import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';
import { fetchProblemData } from './api';
import { generateDriver } from './driver';

function getSlug(document: vscode.TextDocument): string | null {
    const basename = path.basename(document.fileName);
    const match = basename.match(/^\d+\.(.+)\.(ts|js)$/);
    return match ? match[1] : null;
}

function getLang(document: vscode.TextDocument): 'typescript' | 'javascript' | null {
    const m = document.getText().match(/@lc app=leetcode id=\d+ lang=(typescript|javascript)/);
    return m ? (m[1] as 'typescript' | 'javascript') : null;
}

// Node 22.6+ supports --experimental-strip-types; Node 23+ promoted it to --strip-types.
// This avoids npx overhead when possible.
function getTsCommand(tmpFile: string): string {
    const major = parseInt(process.versions.node.split('.')[0], 10);
    if (major >= 23) {
        return `node --strip-types "${tmpFile}"`;
    }
    if (major >= 22) {
        return `node --experimental-strip-types "${tmpFile}"`;
    }
    return `npx --yes tsx "${tmpFile}"`;
}

export async function runSolution(
    document: vscode.TextDocument,
    context: vscode.ExtensionContext
): Promise<void> {
    const slug = getSlug(document);
    if (!slug) {
        vscode.window.showErrorMessage(
            'LeetCode Local: could not determine problem slug from filename (expected: 123.problem-name.ts)'
        );
        return;
    }

    const lang = getLang(document);
    if (!lang) {
        vscode.window.showErrorMessage(
            'LeetCode Local: file does not appear to be a TypeScript/JavaScript LeetCode solution.'
        );
        return;
    }

    await vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
            title: `LeetCode Local: fetching test cases for ${slug}…`,
            cancellable: false,
        },
        async () => {
            try {
                const problemData = await fetchProblemData(slug, context);
                const driver = generateDriver(problemData.metaData, problemData.exampleTestcases);
                const ext = lang === 'typescript' ? 'ts' : 'js';
                const tmpFile = path.join(os.tmpdir(), `lc-${slug}.${ext}`);
                fs.writeFileSync(tmpFile, document.getText() + driver, 'utf8');

                let terminal = vscode.window.terminals.find(
                    (t) => t.name === 'LeetCode Run' && t.exitStatus === undefined
                );
                if (!terminal) {
                    terminal = vscode.window.createTerminal('LeetCode Run');
                }
                terminal.show(true);

                const cmd = lang === 'typescript'
                    ? getTsCommand(tmpFile)
                    : `node "${tmpFile}"`;
                terminal.sendText(cmd);
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : String(err);
                vscode.window.showErrorMessage(`LeetCode Local: ${msg}`);
            }
        }
    );
}
