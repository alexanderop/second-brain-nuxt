#!/bin/bash
# Fetch GitHub repository metadata using the public API
# Usage: get-github-metadata.sh <github-url>
# Example: get-github-metadata.sh https://github.com/steveyegge/beads

set -e

URL="$1"

if [ -z "$URL" ]; then
    echo "Usage: get-github-metadata.sh <github-url>" >&2
    exit 1
fi

# Extract owner/repo from URL
# Handles: https://github.com/owner/repo or https://github.com/owner/repo/...
REPO_PATH=$(echo "$URL" | sed -E 's|https?://github\.com/([^/]+/[^/]+).*|\1|')

if [ -z "$REPO_PATH" ]; then
    echo "Error: Could not parse GitHub URL: $URL" >&2
    exit 1
fi

# Fetch from GitHub API (no auth needed for public repos)
API_URL="https://api.github.com/repos/$REPO_PATH"
RESPONSE=$(curl -s -H "Accept: application/vnd.github.v3+json" "$API_URL")

# Check for errors
if echo "$RESPONSE" | grep -q '"message"'; then
    MESSAGE=$(echo "$RESPONSE" | jq -r '.message // empty')
    if [ -n "$MESSAGE" ] && [ "$MESSAGE" != "null" ]; then
        echo "Error: $MESSAGE" >&2
        exit 1
    fi
fi

# Extract fields
NAME=$(echo "$RESPONSE" | jq -r '.name // empty')
DESCRIPTION=$(echo "$RESPONSE" | jq -r '.description // empty')
STARS=$(echo "$RESPONSE" | jq -r '.stargazers_count // 0')
LANGUAGE=$(echo "$RESPONSE" | jq -r '.language // empty')
OWNER=$(echo "$RESPONSE" | jq -r '.owner.login // empty')
TOPICS=$(echo "$RESPONSE" | jq -r '.topics // [] | join(", ")')

# Output as key-value pairs
echo "name: $NAME"
echo "description: $DESCRIPTION"
echo "stars: $STARS"
echo "language: $LANGUAGE"
echo "owner: $OWNER"
echo "topics: $TOPICS"
