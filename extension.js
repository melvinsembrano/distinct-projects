// The module 'vscode' contains the VS Code extensibility API
const vscode = require('vscode');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	console.log('Distinct Projects extension is now active!');

	// Create status bar item
	const statusBarItem = vscode.window.createStatusBarItem(
		vscode.StatusBarAlignment.Right,
		100
	);
	statusBarItem.command = 'distinct-projects.chooseTitleBarColor';
	statusBarItem.tooltip = 'Choose Title Bar Color';
	context.subscriptions.push(statusBarItem);

	// Apply saved color on activation
	applySavedColor();

	// Update status bar item
	updateStatusBarItem(statusBarItem);

	// Register command to choose title bar color
	const disposable = vscode.commands.registerCommand(
		'distinct-projects.chooseTitleBarColor',
		async function () {
			// Get current color
			const config = vscode.workspace.getConfiguration();
			const currentColor = config.get('workbench.colorCustomizations')?.['titleBar.activeBackground'] || '#007ACC';

			// Predefined color palette
			const colorPresets = [
				{ label: '$(symbol-color) Blue', description: '#007ACC', color: '#007ACC' },
				{ label: '$(symbol-color) Purple', description: '#663399', color: '#663399' },
				{ label: '$(symbol-color) Green', description: '#28A745', color: '#28A745' },
				{ label: '$(symbol-color) Red', description: '#DC3545', color: '#DC3545' },
				{ label: '$(symbol-color) Orange', description: '#FD7E14', color: '#FD7E14' },
				{ label: '$(symbol-color) Teal', description: '#20C997', color: '#20C997' },
				{ label: '$(symbol-color) Pink', description: '#E83E8C', color: '#E83E8C' },
				{ label: '$(symbol-color) Indigo', description: '#6610F2', color: '#6610F2' },
				{ label: '$(symbol-color) Yellow', description: '#FFC107', color: '#FFC107' },
				{ label: '$(symbol-color) Cyan', description: '#17A2B8', color: '#17A2B8' },
				{ label: '$(symbol-color) Dark Gray', description: '#343A40', color: '#343A40' },
				{ label: '$(symbol-color) Lime', description: '#82C91E', color: '#82C91E' },
				{ label: '$(symbol-color) Current: ' + currentColor, description: currentColor, color: currentColor },
				{ label: '$(edit) Custom Color...', description: 'Enter a hex color code', color: null }
			];

			// Show quick pick
			const selected = await vscode.window.showQuickPick(colorPresets, {
				placeHolder: 'Choose a title bar color or select Custom Color to enter hex code',
				matchOnDescription: true
			});

			if (!selected) {
				return;
			}

			let color = selected.color;

			// If custom color selected, show input box
			if (color === null) {
				color = await vscode.window.showInputBox({
					prompt: 'Enter a color for the title bar (hex format, e.g., #FF5733)',
					value: currentColor,
					placeHolder: '#007ACC',
					validateInput: (value) => {
						if (!value) return 'Color is required';
						if (!/^#[0-9A-Fa-f]{6}$/i.test(value)) {
							return 'Please enter a valid hex color (e.g., #FF5733)';
						}
						return null;
					}
				});
			}

			if (color) {
				await applyTitleBarColor(color);
				updateStatusBarItem(statusBarItem);
				vscode.window.showInformationMessage(`Title bar color set to ${color}`);
			}
		}
	);

	context.subscriptions.push(disposable);
}

/**
 * Apply saved color from workspace settings
 */
function applySavedColor() {
	const config = vscode.workspace.getConfiguration();
	const customizations = config.get('workbench.colorCustomizations');
	
	if (customizations && customizations['titleBar.activeBackground']) {
		console.log('Applied saved title bar color:', customizations['titleBar.activeBackground']);
	}
}

/**
 * Apply a color to the title bar
 * @param {string} color - Hex color code
 */
async function applyTitleBarColor(color) {
	const config = vscode.workspace.getConfiguration();
	
	// Get existing color customizations
	const existingCustomizations = config.get('workbench.colorCustomizations') || {};
	
	// Calculate foreground color based on background brightness
	const foregroundColor = getContrastingTextColor(color);
	
	// Create updated customizations
	const newCustomizations = {
		...existingCustomizations,
		'titleBar.activeBackground': color,
		'titleBar.activeForeground': foregroundColor,
		'titleBar.inactiveBackground': color + 'CC', // Add some transparency
		'titleBar.inactiveForeground': foregroundColor + 'CC'
	};
	
	// Update workspace settings
	await config.update(
		'workbench.colorCustomizations',
		newCustomizations,
		vscode.ConfigurationTarget.Workspace
	);
}

/**
 * Get contrasting text color (white or black) based on background color
 * @param {string} hexColor - Hex color code
 * @returns {string} - '#FFFFFF' or '#000000'
 */
function getContrastingTextColor(hexColor) {
	// Remove # if present
	const hex = hexColor.replace('#', '');
	
	// Convert to RGB
	const r = parseInt(hex.substr(0, 2), 16);
	const g = parseInt(hex.substr(2, 2), 16);
	const b = parseInt(hex.substr(4, 2), 16);
	
	// Calculate relative luminance
	const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
	
	// Return white for dark backgrounds, black for light backgrounds
	return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

/**
 * Update the status bar item with current color
 * @param {vscode.StatusBarItem} statusBarItem
 */
function updateStatusBarItem(statusBarItem) {
	const config = vscode.workspace.getConfiguration();
	const customizations = config.get('workbench.colorCustomizations');
	const currentColor = customizations?.['titleBar.activeBackground'];
	
	if (currentColor) {
		statusBarItem.text = `$(symbol-color) ${currentColor}`;
	} else {
		statusBarItem.text = `$(symbol-color) Set Color`;
	}
	
	statusBarItem.show();
}

/**
 * This method is called when your extension is deactivated
 */
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
