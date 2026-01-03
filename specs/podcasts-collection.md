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
artwork: "https://..."  # Podcast cover art
website: "https://hubermanlab.com"
hosts:
  - andrew-huberman  # References to author slugs
feed: "https://..."  # RSS feed URL (optional)
platforms:
  spotify: "https://open.spotify.com/show/..."
  apple: "https://podcasts.apple.com/..."
  youtube: "https://youtube.com/@hubermanlab"
---

Optional body content describing the podcast.
```

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
    hosts: z.array(z.string()).default([]),  // Author slugs
    feed: z.string().url().optional(),
    platforms: z.object({
      spotify: z.string().url().optional(),
      apple: z.string().url().optional(),
      youtube: z.string().url().optional(),
    }).optional(),
  }),
}),
```

### Episode Content Schema Update

Add `podcast` field to content schema:

```typescript
// In content collection schema
podcast: z.string().optional(),  // Podcast slug
```

### Episode Frontmatter Example

```yaml
---
title: "How to Build Habits That Stick"
type: podcast
podcast: huberman-lab  # Links to podcast show
authors:
  - andrew-huberman
url: "https://youtube.com/watch?v=..."
tags:
  - habit
  - neuroscience
date: 2025-01-15
---

Episode notes with [[wiki-links]] to related content.
```

---

## Pages & Routes

| Route | Description |
|-------|-------------|
| `/podcasts` | All podcast shows |
| `/podcasts/[slug]` | Podcast profile + all episodes |

### Podcast Index Page (`/podcasts`)

- Grid of podcast show cards
- Each card shows: artwork, name, episode count
- Sorted by most recent episode or total episode count

### Podcast Profile Page (`/podcasts/[slug]`)

**Header:**
- Artwork (large)
- Name
- Description
- Host links (to author profiles)
- Platform links (Spotify, Apple, YouTube)
- Website link

**Episodes Section:**
- List of all episodes from this podcast
- Sorted by date (newest first)
- Same card style as homepage content list

**Related Content:**
- Optional: Notes that wiki-link to episodes from this podcast

---

## UI Components

### PodcastCard

Display podcast show in grid:
```
┌─────────────────────────┐
│  ┌─────┐                │
│  │ Art │  Podcast Name  │
│  │     │  12 episodes   │
│  └─────┘                │
└─────────────────────────┘
```

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
│  [Spotify] [Apple] [YouTube] [Website]  │
└─────────────────────────────────────────┘
```

### Episode List Enhancement

When `podcast` field is present on content, show podcast name/link:
```
┌─────────────────────────────────────────┐
│ 🎙 How to Build Habits That Stick      │
│    Huberman Lab • Jan 15, 2025          │
│    #habit #neuroscience                 │
└─────────────────────────────────────────┘
```

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
  .order('date', 'desc')
  .all()
```

### Get podcast with episode count
```typescript
// In podcasts index, compute episode counts via separate query
const podcasts = await queryCollection('podcasts').all()
const episodes = await queryCollection('content')
  .where('type', '=', 'podcast')
  .select('podcast')
  .all()

// Count episodes per podcast
const counts = episodes.reduce((acc, ep) => {
  if (ep.podcast) acc[ep.podcast] = (acc[ep.podcast] || 0) + 1
  return acc
}, {})
```

---

## Migration

### Existing podcast content

For existing `type: podcast` notes without the `podcast` field:
- Field remains optional
- Episodes without `podcast` still display normally
- Can backfill podcast references incrementally

### Creating podcast profiles

When adding a note for a new podcast episode:
1. Check if podcast profile exists in `content/podcasts/`
2. If not, create profile with basic metadata
3. Add `podcast: {slug}` to episode frontmatter

---

## Implementation Tasks

1. **Schema updates**
   - Add `podcasts` collection to `content.config.ts`
   - Add `podcast` field to content schema

2. **Create podcast directory**
   - `content/podcasts/` folder
   - Initial profiles for existing podcast episodes

3. **Podcast pages**
   - `/podcasts` index page
   - `/podcasts/[slug]` profile page

4. **Components**
   - `PodcastCard.vue`
   - `PodcastHeader.vue`
   - Update `ContentCard.vue` to show podcast name

5. **Navigation**
   - Add "Podcasts" to main nav
   - Add to site.config.ts nav array

6. **Skill updates**
   - Update `adding-notes` skill to handle podcast field
   - Create podcast profile when needed

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
3. Podcast profile pages list all episodes
4. `/podcasts` shows all podcast shows with episode counts
5. Content cards show podcast name when applicable
