---
name: adding-notes
description: Add new notes to the Second Brain knowledge base. Use when the user provides a resource (URL, book, podcast, article, GitHub repo, Reddit thread) and asks to "add a note", "create a note", "save this", "add to my notes", "take notes on", or "capture this".
allowed-tools: Read, Write, Bash, WebFetch, Glob, Grep, Task, TaskOutput, WebSearch
---

# Adding Notes to Second Brain

Add content to the knowledge base with proper frontmatter, tags, summaries, and wiki-links. Uses **subagent delegation** for parallel processing.

## Workflow Overview

```
Phase 1: Type Detection & Background Dispatch
   ├─ Detect content type from URL
   ├─ Detect if content is technical (isTechnical flag)
   ├─ Spawn background agent for semantic analysis
   └─ Continue immediately to Phase 2

Phase 2: Parallel Metadata Collection
   ├─ Spawn parallel agents based on content type
   ├─ IF isTechnical: spawn code extraction agent
   └─ Collect results via TaskOutput

Phase 3: Parallel Author Creation
   ├─ For each missing author, spawn WebSearch agent
   └─ All authors processed in parallel

Phase 4: Content Generation
   ├─ Load writing-style skill (REQUIRED)
   ├─ Collect semantic analysis from Phase 1
   ├─ IF isTechnical: collect code snippets from Phase 2
   └─ Generate markdown body with wiki-links + code

Phase 5: Quality Validation (BLOCKING GATE)
   ├─ Spawn 3 parallel validation agents
   ├─ IF issues → present to user, BLOCK until confirmed
   └─ ELSE → proceed to save

Phase 6: Save Note
   └─ Write to content/{slug}.md

Phase 7: MOC Placement (NON-BLOCKING)
   └─ Suggest MOC placements if matches found
```

---

## Script Reference

| Script | Purpose |
|--------|---------|
| `generate-frontmatter.sh URL [type]` | Create dated template with auto-detected type |
| `get-youtube-metadata.sh URL` | Fetch video title, channel |
| `get-youtube-transcript.py URL` | Fetch video transcript |
| `get-reddit-thread.py URL --comments N` | Fetch thread and top comments |
| `get-goodreads-metadata.sh URL` | Fetch book title, author, cover |
| `get-manga-metadata.sh URL` | Fetch series metadata |
| `get-github-metadata.sh URL` | Fetch repo name, stars, language |
| `check-author-exists.sh NAME` | Check if author profile exists |
| `list-existing-authors.sh [filter]` | List or search authors |
| `generate-author-frontmatter.sh NAME [opts]` | Generate author profile |
| `list-existing-tags.sh [filter]` | List tags by frequency |
| `generate-slug.sh "Title"` | Generate kebab-case filename |
| `find-related-notes.py FILE --limit N` | Find semantically related notes |

---

## Agent Pattern

Spawn agents with `Task` tool, `subagent_type: "general-purpose"`. Collect results with `TaskOutput` (blocking). Run independent agents in parallel by including multiple Task calls in a single message.

---

## Phase 1: Type Detection & Background Dispatch

### 1.1 Generate Frontmatter Template

```bash
.claude/skills/adding-notes/scripts/generate-frontmatter.sh "[URL]" "[type]"
```

**Auto-detected types from URL:**
- YouTube → `youtube`
- Reddit → `reddit`
- Spotify/Apple Podcasts → `podcast`
- Twitter/X → `tweet`
- Goodreads series (`/series/`) → `manga`
- Amazon/Goodreads (books) → `book`
- IMDB → `movie`
- Udemy/Coursera/Skillshare → `course`
- GitHub → `github`
- Other URLs → `article`
- No URL → `note`

**Manual overrides:** `quote`, `evergreen`, `tv`, `map`

### 1.2 Start Background Semantic Analysis

Immediately spawn a background agent to find related notes:

```
Task: "Run semantic analysis:
  python3 .claude/skills/adding-notes/scripts/find-related-notes.py content/TEMP_NOTE.md --limit 10

  If note doesn't exist, create temp stub with title/tags, run analysis, delete stub.
  Return related notes with scores and reasons."

run_in_background: true
```

Save agent ID for Phase 4.

### 1.3 Detect Technical Content

Content is **technical** (set `isTechnical: true`) if ANY:

| Signal | Examples |
|--------|----------|
| Type | `github`, `course` |
| URL domain | github.com, stackoverflow.com, dev.to, medium.com, hashnode.dev, egghead.io, smashingmagazine.com |
| Title contains | code, api, sdk, tutorial, implement, build, programming, developer, library, framework, typescript, javascript, python, vue, react |
| Content discusses | implementation details, code examples, CLI commands, configuration |

This flag determines whether to spawn the code extraction agent in Phase 2.

---

## Phase 2: Parallel Metadata Collection

