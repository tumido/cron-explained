import * as assert from 'assert';
import { suiteTeardown } from 'mocha';
import * as vscode from 'vscode';
import * as extension from '../../extension';

suite('executeCommand', () => {
    let configuration: [string, string | undefined][] = [];

    suiteSetup(() => {
        configuration = ['codeLens.enabled', 'hover.enabled'].map(setting => (
            [setting, vscode.workspace.getConfiguration('cron-explained').get(setting)]
        ));
    });

    suite('cron-explained.insertComment', () => {
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

    suite('cron-explained.toggleCodeLens', () => {
        test('should be enabled', async () => {
            await vscode.workspace.getConfiguration('cron-explained').update('codeLens.enabled', false, true);
            await vscode.commands.executeCommand('cron-explained.toggleCodeLens');
            assert.strictEqual(vscode.workspace.getConfiguration('cron-explained').get('codeLens.enabled'), true);
        });

        test('should be disabled', async () => {
            await vscode.workspace.getConfiguration('cron-explained').update('codeLens.enabled', true, true);
            await vscode.commands.executeCommand('cron-explained.toggleCodeLens');
            assert.strictEqual(vscode.workspace.getConfiguration('cron-explained').get('codeLens.enabled'), false);
        });
    });

    suite('cron-explained.toggleHover', () => {
        test('should be enabled', async () => {
            await vscode.workspace.getConfiguration('cron-explained').update('hover.enabled', false, true);
            await vscode.commands.executeCommand('cron-explained.toggleHover');
            assert.strictEqual(vscode.workspace.getConfiguration('cron-explained').get('hover.enabled'), true);
        });

        test('should be disabled', async () => {
            await vscode.workspace.getConfiguration('cron-explained').update('hover.enabled', true, true);
            await vscode.commands.executeCommand('cron-explained.toggleHover');
            assert.strictEqual(vscode.workspace.getConfiguration('cron-explained').get('hover.enabled'), false);
        });
    });

    suiteTeardown(() => {
        configuration.map(async ([setting, value]) => {
            await vscode.workspace.getConfiguration('cron-explained').update(setting, value, true);
        });
    });
});


suite('unit', () => {
    suite('getConstrueOptions', () => {
        let configuration: [string, string | undefined][] = [];

        suiteSetup(() => {
            configuration = ['locale', 'verbose'].map(setting => (
                [setting, vscode.workspace.getConfiguration('cron-explained').get(setting)]
            ));
        });

        test('should use env locale', async () => {
            await vscode.workspace.getConfiguration('cron-explained').update('cronstrueOptions.locale', undefined, true);
            const options = extension.getConstrueOptions();
            assert.strictEqual(options.locale, vscode.env.language);
        });

        test('should use set locale', async () => {
            await vscode.workspace.getConfiguration('cron-explained').update('cronstrueOptions.locale', 'de', true);
            const options = extension.getConstrueOptions();
            assert.strictEqual(options.locale, 'de');
        });

        suiteTeardown(() => {
            configuration.map(async ([setting, value]) => {
                await vscode.workspace.getConfiguration('cron-explained').update(setting, value, true);
            });
        });
    });

    suite('translate', () => {
        test('should succeed on nontrivial cron', () => {
            const translation = extension.translate('0 0 0 * * * 2020');
            assert.strictEqual(translation, 'At 00:00, every day, only in 2020');
        });
        test('should gracefully fail on trivial cron', () => {
            const translation = extension.translate('@daily');
            assert.strictEqual(translation, "");
        });
        test('should fail for invalid cron', () => {
            assert.throws(() => extension.translate('0 0 0 0 0'), /cron-explained: Unable to parse/);
        });
        test('should fail gracefully for unknown cron format', () => {
            assert.throws(() => extension.translate('this is not a cron format'), /cron-explained: Unable to parse/);
        });
    });
});
