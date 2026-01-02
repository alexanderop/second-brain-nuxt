#!/bin/bash
# List all existing authors for reference and disambiguation
# Usage: list-existing-authors.sh [search-term]
#
# Examples:
#   list-existing-authors.sh           # Show all authors
#   list-existing-authors.sh "simon"   # Filter by term

AUTHORS_DIR="${AUTHORS_DIR:-content/authors}"
SEARCH="${1:-}"

# Check if authors directory exists
if [ ! -d "$AUTHORS_DIR" ]; then
    echo "No authors directory found at $AUTHORS_DIR" >&2
    exit 1
fi

# Extract names from YAML frontmatter
AUTHORS=$(grep -h "^name: " "$AUTHORS_DIR"/*.md 2>/dev/null | \
    sed 's/^name: "//' | \
    sed 's/"$//' | \
    sort)

if [ -z "$AUTHORS" ]; then
    echo "No authors found in $AUTHORS_DIR/*.md" >&2
    exit 1
fi

if [ -n "$SEARCH" ]; then
    echo "Authors matching '$SEARCH':"
    MATCHES=$(echo "$AUTHORS" | grep -i "$SEARCH" | sed 's/^/  - /')
    if [ -n "$MATCHES" ]; then
        echo "$MATCHES"
    else
        echo "  (no matches)"
    fi
else
    echo "Existing authors:"
    echo "$AUTHORS" | sed 's/^/  - /'
fi
