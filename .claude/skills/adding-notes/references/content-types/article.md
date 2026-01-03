# Articles

Web articles, blog posts, and written content.

## Detection

- Any URL not matching other content types
- Type auto-detected as `article`

## Metadata Collection

**Agent A - Content:**
Use WebFetch to extract: title, author, description, key points

**Agent B - Author Check** (if author known):
```bash
.claude/skills/adding-notes/scripts/check-author-exists.sh 'Author Name'
```

## Frontmatter

```yaml
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
```

## Body Template

```markdown
## Summary

[Brief overview of the article's main argument]

## Key Points

- Point 1
- Point 2

## Related

See also [[related-note]].
```

---

## Technical Variant

For programming/code content, add Code Snippets section.

### Technical Detection

Content is technical if ANY:
- URL domain: github.com, dev.to, hashnode.dev, medium.com (tech), stackoverflow.com, smashingmagazine.com, egghead.io
- Title contains: code, api, sdk, tutorial, implement, build, programming, developer, library, framework, typescript, javascript, python, vue, react

### Technical Frontmatter

```yaml
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
```

### Technical Body Template

```markdown
## Summary

[What the article teaches]

## Key Concepts

- Concept 1
- Concept 2

## Code Snippets

Practical examples from this article.

### Basic Usage

How to set up the client.

```typescript
const client = new ApiClient({
  baseUrl: process.env.API_URL,
  timeout: 5000,
})
```

### Error Handling

Recommended error handling pattern.

```typescript
try {
  const result = await client.fetch('/users')
} catch (error) {
  if (error instanceof NetworkError) {
    // Retry logic here
  }
}
```

## Related

See also [[related-library]] and [[error-handling-patterns]].
```

### Code Snippet Guidelines

See `references/code-extraction.md` for detailed selection and formatting rules.

**Quick reference:**
- Include 1-3 snippets when content is technical
- 5-20 lines each, self-contained
- Proper language tags
- Skip: boilerplate, imports-only, obvious examples
