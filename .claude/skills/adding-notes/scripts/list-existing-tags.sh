#!/bin/bash
# List all existing tags with frequency counts
# Usage: list-existing-tags.sh [search-term]

CONTENT_DIR="${CONTENT_DIR:-content}"
SEARCH="${1:-}"

# Extract tags from YAML frontmatter and count occurrences
TAGS=$(grep -h "^  - " "$CONTENT_DIR"/*.md 2>/dev/null | \
    sed 's/^  - //' | \
    sort | \
    uniq -c | \
    sort -rn)

if [ -z "$TAGS" ]; then
    echo "No tags found in $CONTENT_DIR/*.md" >&2
    exit 1
fi

if [ -n "$SEARCH" ]; then
    # Filter by search term (case-insensitive)
    echo "Tags matching '$SEARCH':"
    echo "$TAGS" | grep -i "$SEARCH" || echo "  (no matches)"
else
    echo "All tags (by frequency):"
    echo "$TAGS"
fi
