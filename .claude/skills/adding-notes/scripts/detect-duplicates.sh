#!/bin/bash
# Detect potential duplicate notes based on title or URL
# Usage: ./detect-duplicates.sh "Title" [URL]
# Returns: List of potential duplicates (exit 1) or "No duplicates found" (exit 0)

set -e

CONTENT_DIR="content"

if [ -z "$1" ]; then
    echo "Usage: $0 <title> [url]"
    echo "  Check for potential duplicate notes by title and/or URL"
    exit 1
fi

TITLE="$1"
URL="${2:-}"

DUPLICATES=""
DUPLICATE_COUNT=0

# Normalize title for comparison (lowercase, remove special chars)
NORMALIZED_TITLE=$(echo "$TITLE" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9 ]//g' | xargs)

# Check for exact title match in frontmatter
echo "Checking for title matches..."
TITLE_MATCHES=$(grep -l "^title:.*$TITLE" "$CONTENT_DIR"/*.md 2>/dev/null || true)

if [ -n "$TITLE_MATCHES" ]; then
    while IFS= read -r file; do
        if [ -n "$file" ]; then
            DUPLICATE_COUNT=$((DUPLICATE_COUNT + 1))
            DUPLICATES="$DUPLICATES\n  - Exact title match: $file"
        fi
    done <<< "$TITLE_MATCHES"
fi

# Check for similar titles (first 3 words match)
FIRST_WORDS=$(echo "$NORMALIZED_TITLE" | awk '{print $1" "$2" "$3}')
if [ -n "$FIRST_WORDS" ] && [ "$FIRST_WORDS" != "  " ]; then
    SIMILAR_MATCHES=$(grep -il "^title:.*$FIRST_WORDS" "$CONTENT_DIR"/*.md 2>/dev/null || true)

    if [ -n "$SIMILAR_MATCHES" ]; then
        while IFS= read -r file; do
            if [ -n "$file" ]; then
                # Skip if already found as exact match
                if [[ "$TITLE_MATCHES" != *"$file"* ]]; then
                    DUPLICATE_COUNT=$((DUPLICATE_COUNT + 1))
                    DUPLICATES="$DUPLICATES\n  - Similar title: $file"
                fi
            fi
        done <<< "$SIMILAR_MATCHES"
    fi
fi

# Check for URL match if URL provided
if [ -n "$URL" ]; then
    echo "Checking for URL matches..."
    # Escape special characters in URL for grep
    ESCAPED_URL=$(echo "$URL" | sed 's/[.[\*^$()+?{|]/\\&/g')
    URL_MATCHES=$(grep -l "^url:.*$ESCAPED_URL" "$CONTENT_DIR"/*.md 2>/dev/null || true)

    if [ -n "$URL_MATCHES" ]; then
        while IFS= read -r file; do
            if [ -n "$file" ]; then
                DUPLICATE_COUNT=$((DUPLICATE_COUNT + 1))
                DUPLICATES="$DUPLICATES\n  - URL match: $file"
            fi
        done <<< "$URL_MATCHES"
    fi

    # Also check for partial URL match (same domain/path)
    # Extract domain from URL
    DOMAIN=$(echo "$URL" | sed -E 's|https?://([^/]+).*|\1|')
    if [ -n "$DOMAIN" ]; then
        DOMAIN_MATCHES=$(grep -l "^url:.*$DOMAIN" "$CONTENT_DIR"/*.md 2>/dev/null | head -5 || true)
        if [ -n "$DOMAIN_MATCHES" ]; then
            while IFS= read -r file; do
                if [ -n "$file" ]; then
                    # Skip if already found
                    if [[ "$URL_MATCHES" != *"$file"* ]] && [[ "$TITLE_MATCHES" != *"$file"* ]]; then
                        DUPLICATES="$DUPLICATES\n  - Same domain: $file (verify manually)"
                    fi
                fi
            done <<< "$DOMAIN_MATCHES"
        fi
    fi
fi

# Report results
if [ $DUPLICATE_COUNT -gt 0 ]; then
    echo "Potential duplicates found: $DUPLICATE_COUNT"
    echo -e "$DUPLICATES"
    exit 1
else
    echo "No duplicates found"
    exit 0
fi
