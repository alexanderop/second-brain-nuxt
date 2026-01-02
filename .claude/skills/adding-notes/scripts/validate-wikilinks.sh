#!/bin/bash
# Validate wiki-links in a markdown file
# Usage: ./validate-wikilinks.sh <markdown-file>
# Returns: List of broken links (exit 1) or "All links valid" (exit 0)

set -e

CONTENT_DIR="content"

if [ -z "$1" ]; then
    echo "Usage: $0 <markdown-file-or-content>"
    echo "  Pass a file path to validate wiki-links in that file"
    echo "  Or pass markdown content directly (for draft notes)"
    exit 1
fi

# Check if argument is a file or raw content
if [ -f "$1" ]; then
    CONTENT=$(cat "$1")
else
    CONTENT="$1"
fi

# Extract all wiki-links using grep
# Matches [[slug]] pattern
LINKS=$(echo "$CONTENT" | grep -oE '\[\[[a-zA-Z0-9_-]+\]\]' | sed 's/\[\[//g; s/\]\]//g' | sort -u)

if [ -z "$LINKS" ]; then
    echo "No wiki-links found"
    exit 0
fi

BROKEN_LINKS=""
VALID_COUNT=0
BROKEN_COUNT=0

while IFS= read -r link; do
    # Check if the target file exists
    TARGET_FILE="$CONTENT_DIR/$link.md"

    if [ -f "$TARGET_FILE" ]; then
        VALID_COUNT=$((VALID_COUNT + 1))
    else
        BROKEN_COUNT=$((BROKEN_COUNT + 1))
        BROKEN_LINKS="$BROKEN_LINKS\n  - [[$link]] → $TARGET_FILE (NOT FOUND)"
    fi
done <<< "$LINKS"

# Report results
if [ $BROKEN_COUNT -gt 0 ]; then
    echo "Broken wiki-links found: $BROKEN_COUNT"
    echo -e "$BROKEN_LINKS"
    echo ""
    echo "Valid links: $VALID_COUNT"
    exit 1
else
    echo "All links valid ($VALID_COUNT links checked)"
    exit 0
fi
