import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';
import { fetchProblemData } from './api';
import { generateDriver, isClassMeta, parseMeta, Param } from './driver';

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
function getTsCommand(tmpFile: string): string {
    const major = parseInt(process.versions.node.split('.')[0], 10);
    if (major >= 23) return `node --strip-types "${tmpFile}"`;
    if (major >= 22) return `node --experimental-strip-types "${tmpFile}"`;
    return `npx --yes tsx "${tmpFile}"`;
}

function placeholderForType(type: string): string {
    if (type.endsWith('[]')) return '[1,2,3]';
    if (type === 'string') return '"hello"';
    if (type === 'boolean') return 'true';
    if (type === 'character') return '"a"';
    return '42';
}

async function promptFunctionInputs(params: Param[]): Promise<string | undefined> {
    const lines: string[] = [];
    for (const param of params) {
        const val = await vscode.window.showInputBox({
            title: 'LeetCode Local: custom test case',
            prompt: `${param.name} (${param.type})`,
            placeHolder: placeholderForType(param.type),
        });
        if (val === undefined) return undefined; // cancelled
        lines.push(val);
    }
    return lines.join('\n');
}

async function promptClassInputs(classname: string): Promise<string | undefined> {
    const ops = await vscode.window.showInputBox({
        title: 'LeetCode Local: custom test case',
        prompt: `${classname} — operations array`,
        placeHolder: `["${classname}","method1","method2"]`,
    });
    if (ops === undefined) return undefined;

    const args = await vscode.window.showInputBox({
        title: 'LeetCode Local: custom test case',
        prompt: `${classname} — arguments array`,
        placeHolder: '[[constructorArg],[arg1],[arg2]]',
    });
    if (args === undefined) return undefined;

    return `${ops}\n${args}`;
}

async function executeDriver(
    document: vscode.TextDocument,
    metaDataStr: string,
    testcases: string,
    label: string
): Promise<void> {
    const lang = getLang(document);
    if (!lang) return;
    const slug = getSlug(document)!;

    const driver = generateDriver(metaDataStr, testcases);
    const ext = lang === 'typescript' ? 'ts' : 'js';
    const tmpFile = path.join(os.tmpdir(), `lc-${label}-${slug}.${ext}`);
    fs.writeFileSync(tmpFile, document.getText() + driver, 'utf8');

    let terminal = vscode.window.terminals.find(
        (t) => t.name === 'LeetCode Run' && t.exitStatus === undefined
    );
    if (!terminal) {
        terminal = vscode.window.createTerminal('LeetCode Run');
    }
    terminal.show(true);

    const cmd = lang === 'typescript' ? getTsCommand(tmpFile) : `node "${tmpFile}"`;
    terminal.sendText(cmd);
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
    if (!getLang(document)) {
        vscode.window.showErrorMessage(
            'LeetCode Local: file does not appear to be a TypeScript/JavaScript LeetCode solution.'
        );
        return;
    }

    await vscode.window.withProgress(
        { location: vscode.ProgressLocation.Notification, title: `LeetCode Local: fetching test cases for ${slug}…`, cancellable: false },
        async () => {
            try {
                const problemData = await fetchProblemData(slug, context);
                await executeDriver(document, problemData.metaData, problemData.exampleTestcases, 'example');
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : String(err);
                vscode.window.showErrorMessage(`LeetCode Local: ${msg}`);
            }
        }
    );
}

export async function runCustomSolution(
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
    if (!getLang(document)) {
        vscode.window.showErrorMessage(
            'LeetCode Local: file does not appear to be a TypeScript/JavaScript LeetCode solution.'
        );
        return;
    }

    let metaDataStr: string;
    try {
        const problemData = await fetchProblemData(slug, context);
        metaDataStr = problemData.metaData;
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        vscode.window.showErrorMessage(`LeetCode Local: ${msg}`);
        return;
    }

    const meta = parseMeta(metaDataStr);
    const testcases = isClassMeta(meta)
        ? await promptClassInputs(meta.classname)
        : await promptFunctionInputs(meta.params);

    if (testcases === undefined) return; // user cancelled

    try {
        await executeDriver(document, metaDataStr, testcases, 'custom');
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        vscode.window.showErrorMessage(`LeetCode Local: ${msg}`);
    }
}
