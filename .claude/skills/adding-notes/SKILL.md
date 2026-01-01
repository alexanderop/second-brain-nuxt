---
name: adding-notes
description: Add new notes to the Second Brain knowledge base. Use when the user provides a resource (URL, book, podcast, article) and asks to "add a note", "create a note", "save this", or "add to my notes".
allowed-tools: Read, Write, Bash, WebFetch, Glob, Grep
---

# Adding Notes to Second Brain

This skill helps add new content to the knowledge base with proper frontmatter, tags, summaries, and wiki-links.

## Workflow

### 1. Generate Frontmatter Template

Run the script to get a dated template with auto-detected type:

```bash
.claude/skills/adding-notes/scripts/generate-frontmatter.sh "[URL]" "[type]"
```

The script auto-detects type from URL patterns:
- YouTube → `youtube`
- Spotify/Apple Podcasts → `podcast`
- Twitter/X → `tweet`
- Amazon/Goodreads → `book`
- IMDB → `movie`
- Other URLs → `article`
- No URL → `note`

### 2. Fetch Resource Details

For URLs, use WebFetch to extract:
- **Title**: The main heading or page title
- **Description**: Meta description or first paragraph
- **Key content**: Main points, quotes, or takeaways

### 3. Generate Content

Fill in the frontmatter:

**Title**: Use the actual resource title, cleaned up
- Remove site names (e.g., "- YouTube")
- Keep episode numbers for podcasts

**Tags**: Generate 3-5 relevant tags
- Use lowercase, hyphenated format: `productivity`, `habit-formation`, `mental-models`
- Include topic tags and format tags where relevant
- Check existing tags in the codebase for consistency

**Summary**: Write 1-2 sentences capturing the core idea
- Focus on the main thesis or takeaway
- Be concise but informative

**Notes**: Add key takeaways or memorable quotes
- Use blockquotes for direct quotes: `> "Quote here"`
- Keep it focused on actionable insights

### 4. Discover Wiki-Links

Search existing content for related notes:

```bash
# Find existing notes to link to
ls content/*.md
```

**Be selective with connections.** Only add wiki-links when there is a strong, direct relationship:

✅ **Link when:**
- Same author or creator
- Explicitly references or cites the other work
- Directly builds on or responds to the other content
- Covers the same core topic (e.g., two notes about "habit formation")
- Part of the same series or project

❌ **Do NOT link when:**
- Only a vague thematic overlap (e.g., "both mention AI" or "both are about productivity")
- The connection requires multiple hops of reasoning
- The link would feel forced or add no value to the reader
- Topics are tangentially related but not the main focus of either note

**When in doubt, leave it out.** A note with no wiki-links is better than one with weak connections. Links should help readers discover genuinely related content.

Add wiki-links using `[[slug]]` syntax in the body content.

### 5. Generate Slug and Save

Create a kebab-case slug from the title:
- "Atomic Habits" → `atomic-habits`
- "Lex Fridman Podcast #404" → `lex-fridman-podcast-404`

Save to: `content/{slug}.md`

## Content Type Patterns

### Books
```markdown
## Core Framework
[Main structure or methodology]

## Key Concepts
- Concept 1
- Concept 2

## Connections
Related to [[other-book]] and [[related-concept]].
```

### Podcasts/YouTube
```markdown
## Key Takeaways
- Point 1
- Point 2

## Notable Quotes
> "Quote from the episode"

## References
Discusses ideas from [[referenced-book]].
```

### Articles
```markdown
## Summary
[Brief overview]

## Key Points
- Point 1
- Point 2

## Related
See also [[related-note]].
```

### Personal Notes
```markdown
[Synthesized thoughts and ideas]

Connects to [[concept-1]] and [[concept-2]].
```

## Quality Checklist

Before saving, verify:
- [ ] Title is clean and descriptive
- [ ] Type matches the content format
- [ ] URL is valid (if applicable)
- [ ] 3-5 relevant tags included
- [ ] Summary captures the core idea
- [ ] Wiki-links added only for strong, direct connections (or none if no strong matches)
- [ ] Slug is kebab-case
- [ ] Date is today's date
