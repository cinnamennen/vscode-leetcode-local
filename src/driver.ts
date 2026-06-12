export interface Param {
    name: string;
    type: string;
}

export interface FunctionMeta {
    name: string;
    params: Param[];
    return: { type: string };
}

export interface ClassMeta {
    classname: string;
    constructor: { params: Param[] };
    methods: Array<{ name: string; params: Param[]; return: { type: string } }>;
}

export type Meta = FunctionMeta | ClassMeta;

export function parseMeta(metaDataStr: string): Meta {
    return JSON.parse(metaDataStr);
}

export function isClassMeta(meta: Meta): meta is ClassMeta {
    return 'classname' in meta;
}

export function generateDriver(metaDataStr: string, exampleTestcases: string): string {
    const meta: Meta = JSON.parse(metaDataStr);
    const lines = exampleTestcases.split('\n').filter((l) => l.trim() !== '');

    const chunks: string[] = [
        '',
        '// ---- leetcode-local: auto-generated test driver ----',
    ];

    if (isClassMeta(meta)) {
        chunks.push(...buildClassDriver(meta, lines));
    } else {
        chunks.push(...buildFunctionDriver(meta, lines));
    }

    return chunks.join('\n') + '\n';
}

function buildFunctionDriver(meta: FunctionMeta, lines: string[]): string[] {
    const n = meta.params.length;
    const result: string[] = [];
    let caseNum = 1;

    for (let i = 0; i + n <= lines.length; i += n, caseNum++) {
        const args = lines.slice(i, i + n);
        const label = meta.params.map((p, j) => `${p.name}=${args[j]}`).join(', ');
        result.push(
            `console.log(\`Case ${caseNum} [${label}]:\`, JSON.stringify(${meta.name}(${args.join(', ')})));`
        );
    }

    return result;
}

function buildClassDriver(meta: ClassMeta, lines: string[]): string[] {
    const result: string[] = [];

    // Class problems have pairs of lines: operations array + args array
    for (let i = 0; i + 1 < lines.length; i += 2) {
        const caseNum = i / 2 + 1;
        result.push(
            `{`,
            `  const ops: string[] = ${lines[i]};`,
            `  const args: any[][] = ${lines[i + 1]};`,
            `  const out: any[] = [null];`,
            `  const Cls: any = ${meta.classname};`,
            `  const obj = new Cls(...args[0]);`,
            `  for (let i = 1; i < ops.length; i++) {`,
            `    out.push(obj[ops[i]](...args[i]) ?? null);`,
            `  }`,
            `  console.log(\`Case ${caseNum}:\`, JSON.stringify(out));`,
            `}`,
        );
    }

    return result;
}
