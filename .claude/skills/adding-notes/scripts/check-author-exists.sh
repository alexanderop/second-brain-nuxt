#!/bin/bash
# Check if an author profile already exists
# Usage: check-author-exists.sh "Author Name"
#
# Output on found:  EXISTS: content/authors/author-name.md
# Output on possible match: POSSIBLE_MATCH: file1.md, file2.md
# Output on not found: NOT_FOUND
# Exit codes: 0 = found, 1 = not found, 2 = usage error, 3 = possible match

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

    # Search in aliases field (case-insensitive)
    ALIAS_MATCH=$(grep -li "aliases:" "$AUTHORS_DIR"/*.md 2>/dev/null | \
        xargs grep -li "$AUTHOR_NAME" 2>/dev/null | head -1) || true
    if [ -n "$ALIAS_MATCH" ]; then
        echo "EXISTS: $ALIAS_MATCH"
        exit 0
    fi

    # Fuzzy search: look for last name or initials in name/aliases fields
    # Extract words from input name for partial matching
    LAST_WORD=$(echo "$AUTHOR_NAME" | awk '{print $NF}' | tr '[:upper:]' '[:lower:]')
    INITIALS=$(echo "$AUTHOR_NAME" | sed 's/\([A-Z]\)[a-z]*/\1/g' | tr -d ' ' | tr '[:upper:]' '[:lower:]')

    POSSIBLE_MATCHES=""

    # Search for last name in name field
    if [ -n "$LAST_WORD" ] && [ ${#LAST_WORD} -gt 2 ]; then
        MATCHES=$(grep -li "^name:.*$LAST_WORD" "$AUTHORS_DIR"/*.md 2>/dev/null) || true
        if [ -n "$MATCHES" ]; then
            POSSIBLE_MATCHES="$MATCHES"
        fi
    fi

    # Search for initials as filename (e.g., "dhh" for "David Heinemeier Hansson")
    if [ -n "$INITIALS" ] && [ -f "$AUTHORS_DIR/$INITIALS.md" ]; then
        if [ -z "$POSSIBLE_MATCHES" ]; then
            POSSIBLE_MATCHES="$AUTHORS_DIR/$INITIALS.md"
        else
            POSSIBLE_MATCHES="$POSSIBLE_MATCHES"$'\n'"$AUTHORS_DIR/$INITIALS.md"
        fi
    fi

    # If we found possible matches, return them
    if [ -n "$POSSIBLE_MATCHES" ]; then
        # Dedupe and format
        UNIQUE_MATCHES=$(echo "$POSSIBLE_MATCHES" | sort -u | tr '\n' ', ' | sed 's/, $//')
        echo "POSSIBLE_MATCH: $UNIQUE_MATCHES"
        exit 3
    fi
fi

echo "NOT_FOUND"
exit 1
