import * as vscode from 'vscode';
import { LeetCodeCodelensProvider } from './codelens';
import { runSolution } from './runner';

export function activate(context: vscode.ExtensionContext): void {
    context.subscriptions.push(
        vscode.languages.registerCodeLensProvider(
            [{ language: 'typescript' }, { language: 'javascript' }],
            new LeetCodeCodelensProvider()
        ),
        vscode.commands.registerCommand(
            'leetcode-local.run',
            (document?: vscode.TextDocument) => {
                const doc = document ?? vscode.window.activeTextEditor?.document;
                if (doc) {
                    runSolution(doc, context);
                }
            }
        )
    );
}

export function deactivate(): void {}
