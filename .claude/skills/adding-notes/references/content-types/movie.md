# Movies

Movies from IMDB or TMDB.

## Detection

- URL contains: imdb.com/title/, themoviedb.org/movie/
- User explicitly mentions "movie" or "film"
- Type auto-detected as `movie`

## Metadata Collection

Run these in parallel:

**Agent A - Movie Metadata (TMDB preferred):**
1. If IMDB URL provided, extract IMDB ID (e.g., tt32600395)
2. WebSearch: `{imdb_id} TMDB` to find TMDB page
3. WebFetch TMDB page to extract:
   - Title and year
   - Synopsis/overview
   - Director name(s)
   - Genres (for tags)
   - Poster path → construct URL: `https://image.tmdb.org/t/p/w500/{poster_path}`

**Agent B - Official Trailer:**
1. WebSearch: `"{movie title}" {year} official trailer youtube`
2. Look for results from official channels or with "Official Trailer" in title
3. Extract YouTube URL (format: `https://www.youtube.com/watch?v=...`)
4. Verify legitimacy signals:
   - Channel contains studio name, "Movies", or is verified
   - Title contains "Official Trailer"
   - High view count

**Agent C - Director/Author Check:**
```text
Glob: content/authors/*{director-lastname}*.md
```
If not found, create author profile for director.

## Watching Status Prompt

After collecting metadata, prompt user:

```yaml
question: "What's your watching status for this movie?"
header: "Status"
multiSelect: false
options:
  - label: "Watched"
    description: "Already seen it"
  - label: "Want to watch"
    description: "On my watchlist"
  - label: "Currently watching"
    description: "In progress (for series/long films)"
```

### Response Handling

| Response | Set Fields |
|----------|------------|
| Watched | `watchingStatus: watched`, ask for `watchedOn` date |
| Want to watch | `watchingStatus: want-to-watch` |
| Currently watching | `watchingStatus: watching` |

### Rating Prompt (if watched)

```yaml
question: "How would you rate this movie? (1-10)"
header: "Rating"
```

## Frontmatter

```yaml
---
title: "Movie Title"
type: movie
url: "https://www.imdb.com/title/tt..."
cover: "https://image.tmdb.org/t/p/w500/{poster_path}"
trailer: "https://www.youtube.com/watch?v=..."
tags:
  - genre-1
  - genre-2
authors:
  - director-slug
summary: "One-sentence synopsis focusing on the core premise or conflict."
rating: 8
watchingStatus: watched
watchedOn: "2026-01-06"
date: 2026-01-07
---
```

## Cover Image Source

**TMDB provides stable, direct image URLs:**
- Pattern: `https://image.tmdb.org/t/p/{size}/{poster_path}`
- Sizes: w92, w154, w185, w342, w500, w780, original
- Recommended: `w500` for good quality/size balance
- The `poster_path` is found on TMDB movie pages (e.g., `/w2pzrRTevXrW3vgIK4CCYaXvtIc.jpg`)

**Why TMDB over IMDB:**
- IMDB blocks direct fetching (403 errors)
- TMDB provides direct, stable image URLs
- TMDB includes trailer information
- TMDB has consistent data structure

## Trailer Discovery Strategy

Search pattern: `"{movie title}" {year} official trailer`

**Verification signals for "official" trailers:**
1. Channel name contains studio name or "Movies"
2. Title contains "Official Trailer" or "Official Teaser"
3. High view count (millions for major releases)
4. Uploaded by verified channel
5. Video length typical for trailers (1-3 minutes)

**Fallback:** If no official trailer found, omit the `trailer` field rather than linking unofficial content.

## Body Template

```markdown
## Overview

[Brief context: release year, director, notable production aspects]

## Key Themes

- **Theme 1** — Explanation
- **Theme 2** — Explanation
- **Theme 3** — Explanation

## Why It Matters

[Cultural significance, influence, or personal relevance]

## Connections

[Optional - only if genuine connections exist to other notes]

- [[related-note]] - [1-sentence explanation of the relationship]
```

## Special Features

**Movie Poster**: Notes with `type: movie` and valid `cover` URL automatically display the poster in the UI.

**Embedded Trailer**: Notes with `trailer` URL can embed the YouTube player in the UI.
