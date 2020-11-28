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

const getConstrueOptions = (): Options => {
	const config = vscode.workspace.getConfiguration('cronToHuman');
	return {
		use24HourTimeFormat: Boolean(config.get('use24HourTimeFormat')),
		verbose: Boolean(config.get('verbose')),
		locale: vscode.env.language
	};
};
let cronstrueOptions = getConstrueOptions();

const isCodeLenseEnabled = (): boolean => vscode.workspace.getConfiguration("cronToHuman").get("enableCodeLens", true);
const isHoverEnabled = (): boolean => vscode.workspace.getConfiguration("cronToHuman").get("enableHover", true);

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

export const activate = (context: vscode.ExtensionContext) => {

	context.subscriptions.push(
		vscode.workspace.onDidChangeConfiguration((event: vscode.ConfigurationChangeEvent) => {
			if (!event.affectsConfiguration('cronToHuman')) { return; }
			cronstrueOptions = getConstrueOptions();
		})
	);

	context.subscriptions.push(
		vscode.languages.registerHoverProvider(
			'*',
			{
				provideHover(doc: vscode.TextDocument, pos: vscode.Position, token: vscode.CancellationToken) {
					if (!isHoverEnabled()) { return null; }
					const regexp = new RegExp(regexpBase);
					const range = doc.getWordRangeAtPosition(pos, regexp);
					if (!range) { return; }
					const translated = translate(doc.getText(range));

					return translated ? new vscode.Hover(translated) : null;
				}
			}
		)
	);

	context.subscriptions.push(
		vscode.commands.registerTextEditorCommand(
			'cronToHuman.insertComment',
			(editor: vscode.TextEditor, edit: vscode.TextEditorEdit, anotherPosition?: vscode.Range) => {
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
			}
		)
	);


	context.subscriptions.push(
		vscode.languages.registerCodeLensProvider(
			"*",
			{
				provideCodeLenses(doc: vscode.TextDocument, token: vscode.CancellationToken) {
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
				},
				resolveCodeLens(codeLens: vscode.CodeLens, token: vscode.CancellationToken) {
					if (!isCodeLenseEnabled()) { return null; }

					codeLens.command = {
						title: "Explain Cron",
						command: "cronToHuman.insertComment",
						arguments: [codeLens.range]
					};
					return codeLens;
				}
			}
		)
	);

	context.subscriptions.push(
		vscode.commands.registerCommand("cronToHuman.enableCodeLens", () => {
			vscode.workspace.getConfiguration("cronToHuman").update("enableCodeLens", true, true);
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand("cronToHuman.disableCodeLens", () => {
			vscode.workspace.getConfiguration("cronToHuman").update("enableCodeLens", false, true);
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand("cronToHuman.enableHover", () => {
			vscode.workspace.getConfiguration("cronToHuman").update("enableHover", true, true);
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand("cronToHuman.disableHover", () => {
			vscode.workspace.getConfiguration("cronToHuman").update("enableHover", false, true);
		})
	);
};

export const deactivate = () => { };
