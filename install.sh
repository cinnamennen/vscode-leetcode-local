#!/bin/bash
set -e

REPO="cinnamennen/vscode-leetcode-local"

echo "Downloading latest release from $REPO..."
TMP_DIR=$(mktemp -d)
gh release download --repo "$REPO" --pattern "*.vsix" --dir "$TMP_DIR"
VSIX=$(ls "$TMP_DIR"/*.vsix | head -1)

echo "Installing $(basename "$VSIX")..."
code --install-extension "$VSIX"

rm -rf "$TMP_DIR"
echo "Done. Reload VS Code (Ctrl+Shift+P -> Developer: Reload Window)"
