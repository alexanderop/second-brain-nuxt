# Content Type Templates

Templates for structuring note bodies based on content type. Load this file when generating content in Phase 4.

## Table of Contents

- [Books](#books)
- [Manga](#manga)
- [YouTube/Podcasts](#youtubepodcasts)
- [Articles](#articles)
- [Technical Articles](#technical-articles)
- [Reddit Threads](#reddit-threads)
- [GitHub Repositories](#github-repositories)
- [Personal Notes](#personal-notes)
- [Quotes](#quotes)
- [Courses](#courses)
- [Evergreen Notes](#evergreen-notes)
- [Map Notes (MOCs)](#map-notes-mocs)

---

## Books

```markdown
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
summary: "One-sentence description of the book's core idea"
readingStatus: finished
startedReading: 2025-12-15
finishedReading: 2026-01-01
date: 2026-01-01
---

## Core Framework
[Main structure or methodology]

## Key Concepts
- Concept 1
- Concept 2

## Connections
Related to [[other-book]] and [[related-concept]].
```

### Reading Status Fields

- `readingStatus`: `want-to-read` | `reading` | `finished`
- `startedReading`: Date when started (YYYY-MM-DD)
- `finishedReading`: Date when finished (YYYY-MM-DD)

### Reading Status Prompt Flow

After collecting Goodreads metadata, prompt user:

```
What's your reading status for this book?
1. Want to read (haven't started)
2. Currently reading
3. Already finished
```

**Based on response:**

- **1 (Want to read):** Set `readingStatus: want-to-read`, no dates
- **2 (Currently reading):** Set `readingStatus: reading`, ask for start date
- **3 (Already finished):** Set `readingStatus: finished`, ask for finish date, optionally start date

**Date handling:**
- `today` → current date in YYYY-MM-DD
- `skip` → leave field empty
- Accept: YYYY-MM-DD, MM/DD/YYYY, "January 15, 2025" (normalize to YYYY-MM-DD)

### Book Cover Feature

Notes with `type: book` and valid `cover` URL automatically display the cover image.

---

## Manga

Create ONE note per manga series, not per volume. Use series URL.

```markdown
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

## Overview
[Series premise and main themes]

## Key Arcs
- Arc 1: Description
- Arc 2: Description

## Why Read This
[What makes this series notable]

## Connections
Similar to [[other-manga]] or explores themes from [[related-concept]].
```

### Manga-specific Fields

- `volumes`: Total volume count (number)
- `status`: `ongoing` | `completed` | `hiatus`

---

## YouTube/Podcasts

```markdown
---
title: "Episode Title"
type: youtube
url: "https://www.youtube.com/watch?v=..."
tags:
  - topic-1
  - topic-2
authors:
  - channel-slug
summary: "Core message of the episode"
date: 2026-01-01
---

## Key Takeaways
- Point 1 (from transcript analysis)
- Point 2

## Notable Quotes
> "Exact quote from transcript"

## References
Discusses ideas from [[referenced-book]].
```

Use transcript to extract accurate quotes and key points.

**YouTube Embed Feature**: Notes with `type: youtube` and valid `url` automatically display an embedded player.

---

## Articles

```markdown
---
title: "Article Title"
type: article
url: "https://example.com/article"
tags:
  - topic-1
  - topic-2
authors:
  - author-slug
summary: "Core thesis of the article"
date: 2026-01-01
---

## Summary
[Brief overview]

## Key Points
- Point 1
- Point 2

## Related
See also [[related-note]].
```

---

## Technical Articles

For programming/code content, add Code Snippets section.

```markdown
---
title: "Technical Article Title"
type: article
url: "https://example.com/article"
tags:
  - programming
  - typescript
authors:
  - author-slug
summary: "What this article teaches"
date: 2026-01-01
---

## Summary
[What the article teaches]

## Key Concepts
- Concept 1
- Concept 2

## Code Snippets

Practical examples from this article.

### Basic Usage

How to set up the client.

\`\`\`typescript
const client = new ApiClient({
  baseUrl: process.env.API_URL,
  timeout: 5000,
})
\`\`\`

### Error Handling

Recommended error handling pattern.

\`\`\`typescript
try {
  const result = await client.fetch('/users')
} catch (error) {
  if (error instanceof NetworkError) {
    // Retry logic here
  }
}
\`\`\`

## Related
See also [[related-library]] and [[error-handling-patterns]].
```

### Code Snippet Guidelines

**Include 1-3 snippets when content is technical** (see SKILL.md Phase 1.3 for detection criteria):
- Type: `github`, `course`
- URL domain: github.com, dev.to, egghead.io, stackoverflow.com, etc.
- Title/content: discusses implementation, tutorials, APIs, libraries

**Snippet selection priority:**
1. Demonstrates the **core concept** of the resource
2. **Self-contained** (works without extensive context)
3. **Practical** (you'd actually copy-paste this)
4. **Non-obvious** (teaches something beyond boilerplate)

**Snippet quality:**
- 5-20 lines each (trim longer examples)
- Proper language-tagged fenced blocks
- One-line explanation above each block
- Descriptive H3 heading (not "Example 1")

**Good snippets:**
- ✅ Core API usage patterns
- ✅ Configuration examples
- ✅ Common gotchas with fixes
- ✅ Reusable utility functions
- ✅ "After" in before/after comparisons

**Skip:**
- ❌ Boilerplate (imports-only, setup)
- ❌ Framework scaffolding
- ❌ Obvious/trivial examples
- ❌ Incomplete fragments requiring context
- ❌ Invented examples (if source has none, skip section)

---

## Reddit Threads

```markdown
---
title: "Thread Title"
type: reddit
url: "https://www.reddit.com/r/..."
tags:
  - topic-1
  - topic-2
authors:
  - u-username
summary: "What the discussion is about"
date: 2026-01-01
---

## Summary
[Core question or topic]

## Key Points from OP
- Main argument or question
- Supporting context provided

## Notable Comments
> "Quote from highly-upvoted comment"
>
> — u/commenter (X points)

> "Another insightful response"
>
> — u/other_user (Y points)

## Discussion Takeaways
- Key consensus or insights
- Notable counterarguments

## Related
See also [[related-topic]].
```

---

## GitHub Repositories

```markdown
---
title: "Repository Name"
type: github
url: "https://github.com/owner/repo"
stars: 7600
language: "Go"
tags:
  - topic-1
  - topic-2
authors:
  - owner-slug
summary: "Brief description of what the repository does."
date: 2026-01-02
---

## Overview
[What the project does and why it exists]

## Key Features
- Feature 1
- Feature 2

## Code Snippets

Quick examples from the README or docs.

### Installation

\`\`\`bash
go install github.com/owner/repo@latest
\`\`\`

### Basic Usage

\`\`\`go
client := repo.NewClient(repo.Config{
    Timeout: 30 * time.Second,
})
result, err := client.Process(data)
\`\`\`

## Technical Details
[Architecture, tech stack, notable implementation choices]

## Connections
Related to [[other-tool]] or implements patterns from [[related-concept]].
```

### GitHub-specific Fields

- `stars`: Repository star count (number)
- `language`: Primary programming language (string)

**GitHub Card Feature**: Notes with `type: github` automatically display a card with language badge and star count.

Always include 1-3 snippets from README showing installation and basic usage.

---

## Personal Notes

```markdown
---
title: "Note Title"
type: note
tags:
  - topic-1
  - topic-2
summary: "Core idea of this note"
date: 2026-01-01
---

[Synthesized thoughts and ideas]

Connects to [[concept-1]] and [[concept-2]].
```

---

## Quotes

```markdown
---
title: "Quote from Author"
type: quote
tags:
  - topic-1
authors:
  - author-slug
summary: "What this quote captures"
date: 2026-01-01
---

> "The quote text here"

— Author Name, Source

Context or why this quote resonates.
```

---

## Courses

```markdown
---
title: "Course Title"
type: course
url: "https://udemy.com/course/..."
tags:
  - topic-1
  - topic-2
authors:
  - instructor-slug
summary: "What skills this course teaches"
date: 2026-01-01
---

## Course Overview
[What the course covers]

## Key Lessons
- Lesson 1
- Lesson 2

## Projects/Exercises
[Notable hands-on work]

## Connections
Builds on [[prerequisite-topic]] and leads to [[advanced-topic]].
```

---

## Evergreen Notes

Use `type: evergreen` for foundational reference notes synthesizing multiple sources.

```markdown
---
title: "Concept Name"
type: evergreen
tags:
  - topic-1
  - topic-2
summary: "Core definition of this concept"
date: 2026-01-01
---

## Definition
[Core concept explained]

## Key Principles
- Principle 1
- Principle 2

## Sources
Synthesized from [[source-1]], [[source-2]], and [[source-3]].
```

---

## Map Notes (MOCs)

Use `type: map` for Maps of Content that curate related notes. Maps appear as **pink hexagons** on the knowledge graph.

```markdown
---
title: "Topic Roadmap"
type: map
tags:
  - learning-path
  - topic-area
summary: "A curated map connecting key resources about [topic]"
date: 2026-01-01
---

This map connects essential resources for [topic description].

## Section 1
- [[related-note-1]] - Brief description
- [[related-note-2]] - Brief description

## Section 2
- [[related-note-3]] - Brief description
```

### Map Guidelines

- Notes linked via `[[wiki-links]]` become **members** of the map
- Members cluster around the map on graph visualization
- Notes can belong to **multiple maps**
- Keep maps focused: 3-10 members ideal
