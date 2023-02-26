// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// Target specified as full path
type Target = string;
type ArgList = string;

const empty : string = "[blank]";
let history = {};
let currentTarget : string = "";
let currentArgs : string = "";
let currentDoDebug : boolean = false;

function saveConfig() : void {
	vscode.workspace.getConfiguration().update("catapult.history", history, vscode.ConfigurationTarget.Global);
}

function maxHistoryPerTarget() : number {
	let num = vscode.workspace.getConfiguration().get("catapult.maxHistoryPerTarget", {});
	return typeof num === 'number' ? num : 100;
}

function editArgumentsBeforeLaunch() : boolean {
	let v = vscode.workspace.getConfiguration().get("catapult.editArgumentsBeforeLaunch", {});
	return typeof v === 'boolean' ? v : true;
}

// precondition: currentTarget has been set
function targetArgsCustomized(commandline : string | undefined) {
	if(typeof commandline === 'undefined') {return;}

	currentArgs = commandline;
	let hist = history[currentTarget];
	if(!hist) {hist = [];}

	if(commandline !== "") {
		hist.unshift(commandline);
	}

	hist = hist.filter((item,index) => { return hist?.indexOf(item) === index; });
	hist = hist.slice(0, Math.min(hist.length, maxHistoryPerTarget()) );
	history[currentTarget] = hist;

	// vscode.window.showInformationMessage("Launching: '" + currentTarget + " " + currentArgs + "'");
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

	saveConfig();
}

// precondition: currentTarget has been set
function targetArgsSelected(selected : any) {
	let commandline = selected?.label;
	if(typeof commandline === 'undefined') {return;}

	if(editArgumentsBeforeLaunch() || commandline === empty) {
		let cmd : string = (commandline === empty) ? "" : commandline;
		vscode.window.showInputBox({
			title: "Modify the command line, or just hit enter!",
			value: cmd,
			prompt: "Enter Arguments for '" + currentTarget + "'"
		}).then(targetArgsCustomized);
	}else{
		targetArgsCustomized(commandline);
	}
}

function targetClear(target : unknown) {
	if(typeof target !== 'string') {return;}
	currentTarget = target;
	history[currentTarget] = [];
	saveConfig();
}

function targetLaunched(target : unknown) {
	if(typeof target !== 'string') {return;}

	if( target === '') {
		pickAndLaunch;
	}

	currentTarget = target;

	// arg history for selected target
	let targetHistory = history[target];
	console.log("history: " + JSON.stringify(history));
	console.log("targetHistory1: " + JSON.stringify(targetHistory));

	// arg history for other targets
	let otherHistory : string[] = [];
	Object.keys(history).forEach(key => {
		let otherTargetHistory = history[key];
		otherTargetHistory.forEach((arglist:string) => {
			if( (!targetHistory || (targetHistory.indexOf(arglist) < 0)) && otherHistory.indexOf(arglist) < 0) {
				otherHistory.push(arglist);
			}
		});
	});
	console.log("targetHistory2: " + JSON.stringify(targetHistory));

	if( (!targetHistory || (targetHistory.length === 0)) && (otherHistory.length === 0)) {
		targetArgsSelected({label:empty});
	}else{
		let items : vscode.QuickPickItem[] = [];

		items.push({kind: vscode.QuickPickItemKind.Separator, label:"Start from scratch"});
		items.push({label: empty});

		if(targetHistory?.length > 0) {
			items.push({kind: vscode.QuickPickItemKind.Separator, label:"Recent"});
			targetHistory.forEach((arglist:string) => {
				items.push({label: arglist});
			});
		}

		if(otherHistory?.length > 0) {
			items.push({kind: vscode.QuickPickItemKind.Separator, label:"From other targets"});
			otherHistory.forEach((other:string) => {
				items.push({label: other});
			});
		}

		vscode.window.showQuickPick(items, {
			title: "Select command line arguments to customize",
			placeHolder: "Arguments for '" + currentTarget + "'"
		} ).then(targetArgsSelected);
	}
}

async function pickAndLaunch() {
	await vscode.commands.executeCommand('cmake.selectLaunchTarget');
	vscode.commands.executeCommand('cmake.launchTargetPath').then(targetLaunched);
}

function common() {
	history = vscode.workspace.getConfiguration().get("catapult.history", {});
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	context.subscriptions.push(
		vscode.commands.registerCommand('catapult.pickAndLaunch', () => {
			common();
			currentDoDebug = false;
			pickAndLaunch();
		}),
		vscode.commands.registerCommand('catapult.launch', () => {
			common();
			currentDoDebug = false;
			vscode.commands.executeCommand('cmake.launchTargetPath').then(targetLaunched);
		}),
		vscode.commands.registerCommand('catapult.debug', () => {
			common();
			currentDoDebug = true;
			vscode.commands.executeCommand('cmake.launchTargetPath').then(targetLaunched);
		}),
		vscode.commands.registerCommand('catapult.again', () => {
			common();
			targetArgsCustomized(currentArgs);
		}),
		vscode.commands.registerCommand('catapult.clear', () => {
			common();
			currentDoDebug = true;
			vscode.commands.executeCommand('cmake.launchTargetPath').then(targetClear);
		}),
		vscode.commands.registerCommand('catapult.settings', () => {
			common();
			currentDoDebug = true;
			vscode.commands.executeCommand( 'workbench.action.openSettings', 'catapult' );
		})



	);
}

// This method is called when your extension is deactivated
export function deactivate() {}
