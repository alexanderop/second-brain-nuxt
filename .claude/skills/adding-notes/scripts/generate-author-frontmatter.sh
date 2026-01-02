#!/bin/bash
# Generate author profile YAML frontmatter
# Usage: generate-author-frontmatter.sh "Author Name" [options]
#
# Options:
#   --bio "Biography text"
#   --avatar "https://example.com/avatar.jpg"
#   --website "https://author.com"
#   --twitter "handle"
#   --github "handle"
#   --linkedin "handle"
#   --youtube "handle"
#
# All options except name are optional.
# Output: YAML frontmatter to stdout

set -e

if [ -z "$1" ]; then
    echo "Usage: generate-author-frontmatter.sh \"Author Name\" [--bio \"...\"] [--avatar URL] ..." >&2
    exit 1
fi

NAME="$1"
shift

# Default values (empty strings)
BIO=""
AVATAR=""
WEBSITE=""
TWITTER=""
GITHUB=""
LINKEDIN=""
YOUTUBE=""

# Parse options
while [[ $# -gt 0 ]]; do
    case $1 in
        --bio) BIO="$2"; shift 2 ;;
        --avatar) AVATAR="$2"; shift 2 ;;
        --website) WEBSITE="$2"; shift 2 ;;
        --twitter) TWITTER="$2"; shift 2 ;;
        --github) GITHUB="$2"; shift 2 ;;
        --linkedin) LINKEDIN="$2"; shift 2 ;;
        --youtube) YOUTUBE="$2"; shift 2 ;;
        *) shift ;;
    esac
done

# Escape double quotes in bio
BIO_ESCAPED=$(echo "$BIO" | sed 's/"/\\"/g')

cat << EOF
---
name: "$NAME"
slug: "$NAME"
bio: "$BIO_ESCAPED"
avatar: "$AVATAR"
website: "$WEBSITE"
socials:
  twitter: "$TWITTER"
  github: "$GITHUB"
  linkedin: "$LINKEDIN"
  youtube: "$YOUTUBE"
---
EOF
