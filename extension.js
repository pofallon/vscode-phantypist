// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const ncp = require('copy-paste');
const async = require('async');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.phantypist', function () {
        // The code you place here will be executed every time your command is executed

        var config = vscode.workspace.getConfiguration('phantypist');
        
        ncp.paste((error, content) => {
            
            var seenChar = false;
            var firstOfLine = "";

            // Split the clipboard contents into an array of characters
            async.eachOfSeries(Array.from(content), (value, key, cb) => {
                let selection = vscode.window.activeTextEditor.selection;
                let startLine = selection.start.line;
                let position = new vscode.Position(startLine, selection.start.character);

                // If we're starting a new line, we haven't seen a non-whitespace char yet
                if (position.character === 0) {
                    seenChar = false;
                }

                // If we haven't see a non-whitespace char yet, and this one isn't either
                // just accumulate the character
                if (!seenChar && value.match(/\s/)) {
                    firstOfLine += value;
                    cb();
                } else {
                    // If this is a non-whitespace character, we'll print it
                    // (along with any accumulated initial whitespace)
                    seenChar = true;
                    if (firstOfLine) {
                        value = firstOfLine + value;
                        firstOfLine = "";
                    }
                    // At some (random, configurable) time in the future, add the text to the editor
                    setTimeout(() => {
                        vscode.window.activeTextEditor.edit((editBuilder) => {
                            editBuilder.insert(position, value);
                        }, {undoStopAfter: false, undoStopBefore: false})
                        .then(() => { cb(); }, (error) => { cb(error); });
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