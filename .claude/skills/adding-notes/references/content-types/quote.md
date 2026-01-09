# Quotes

Standalone quotes worth preserving.

## Detection

- Type override: `quote`
- User provides a quote to save

## Frontmatter

```yaml
---
title: "Quote from Author"
type: quote
tags:
  - topic-1
authors:
  - author-slug
summary: "Core insight: What idea does this quote express? (assertion, not description)"
date: 2026-01-01
---
```

## Body Template

```markdown
> "The quote text here"

— Author Name, Source

Context or why this quote resonates.

## Connections

[Each link must explain WHY you're connecting these notes. Minimum 2 links required.]

- [[related-concept]] - [How this quote relates to this concept]
- [[author-work]] - [Source material for this quote]
```

## Notes

- Title format: "Quote from [Author]" or use the quote's key phrase
- Author is required (create profile if needed)
- Add context explaining why the quote matters

---

## Diagram Evaluation

**Priority: LOW** — Quotes rarely need diagrams.

**Default action:** Skip with reason "Quote type - minimal content, no visual structure"

**Exception:** Only add if the quote itself describes a visual framework (rare).

**Log outcome:** `✓ No diagram needed: Quote type - minimal content`
