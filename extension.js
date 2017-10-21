// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const ncp = require('copy-paste');
const async = require('async');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "phantypist" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.phantypist', function () {
        // The code you place here will be executed every time your command is executed

        var config = vscode.workspace.getConfiguration('phantypist');
        
        ncp.paste((error, content) => {
            
            var seenChar = false;
            var firstOfLine = "";

            async.eachOfSeries(Array.from(content), (value, key, cb) => {
                let selection = vscode.window.activeTextEditor.selection;
                let startLine = selection.start.line;
                let position = new vscode.Position(startLine, selection.start.character);

                if (position.character === 0) {
                    seenChar = false;
                }

                if (!seenChar && value.match(/\s/)) {
                    firstOfLine += value;
                    cb();
                } else {
                    seenChar = true;
                    if (firstOfLine) {
                        value = firstOfLine + value;
                        firstOfLine = "";
                    }
                    setTimeout(() => {
                        vscode.window.activeTextEditor.edit((editBuilder) => {
                            editBuilder.insert(position, value);
                        }, {undoStopAfter: false, undoStopBefore: false}).then(() => { cb(); });
                    }, Math.random() * (config.maxWaitTime-config.minWaitTime)+config.minWaitTime);
                }

            })
        });
    });

    context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;