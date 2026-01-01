#!/bin/bash
# Fetch YouTube video metadata using oEmbed API (no dependencies required)

if [ -z "$1" ]; then
    echo "Usage: get-youtube-metadata.sh <youtube-url>" >&2
    exit 1
fi

URL="$1"

# Use YouTube's oEmbed API to get title and author
OEMBED_URL="https://www.youtube.com/oembed?url=${URL}&format=json"

# Fetch and parse with curl
RESPONSE=$(curl -s "$OEMBED_URL")

if [ $? -ne 0 ] || [ -z "$RESPONSE" ]; then
    echo "Error: Failed to fetch metadata for $URL" >&2
    exit 1
fi

# Extract fields using basic tools (grep/sed work on JSON for simple cases)
TITLE=$(echo "$RESPONSE" | grep -o '"title":"[^"]*"' | sed 's/"title":"//;s/"$//')
AUTHOR=$(echo "$RESPONSE" | grep -o '"author_name":"[^"]*"' | sed 's/"author_name":"//;s/"$//')

if [ -z "$TITLE" ]; then
    echo "Error: Could not parse metadata" >&2
    exit 1
fi

echo "Title: $TITLE"
echo "Channel: $AUTHOR"
