# Feature: Private Journaling System

> Build a daily journaling habit with private notes that link to public knowledge, using fractal review cycles to surface patterns over time.

## Overview

A private journaling layer that lives alongside the public Second Brain. Daily notes capture thoughts, learnings, and links without being published. Weekly and monthly reviews compile these entries into summaries, creating a fractal structure that zooms from daily details to yearly themes.

## Goals

- **Capture more consistently** - Lower friction for daily logging
- **Surface connections** - Find patterns across time and topics
- **Build writing habit** - Daily practice leads to better essays/content
- **Reduce information loss** - Stop losing insights before they're recorded

## Pain Point Addressed

No journaling habit exists today. The system needs structure to support daily capture without requiring the content to be public.

## Architecture

### Design Philosophy

Inspired by [Steph Ango's Obsidian workflow](https://stephango.com/vault), this system follows:

- **Flat structure** — All private notes in a single folder, no subfolders
- **Properties over folders** — Use `type` frontmatter to distinguish daily/weekly/monthly
- **Wiki-links profusely** — Private notes link to public content freely
- **YYYY-MM-DD dates** — ISO format for all filenames

### Private Content Structure

```text
content/
├── private/           # Excluded from web build (flat, no subfolders)
│   ├── 2024-01-13.md  # type: daily
│   ├── 2024-01-14.md  # type: daily
│   ├── 2024-W02.md    # type: weekly
│   ├── 2024-01.md     # type: monthly
│   └── ...
├── books/             # Public content (unchanged)
├── podcasts/          # Public content (unchanged)
└── ...
```

### Privacy Model

- `/content/private/` folder excluded from Nuxt Content build
- Private notes CAN wiki-link to public content (`[[book-title]]`)
- Public content backlinks do NOT show private references
- Git repo contains private content (local development access)

## Skills

### /daily-note

Creates or opens today's journal entry with guided interactive prompts.

**Modes:**
- **Quick capture** - Log a thought, win, or learning in seconds
- **Morning check-in** - Start day with mood, habits, and intentions
- **Evening reflection** - Review day with metrics, wins, and gratitude
- **Full journal** - Complete all sections

**Features:**
1. **Mood tracking** - How are you feeling? (Great/Good/Okay/Low)
2. **Habit tracking** - Checkbox lists for morning and evening habits
3. **Metrics logging** - Weight, sleep, steps, water, energy
4. **Wins capture** - What went well today
5. **Gratitude** - Optional daily gratitude practice
6. **Tomorrow planning** - Set intentions for the next day
7. **Wiki-links** - Auto-suggest links to today's public notes

**Behavior:**
1. Check if `/content/private/YYYY-MM-DD.md` exists
2. Ask user which mode they want (AskUserQuestion)
3. Guide through interactive questions based on mode
4. Create/update the daily note with responses

**Template Structure:**
```markdown
---
title: "2024-01-13"
type: daily
date: 2024-01-13
mood: good
dayRating: 2
private: true
---

## Metrics

| Metric | Value |
|--------|-------|
| Weight | 75kg |
| Sleep  | 7.5h |
| Steps  | 8500 |

## Habits

### Morning
- [x] Exercise
- [x] Meditation
- [ ] Journaling
- [ ] Reading

### Evening
- [ ] Exercise
- [x] Reading
- [x] No screens
- [ ] Planning

## Morning Intentions

{what to focus on today}

## Captures

- {quick thoughts throughout the day}

## Wins

- {good things that happened}

## Learnings

- {insights and discoveries}

## Gratitude

- {what you're thankful for}

## Tomorrow

- {priorities for the next day}

## Links Captured

- [[public-note-from-today]]
```

### /weekly-review

Summarizes the past week's daily entries.

**Behavior:**
1. Find all notes with `type: daily` from the past 7 days in `/content/private/`
2. Read and aggregate content
3. Prompt user: "What were the themes this week?"
4. Generate summary with:
   - Key events
   - Learnings consolidated
   - Links to daily entries
   - Notable wiki-links to public content
5. Save to `/content/private/YYYY-Www.md`

**Template Structure:**
```markdown
---
title: "Week 2, 2024"
type: weekly
week: 2024-W02
date: 2024-01-14
dailies:
  - "[[2024-01-08]]"
  - "[[2024-01-09]]"
  - ...
private: true
---

## Week Summary

{user input + aggregated themes}

## Key Events

- {extracted from dailies}

## Learnings

- {consolidated from dailies}

## Public Notes Created

- [[note-1]]
- [[note-2]]
```

### /monthly-review

Aggregates weekly summaries into a monthly overview.

**Behavior:**
1. Find all notes with `type: weekly` from the past month in `/content/private/`
2. Read and aggregate content
3. Prompt user: "What were the big themes this month?"
4. Generate summary with:
   - Monthly themes
   - Notable achievements
   - Links to weekly entries
   - Top public notes created
5. Save to `/content/private/YYYY-MM.md`

**Template Structure:**
```markdown
---
title: "January 2024"
type: monthly
month: 2024-01
date: 2024-02-01
weeks:
  - "[[2024-W01]]"
  - "[[2024-W02]]"
  - ...
private: true
---

## Month Summary

{user input + aggregated themes}

## Themes

- {extracted from weeklies}

## Achievements

- {notable accomplishments}

## Top Public Notes

- [[most-linked-note]]
- [[most-viewed-note]]
```

## External Integrations

### Readwise

- Syncs via Obsidian Readwise plugin (existing workflow)
- Highlights land in Obsidian vault
- User manually promotes relevant content to Second Brain public notes
- No code changes needed in Second Brain

## Implementation Details

### Build Exclusion

In `nuxt.config.ts`, exclude private folder:

```typescript
content: {
  sources: {
    content: {
      driver: 'fs',
      prefix: '',
      base: './content',
      ignore: ['private/**']  // Exclude from build
    }
  }
}
```

### Skill File Locations

```text
.claude/skills/
├── daily-note.md
├── weekly-review.md
└── monthly-review.md
```

### Date Utilities

Skills should use consistent date formatting:
- Daily: `YYYY-MM-DD` (ISO 8601)
- Weekly: `YYYY-Www` (ISO week number)
- Monthly: `YYYY-MM`

## Scope

### MVP

- [x] Flat private folder structure (`/content/private/`)
- [x] `/daily-note` skill with prompted sections
- [x] `/weekly-review` skill
- [x] `/monthly-review` skill
- [ ] Build exclusion configuration

### Enhanced Features (Implemented)

- [x] Interactive AskUserQuestion flows
- [x] Mood and day rating tracking
- [x] Habit tracking (morning/evening)
- [x] Metrics logging (weight, sleep, steps)
- [x] Quick capture mode for fast journaling
- [x] Gratitude section
- [x] Tomorrow planning

### Future Enhancements

- [ ] Streak tracking visualization on stats page
- [ ] Timeline UI component for browsing reviews
- [ ] Auto-generated AI summaries from daily entries
- [ ] Yearly review skill
- [ ] Mobile capture integration
- [ ] Location properties for place-based journaling
- [ ] Custom habit configuration per user
- [ ] Metrics charts and trends visualization

## Success Metrics

- **Streak tracking**: Days in a row with journal entries (future UI)
- **Review completion**: % of weekly/monthly reviews completed
- **Habit formation**: Consistent daily usage over 30+ days

## Status

**Status:** Spec Complete
**Created:** 2024-01-13
**Updated:** 2026-01-13 (revised to flat structure per Steph Ango's philosophy)
**Priority:** High (addresses core pain point)
