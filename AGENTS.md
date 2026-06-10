# Agent Guide

## What this repo is

A VS Code companion extension (`leetcode-local-runner`) that adds local execution to the vscode-leetcode extension. It reads the `@lc` header from solution files, fetches example test cases from LeetCode's public GraphQL API, generates a test driver, and runs the solution locally via Node.js.

## Build

```bash
npm install
npm run compile      # one-shot build to out/
npm run watch        # rebuild on save
```

Output goes to `out/`. The extension entry point is `out/extension.js`.

## Install locally

```bash
bash install.sh      # downloads latest VSIX from GitHub releases and installs via `code`
```

After installing, reload the VS Code window (`Ctrl+Shift+P` → `Developer: Reload Window`).

## Key files

| File | Role |
|---|---|
| `src/extension.ts` | Activation — registers the CodeLens provider and `leetcode-local.run` command |
| `src/codelens.ts` | `CodeLensProvider` — shows `▶ Run Locally` on files with `@lc lang=typescript\|javascript` |
| `src/api.ts` | Fetches `exampleTestcases` + `metaData` from `leetcode.com/graphql`; caches in `ExtensionContext.globalState` with configurable TTL |
| `src/driver.ts` | Generates test driver code for two problem shapes: plain functions and class-based (ops+args pairs like LRUCache) |
| `src/runner.ts` | Writes temp file, selects runner (`node --strip-types` on Node 23+, `--experimental-strip-types` on 22+, `npx tsx` fallback), sends to "LeetCode Run" terminal |

## Solution file format (produced by vscode-leetcode)

```
/*
 * @lc app=leetcode id=146 lang=typescript
 */
// @lc code=start
... solution code ...
// @lc code=end
```

Filename: `ID.slug.ts` (e.g. `146.lru-cache.ts`). The slug is used as the LeetCode GraphQL `titleSlug`.

## LeetCode API

`POST https://leetcode.com/graphql` with `questionData(titleSlug)` querying `exampleTestcases` and `metaData`. No auth required for public problems.

`metaData` is a JSON string. Two shapes:
- **Function**: `{ name, params: [{name, type}], return }` — `exampleTestcases` has N lines per test case where N = number of params
- **Class**: `{ classname, constructor, methods }` — `exampleTestcases` has pairs of lines: operations array + args array

## Release process

```bash
# bump version in package.json, then:
git add package.json && git commit -m "v0.x.x"
git tag v0.x.x && git push && git push --tags
```

GitHub Actions builds the VSIX, publishes to the VS Code Marketplace, and attaches the VSIX to a GitHub release.

## Configuration

`leetcodeLocal.cacheMaxAge` (seconds, default 86400). Stored per-slug in `ExtensionContext.globalState` as `{ data, cachedAt }`.
