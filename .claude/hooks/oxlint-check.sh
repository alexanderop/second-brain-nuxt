#!/bin/bash

# Extract file path from hook input
file_path=$(jq -r '.tool_input.file_path' 2>/dev/null)

# Exit if no file path
if [ -z "$file_path" ]; then
  exit 0
fi

# Only check JS/TS/Vue files
if ! [[ "$file_path" =~ \.(js|ts|jsx|tsx|vue)$ ]]; then
  exit 0
fi

# Run oxlint - exit 2 blocks Claude until fixed
if ! "$CLAUDE_PROJECT_DIR/node_modules/.bin/oxlint" "$file_path" 2>&1; then
  exit 2
fi

exit 0