Spawn parallel agents based on content type.

### YouTube Videos

**Agent A - Metadata:**
```bash
.claude/skills/adding-notes/scripts/get-youtube-metadata.sh 'URL'
```

**Agent B - Transcript:**
```bash
python3 .claude/skills/adding-notes/scripts/get-youtube-transcript.py 'URL'
```

Use transcript for accurate key takeaways and exact quotes.

### Reddit Threads

**Agent A - Thread Content:**
```bash
python3 .claude/skills/adding-notes/scripts/get-reddit-thread.py 'URL' --comments 10
```

**Agent B - Author Check:**
```bash
.claude/skills/adding-notes/scripts/check-author-exists.sh 'u/username'
```

Author format: `u/` prefix (e.g., `u/mario_candela`).

### Books (Goodreads)

**Agent A - Book Metadata:**
```bash
.claude/skills/adding-notes/scripts/get-goodreads-metadata.sh 'URL'
```

**Agent B - Author Check:**
```bash
.claude/skills/adding-notes/scripts/check-author-exists.sh 'Author Name'
```

**Then prompt for reading status** — see `references/content-templates.md` for the flow.

### Manga (Goodreads Series)

**Agent A - Manga Metadata:**
```bash
.claude/skills/adding-notes/scripts/get-manga-metadata.sh 'SERIES_URL'
```

**Agent B - Author Check** (same as books)

Create ONE note per series, not per volume.

### Articles

**Agent A - Content:** Use WebFetch to extract title, description, key points, author.

**Agent B - Author Check** (if author known)

### GitHub Repositories

**Agent A - Repo Metadata:**
```bash
.claude/skills/adding-notes/scripts/get-github-metadata.sh 'URL'
```

**Agent B - Author Check** (repo owner)

---

### Code Extraction Agent (Technical Content Only)

**Spawn in parallel with other Phase 2 agents IF `isTechnical: true`.**

```
Task: "Extract practical code snippets from [SOURCE].

Source-specific strategy:
- YouTube/Podcast: Parse transcript for code patterns (see below)
- Article: Extract fenced code blocks from WebFetch content
- GitHub: Extract from README (installation, quick start, basic usage)
- Reddit: Extract from top-voted comments with code

Return: Array of {code, language, purpose, lines} objects.
Keep only snippets that are 5-30 lines and self-contained."

run_in_background: true
```

**YouTube Transcript Code Patterns:**
- Variable declarations: `const`, `let`, `var`, `function`, `class`
- Imports: `import`, `from`, `require`
- CLI commands: lines starting with `$`, `>`, `npm`, `pnpm`, `yarn`, `git`
- Spoken code reconstruction:
  - "equals" → `=`
  - "dot" → `.`
  - "open paren" / "close paren" → `()`
  - "arrow function" → `=>`
  - "backtick" → `` ` ``

**Article Code Extraction:**
1. Find all fenced code blocks (` ```lang ... ``` `)
2. Prioritize blocks that:
   - Follow "Example:", "Here's how:", "Usage:" headings
   - Contain complete implementations (not just imports)
   - Show the "after" in before/after comparisons
3. Skip: import-only blocks, single-line examples, incomplete fragments

**GitHub README Extraction:**
1. Target sections: "Quick Start", "Getting Started", "Installation", "Usage", "Example"
2. Extract: installation commands, basic usage patterns, configuration examples
3. Skip: badges, contributing guidelines, license sections

Save agent ID for Phase 4.

---

## Phase 3: Parallel Author Creation

For external types (youtube, podcast, article, book, manga, movie, tv, tweet, course, reddit, github), authors are **required**.

For each author marked `NOT_FOUND`, spawn parallel agents. See `references/author-creation.md` for detailed workflow.

**Quick flow:**
1. WebSearch: `[Author Name] official site bio`
2. Extract: bio, avatar, website, socials
3. Generate frontmatter with script
4. Save to `content/authors/{slug}.md`

---

## Phase 4: Content Generation

### 4.0 Load Writing Style (REQUIRED)

```bash
Read .claude/skills/adding-notes/scripts/../writing-style/SKILL.md
```

Apply to all generated text: active voice, no filler, everyday words.

### 4.1 Collect Semantic Analysis

Retrieve background agent results from Phase 1:

```
TaskOutput: [semantic analysis agent ID]
block: true
```

### 4.2 Compile Frontmatter

**Title:** Use actual resource title, cleaned (remove "- YouTube" etc.)

**Authors:** Use slugs from Phase 3

**Tags:** 3-5 relevant tags, lowercase hyphenated. Check existing:
```bash
.claude/skills/adding-notes/scripts/list-existing-tags.sh
```

**Summary:** 1-2 sentences capturing the core idea

**Notes** (optional): Personal context (why saved, who recommended)

### 4.3 Generate Body with Wiki-Links

Use semantic analysis results to add wiki-links for **strong connections only**.

✅ **Link when:**
- Same author/creator
- Explicitly references the other work
- Covers the same core topic
- Part of the same series

❌ **Do NOT link when:**
- Only vague thematic overlap
- Connection requires multiple hops
- Link would feel forced

**When in doubt, leave it out.**

### 4.4 Content Structure

See `references/content-templates.md` for type-specific templates.

### 4.5 Code Snippets (Technical Content)

**Pre-requisite:** `isTechnical: true` from Phase 1.3

#### 4.5.1 Collect Code Extraction Results

```
TaskOutput: [code extraction agent ID from Phase 2]
block: true
```

#### 4.5.2 Select Best Snippets

From extracted snippets, choose **1-3** based on:

| Priority | Criteria |
|----------|----------|
| 1 | Demonstrates the **core concept** of the resource |
| 2 | **Self-contained** (works without extensive context) |
| 3 | **Practical** (you'd actually copy-paste this) |
| 4 | **Non-obvious** (teaches something, not boilerplate) |

**Skip snippets that are:**
- Import-only blocks
- Framework scaffolding / boilerplate
- Incomplete fragments requiring surrounding code
- Obvious examples that don't teach

#### 4.5.3 Format Code Section

```markdown
## Code Snippets

