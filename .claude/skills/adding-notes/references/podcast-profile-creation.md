# Podcast Profile Creation

When adding a podcast episode and the show profile doesn't exist, create it first.

## Step 1: Gather Show Metadata

Spawn parallel agents:

**Agent A - Show Info:**
```text
WebSearch: "[Show Name]" podcast official site
```
Extract: description, website, RSS feed

**Agent B - Artwork:**
```text
WebSearch: "[Show Name]" podcast artwork cover
```
Find high-resolution cover art URL

**Agent C - Platform Links:**
Search for show on each platform:
- Spotify: `site:open.spotify.com "[Show Name]" podcast`
- Apple: `site:podcasts.apple.com "[Show Name]"`
- YouTube: `site:youtube.com "@[ShowName]" OR "[Show Name]" podcast channel`

**Agent D - Host Author Profiles:**
For each host:
1. Check if author exists: `check-author-exists.sh "Host Name"`
2. If not found, create author profile (see `references/author-creation.md`)

## Step 2: Generate Podcast Profile

Create `content/podcasts/{show-slug}.md`:

```yaml
---
name: "Show Name"
slug: "show-slug"
description: "Show description"
artwork: "https://..."
website: "https://..."
hosts:
  - host-slug
feed: "https://feeds.example.com/show"
platforms:
  spotify: "https://open.spotify.com/show/..."
  apple: "https://podcasts.apple.com/..."
  youtube: "https://youtube.com/@..."
---
```

## Profile Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Show display name |
| `slug` | Yes | URL-safe identifier |
| `description` | Yes | Show description |
| `artwork` | No | Cover art URL |
| `website` | No | Official website |
| `hosts` | Yes | Array of host author slugs |
| `feed` | No | RSS feed URL |
| `platforms` | No | Platform URLs object |

## Slug Generation

```bash
.claude/skills/adding-notes/scripts/generate-slug.sh "Show Name"
```

Rules:
- ASCII only
- Kebab-case
- No special characters
- Lowercase

## Notes

- Podcast profiles live in `content/podcasts/`
- All hosts must have author profiles
- Platform links help with discoverability
- Episode notes reference profile via `podcast: show-slug`
