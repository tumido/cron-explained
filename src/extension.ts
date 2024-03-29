import * as vscode from 'vscode';
import cronstrue from 'cronstrue';
import type { Options } from 'cronstrue/dist/options';
import getCommentStyle from './commentStyles';
import cronRegex from './regex';

const regexpSections = [
    "(@(annually|yearly|monthly|weekly|daily|hourly|reboot))",
    "|(@every (\\d+(ns|us|µs|ms|s|m|h))+)",
    `|${cronRegex}`
];

const regexpSelfExplanatory = regexpSections.slice(0, 2).join("");
const regexpBase = regexpSections.join("");

/**
 * Create construe options object from workspace configuration and environment.
 */
export const getConstrueOptions = (): Options => {
    const config = vscode.workspace.getConfiguration('cron-explained.cronstrueOptions');
    return {
        use24HourTimeFormat: Boolean(config.get('use24HourTimeFormat')),
        verbose: Boolean(config.get('verbose')),
        locale: config.get('locale') || vscode.env.language,
        dayOfWeekStartIndexZero: config.get("dayOfWeekStartIndexZero"),
        monthStartIndexZero: config.get("monthStartIndexZero")
    };
};

let cronstrueOptions = getConstrueOptions();

const isCodeLenseEnabled = (): boolean => vscode.workspace.getConfiguration("cron-explained").get("codeLens.enabled", true);
const isHoverEnabled = (): boolean => vscode.workspace.getConfiguration("cron-explained").get("hover.enabled", true);
const codeLensSettings = (property: string): boolean => vscode.workspace.getConfiguration("cron-explained.codeLens").get(property, true);

/**
 * Parses a cron string into a human readable format.
 * @param string Cron string
 */
export const translate = (string: string): string => {
    try {
        return cronstrue.toString(string, cronstrueOptions);
    } catch (err) {
        if (new RegExp(regexpSelfExplanatory).test(string)) {
            return "";
        } else {
            console.error(`Unable to parse "${string}"`);
            throw new Error(`cron-explained: Unable to parse "${string}"`);
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
    const regexp = new RegExp(regexpBase, 'i');
    const lineNumber = anotherPosition?.start.line || editor.selection.start.line;
    const textLine = editor.document.lineAt(lineNumber);
    const matches = textLine.text.match(regexp);
    if (!matches || !matches[0]) { return; }

    const commentStyle = getCommentStyle(editor.document.languageId);
    const translated = translate(matches[0]);

    if (new RegExp(`^.*${commentStyle[0]}[a-zA-Z0-9:, ]+${commentStyle[1]}$`).test(textLine.text)) {
        const deleteRange = new vscode.Range(
            lineNumber, textLine.text.lastIndexOf(commentStyle[0]),
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
    if (!isHoverEnabled() || token.isCancellationRequested) { return null; }
    const regexp = new RegExp(regexpBase, 'i');
    const range = doc.getWordRangeAtPosition(pos, regexp);
    if (!range || token.isCancellationRequested) { return; }
    const translated = translate(doc.getText(range));

    return translated ? new vscode.Hover(translated) : null;
};

/**
 * Locates lines where the code lense should be displayed.
 * @param doc Represents a text document.
 * @param token Cancellation token.
 */
const codeLensProvider = (doc: vscode.TextDocument, token: vscode.CancellationToken) => {
    if (!isCodeLenseEnabled() || token.isCancellationRequested) { return []; }

    const text = doc.getText();
    const codeLenses = [];
    const regexp = new RegExp(regexpBase, "gi");

    let matches;
    while ((matches = regexp.exec(text)) !== null) {
        const line = doc.lineAt(doc.positionAt(matches.index).line);
        const indexOf = line.text.indexOf(matches[0]);
        const position = new vscode.Position(line.lineNumber, indexOf);
        const range = doc.getWordRangeAtPosition(position, new RegExp(regexpBase, 'i'));
        if (!range) { continue; }

        const translated = translate(doc.getText(range));
        if (!translated) { continue; }

        if (codeLensSettings('showTranscript')) {
            codeLenses.push(new vscode.CodeLens(range, { title: translated, command: "" }));
        }
        if (codeLensSettings('showCommentAction')) {
            codeLenses.push(new vscode.CodeLens(range, {
                title: "Insert comment",
                command: "cron-explained.insertComment",
                arguments: [range]
            }));
        }

        if (token.isCancellationRequested) { break; }
    }
    return codeLenses;
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
        vscode.commands.registerCommand("cron-explained.toggleCodeLens", changeSettingsState("codeLens.enabled")),
        vscode.commands.registerCommand("cron-explained.toggleHover", changeSettingsState("hover.enabled")),
        vscode.commands.registerTextEditorCommand('cron-explained.insertComment', insertComment),
        vscode.languages.registerCodeLensProvider("*", { provideCodeLenses: codeLensProvider, resolveCodeLens: codeLens => codeLens }),
        vscode.languages.registerHoverProvider('*', { provideHover: hoverProvider }),
        vscode.workspace.onDidChangeConfiguration(handleConfigChange),
    ].map(disposable => context.subscriptions.push(disposable));
};

export const deactivate = () => { };
