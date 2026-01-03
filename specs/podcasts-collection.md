# Podcasts Collection Specification

## Overview

Add a `podcasts` collection to enable notes to reference podcast shows, similar to how content references authors. This allows grouping episodes from the same podcast and provides show-level metadata.

## Problem

When capturing notes from podcast episodes, there's no way to:
- Link multiple episodes to their parent show
- See all notes from a specific podcast
- Display podcast show metadata (artwork, hosts, description)
- Navigate from an episode to other episodes of the same show

## Solution

Create a `podcasts` collection mirroring the `authors` pattern:
- Podcast show profiles live in `content/podcasts/`
- Episode notes reference shows via a `podcast` field in frontmatter
- Podcast profile pages list all episodes from that show

---

## Data Model

### Podcast Show Schema

Location: `content/podcasts/{slug}.md`

```yaml
---
name: "Huberman Lab"
slug: "huberman-lab"
description: "Science and science-based tools for everyday life"
artwork: "https://..."  # Podcast cover art (any format, CSS handles sizing)
website: "https://hubermanlab.com"
hosts:
  - andrew-huberman  # Required: at least one author slug, equal treatment for multiple
feed: "https://..."  # RSS feed URL (reference only, not actively used)
platforms:
  spotify: "https://open.spotify.com/show/..."
  apple: "https://podcasts.apple.com/..."
  youtube: "https://youtube.com/@hubermanlab"
  rss: "https://feeds.example.com/hubermanlab"
---
```

**Notes:**
- Collection `type: 'data'` - no markdown body content
- `hosts` is required with at least one entry
- Multiple hosts have equal treatment (no primary/secondary distinction)
- `artwork` has no dimension restrictions - CSS handles sizing
- `platforms` is extensible with known keys that have icon mappings
- `feed` is stored for reference only, no active fetching

### Known Platforms Enum

Platforms with predefined Iconify icon mappings:
- `spotify` - Spotify
- `apple` - Apple Podcasts
- `youtube` - YouTube
- `rss` - RSS feed

### Schema Definition

Add to `content.config.ts`:

```typescript
podcasts: defineCollection({
  type: 'data',
  source: 'podcasts/**/*.md',
  schema: z.object({
    name: z.string(),
    slug: z.string(),
    description: z.string().optional(),
    artwork: z.string().url().optional(),
    website: z.string().url().optional(),
    hosts: z.array(z.string()).min(1),  // Required, at least one author slug
    feed: z.string().url().optional(),
    platforms: z.record(z.string(), z.string().url()).optional(),  // Extensible, known keys have icons
  }),
}),
```

### Episode Content Schema Update

Add `podcast` and `guests` fields to content schema:

```typescript
// In content collection schema
podcast: z.string().optional(),  // Podcast slug
guests: z.array(z.string()).optional(),  // Guest author slugs (distinct from hosts)
urls: z.array(z.object({
  platform: z.string(),
  url: z.string().url(),
})).optional(),  // Multiple platform URLs for same episode
```

### Episode Frontmatter Example

```yaml
---
title: "How to Build Habits That Stick"
type: podcast
podcast: huberman-lab  # Links to podcast show
guests:
  - james-clear  # Guest on this episode (not a regular host)
urls:
  - platform: youtube
    url: "https://youtube.com/watch?v=..."
  - platform: spotify
    url: "https://open.spotify.com/episode/..."
tags:
  - habit
  - neuroscience
date: 2025-01-15
---

Episode notes with [[wiki-links]] to related content.
```

**Notes:**
- `podcast` field silently ignored if slug doesn't exist (no build error)
- `guests` are author slugs for people appearing on this specific episode
- `urls` array supports multiple platforms per episode with object format
- Regular `authors` field can still be used alongside `guests`

---

## Attribution Display

### Guest vs Host Distinction

When an episode has both podcast hosts and guests, display them distinctly:
- Hosts come from `podcast.hosts` (via the linked podcast profile)
- Guests come from the episode's `guests` field
- Display format: "Guest: James Clear • Hosted by Andrew Huberman"

### Validation

At skill-time (when adding notes), warn if:
- Episode guest appears in podcast hosts list (unusual pattern)
- Episode has no guests and no authors (attribution unclear)

No build-time validation - keep data flexible.

---

## Pages & Routes

| Route | Description |
|-------|-------------|
| `/podcasts` | All podcast shows |
| `/podcasts/[slug]` | Podcast profile + all episodes |

### Podcast Index Page (`/podcasts`)

