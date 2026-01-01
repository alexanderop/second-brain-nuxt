#!/bin/bash
# Generate a kebab-case slug from a title and check for conflicts
# Usage: generate-slug.sh "The Science of Setting & Achieving Goals"
# Output: science-of-setting-achieving-goals

set -e

if [ -z "$1" ]; then
    echo "Usage: generate-slug.sh \"Title Here\"" >&2
    exit 1
fi

TITLE="$1"
CONTENT_DIR="${2:-content}"

# Convert to kebab-case:
# 1. Convert to lowercase
# 2. Replace & with "and"
# 3. Remove special characters except spaces and hyphens
# 4. Replace spaces with hyphens
# 5. Remove consecutive hyphens
# 6. Remove leading/trailing hyphens
SLUG=$(echo "$TITLE" | \
    tr '[:upper:]' '[:lower:]' | \
    sed 's/&/and/g' | \
    sed 's/[^a-z0-9 -]//g' | \
    sed 's/  */ /g' | \
    sed 's/ /-/g' | \
    sed 's/--*/-/g' | \
    sed 's/^-//;s/-$//')

# Check if file already exists
if [ -f "$CONTENT_DIR/$SLUG.md" ]; then
    echo "Warning: $CONTENT_DIR/$SLUG.md already exists" >&2
    echo "$SLUG"
    exit 1
fi

echo "$SLUG"
