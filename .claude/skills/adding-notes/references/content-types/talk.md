# Conference Talks

Presentations at conferences, meetups, or keynotes.

## Detection

YouTube video is a **talk** if:
- Channel is a known talk channel (TED, Google, JSConf, etc.)
- Title contains: "keynote", "talk", conference name + year
- Single speaker presenting to audience
- Duration: 15-60 minutes typical
- Live audience reactions visible

### Known Talk Channels

| Channel Pattern | Conference |
|-----------------|------------|
| TED, TEDx Talks | TED |
| Google, Google Developers | Google I/O, Chrome Dev Summit |
| Apple | WWDC |
| JSConf, ReactConf, VueConf | JS conferences |
| Strange Loop | Strange Loop |
| GOTO Conferences | GOTO |
| InfoQ | QCon |
| NDC Conferences | NDC |

## Metadata Collection

**Agent A - Metadata:**
```bash
.claude/skills/adding-notes/scripts/get-youtube-metadata.sh 'URL'
```

**Agent B - Transcript:**
```bash
python3 .claude/skills/adding-notes/scripts/get-youtube-transcript.py 'URL'
```

**Agent C - Speaker Check:**
```bash
.claude/skills/adding-notes/scripts/check-author-exists.sh 'Speaker Name'
```

**Agent D - Conference Detection:**
Extract from title/description/channel:
- Conference name
- Year (e.g., "Strange Loop 2023", "WWDC 2024")

## Frontmatter

```yaml
---
title: "Talk Title"
type: talk
url: "https://www.youtube.com/watch?v=..."
conference: "Strange Loop 2023"
tags:
  - topic-1
  - topic-2
authors:
  - speaker-slug
summary: "Core argument: What claim does this talk make? (assertion, not description)"
date: 2026-01-01
---
```

## Talk-specific Fields

| Field | Required | Description |
|-------|----------|-------------|
| `conference` | No | Conference name + year |
| `authors` | Yes | Speaker slug |

## Body Template

```markdown
## Overview

[1-2 sentences on what the talk covers and why it matters]

## Key Arguments

### [First Major Point]

[Explanation with examples from the talk]

### [Second Major Point]

[Explanation with examples]

## Notable Quotes

> "Exact quote from the talk"
> — Speaker Name

## Practical Takeaways

- Actionable insight 1
- Actionable insight 2

## Connections

[Each link must explain WHY you're connecting these notes. Minimum 2 links required.]

- [[related-concept]] - [1-sentence explanation of the relationship]
- [[referenced-work]] - [1-sentence explanation of the relationship]
```

## Content Structure by Talk Type

### Technical Talks (conference presentations)

- Focus on Key Arguments with examples
- Extract code snippets if shown on slides
- Note any tools/libraries mentioned
- If technical with code visible, set `isTechnical: true` and see `references/code-extraction.md`

### Keynotes/Vision Talks

- Focus on thesis and implications
- Capture memorable quotes
- Connect to broader industry trends

### Panel Discussions

If truly conversational with multiple speakers:
- Consider using `type: podcast` instead
- See `content-types/podcast.md`

## Notes

- Use transcript for accurate quotes and specific examples
- Speaker goes in `authors`, not `guests`
- Conference field helps with searchability and context