- Grid of podcast show cards (matches homepage content grid responsive columns)
- Each card shows: artwork (clickable), name, episode count
- **Sorted by most recent episode date** (keeps active shows prominent)
- **Only shows podcasts with at least one published episode** (hide empty profiles)
- No filtering/search - use browser Cmd+F
- Top-level navigation item (same level as Authors, Tags)

### Podcast Profile Page (`/podcasts/[slug]`)

**Header:**
- Artwork (large, clickable → links back to this page for consistency)
- Name
- Description
- Host links (to author profiles) - all hosts equal treatment
- Platform links with Iconify icons (Spotify, Apple, YouTube, RSS)
- Website link

**Episodes Section:**
- List of all episodes from this podcast (using full ContentCard component)
- Sorted by date (newest first)
- Only counts/shows published episodes (not drafts)

**Related Content Section:**
- Notes that wiki-link to episodes from this podcast
- Notes that wiki-link to the podcast profile itself (e.g., `[[huberman-lab]]`)
- Combined in single "Related" section

### SEO & Meta

- Page title format: "Huberman Lab - Second Brain" (name only, no "Podcast" suffix)
- No custom OpenGraph image - uses site default

### Error Handling

- `/podcasts/non-existent-slug` → Standard 404 page

---

## UI Components

### PodcastCard

Display podcast show in grid:
```
┌─────────────────────────┐
│  ┌─────┐                │
│  │ Art │  Podcast Name  │  ← Artwork is clickable link
│  │     │  12 episodes   │
│  └─────┘                │
└─────────────────────────┘
```

- Full podcast name (no truncation, allow wrapping)
- Artwork is clickable link to profile
- Fallback for missing/broken artwork: generic podcast icon (via CSS onerror)

### PodcastHeader

Profile page header:
```
┌─────────────────────────────────────────┐
│  ┌─────────┐                            │
│  │         │  Huberman Lab              │
│  │ Artwork │  Science-based tools...    │
│  │         │                            │
│  └─────────┘  Hosted by Andrew Huberman │
│                                         │
│  [Spotify] [Apple] [YouTube] [RSS]      │  ← Iconify icons
└─────────────────────────────────────────┘
```

### Episode Content Card Enhancement

When `podcast` field is present on content, show podcast name as clickable link:
```
┌─────────────────────────────────────────┐
│ 🎙 How to Build Habits That Stick      │
│    Huberman Lab • Jan 15, 2025          │  ← "Huberman Lab" links to profile
│    Guest: James Clear                   │
│    #habit #neuroscience                 │
└─────────────────────────────────────────┘
```

### Episode Page Header Badge

On the full episode page (not just cards), show podcast prominently:
- Podcast artwork + name as badge near the title
- Clickable, links to podcast profile
- Display: "Guest: X" and "Hosted by: Y" distinctly if applicable

---

## Queries

### Get podcast by slug
```typescript
const podcast = await queryCollection('podcasts')
  .where('slug', '=', slug)
  .first()
```

### Get all episodes for a podcast
```typescript
const episodes = await queryCollection('content')
  .where('type', '=', 'podcast')
  .where('podcast', '=', podcastSlug)
  .where('draft', '!=', true)  // Published only
  .order('date', 'desc')
  .all()
```

### Get podcasts with episode counts (for index page)
```typescript
// Get all podcasts
const podcasts = await queryCollection('podcasts').all()

// Get published episodes
const episodes = await queryCollection('content')
  .where('type', '=', 'podcast')
  .where('draft', '!=', true)
  .select('podcast', 'date')
  .all()

// Count and get most recent date per podcast
const podcastStats = episodes.reduce((acc, ep) => {
  if (ep.podcast) {
    if (!acc[ep.podcast]) {
      acc[ep.podcast] = { count: 0, mostRecent: null }
    }
    acc[ep.podcast].count++
    if (!acc[ep.podcast].mostRecent || ep.date > acc[ep.podcast].mostRecent) {
      acc[ep.podcast].mostRecent = ep.date
    }
  }
  return acc
}, {})

// Filter to podcasts with episodes, sort by most recent
const activePodcasts = podcasts
  .filter(p => podcastStats[p.slug]?.count > 0)
  .sort((a, b) => {
    const dateA = podcastStats[a.slug]?.mostRecent || ''
    const dateB = podcastStats[b.slug]?.mostRecent || ''
    return dateB.localeCompare(dateA)
  })
```

### Get related content (backlinks)
```typescript
// Notes linking to any episode of this podcast
const episodeSlugs = episodes.map(e => e.slug)
const relatedToEpisodes = await queryCollection('content')
  .where('body', 'contains', episodeSlugs.map(s => `[[${s}]]`))
  .all()

// Notes linking to the podcast itself
const relatedToPodcast = await queryCollection('content')
  .where('body', 'contains', `[[${podcastSlug}]]`)
  .all()

// Combine and dedupe
const related = [...new Map([...relatedToEpisodes, ...relatedToPodcast].map(n => [n.slug, n])).values()]
```

