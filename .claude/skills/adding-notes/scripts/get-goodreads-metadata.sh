#!/bin/bash
# Fetch book metadata from Goodreads URL
# Extracts: title, author, cover image URL from OpenGraph meta tags
#
# Usage: get-goodreads-metadata.sh <goodreads-url>
#
# Output:
#   Title: Book Title
#   Author: Author Name
#   Cover: https://images-na.ssl-images-amazon.com/...
#
# Requires: curl

set -e

URL="$1"

if [[ -z "$URL" ]]; then
  echo "Usage: get-goodreads-metadata.sh <goodreads-url>" >&2
  exit 1
fi

if [[ "$URL" != *"goodreads.com"* ]]; then
  echo "Error: URL must be a Goodreads URL" >&2
  exit 1
fi

# Fetch the page HTML
HTML=$(curl -sL "$URL" -H "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)")

if [[ -z "$HTML" ]]; then
  echo "Error: Failed to fetch page" >&2
  exit 1
fi

# Extract og:title (book title)
TITLE=$(echo "$HTML" | grep -o '<meta property="og:title" content="[^"]*"' | head -1 | sed 's/.*content="\([^"]*\)".*/\1/')

# Extract og:image (cover URL)
COVER=$(echo "$HTML" | grep -o '<meta property="og:image" content="[^"]*"' | head -1 | sed 's/.*content="\([^"]*\)".*/\1/')

# Extract author name from structured data or meta tags
# Try multiple patterns as Goodreads HTML structure varies
AUTHOR=$(echo "$HTML" | grep -o 'class="ContributorLink__name"[^>]*>[^<]*<' | head -1 | sed 's/.*>\([^<]*\)<.*/\1/')

# Fallback: try author from span with itemprop
if [[ -z "$AUTHOR" ]]; then
  AUTHOR=$(echo "$HTML" | grep -o '<span itemprop="name">[^<]*</span>' | head -1 | sed 's/<[^>]*>//g')
fi

# Fallback: try from og:book:author or similar
if [[ -z "$AUTHOR" ]]; then
  AUTHOR=$(echo "$HTML" | grep -o 'class="authorName"[^>]*><span[^>]*>[^<]*<' | head -1 | sed 's/.*>\([^<]*\)<.*/\1/')
fi

# Output results
echo "Title: $TITLE"
echo "Author: $AUTHOR"
echo "Cover: $COVER"
