// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import path from "path";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "quick-template" is now active!'
  );

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "quick-template.insertTemplateCode",
    async () => {
      // The code you place here will be executed every time your command is executed
      // Display a message box to the user
      // vscode.window.showInformationMessage("Hello World from quick-template!");

      // // 打印当前项目的根目录
      // const path = vscode.workspace.workspaceFolders?.[0].uri.path;
      // path && vscode.window.showInformationMessage(path);

      // addTemplate();
      const templates = await getTemplates();

      if (!templates.length) {
        return vscode.window.showInformationMessage("模板不存在");
      }

      vscode.window
        .showQuickPick(
          templates.map((item) => item.name),
          {
            title: "选择模板",
          }
        )
        .then((value) => {
          if (!value) {
            // vscode.window.showInformationMessage("模板名不能为空");
            return;
          }
          const template = templates.find((item) => item.name === value);
          if (!template) {
            vscode.window.showInformationMessage("模板不存在");
            return;
          }
          const editor = vscode.window.activeTextEditor;
          if (!editor) {
            vscode.window.showInformationMessage("editor not found");
            return;
          }
          editor.edit((editBuilder) => {
            editBuilder.insert(editor.selection.active, template.content);
          });
        });
    }
  );

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}

// 读取项目根目录下的 .template 文件夹，获取所有的模板
const getTemplates = async () => {
  // const pwd = vscode.workspace.
  // // if (!path) return []
  // const filePath = `${pwd}/.template`;
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showInformationMessage("editor not found");
    return [];
  }

  const filePath = editor.document.uri.fsPath;
  const workspaceFolder = vscode.workspace.getWorkspaceFolder(
    editor.document.uri
  )?.uri.fsPath;

  if (!workspaceFolder) {
    vscode.window.showInformationMessage("workspaceFolder not found");
    return [];
  }

  const list: { name: string; path: string }[] = [];
  let currentDir = path.dirname(filePath);
  while (currentDir.startsWith(workspaceFolder)) {
    const templateDir = path.join(currentDir, ".template");
    try {
      const files = await vscode.workspace.fs.readDirectory(
        vscode.Uri.file(templateDir)
      );

      for (const [file, type] of files) {
        if (type === vscode.FileType.File) {
          list.push({
            name: file.split(".")[0],
            path: path.join(templateDir, file),
          });
        }
      }
    } catch (error) {}

    currentDir = path.dirname(currentDir);
  }
  return Promise.all(
    list.map(async (i) => ({
      name: i.name,
      content: await vscode.workspace.fs
        .readFile(vscode.Uri.file(i.path))
        .then((i) => i.toString()),
    }))
  );

  // const folder = path.join(
  //   vscode.workspace.workspaceFolders!?.[0].uri.fsPath,
  //   ".template"
  // );
  // const files = await vscode.workspace.fs.readDirectory(
  //   vscode.Uri.file(folder)
  // );
  // return Promise.all(
  //   files
  //     .filter((i) => i[1] === vscode.FileType.File)
  //     .map(async (i) => ({
  //       name: i[0].split(".")[0],
  //       content: await vscode.workspace.fs
  //         .readFile(vscode.Uri.file(path.join(folder, i[0])))
  //         .then((i) => i.toString()),
  //     }))
  // );
};
