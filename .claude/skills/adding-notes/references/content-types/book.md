# Books

Books from Goodreads or Amazon.

## Detection

- URL contains: goodreads.com/book/, amazon.com (book pages)
- Type auto-detected as `book`

## Metadata Collection

**Agent A - Book Metadata:**
```bash
.claude/skills/adding-notes/scripts/get-goodreads-metadata.sh 'URL'
```

**Agent B - Author Check:**
```bash
.claude/skills/adding-notes/scripts/check-author-exists.sh 'Author Name'
```

## Reading Status Prompt

After collecting metadata, prompt user:

```text
What's your reading status for this book?
1. Want to read (haven't started)
2. Currently reading
3. Already finished
```

### Response Handling

| Response | Set Fields |
|----------|------------|
| 1 (Want to read) | `readingStatus: want-to-read` |
| 2 (Currently reading) | `readingStatus: reading`, ask for `startedReading` |
| 3 (Already finished) | `readingStatus: finished`, ask for `finishedReading`, optionally `startedReading` |

### Date Input Handling

Accept these formats and normalize to YYYY-MM-DD:
- `today` → current date
- `skip` → leave field empty
- `2025-12-15` → use as-is
- `12/15/2025` → normalize to YYYY-MM-DD
- `December 15, 2025` → normalize to YYYY-MM-DD

## Frontmatter

```yaml
---
title: "Book Title"
type: book
url: "https://www.goodreads.com/book/show/..."
cover: "https://images-na.ssl-images-amazon.com/..."
tags:
  - topic-1
  - topic-2
authors:
  - author-slug
summary: "Core argument: What claim does this book make? (assertion, not description)"
readingStatus: finished
startedReading: 2025-12-15
finishedReading: 2026-01-01
date: 2026-01-01
---
```

## Reading Status Fields

| Field | Values | Description |
|-------|--------|-------------|
| `readingStatus` | `want-to-read`, `reading`, `finished` | Current reading state |
| `startedReading` | YYYY-MM-DD | Date started (optional) |
| `finishedReading` | YYYY-MM-DD | Date finished (optional) |

## Body Template

```markdown
## Core Framework

[Main structure or methodology presented in the book]

## Key Concepts

- Concept 1: Brief explanation
- Concept 2: Brief explanation

## Connections

[Each link must explain WHY you're connecting these notes. Minimum 2 links required.]

- [[other-book]] - [1-sentence explanation of the relationship]
- [[related-concept]] - [1-sentence explanation of the relationship]
```

## Special Features

**Book Cover**: Notes with `type: book` and valid `cover` URL automatically display the cover image in the UI.
