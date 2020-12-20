import * as vscode from 'vscode';
import cronstrue from 'cronstrue';
import type { Options } from 'cronstrue/dist/options';
import getCommentStyle from './commentStyles';

const regexpSections = [
    "(@(annually|yearly|monthly|weekly|daily|hourly|reboot))|",
    "(@every (\\d+(ns|us|µs|ms|s|m|h))+)|",
    "((((\\d+,)+\\d+|((\\d+|\\*)(\\/|-)\\d+)|\\d+|\\*) ?){5,7})"
];

const regexpSelfExplanatory = regexpSections.slice(0, 2).join("");
const regexpBase = regexpSections.join("");

/**
 * Create construe options object from workspace configuration and environment.
 */
export const getConstrueOptions = (): Options => {
    const config = vscode.workspace.getConfiguration('cron-explained');
    return {
        use24HourTimeFormat: Boolean(config.get('use24HourTimeFormat')),
        verbose: Boolean(config.get('verbose')),
        locale: config.get('locale') || vscode.env.language,
    };
};

let cronstrueOptions = getConstrueOptions();

const isCodeLenseEnabled = (): boolean => vscode.workspace.getConfiguration("cron-explained").get("enableCodeLens", true);
const isHoverEnabled = (): boolean => vscode.workspace.getConfiguration("cron-explained").get("enableHover", true);

/**
 * Parses a cron string into a human readable format.
 * @param string Cron string
 */
const translate = (string: string): string => {
    try {
        return cronstrue.toString(string, cronstrueOptions);
    } catch (err) {
        if (string.match(regexpSelfExplanatory) !== null) {
            return "";
        } else {
            console.error(`Unable to parse "${string}"`);
            throw err;
        }
    }
};

/**
 * Insert parsed cron string as a comment at the end of line.
 *
 * @param editor Editor attached to a document
 * @param edit Edit for the text editor
 * @param anotherPosition Optional position elsewhere than the current cursor, inferred for code lenses.
 */
const insertComment = (editor: vscode.TextEditor, edit: vscode.TextEditorEdit, anotherPosition?: vscode.Range) => {
    const regexp = new RegExp(regexpBase);
    const lineNumber = anotherPosition?.start.line || editor.selection.start.line;
    const textLine = editor.document.lineAt(lineNumber);
    const matches = textLine.text.match(regexp);
    if (!matches || !matches[0]) { return; }

    const commentStyle = getCommentStyle(editor.document.languageId);
    const translated = translate(matches[0]);

    let matchesComment;
    if ((matchesComment = textLine.text.match(commentStyle[0])) !== null) {
        const deleteRange = new vscode.Range(
            lineNumber, textLine.text.indexOf(matchesComment[0]),
            lineNumber, textLine.range.end.character
        );
        edit.delete(deleteRange);
    }
    if (translated) {
        edit.insert(textLine.range.end, commentStyle[0] + translated + commentStyle[1]);
    } else {
        vscode.window.showInformationMessage('Cron schedule is self-explanatory, no need to translate.');
    }
};

/**
 * Update cronstrue options when config has changed.
 *
 * @param event An event describing the change in Configuration
 */
const handleConfigChange = (event: vscode.ConfigurationChangeEvent) => {
    if (!event.affectsConfiguration('cron-explained')) { return; }
    cronstrueOptions = getConstrueOptions();
};

/**
 * Hover tooltip provider shows translated cron string on mouse over.
 * @param doc Represents a text document.
 * @param pos Represents a line position in a document.
 * @param token Cancellation token.
 */
const hoverProvider = (doc: vscode.TextDocument, pos: vscode.Position, token: vscode.CancellationToken) => {
    if (!isHoverEnabled()) { return null; }
    const regexp = new RegExp(regexpBase);
    const range = doc.getWordRangeAtPosition(pos, regexp);
    if (!range) { return; }
    const translated = translate(doc.getText(range));

    return translated ? new vscode.Hover(translated) : null;
};

/**
 * Locates lines where the code lense should be displayed.
 * @param doc Represents a text document.
 * @param token Cancellation token.
 */
const codeLensProvider = (doc: vscode.TextDocument, token: vscode.CancellationToken) => {
    if (!isCodeLenseEnabled()) { return []; }

    const text = doc.getText();
    const codeLenses = [];
    const regexp = new RegExp(regexpBase, "g");

    let matches;
    while ((matches = regexp.exec(text)) !== null) {
        const line = doc.lineAt(doc.positionAt(matches.index).line);
        const indexOf = line.text.indexOf(matches[0]);
        const position = new vscode.Position(line.lineNumber, indexOf);
        const range = doc.getWordRangeAtPosition(position, new RegExp(regexpBase));
        if (range) {
            codeLenses.push(new vscode.CodeLens(range));
        }
    }
    return codeLenses;
};

/**
 * Resolves command for a code lense instance.
 * @param codeLens A code lens instance.
 * @param token Cancellation token.
 */
const codeLensResolver = (codeLens: vscode.CodeLens, token: vscode.CancellationToken) => {
    if (!isCodeLenseEnabled()) { return null; }

    codeLens.command = {
        title: "Explain Cron",
        command: "cron-explained.insertComment",
        arguments: [codeLens.range]
    };
    return codeLens;
};


/**
 * Helper for changing configuration values.
 * @param property Configuration property.
 * @param enabled State of the property.
 */
const changeSettingsState = (property: string) => async () => {
    const currentValue = Boolean(vscode.workspace.getConfiguration("cron-explained").get(property));
    await vscode.workspace.getConfiguration("cron-explained").update(property, !currentValue, true);
};

export const activate = (context: vscode.ExtensionContext) => {
    [
        vscode.commands.registerCommand("cron-explained.toggleCodeLens", changeSettingsState("enableCodeLens")),
        vscode.commands.registerCommand("cron-explained.toggleHover", changeSettingsState("enableHover")),
        vscode.commands.registerTextEditorCommand('cron-explained.insertComment', insertComment),
        vscode.languages.registerCodeLensProvider("*", { provideCodeLenses: codeLensProvider, resolveCodeLens: codeLensResolver }),
        vscode.languages.registerHoverProvider('*', { provideHover: hoverProvider }),
        vscode.workspace.onDidChangeConfiguration(handleConfigChange),
    ].map(disposable => context.subscriptions.push(disposable));
};

export const deactivate = () => { };
