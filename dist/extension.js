"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const path = require("path");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    const styleDiskPath = vscode.Uri.file(path.join(context.extensionPath, 'src', 'styles.css'));
    // // And get the special URI to use with the webview
    // const scriptSrc = panel.webview.asWebviewUri(onDiskPath);
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "dbizzy" is now active!');
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    context.subscriptions.push(vscode.commands.registerCommand('dbizzy.helloWorld', () => {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        vscode.window.showInformationMessage('bello World from dBizzy!');
    }));
    // Preview Database -- create new webview panel 
    context.subscriptions.push(vscode.commands.registerCommand('dbizzy.previewDatabase', () => {
        vscode.window.showInformationMessage('hello>');
        const preview = 'previewDatabase';
        const previewTitle = 'Preview Database';
        const panel = vscode.window.createWebviewPanel(preview, // type of webview, internal use
        previewTitle, // title of panel displayed to the user
        vscode.ViewColumn.Beside, {
            enableScripts: true
        });
        // Get path to resource on disk
        const onDiskPath = vscode.Uri.file(path.join(context.extensionPath, 'src', 'sql.js'));
        // And get the special URI to use with the webview
        const scriptSrc = panel.webview.asWebviewUri(onDiskPath);
        const styleSrc = panel.webview.asWebviewUri(styleDiskPath);
        panel.webview.html = getWebviewContent(preview, previewTitle, scriptSrc.toString(), styleSrc.toString());
    }));
    context.subscriptions.push(vscode.commands.registerCommand('dbizzy.queryDatabase', () => {
        const query = 'queryDatabase';
        const queryTitle = 'Query Database';
        const panel = vscode.window.createWebviewPanel(query, // type of webview, internal use
        queryTitle, // title of panel displayed to the user
        vscode.ViewColumn.Beside, {});
        panel.webview.html = getWebviewContent(query, queryTitle, '', '');
    }));
}
exports.activate = activate;
// starting index.html  
const getWebviewContent = (view, viewTitle, scriptSrc, styleSrc) => {
    return (`<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="${styleSrc}">
      <script type="text/javascript" src="${scriptSrc}"></script>
      <title> ${viewTitle} </title>
    </head>
    <body>
      <div id=${view}>
        hello team dBizzy:
        ${view}
      </div>

      
    </body>
    </html>`);
};
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map