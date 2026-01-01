#!/bin/bash
# Generates frontmatter template for new notes
# Usage: ./generate-frontmatter.sh [url] [type]

DATE=$(date +%Y-%m-%dT%H:%M:%S)
URL="${1:-}"
TYPE="${2:-note}"

# Auto-detect type from URL if not explicitly provided
if [[ -n "$URL" && "$TYPE" == "note" ]]; then
  case "$URL" in
    *youtube.com*|*youtu.be*) TYPE="youtube" ;;
    *reddit.com*|*redd.it*) TYPE="reddit" ;;
    *spotify.com/episode*|*podcasts.apple.com*|*podcast*) TYPE="podcast" ;;
    *twitter.com*|*x.com*) TYPE="tweet" ;;
    *amazon.com*|*goodreads.com*) TYPE="book" ;;
    *imdb.com*) TYPE="movie" ;;
    *udemy.com*|*coursera.org*|*skillshare.com*) TYPE="course" ;;
    *) TYPE="article" ;;
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
