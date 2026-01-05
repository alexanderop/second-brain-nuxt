---
name: managing-blog-ideas
description: Create and develop blog post ideas. Use when asked to "create a blog idea", "start a blog post", "expand blog outline", "develop this post idea", "update blog draft", or "list blog ideas".
allowed-tools: Read, Write, Edit, Glob, Grep, AskUserQuestion
---

# Managing Blog Ideas

Create and evolve blog post ideas from initial concept to publication-ready draft.

## Location

All blog ideas live in `content/blog-ideas/` and are excluded from Nuxt Content publishing.

## Mode Detection

1. **List mode**: User asks "what blog ideas" or "list blog ideas" → list all files in `content/blog-ideas/`
2. **Update mode**: User provides slug/title that exists → load and update
3. **Create mode**: New topic → create fresh blog idea

---

## CREATE Mode

### Phase 1: Gather Information

1. If topic not provided, ask:
   ```yaml
   question: "What topic would you like to write about?"
   header: "Blog Topic"
   ```

2. Search Second Brain for related notes:
   ```text
   Grep pattern: "{topic keywords}" glob: "content/*.md"
   ```

3. Present found connections to user

### Phase 2: Generate Blog Idea

**Frontmatter:**
```yaml
---
title: "Working Title"
status: idea
tags:
  - tag-1
  - tag-2
core_idea: "Single sentence thesis"
target_audience: ""
created: {today YYYY-MM-DD}
updated: {today YYYY-MM-DD}
---
```

**Body structure:**
1. Core Idea section (1-2 sentences)
2. Outline with 3-5 sections (H3 headers with bullet points)
3. Source Notes (wiki-links to related Second Brain notes)
4. Open Questions (what needs research/clarification)

### Phase 3: User Review

Present the generated content and ask:
```yaml
question: "Does this blog idea look good?"
header: "Review"
multiSelect: false
options:
  - label: "Save"
    description: "Create the blog idea file"
  - label: "Edit"
    description: "Tell me what to change"
```

### Phase 4: Save

Generate slug: lowercase title, spaces to hyphens, remove special characters.
Save to `content/blog-ideas/{slug}.md`.

Confirm creation with file path and summary.

---

## UPDATE Mode

### Phase 1: Load Existing

1. Find the file:
   ```text
   Glob: content/blog-ideas/{slug}*.md
   ```
2. Read and display current state:
   - Status
   - Last updated
   - Current outline structure
   - Source notes count

### Phase 2: Choose Update Action

```yaml
question: "What would you like to do with this blog idea?"
header: "Update"
multiSelect: false
options:
  - label: "Expand outline"
    description: "Add more sections or detail to existing sections"
  - label: "Draft a section"
    description: "Write content for one of the outline sections"
  - label: "Find sources"
    description: "Search Second Brain for more related notes"
  - label: "Update status"
    description: "Move to next stage (idea → outline → draft → ready)"
  - label: "Refine core idea"
    description: "Sharpen the thesis or angle"
```

### Phase 3: Execute Update

**Expand outline:**
- Read current sections
- Ask which section to expand OR add new section
- Generate additional bullet points / subsections

**Draft a section:**
- Present section titles
- User picks one
- Generate draft prose following writing-style skill
- Insert under `## Draft Sections`

**Find sources:**
- Extract keywords from title/outline
- Search Second Brain
- Present candidates
- Add selected links to Source Notes

**Update status:**
- Validate readiness for next stage
- Update frontmatter status field

**Refine core idea:**
- Present current core_idea
- Discuss with user
- Update frontmatter

### Phase 4: Save

- Apply edits
- Update `updated` date
- Confirm changes

---

## Status Definitions

| Status | Criteria | Next Step |
|--------|----------|-----------|
| `idea` | Has title and basic core_idea | Develop outline |
| `outline` | 3+ sections with bullet points | Draft sections |
| `draft` | At least one section has prose | Complete all sections |
| `ready` | All sections drafted, reviewed | Publish to blog |

---

## Blog Idea Template

```markdown
---
title: "Working Title"
status: idea
tags:
  - topic-1
core_idea: "Single sentence thesis"
target_audience: ""
created: YYYY-MM-DD
updated: YYYY-MM-DD
---

## Core Idea

[1-2 sentences: What's the main argument? What will readers take away?]

## Outline

### 1. Introduction
- Hook
- Context
- Thesis

### 2. [Main Point]
- Key point
- Key point

### 3. [Main Point]
- Key point
- Key point

### 4. Conclusion
- Summary
- Call to action

## Source Notes

[Wiki-links to Second Brain notes that inform this post]

- [[note-slug]] - How this informs the post

## Draft Sections

[Write draft content for each section as ideas develop]

## Open Questions

- Question I need to answer before writing
- Research needed
```

---

## Quality Checklist

Before saving:
- [ ] Title is specific and compelling
- [ ] Core idea is a clear thesis (assertion, not description)
- [ ] At least 3 outline sections
- [ ] At least 2 wiki-links to source notes
- [ ] Tags match existing taxonomy
- [ ] Status accurately reflects completeness

---

## Validation

**Wiki-link check:** Each `[[link]]` should exist in `content/`.

**Status progression:**
- Don't advance to `outline` without 3+ sections
- Don't advance to `draft` without prose content
- Don't advance to `ready` without all sections drafted
