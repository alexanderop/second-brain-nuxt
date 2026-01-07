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
summary: "Core argument: What claim does this article make? (assertion, not description)"
date: YYYY-MM-DD  # Use actual publication date from article metadata (must not be in future)
---
```

## Body Template

```markdown
## Summary

[Brief overview of the article's main argument]

## Key Points

- Point 1
- Point 2

## Connections

[Each link must explain WHY you're connecting these notes. Minimum 2 links required.]

- [[related-note]] - [1-sentence explanation of the relationship]
- [[another-note]] - [1-sentence explanation of the relationship]
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
summary: "Core argument: What claim does this article make? (assertion, not description)"
date: YYYY-MM-DD  # Use actual publication date from article metadata (must not be in future)
---
```

### Technical Body Template

````markdown
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

## Connections

[Each link must explain WHY you're connecting these notes. Minimum 2 links required.]

- [[related-library]] - [1-sentence explanation of the relationship]
- [[error-handling-patterns]] - [1-sentence explanation of the relationship]
````

### Code Snippet Guidelines

See `references/code-extraction.md` for detailed selection and formatting rules.

**Quick reference:**
- Include 1-3 snippets when content is technical
- 5-20 lines each, self-contained
- Proper language tags
- Skip: boilerplate, imports-only, obvious examples
