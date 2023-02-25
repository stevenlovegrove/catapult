// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// Target specified as full path
type Target = string;
type ArgList = string;

const empty : string = "[empty]";
let history = new Map<Target, ArgList[]>();
let currentTarget : string = "";
let currentArgs : string = "";
let currentDoDebug : boolean = false;

// precondition: currentTarget has been set
function targetArgsCustomized(commandline : string | undefined) {
	if(typeof commandline === 'undefined') {return;}

	currentArgs = commandline;
	let hist = history.get(currentTarget);
	if(!hist) {hist = [];}

	if(commandline !== "") {
		hist.unshift(commandline);
	}

	history.set(currentTarget,
		hist.filter((item,index) => { return hist?.indexOf(item) === index; })
	);

	vscode.window.showInformationMessage("Launching: '" + currentTarget + " " + currentArgs + "'");
	let thisLaunch = {
		MIMode: "lldb",
		args: currentArgs.split(' ')
	};

	vscode.workspace.getConfiguration().update("cmake.debugConfig", thisLaunch, vscode.ConfigurationTarget.Global);
	if(currentDoDebug) {
		vscode.commands.executeCommand("cmake.debugTarget");
	}else{
		vscode.commands.executeCommand("cmake.launchTarget");
	}

	// Save list to persist
	let json = Array.from(history.entries()).reduce((o, [key, value]) => { o[key] = value; return o; }, {});
	vscode.workspace.getConfiguration().update("launcharoo.history", json, vscode.ConfigurationTarget.Global);
}

// precondition: currentTarget has been set
function targetArgsSelected(commandline : string | undefined) {
	if(typeof commandline === 'undefined') {return;}

	let cmd : string = (commandline === empty) ? "" : commandline;
	vscode.window.showInputBox({
		title: "Customize Command Line",
		value: cmd,
		prompt: "Enter Arguments for '" + currentTarget + "'"
	}).then(targetArgsCustomized);
}

function targetLaunched(target : unknown) {
	if(typeof target !== 'string') {return;}

	currentTarget = target;
	let targetHistory = history.get(target);
	if(targetHistory && targetHistory.length > 0) {
		vscode.window.showQuickPick([empty].concat(targetHistory),
		{
			title: "Select existing Command Line to Customize",
			placeHolder: "Arguments for '" + currentTarget + "'"
		}
		).then(targetArgsSelected);
	}else{
		targetArgsSelected("");
	}
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "launcharoo" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable1 = vscode.commands.registerCommand('launcharoo.launch', () => {
		currentDoDebug = false;
		vscode.commands.executeCommand('cmake.launchTargetPath').then(targetLaunched);
	});
	let disposable2 = vscode.commands.registerCommand('launcharoo.debug', () => {
		currentDoDebug = true;
		vscode.commands.executeCommand('cmake.launchTargetPath').then(targetLaunched);
	});
	context.subscriptions.push(disposable1);
	context.subscriptions.push(disposable2);
}

// This method is called when your extension is deactivated
export function deactivate() {}
