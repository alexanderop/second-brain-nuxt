#!/bin/bash
# Generates frontmatter template for new notes
# Usage: ./generate-frontmatter.sh [url] [type]

DATE=$(date +%Y-%m-%d)
URL="${1:-}"
TYPE="${2:-note}"

# Auto-detect type from URL if provided
if [[ -n "$URL" ]]; then
  case "$URL" in
    *youtube.com*|*youtu.be*) TYPE="youtube" ;;
    *spotify.com/episode*|*podcasts.apple.com*|*podcast*) TYPE="podcast" ;;
    *twitter.com*|*x.com*) TYPE="tweet" ;;
    *amazon.com*|*goodreads.com*) TYPE="book" ;;
    *imdb.com*) TYPE="movie" ;;
    *) TYPE="${TYPE:-article}" ;;
  esac
fi

cat << EOF
---
title: ""
type: $TYPE
url: "$URL"
tags: []
summary: ""
notes: ""
date: $DATE
---
EOF
