# Movies

Movies from IMDB or TMDB.

## Detection

- URL contains: imdb.com/title/, themoviedb.org/movie/
- User explicitly mentions "movie" or "film"
- Type auto-detected as `movie`

## Metadata Collection

**CRITICAL: Never fetch IMDB directly** — IMDB returns 403 errors. Always go to TMDB.

Run these in parallel:

**Agent A - Movie Metadata (TMDB only):**
1. Extract IMDB ID from URL (e.g., `tt16311594` from `imdb.com/title/tt16311594/`)
2. WebSearch: `{imdb_id} site:themoviedb.org` to find TMDB page
3. TMDB URLs follow pattern: `themoviedb.org/movie/{tmdb_id}-{slug}`
4. WebFetch the TMDB page to extract:
   - Title and year
   - Synopsis/overview
   - Director name(s)
   - Genres (for tags)
   - Poster path → construct URL: `https://image.tmdb.org/t/p/w500/{poster_path}`

**Agent B - Official Trailer (best effort):**
1. WebSearch: `"{movie title}" {year} official trailer`
2. Look for results containing YouTube URLs in the search results themselves
3. **YouTube cannot be fetched directly** — only use URLs visible in search results
4. If no YouTube URL found in 2 search attempts, **omit the trailer field entirely**
5. **Never guess or construct YouTube URLs** — only use verified URLs from search results

**Agent C - Director/Author Check:**
```text
Glob: content/authors/*{director-lastname}*.md
```
If not found, create author profile for director.

## Watching Status Prompt

**Skip prompts for data already provided.** If user says "watched it 2025 give it a 9":
- Set `watchingStatus: watched`, `watchedOn: "2025"`, `rating: 9`
- Don't prompt for any of these fields

Only prompt for missing information:

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
trailer: "https://www.youtube.com/watch?v=..."  # optional - omit if not verified
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

**Constraint:** YouTube pages cannot be fetched directly. You can only use URLs that appear in web search results.

Search pattern: `"{movie title}" {year} official trailer`

**Look for YouTube URLs in search results** — they often appear in result snippets or descriptions. Valid format: `youtube.com/watch?v={11-char-id}`

**Verification signals (from search result context):**
1. Result mentions official channel or studio name
2. Title contains "Official Trailer" or "Official Teaser"
3. High view count mentioned in snippet

**Strict rules:**
- Only use YouTube URLs that appear verbatim in search results
- **Never construct or guess video IDs**
- If no verified URL found after 2 searches, **omit the trailer field**
- An empty trailer field is better than a broken link

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
