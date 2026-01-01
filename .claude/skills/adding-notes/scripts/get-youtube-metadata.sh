#!/bin/bash
# Fetch YouTube video metadata using oEmbed API
# Requires: jq (for JSON parsing)

set -e

if [ -z "$1" ]; then
    echo "Usage: get-youtube-metadata.sh <youtube-url>" >&2
    exit 1
fi

# Check for jq dependency
if ! command -v jq &> /dev/null; then
    echo "Error: jq is required but not installed." >&2
    echo "Install with: brew install jq" >&2
    exit 1
fi

URL="$1"

# Use YouTube's oEmbed API
OEMBED_URL="https://www.youtube.com/oembed?url=${URL}&format=json"

# Fetch metadata
RESPONSE=$(curl -s -f "$OEMBED_URL" 2>/dev/null)

if [ -z "$RESPONSE" ]; then
    echo "Error: Failed to fetch metadata for $URL" >&2
    echo "The video may be private, age-restricted, or unavailable." >&2
    exit 1
fi

# Parse with jq
TITLE=$(echo "$RESPONSE" | jq -r '.title // empty')
AUTHOR=$(echo "$RESPONSE" | jq -r '.author_name // empty')

if [ -z "$TITLE" ]; then
    echo "Error: Could not parse video title" >&2
    exit 1
fi

echo "Title: $TITLE"
echo "Channel: $AUTHOR"
