# LeetCode Local Runner

A VS Code companion extension for [vscode-leetcode](https://marketplace.visualstudio.com/items?itemName=LeetCode.vscode-leetcode) that adds a **▶ Run Locally** button to your TypeScript and JavaScript solution files, letting you print-statement debug without submitting to LeetCode's servers.

## How it works

1. Open a `.ts` or `.js` solution file created by the vscode-leetcode extension
2. Two buttons appear above `// @lc code=start`:
   - **▶ Run Locally** — fetches LeetCode's example test cases and runs them
   - **▶ Run Custom** — runs a single test case you provide

Example output for LRU Cache:
```
Case 1: [null,null,null,1,null,-1,null,-1,3,4]
```

Example output for Two Sum:
```
Case 1 [nums=[2,7,11,15], target=9]: [0,1]
Case 2 [nums=[3,2,4], target=6]: [1,2]
```

## Custom test cases

**▶ Run Custom** lets you test against your own inputs.

### Option 1 — Input box prompt

Click **▶ Run Custom** and type each parameter value when prompted. The input boxes stay open while you switch windows to copy a value, and your last-used values are pre-filled next time.

### Option 2 — Comment block in the file

Add a `// @lc-custom` comment block anywhere in the file. Each following `// <value>` line is one input line (same format LeetCode uses: one line per parameter). When this block is present, **▶ Run Custom** uses it directly without prompting.

```typescript
// @lc-custom
// [2,7,11,15]
// 9
```

Multiple test cases work too — just add more groups of lines:

```typescript
// @lc-custom
// [2,7,11,15]
// 9
// [3,2,4]
// 6
```

## Requirements

- Node.js 22 or later
- [vscode-leetcode](https://marketplace.visualstudio.com/items?itemName=LeetCode.vscode-leetcode) to download and submit solutions

## Configuration

| Setting | Default | Description |
|---|---|---|
| `leetcodeLocal.cacheMaxAge` | `86400` | Seconds to cache fetched problem data. Set to `0` to always fetch fresh. |

## Supported languages

TypeScript and JavaScript only. The solution file must follow the `ID.problem-slug.ts` naming convention produced by vscode-leetcode.