### [Pattern/Purpose Name]

Brief explanation of what this demonstrates (1 sentence).

```language
// the actual code
```
```

**Formatting rules:**
- 5-20 lines per snippet (trim if longer)
- Use correct language tag for syntax highlighting
- One-line explanation above each block
- Use descriptive H3 headings (not "Example 1")

#### 4.5.4 Edge Cases

| Situation | Action |
|-----------|--------|
| No snippets extracted | Skip "Code Snippets" section entirely |
| Source is conceptual (no code in original) | Skip section, don't invent examples |
| Transcript code unclear | Add note: "Reconstructed from spoken code—verify against video" |
| Only 1 good snippet exists | Include just that one (don't pad with weak examples) |

### 4.6 Diagrams

Add mermaid diagrams only when content has clear visual structure. See `references/diagrams-guide.md`.

---

## Phase 5: Quality Validation (BLOCKING GATE)

Spawn **3 parallel validation agents**:

**Agent 1 - Wiki-Link Validator:**
Check each `[[link]]` exists in `content/{link}.md`.

**Agent 2 - Duplicate Detector:**
- Search for title in content/*.md
- Check if URL exists in any note

**Agent 3 - Tag Validator:**
- Compare tags against existing
- Suggest similar existing tags for new ones

### Handle Results

**IF issues found:**

```markdown
## Quality Validation Issues Found

**Wiki-Links:**
- ❌ [[missing-note]] - target does not exist

**Duplicates:**
- ⚠️ Similar note exists: "Title" (content/slug.md)

**Tags:**
- ℹ️ New tag: "new-tag" (consider "similar-tag")
```

Ask user:
- a) Proceed anyway
- b) Fix issues
- c) Cancel

**BLOCK until user responds.**

**IF no issues:** Log "✓ Quality validation passed" and proceed.

---

## Phase 6: Save Note

### 6.1 Generate Slug

```bash
.claude/skills/adding-notes/scripts/generate-slug.sh "Title Here"
```

### 6.2 Write Note

Save to: `content/{slug}.md`

### 6.3 Confirm

```markdown
✓ Note saved: content/{slug}.md
  - Type: {type}
  - Authors: {author-slugs}
  - Tags: {tag-count} tags
  - Wiki-links: {link-count} connections
```

---

## Phase 7: MOC Placement (Non-blocking)

### 7.1 Run Analysis

```bash
python3 .claude/skills/moc-curator/scripts/cluster-notes.py --mode=for-note --note={slug}
```

### 7.2 Present Suggestions (if score >= 0.7)

```markdown
### MOC Placement Suggestions

This note could belong in:
1. **[[ai-agents-roadmap]]** (score: 0.82) - shares tags: ai-agents, llm
2. **[[context-engineering-guide]]** (score: 0.74) - semantic similarity

Reply with numbers to add, or "skip".
```

### 7.3 Apply Updates

For each selected MOC, append to `## Suggested` section:
```markdown
- [[new-note-slug]] - Brief description
```

---

## Error Handling

**Metadata agent fails:** Prompt user for manual entry or use WebFetch fallback.

**Transcript unavailable:** Note "No transcript available - summarized from viewing".

**Author not found online:** Create minimal profile (name only). Try GitHub avatar if handle known.

**Reddit thread fails:** If 429 error, wait 60s and retry. For quarantined subs, manually copy content.

**Semantic analysis times out:** Proceed without wiki-link suggestions.

**Validation agent crashes:** Warn user, proceed with caution, recommend manual check.
