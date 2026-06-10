import * as https from 'https';
import * as vscode from 'vscode';

export interface ProblemData {
    exampleTestcases: string;
    metaData: string;
}

interface CacheEntry {
    data: ProblemData;
    cachedAt: number;
}

const QUERY = `
    query questionData($titleSlug: String!) {
        question(titleSlug: $titleSlug) {
            exampleTestcases
            metaData
        }
    }
`;

function cacheMaxAgeMs(): number {
    const cfg = vscode.workspace.getConfiguration('leetcodeLocal');
    return (cfg.get<number>('cacheMaxAge') ?? 86400) * 1000;
}

export async function fetchProblemData(
    slug: string,
    context: vscode.ExtensionContext
): Promise<ProblemData> {
    const cacheKey = `problemData:${slug}`;
    const maxAge = cacheMaxAgeMs();

    if (maxAge > 0) {
        const cached = context.globalState.get<CacheEntry>(cacheKey);
        if (cached && Date.now() - cached.cachedAt < maxAge) {
            return cached.data;
        }
    }

    const data = await fetchFromApi(slug);
    await context.globalState.update(cacheKey, { data, cachedAt: Date.now() } satisfies CacheEntry);
    return data;
}

function fetchFromApi(slug: string): Promise<ProblemData> {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify({ query: QUERY, variables: { titleSlug: slug } });

        const req = https.request({
            hostname: 'leetcode.com',
            path: '/graphql',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body),
                'Referer': 'https://leetcode.com',
                'Origin': 'https://leetcode.com',
                'User-Agent': 'Mozilla/5.0',
            },
        }, (res) => {
            let raw = '';
            res.on('data', (chunk) => (raw += chunk));
            res.on('end', () => {
                try {
                    const json = JSON.parse(raw);
                    const q = json.data?.question;
                    if (!q?.exampleTestcases || !q?.metaData) {
                        reject(new Error(
                            `No data returned for "${slug}". The problem may not exist or may require authentication.`
                        ));
                        return;
                    }
                    resolve({ exampleTestcases: q.exampleTestcases, metaData: q.metaData });
                } catch (e) {
                    reject(e);
                }
            });
        });

        req.on('error', reject);
        req.write(body);
        req.end();
    });
}
