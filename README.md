# LeetCode Local Runner

A VS Code companion extension for [vscode-leetcode](https://marketplace.visualstudio.com/items?itemName=LeetCode.vscode-leetcode) that adds a **▶ Run Locally** button to your TypeScript and JavaScript solution files, letting you print-statement debug without submitting to LeetCode's servers.

## How it works

1. Open a `.ts` or `.js` solution file created by the vscode-leetcode extension
2. Click **▶ Run Locally** above `// @lc code=start`
3. The extension fetches the example test cases from LeetCode's API, generates a test driver, and runs your solution locally in the integrated terminal

Example output for LRU Cache:
```
Case 1: [null,null,null,1,null,-1,null,-1,3,4]
```

Example output for Two Sum:
```
Case 1 [nums=[2,7,11,15], target=9]: [0,1]
Case 2 [nums=[3,2,4], target=6]: [1,2]
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