---

## Skill Integration: `adding-notes`

### Podcast Detection

Use content analysis to detect if URL is a podcast episode:
- Analyze page content for podcast indicators
- Check metadata, structured data, page structure
- Don't rely solely on domain patterns

### Auto-Create Podcast Profile

When adding a podcast episode note:
1. Check if podcast profile exists in `content/podcasts/`
2. If not, **always auto-create** the profile:
   - Fetch full metadata: name, description, artwork, website, all available platforms
   - Use web search to supplement if primary source lacks fields
   - Create host author profile(s) if they don't exist
3. Add `podcast: {slug}` to episode frontmatter
4. Add `guests` array if episode features guests
5. Populate `urls` array with all available platform links

### Slug Generation

- Auto-generate from podcast name
- ASCII only (transliterate non-ASCII characters)
- Standard kebab-case formatting

### Validation

At skill-time, warn if:
- Guest author appears in podcast hosts (unusual pattern)
- Referenced podcast slug doesn't match any profile

---

## Implementation Tasks

1. **Schema updates**
   - Add `podcasts` collection to `content.config.ts`
   - Add `podcast`, `guests`, `urls` fields to content schema
   - Define known platforms enum with icon mappings

2. **Create podcast directory**
   - `content/podcasts/` folder
   - Initial profiles for existing podcast episodes (if any)

3. **Podcast pages**
   - `/podcasts` index page (grid, sorted by recent, hide empty)
   - `/podcasts/[slug]` profile page with header, episodes, related

4. **Components**
   - `PodcastCard.vue` - grid card with artwork, name, count
   - `PodcastHeader.vue` - profile page header with platforms
   - Update `ContentCard.vue` to show podcast name (linked)
   - Update episode page header to show podcast badge
   - Generic podcast icon fallback for broken/missing artwork

5. **Navigation**
   - Add "Podcasts" to main nav as top-level item
   - Add to site.config.ts nav array

6. **Skill updates**
   - Update `adding-notes` skill:
     - Content analysis for podcast detection
     - Auto-create podcast profile with full metadata
     - Auto-create host author profiles
     - Web search to supplement missing metadata
     - Populate `guests` and `urls` fields
   - Add skill-time validation warnings

---

## Example Podcasts

Initial profiles to create:

```
content/podcasts/
├── huberman-lab.md
├── lex-fridman-podcast.md
├── diary-of-a-ceo.md
├── jocko-podcast.md
└── dwarkesh-podcast.md
```

---

## Decision Summary

Key decisions from specification review:

| Topic | Decision |
|-------|----------|
| Host field | Required (at least one) |
| Multiple hosts | Equal treatment (no primary) |
| Sort order | Most recent episode first |
| Empty podcasts | Hidden from index |
| Orphan podcast refs | Silently ignored |
| Multi-podcast episodes | Not supported (single podcast) |
| Podcast name in cards | Clickable link to profile |
| Artwork fallback | Generic podcast icon |
| Platforms | Extensible object, 4 known (Spotify, Apple, YouTube, RSS) |
| Episode list style | Full ContentCard component |
| Auto-create profiles | Always, with full metadata |
| Nav placement | Top-level item |
| Backlinks section | Include notes linking to podcast + episodes |
| Collection type | Data (no body content) |
| Platform icons | Iconify |
| Episode counts | Published only |
| Guest attribution | Distinct from hosts, explicit `guests` field |
| Episode URLs | Array of {platform, url} objects |
| Name truncation | Show full name |
| Validation | Skill-time only |
| 404 handling | Standard 404 page |
| Index filtering | None |
| Slug format | ASCII only |
| Missing metadata | Web search supplement |

---

## Future Enhancements

- Auto-fetch podcast metadata from RSS feed
- Episode numbers/seasons
- Listen progress tracking
- Podcast-specific statistics (total hours, etc.)
- Recommend related podcasts based on topics

---

## Success Criteria

1. Podcast shows have profile pages with artwork and metadata
2. Episodes link to their parent podcast show
3. Podcast profile pages list all episodes with full cards
4. `/podcasts` shows active podcast shows sorted by recency
5. Content cards show clickable podcast name when applicable
6. Episode pages show podcast badge in header
7. Guests displayed distinctly from hosts
8. Related content section includes notes linking to podcast or episodes
9. `adding-notes` skill auto-creates podcast and host profiles
