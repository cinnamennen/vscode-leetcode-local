import * as vscode from 'vscode';

export class LeetCodeCodelensProvider implements vscode.CodeLensProvider {
    provideCodeLenses(document: vscode.TextDocument): vscode.CodeLens[] {
        const text = document.getText();
        if (!/@lc app=leetcode id=\d+ lang=(typescript|javascript)/.test(text)) {
            return [];
        }

        for (let i = 0; i < document.lineCount; i++) {
            if (document.lineAt(i).text.trim() === '// @lc code=start') {
                const range = new vscode.Range(i, 0, i, 0);
                return [
                    new vscode.CodeLens(range, {
                        title: '▶ Run Locally',
                        command: 'leetcode-local.run',
                        arguments: [document],
                    }),
                    new vscode.CodeLens(range, {
                        title: '▶ Run Custom',
                        command: 'leetcode-local.runCustom',
                        arguments: [document],
                    }),
                ];
            }
        }
        return [];
    }
}
