#!/bin/bash
set -e
cd "$(dirname "$0")"

npm install
npm run compile

# VS Code Server (WSL) extensions live here; adjust if using desktop VS Code
EXT_DIR="${HOME}/.vscode-server/extensions/leetcode-local-runner-0.1.0"
rm -rf "$EXT_DIR"
mkdir -p "$EXT_DIR"
cp package.json "$EXT_DIR/"
cp -r out "$EXT_DIR/"

echo "Installed to $EXT_DIR"
echo "Run: Ctrl+Shift+P -> 'Developer: Reload Window' to activate"
