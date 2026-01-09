# Manga

Manga series from Goodreads. Create **ONE note per series**, not per volume.

## Detection

- URL contains: goodreads.com/series/
- Type auto-detected as `manga`

## Metadata Collection

**Agent A - Manga Metadata:**
```bash
.claude/skills/adding-notes/scripts/get-manga-metadata.sh 'SERIES_URL'
```

**Agent B - Author Check:**
```bash
.claude/skills/adding-notes/scripts/check-author-exists.sh 'Author Name'
```

## Frontmatter

```yaml
---
title: "Vagabond"
type: manga
url: "https://www.goodreads.com/series/69255-vagabond"
cover: "https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/..."
tags:
  - manga
  - samurai
  - historical-fiction
authors:
  - takehiko-inoue
volumes: 37
status: hiatus
summary: "Epic manga following Miyamoto Musashi's journey to become Japan's greatest swordsman."
date: 2026-01-01
---
```

## Manga-specific Fields

| Field | Required | Values |
|-------|----------|--------|
| `volumes` | Yes | Total volume count (number) |
| `status` | Yes | `ongoing`, `completed`, `hiatus` |
| `cover` | No | Cover image URL |

## Body Template

```markdown
## Overview

[Series premise and main themes]

## Key Arcs

- Arc 1: Description
- Arc 2: Description

## Why Read This

[What makes this series notable - art style, storytelling, themes]

## Connections

Similar to [[other-manga]] or explores themes from [[related-concept]].
```

## Notes

- Always use the **series URL**, not individual volume URLs
- One note per series, regardless of volume count
- Cover should be from first volume typically

---

## Diagram Evaluation

**Priority: LOW** — Manga notes are narrative-focused.

**Default action:** Skip. Manga is storytelling, not conceptual frameworks.

**Log outcome:** `✓ No diagram needed: Manga type - narrative content`
