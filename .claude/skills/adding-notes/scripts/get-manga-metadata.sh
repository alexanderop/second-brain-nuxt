#!/bin/bash
# Fetch manga series metadata from Goodreads series URL
# Extracts: series title, author, cover, total volumes, status
#
# Usage: get-manga-metadata.sh <goodreads-series-url>
#
# Example: get-manga-metadata.sh "https://www.goodreads.com/series/57513-slam-dunk"
#
# Output:
#   Title: Series Name
#   Author: Author Name
#   Cover: https://...
#   Volumes: 31
#   Status: completed|ongoing|hiatus
#
# Requires: curl

set -e

URL="$1"

if [[ -z "$URL" ]]; then
  echo "Usage: get-manga-metadata.sh <goodreads-series-url>" >&2
  echo "Example: get-manga-metadata.sh \"https://www.goodreads.com/series/57513-slam-dunk\"" >&2
  exit 1
fi

if [[ "$URL" != *"goodreads.com"* ]]; then
  echo "Error: URL must be a Goodreads URL" >&2
  exit 1
fi

# Check if this is a series URL
if [[ "$URL" != *"/series/"* ]]; then
  echo "Error: URL must be a Goodreads series URL" >&2
  echo "Expected format: https://www.goodreads.com/series/XXXXX-series-name" >&2
  echo "Got: $URL" >&2
  exit 1
fi

USER_AGENT="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"

# Fetch the series page HTML
HTML=$(curl -sL "$URL" -H "User-Agent: $USER_AGENT")

if [[ -z "$HTML" ]]; then
  echo "Error: Failed to fetch series page" >&2
  exit 1
fi

# Extract series title from <title> tag
# Format is typically "Series Name Series" or "Japanese [English] Series"
SERIES_TITLE=$(echo "$HTML" | grep -o '<title>[^<]*</title>' | head -1 | sed 's/<[^>]*>//g' | sed 's/ Series.*$//')

# If title has brackets like "スラムダンク [Slam Dunk]", extract the bracketed English part
if echo "$SERIES_TITLE" | grep -q '\[.*\]'; then
  SERIES_TITLE=$(echo "$SERIES_TITLE" | sed 's/.*\[\([^]]*\)\].*/\1/')
fi

# Extract first volume link from series page to get the actual Vol. 1 cover
# Pattern: /book/show/DIGITS followed by optional .Title_Name until we hit a quote or special char
FIRST_VOL_LINK=$(echo "$HTML" | grep -oE '/book/show/[0-9]+(\.[A-Za-z0-9_-]+)?' | head -1)

if [[ -n "$FIRST_VOL_LINK" ]]; then
  # Fetch first volume page
  VOL_HTML=$(curl -sL "https://www.goodreads.com${FIRST_VOL_LINK}" -H "User-Agent: $USER_AGENT" 2>/dev/null)

  if [[ -n "$VOL_HTML" ]]; then
    # Extract cover from first volume's og:image
    COVER=$(echo "$VOL_HTML" | grep -o '<meta property="og:image" content="[^"]*"' | head -1 | sed 's/.*content="\([^"]*\)".*/\1/')
  fi
fi

# Fallback: try og:image from series page
if [[ -z "$COVER" ]] || [[ "$COVER" == *"nophoto"* ]]; then
  COVER=$(echo "$HTML" | grep -o '<meta property="og:image" content="[^"]*"' | head -1 | sed 's/.*content="\([^"]*\)".*/\1/')
fi

# Fallback: try to find first book cover image on series page
if [[ -z "$COVER" ]] || [[ "$COVER" == *"nophoto"* ]]; then
  COVER=$(echo "$HTML" | grep -o 'src="https://[^"]*compressed\.photo\.goodreads\.com/books[^"]*"' | head -1 | sed 's/src="\([^"]*\)".*/\1/')
fi

# Upgrade to full resolution by removing size constraints (._SY180_, ._SX100_, etc.)
if [[ -n "$COVER" ]]; then
  COVER=$(echo "$COVER" | sed 's/\._S[XY][0-9]*_\././')
fi

# Extract author from the series page
# Look for author link pattern
AUTHOR=$(echo "$HTML" | grep -o 'class="authorName"[^>]*><span[^>]*>[^<]*<' | head -1 | sed 's/.*>\([^<]*\)<.*/\1/')

if [[ -z "$AUTHOR" ]]; then
  # Try contributor link pattern
  AUTHOR=$(echo "$HTML" | grep -o 'ContributorLink__name[^>]*>[^<]*<' | head -1 | sed 's/.*>\([^<]*\)<.*/\1/')
fi

if [[ -z "$AUTHOR" ]]; then
  # Try itemprop="name" pattern
  AUTHOR=$(echo "$HTML" | grep -o '<span itemprop="name">[^<]*</span>' | head -1 | sed 's/<[^>]*>//g')
fi

if [[ -z "$AUTHOR" ]]; then
  # Try "by Author Name" pattern in description
  AUTHOR=$(echo "$HTML" | grep -o 'by [A-Z][a-zA-Z]* [A-Z][a-zA-Z]*' | head -1 | sed 's/by //')
fi

# Extract volume count
# Look for "X primary works" pattern first
VOLUMES=$(echo "$HTML" | grep -o '[0-9]* primary works' | head -1 | grep -o '[0-9]*')

if [[ -z "$VOLUMES" ]]; then
  # Try "X Volumes" pattern from status line
  VOLUMES=$(echo "$HTML" | grep -o '[0-9]* Volumes' | head -1 | grep -o '[0-9]*')
fi

if [[ -z "$VOLUMES" ]]; then
  # Try total works pattern
  VOLUMES=$(echo "$HTML" | grep -o '[0-9]* total works' | head -1 | grep -o '[0-9]*')
fi

# Extract status from series page
# Look for "Status in Country of Origin: X Volumes (Status)" pattern
STATUS_RAW=$(echo "$HTML" | grep -o 'Volumes ([^)]*)' | head -1 | sed 's/Volumes (\(.*\))/\1/')

# Also check for explicit status indicators
if [[ -z "$STATUS_RAW" ]]; then
  if echo "$HTML" | grep -qi "complete\|finished\|ended\|final volume"; then
    STATUS_RAW="Complete"
  elif echo "$HTML" | grep -qi "hiatus"; then
    STATUS_RAW="Hiatus"
  elif echo "$HTML" | grep -qi "ongoing\|continuing"; then
    STATUS_RAW="Ongoing"
  fi
fi

# Normalize status
case "$STATUS_RAW" in
  *[Hh]iatus*) STATUS="hiatus" ;;
  *[Cc]omplete*|*[Ff]inished*|*[Ee]nded*) STATUS="completed" ;;
  *[Oo]ngoing*|*[Cc]ontinuing*) STATUS="ongoing" ;;
  *) STATUS="ongoing" ;;  # Default to ongoing if unknown
esac

# Output results
echo "Title: $SERIES_TITLE"
echo "Author: $AUTHOR"
echo "Cover: $COVER"
echo "Volumes: $VOLUMES"
echo "Status: $STATUS"
