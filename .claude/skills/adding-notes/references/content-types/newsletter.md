# Newsletter Articles

Newsletter articles link to their parent publication via the `newsletter` field.

## Detection

Content is a newsletter article if:
- URL: `*.substack.com/p/*`, `*.beehiiv.com/p/*`, `buttondown.email/*/archive/*`
- Custom domain with newsletter signals (subscribe button, issue number)
- Meta tags indicating newsletter platform

For custom domains: auto-detect platform signatures, then confirm with user if uncertain.

---

## URL Patterns

| Platform | URL Pattern | Example |
|----------|-------------|---------|
| Substack | `*.substack.com/p/*` or custom domain with `/p/` | `lennysnewsletter.substack.com/p/how-to...` |
| beehiiv | `*.beehiiv.com/p/*` | `newsletter.beehiiv.com/p/article` |
| Ghost | `*/subscribe` page + article paths | `blog.example.com/article-title/` |
| ConvertKit | `convertkit.com/` + creator paths | `creator.ck.page/article` |
| Buttondown | `buttondown.email/*` | `buttondown.email/newsletter/article` |

---

## Workflow

### Phase 1: Check for Existing Profile

```bash
ls content/newsletters/ | grep -i "newsletter-slug"
```

- If found → use existing profile
- If NOT found → auto-create profile (see Phase 2)

### Phase 2: Auto-Create Newsletter Profile (if needed)

Spawn 4 agents in parallel:

**Agent A - Publication Info:**
- WebFetch newsletter homepage
- Extract: name, description/tagline, about page content

**Agent B - Logo/Branding:**
- WebFetch newsletter homepage
- Extract: og:image, publication logo
- Prefer: square logo image (not article thumbnail)

**Agent C - Author Info:**
- WebFetch newsletter homepage /about
- Extract: author name(s), check if author exists
- Create author if needed

**Agent D - Platform Detection:**
- Analyze URL structure and page source
- Detect platform from signatures

Write profile with all detected fields to `content/newsletters/{slug}.md`.

### Phase 3: Extract Article Metadata

**Agent A - Article Metadata:**
- WebFetch article URL
- Extract: title, author, date, issue number (if visible)

**Agent B - Content Extraction:**
- Parse article body
- Extract headings, key sections
- Identify links/resources mentioned

**Agent C - Summary Generation:**
- Auto-generate summary from article content
- 1-2 sentences capturing the core message

---

## Frontmatter

```yaml
---
title: "Article Title"
type: newsletter
newsletter: newsletter-slug
issueNumber: 234                    # Optional - only if clearly visible
url: "https://newsletter.substack.com/p/article-slug"
tags:
  - topic-1
  - topic-2
authors:
  - author-slug
guest_author: guest-author-slug    # Optional - for one-off contributors
summary: "Core argument: What claim does this article make? (assertion, not description)"
date: 2024-03-20
---
```

## Body Template

```markdown
## Key Ideas

### [Main Concept 1]

[2-3 sentences explaining the concept with specific details.
Include frameworks, mental models, or actionable advice.]

### [Main Concept 2]

[Explanation with examples from the article.]

## Actionable Takeaways

- **[Takeaway 1]** — [Brief explanation]
- **[Takeaway 2]** — [How to apply]

## Notable Quotes

> "Exact quote from the article"
> — Author Name

## Resources Mentioned

- [Resource Name](url) — context for why it's relevant
- [[wiki-linked-note]] — connection to existing knowledge

## Connections

[Each link must explain WHY you're connecting these notes. Minimum 2 links required.]

- [[related-concept]] - [1-sentence explanation of the relationship]
- [[referenced-book]] - [1-sentence explanation of the relationship]
```

---

## Validation

| Check | Severity | Message |
|-------|----------|---------|
| `newsletter` field exists | Error | Newsletter articles must reference a newsletter profile |
| Newsletter profile exists | Error | Newsletter `{slug}` not found in `content/newsletters/` |
| Author in newsletter authors | Warning | Author `{author}` not listed in newsletter's authors |
| URL domain mismatch | Warning | Article URL doesn't match newsletter website |

---

## Diagram Evaluation

**Priority: LOW** — Newsletters are typically prose-focused.

**Evaluate if:** The article presents a named framework or methodology.

**Common skip reasons:**
- News/commentary format
- List-based content
- No visual structure in the writing

**Log outcome:** `✓ Diagram added: [type] - [description]` or `✓ No diagram needed: [reason]`
