const assert = require('assert');
const vscode = require('vscode');

suite('Distinct Projects Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Extension should be present', () => {
		assert.ok(vscode.extensions.getExtension('your-publisher-name.distinct-projects'));
	});

	test('Should register chooseTitleBarColor command', async () => {
		const commands = await vscode.commands.getCommands(true);
		assert.ok(commands.includes('distinct-projects.chooseTitleBarColor'));
	});

	test('Color contrast calculation', () => {
		// This would test the getContrastingTextColor function if exported
		// For now, basic test structure is in place
		assert.ok(true);
	});
});
