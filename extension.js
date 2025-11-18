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

			// Main menu options
			const mainOptions = [
				{ label: '$(color-mode) Color Palette', description: 'Choose from a wide range of colors', action: 'palette' },
				{ label: '$(symbol-color) Preset Colors', description: 'Quick access to common colors', action: 'presets' },
				{ label: '$(edit) Custom Color', description: 'Enter a hex color code', action: 'custom' },
				{ label: '$(circle-filled) Current: ' + currentColor, description: 'Keep current color', action: 'current' }
			];

			const mainChoice = await vscode.window.showQuickPick(mainOptions, {
				placeHolder: 'How would you like to choose a color?'
			});

			if (!mainChoice) {
				return;
			}

			let color = null;

			if (mainChoice.action === 'palette') {
				color = await showColorPalette();
			} else if (mainChoice.action === 'presets') {
				color = await showPresetColors();
			} else if (mainChoice.action === 'custom') {
				color = await showCustomColorInput(currentColor);
			} else if (mainChoice.action === 'current') {
				return; // Keep current color, do nothing
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
 * Show color palette with a wide range of colors
 * @returns {Promise<string|null>}
 */
async function showColorPalette() {
	const palette = [
		// Reds
		{ label: '$(circle-filled) Deep Red', description: '#8B0000', color: '#8B0000' },
		{ label: '$(circle-filled) Crimson', description: '#DC143C', color: '#DC143C' },
		{ label: '$(circle-filled) Red', description: '#FF0000', color: '#FF0000' },
		{ label: '$(circle-filled) Tomato', description: '#FF6347', color: '#FF6347' },
		{ label: '$(circle-filled) Coral', description: '#FF7F50', color: '#FF7F50' },
		{ label: '$(circle-filled) Indian Red', description: '#CD5C5C', color: '#CD5C5C' },
		
		// Oranges
		{ label: '$(circle-filled) Dark Orange', description: '#FF8C00', color: '#FF8C00' },
		{ label: '$(circle-filled) Orange', description: '#FFA500', color: '#FFA500' },
		{ label: '$(circle-filled) Orange Red', description: '#FF4500', color: '#FF4500' },
		{ label: '$(circle-filled) Peach', description: '#FFCBA4', color: '#FFCBA4' },
		
		// Yellows
		{ label: '$(circle-filled) Gold', description: '#FFD700', color: '#FFD700' },
		{ label: '$(circle-filled) Yellow', description: '#FFFF00', color: '#FFFF00' },
		{ label: '$(circle-filled) Khaki', description: '#F0E68C', color: '#F0E68C' },
		{ label: '$(circle-filled) Dark Goldenrod', description: '#B8860B', color: '#B8860B' },
		
		// Greens
		{ label: '$(circle-filled) Dark Green', description: '#006400', color: '#006400' },
		{ label: '$(circle-filled) Forest Green', description: '#228B22', color: '#228B22' },
		{ label: '$(circle-filled) Green', description: '#008000', color: '#008000' },
		{ label: '$(circle-filled) Lime Green', description: '#32CD32', color: '#32CD32' },
		{ label: '$(circle-filled) Spring Green', description: '#00FF7F', color: '#00FF7F' },
		{ label: '$(circle-filled) Sea Green', description: '#2E8B57', color: '#2E8B57' },
		{ label: '$(circle-filled) Olive', description: '#808000', color: '#808000' },
		
		// Cyans/Teals
		{ label: '$(circle-filled) Teal', description: '#008080', color: '#008080' },
		{ label: '$(circle-filled) Cyan', description: '#00FFFF', color: '#00FFFF' },
		{ label: '$(circle-filled) Turquoise', description: '#40E0D0', color: '#40E0D0' },
		{ label: '$(circle-filled) Aquamarine', description: '#7FFFD4', color: '#7FFFD4' },
		{ label: '$(circle-filled) Dark Cyan', description: '#008B8B', color: '#008B8B' },
		
		// Blues
		{ label: '$(circle-filled) Navy', description: '#000080', color: '#000080' },
		{ label: '$(circle-filled) Dark Blue', description: '#00008B', color: '#00008B' },
		{ label: '$(circle-filled) Blue', description: '#0000FF', color: '#0000FF' },
		{ label: '$(circle-filled) Royal Blue', description: '#4169E1', color: '#4169E1' },
		{ label: '$(circle-filled) Steel Blue', description: '#4682B4', color: '#4682B4' },
		{ label: '$(circle-filled) Dodger Blue', description: '#1E90FF', color: '#1E90FF' },
		{ label: '$(circle-filled) Deep Sky Blue', description: '#00BFFF', color: '#00BFFF' },
		{ label: '$(circle-filled) Sky Blue', description: '#87CEEB', color: '#87CEEB' },
		
		// Purples
		{ label: '$(circle-filled) Indigo', description: '#4B0082', color: '#4B0082' },
		{ label: '$(circle-filled) Purple', description: '#800080', color: '#800080' },
		{ label: '$(circle-filled) Dark Magenta', description: '#8B008B', color: '#8B008B' },
		{ label: '$(circle-filled) Blue Violet', description: '#8A2BE2', color: '#8A2BE2' },
		{ label: '$(circle-filled) Dark Orchid', description: '#9932CC', color: '#9932CC' },
		{ label: '$(circle-filled) Medium Purple', description: '#9370DB', color: '#9370DB' },
		{ label: '$(circle-filled) Plum', description: '#DDA0DD', color: '#DDA0DD' },
		
		// Pinks
		{ label: '$(circle-filled) Deep Pink', description: '#FF1493', color: '#FF1493' },
		{ label: '$(circle-filled) Hot Pink', description: '#FF69B4', color: '#FF69B4' },
		{ label: '$(circle-filled) Pink', description: '#FFC0CB', color: '#FFC0CB' },
		{ label: '$(circle-filled) Magenta', description: '#FF00FF', color: '#FF00FF' },
		
		// Browns
		{ label: '$(circle-filled) Maroon', description: '#800000', color: '#800000' },
		{ label: '$(circle-filled) Brown', description: '#A52A2A', color: '#A52A2A' },
		{ label: '$(circle-filled) Saddle Brown', description: '#8B4513', color: '#8B4513' },
		{ label: '$(circle-filled) Sienna', description: '#A0522D', color: '#A0522D' },
		{ label: '$(circle-filled) Chocolate', description: '#D2691E', color: '#D2691E' },
		{ label: '$(circle-filled) Peru', description: '#CD853F', color: '#CD853F' },
		
		// Grays
		{ label: '$(circle-filled) Black', description: '#000000', color: '#000000' },
		{ label: '$(circle-filled) Dark Slate Gray', description: '#2F4F4F', color: '#2F4F4F' },
		{ label: '$(circle-filled) Dim Gray', description: '#696969', color: '#696969' },
		{ label: '$(circle-filled) Gray', description: '#808080', color: '#808080' },
		{ label: '$(circle-filled) Dark Gray', description: '#A9A9A9', color: '#A9A9A9' },
		{ label: '$(circle-filled) Silver', description: '#C0C0C0', color: '#C0C0C0' },
		{ label: '$(circle-filled) Light Gray', description: '#D3D3D3', color: '#D3D3D3' }
	];

	const selected = await vscode.window.showQuickPick(palette, {
		placeHolder: 'Choose a color from the palette',
		matchOnDescription: true
	});

	return selected ? selected.color : null;
}

/**
 * Show preset colors
 * @returns {Promise<string|null>}
 */
async function showPresetColors() {
	const presets = [
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
		{ label: '$(symbol-color) Lime', description: '#82C91E', color: '#82C91E' }
	];

	const selected = await vscode.window.showQuickPick(presets, {
		placeHolder: 'Choose a preset color',
		matchOnDescription: true
	});

	return selected ? selected.color : null;
}

/**
 * Show custom color input
 * @param {string} currentColor - Current color
 * @returns {Promise<string|null>}
 */
async function showCustomColorInput(currentColor) {
	return await vscode.window.showInputBox({
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
