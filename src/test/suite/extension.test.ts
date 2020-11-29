import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as extension from '../../extension';

suite('insert comment command', () => {
	test('should add a comment after a single call', async () => {
		const document = await vscode.workspace.openTextDocument({ content: "0 0 1 * *" });
		await vscode.window.showTextDocument(document);
		await vscode.commands.executeCommand('cron-explained.insertComment');
		assert.strictEqual(document.getText(), "0 0 1 * * # At 00:00, on day 1 of the month");
	});
	test('should update comment if the value changed', async () => {
		const document = await vscode.workspace.openTextDocument({
			content: "0 0 1 * * # At 00:00, on day 1 of the month"
		});
		const editor = await vscode.window.showTextDocument(document);
		await editor.edit(edit => edit.replace(new vscode.Range(0, 4, 0, 5), "*"));
		await vscode.commands.executeCommand('cron-explained.insertComment');
		assert.strictEqual(document.getText(), "0 0 * * * # At 00:00, every day");
	});
});

suite('code lens', () => {
	test('should be enabled', async () => {
		await vscode.commands.executeCommand('cron-explained.enableCodeLens');
		assert.strictEqual(vscode.workspace.getConfiguration('cron-explained').get('enableCodeLens'), true);
	});
	test('should be disabled', async () => {
		await vscode.commands.executeCommand('cron-explained.disableCodeLens');
		assert.strictEqual(vscode.workspace.getConfiguration('cron-explained').get('enableCodeLens'), false);
	});
});

suite('hover', () => {
	test('should be enabled', async () => {
		await vscode.commands.executeCommand('cron-explained.enableHover');
		assert.strictEqual(vscode.workspace.getConfiguration('cron-explained').get('enableHover'), true);
	});
	test('should be disabled', async () => {
		await vscode.commands.executeCommand('cron-explained.disableHover');
		assert.strictEqual(vscode.workspace.getConfiguration('cron-explained').get('enableHover'), false);
	});
});
