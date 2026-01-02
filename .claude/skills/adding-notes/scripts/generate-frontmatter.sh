#!/bin/bash
# Generates frontmatter template for new notes
# Usage: ./generate-frontmatter.sh [url] [type]
#
# For manga detection: Pass type="manga" or script will auto-detect
# if title matches volume pattern (Volume X, Vol. X, #X)

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
    *goodreads.com/series/*) TYPE="manga" ;;
    *amazon.com*|*goodreads.com*) TYPE="book" ;;
    *imdb.com*) TYPE="movie" ;;
    *udemy.com*|*coursera.org*|*skillshare.com*) TYPE="course" ;;
    *) TYPE="article" ;;
  esac
fi

# Generate frontmatter based on type
if [[ "$TYPE" == "manga" ]]; then
  cat << EOF
---
title: ""
type: manga
url: "$URL"
cover: ""
tags:
  - manga
authors: []
volumes:
status:
summary: ""
notes: ""
date: $DATE
---
EOF
elif [[ "$TYPE" == "book" ]]; then
  cat << EOF
---
title: ""
type: $TYPE
url: "$URL"
cover: ""
tags: []
authors: []
summary: ""
notes: ""
date: $DATE
---
EOF
else
  cat << EOF
---
title: ""
type: $TYPE
url: "$URL"
tags: []
authors: []
summary: ""
notes: ""
date: $DATE
---
EOF
fi
