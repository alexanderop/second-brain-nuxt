# YouTube Videos

Standard YouTube content: essays, reviews, vlogs, tutorials.

**Important:** Before processing any YouTube URL, run classification to determine the correct content type.

## Classification

YouTube videos fall into distinct categories. **Always classify before proceeding.**

```text
YouTube URL detected
    │
    ├─ Known PODCAST channel? ──────────► See podcast.md
    │   (Lex Fridman, Huberman Lab, etc.)
    │
    ├─ Known TALK channel OR conference pattern? ──► See talk.md
    │   (TED, Google, JSConf, etc.)
    │
    ├─ TUTORIAL signals? ───────────────► This file with isTechnical: true
    │   ("how to", screen recording, code walkthrough)
    │
    └─ Default ─────────────────────────► This file (standard)
```

### Known Podcast Channels

If channel matches, route to `podcast.md`:

| Channel | Show |
|---------|------|
| The Diary Of A CEO | diary-of-a-ceo |
| Lex Fridman | lex-fridman-podcast |
| Huberman Lab | huberman-lab |
| All-In Podcast | all-in-podcast |
| Joe Rogan Experience | joe-rogan-experience |
| Tim Ferriss | tim-ferriss-show |
| Acquired | acquired |
| My First Million | my-first-million |
| How I Built This | how-i-built-this |
| The Knowledge Project | knowledge-project |
| Doppelgänger Tech Talk | doppelgaenger |
| Lanz & Precht | lanz-und-precht |
| The Pragmatic Engineer | pragmatic-engineer-podcast |

### Known Talk Channels

If channel matches, route to `talk.md`:

| Channel Pattern | Conference |
|-----------------|------------|
| TED, TEDx Talks | TED |
| Google, Google Developers | Google I/O |
| Apple | WWDC |
| JSConf, ReactConf, VueConf | JS conferences |
| Strange Loop | Strange Loop |
| GOTO Conferences | GOTO |
| InfoQ | QCon |

### Classification Signals

| Signal | Podcast | Talk | Tutorial | Standard |
|--------|---------|------|----------|----------|
| Multiple speakers conversing | Strong | - | - | - |
| Single speaker + slides | - | Strong | - | - |
| Screen recording + narration | - | - | Strong | - |
| "Guest today is..." | Strong | - | - | - |
| Episode number in title | Strong | - | - | - |
| Conference name in title | - | Strong | - | - |
| "How to" / "Tutorial" in title | - | - | Strong | - |
| Code visible on screen | - | Maybe | Yes | - |
| Duration 1-3 hours | Yes | - | - | - |
| Duration 15-45 min | - | Yes | Yes | - |

### Tutorial Detection

Set `isTechnical: true` if:
- Title: "how to", "tutorial", "learn", "guide", "build"
- Channel: educational (Fireship, Traversy Media, The Coding Train, etc.)
- Screen recording with code walkthrough visible
- Step-by-step instruction pattern

---

## Metadata Collection

**Agent A - Metadata:**
```bash
.claude/skills/adding-notes/scripts/get-youtube-metadata.sh 'URL'
```

**Agent B - Transcript:**
```bash
python3 .claude/skills/adding-notes/scripts/get-youtube-transcript.py 'URL'
```

**Agent C - Author Check:**
```bash
.claude/skills/adding-notes/scripts/check-author-exists.sh 'Channel Name'
```

**Agent D - Code Extraction** (if `isTechnical: true`):
See `references/code-extraction.md` for extraction patterns.

---

## Frontmatter

```yaml
---
title: "Video Title"
type: youtube
url: "https://www.youtube.com/watch?v=..."
tags:
  - topic-1
  - topic-2
authors:
  - channel-slug
summary: "Core argument: What claim or insight does this video make? (assertion, not description)"
date: 2026-01-01
---
```

---

## Body Template

### Standard Videos

```markdown
## Key Takeaways

- Point 1 (from transcript analysis)
- Point 2
- Point 3

## Notable Quotes

> "Exact quote from transcript"

## Connections

[Each link must explain WHY you're connecting these notes. Minimum 2 links required.]

- [[referenced-book]] - [1-sentence explanation of the relationship]
- [[related-concept]] - [1-sentence explanation of the relationship]
```

### Tutorial Videos (isTechnical: true)

````markdown
## Key Takeaways

- What you'll learn
- Key techniques covered

## Code Snippets

### [Technique Name]

What this demonstrates.

```javascript
// extracted from tutorial
const example = "code here"
```

## Steps Summary

1. Step one
2. Step two
3. Step three

## Connections

[Each link must explain WHY you're connecting these notes. Minimum 2 links required.]

- [[prerequisite-topic]] - [1-sentence explanation of the relationship]
- [[related-concept]] - [1-sentence explanation of the relationship]
````

See `references/code-extraction.md` for code snippet guidelines.

---

## Special Features

**YouTube Embed**: Notes with `type: youtube` and valid `url` automatically display an embedded video player.

---

## Notes

- Use transcript for accurate quotes and key points
- Channel owner goes in `authors`
- Clean title: remove "- YouTube" suffix
- For tutorials, always spawn code extraction agent
