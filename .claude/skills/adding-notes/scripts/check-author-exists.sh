#!/bin/bash
# Check if an author profile already exists
# Usage: check-author-exists.sh "Author Name"
#
# Output on found:  EXISTS: content/authors/author-name.md
# Output on not found: NOT_FOUND
# Exit codes: 0 = found, 1 = not found, 2 = usage error

set -e

if [ -z "$1" ]; then
    echo "Usage: check-author-exists.sh \"Author Name\"" >&2
    exit 2
fi

AUTHOR_NAME="$1"
AUTHORS_DIR="${AUTHORS_DIR:-content/authors}"

# Generate expected filename (kebab-case)
FILENAME=$(echo "$AUTHOR_NAME" | \
    tr '[:upper:]' '[:lower:]' | \
    sed 's/&/and/g' | \
    sed 's/[^a-z0-9 -]//g' | \
    sed 's/  */ /g' | \
    sed 's/ /-/g' | \
    sed 's/--*/-/g' | \
    sed 's/^-//;s/-$//')

# Check if file exists by expected filename
if [ -f "$AUTHORS_DIR/$FILENAME.md" ]; then
    echo "EXISTS: $AUTHORS_DIR/$FILENAME.md"
    exit 0
fi

# Also search by name field in case filename differs
if [ -d "$AUTHORS_DIR" ]; then
    MATCH=$(grep -l "^name: \"$AUTHOR_NAME\"" "$AUTHORS_DIR"/*.md 2>/dev/null | head -1) || true
    if [ -n "$MATCH" ]; then
        echo "EXISTS: $MATCH"
        exit 0
    fi
fi

echo "NOT_FOUND"
exit 1
