---
name: adding-notes
description: Add new notes to the Second Brain knowledge base. Use when the user provides a resource (URL, book, podcast, article) and asks to "add a note", "create a note", "save this", or "add to my notes".
allowed-tools: Read, Write, Bash, WebFetch, Glob, Grep, Task, TaskOutput, WebSearch
---

# Adding Notes to Second Brain

This skill helps add new content to the knowledge base with proper frontmatter, tags, summaries, and wiki-links. It uses **subagent delegation** for parallel processing and quality validation.

## Workflow Overview

```
Phase 1: Type Detection & Background Dispatch
   ├─ Detect content type from URL
   ├─ Spawn background agent for semantic analysis (runs while other work happens)
   └─ Continue immediately to Phase 2

Phase 2: Parallel Metadata Collection
   ├─ Spawn parallel agents based on content type
   ├─ YouTube: metadata + transcript agents
   ├─ Book/Manga: goodreads + author-check agents
   └─ Collect all results via TaskOutput

Phase 3: Parallel Author Creation
   ├─ For each missing author, spawn WebSearch agent
   ├─ All authors processed in parallel
   └─ Profiles created automatically

Phase 4: Content Generation
   ├─ Load writing-style skill (REQUIRED)
   ├─ Collect semantic analysis from Phase 1
   ├─ Combine metadata + authors + related notes
   └─ Generate markdown body (applying style rules)

Phase 5: Quality Validation (BLOCKING GATE)
   ├─ Spawn 3 parallel validation agents
   ├─ Check: wiki-links, duplicates, tags
   ├─ IF issues found → present to user, BLOCK until confirmed
   └─ ELSE → proceed to save

Phase 6: Save Note
   ├─ Generate slug
   └─ Write to content/{slug}.md

Phase 7: MOC Placement Suggestions (NON-BLOCKING)
   ├─ Run cluster-notes.py --mode=for-note
   ├─ IF matches found → present to user
   └─ Apply MOC updates if requested
```

---

## Phase 1: Type Detection & Background Dispatch

### 1.1 Generate Frontmatter Template

Run the script to get a dated template with auto-detected type:

```bash
.claude/skills/adding-notes/scripts/generate-frontmatter.sh "[URL]" "[type]"
```

The script auto-detects type from URL patterns:
- YouTube → `youtube`
- Reddit → `reddit`
- Spotify/Apple Podcasts → `podcast`
- Twitter/X → `tweet`
- Goodreads series (`/series/`) → `manga`
- Amazon/Goodreads (books) → `book`
- IMDB → `movie`
- Udemy/Coursera/Skillshare → `course`
- Other URLs → `article`
- No URL → `note`

**Manual type overrides:**
- `quote` - For standalone quotes (pass as second argument)
- `evergreen` - For synthesized reference notes (pass as second argument)
- `tv` - For TV series (IMDB shows auto-detect as `movie`, override if needed)
- `map` - For Maps of Content (MOCs) that curate and cluster related notes

### 1.2 Start Background Semantic Analysis

**Immediately after detecting type**, spawn a background agent to find related notes. This runs while other phases execute, so results are ready by Phase 4.

```markdown
Use Task tool with:
- subagent_type: "general-purpose"
- run_in_background: true
- prompt: "Run the semantic analysis script for the new note:

  ```bash
  python3 .claude/skills/adding-notes/scripts/find-related-notes.py content/TEMP_NOTE.md --limit 10
  ```

  If the note file doesn't exist yet, create a temporary stub with just the title and tags, run the analysis, then delete the stub.

  Return the list of related notes with their scores and reasons."
```

**Save the agent ID** - you'll retrieve results in Phase 4 using `TaskOutput`.

---

## Phase 2: Parallel Metadata Collection

Based on the detected content type, spawn **parallel agents** to fetch metadata and check authors simultaneously.

### 2.1 YouTube Videos

Spawn **2 parallel agents** in a single message:

```markdown
**Agent A - Metadata:**
Task tool with subagent_type: "general-purpose"
prompt: "Fetch YouTube metadata:
  ```bash
  .claude/skills/adding-notes/scripts/get-youtube-metadata.sh 'URL'
  ```
  Return: title, channel name"

**Agent B - Transcript:**
Task tool with subagent_type: "general-purpose"
prompt: "Fetch YouTube transcript:
  ```bash
  python3 .claude/skills/adding-notes/scripts/get-youtube-transcript.py 'URL'
  ```
  Return: full transcript text"
```

Collect both results via `TaskOutput` (blocking).

Use the transcript to:
- Extract accurate key takeaways
- Find notable quotes (exact wording)
- Understand the full context of the video

### 2.2 Reddit Threads

Spawn **2 parallel agents**:

```markdown
**Agent A - Thread Content:**
Task tool with subagent_type: "general-purpose"
prompt: "Fetch Reddit thread:
  ```bash
  python3 .claude/skills/adding-notes/scripts/get-reddit-thread.py 'URL' --comments 10
  ```
  Return: OP post, top comments, metadata"

**Agent B - Author Check:**
Task tool with subagent_type: "general-purpose"
prompt: "Check if Reddit author exists:
  ```bash
  .claude/skills/adding-notes/scripts/check-author-exists.sh 'u/username'
  ```
  Return: EXISTS with path, or NOT_FOUND"
```

Author should be the OP's username with `u/` prefix (e.g., `u/mario_candela`).

### 2.3 Books (Goodreads)

Spawn **2 parallel agents**:

```markdown
**Agent A - Book Metadata:**
Task tool with subagent_type: "general-purpose"
prompt: "Fetch Goodreads metadata:
  ```bash
  .claude/skills/adding-notes/scripts/get-goodreads-metadata.sh 'URL'
  ```
  Return: title, author, cover URL"

**Agent B - Author Check:**
Task tool with subagent_type: "general-purpose"
prompt: "Check if author exists:
  ```bash
  .claude/skills/adding-notes/scripts/check-author-exists.sh 'Author Name'
  ```
  Return: EXISTS with path, or NOT_FOUND"
```

**Book Cover Feature**: Notes with `type: book` and a valid `cover` URL automatically display the book cover image at the top of the page.

### 2.3.1 Reading Status Prompt (Books Only)

After collecting Goodreads metadata and checking authors, **prompt the user** for their reading status:

```markdown
**Reading Status:**
What's your reading status for this book?
1. Want to read (haven't started)
2. Currently reading
3. Already finished

Please reply with 1, 2, or 3.
```

**Based on user response:**

- **1 (Want to read):**
  - Set `readingStatus: want-to-read`
  - No dates needed

- **2 (Currently reading):**
  - Set `readingStatus: reading`
  - Ask: "When did you start reading? (YYYY-MM-DD or 'today')"
  - Set `startedReading` from response

- **3 (Already finished):**
  - Set `readingStatus: finished`
  - Ask: "When did you finish? (YYYY-MM-DD or 'today')"
  - Set `finishedReading` from response
  - Ask: "When did you start? (YYYY-MM-DD, 'today', or 'skip')"
  - Set `startedReading` from response (if not 'skip')

**Date handling:**
- `today` → use current date in YYYY-MM-DD format
- `skip` → leave field empty
- Accept formats: YYYY-MM-DD, MM/DD/YYYY, "January 15, 2025" (normalize to YYYY-MM-DD)

### 2.4 Manga (Goodreads Series)

Spawn **2 parallel agents**:

```markdown
**Agent A - Manga Metadata:**
Task tool with subagent_type: "general-purpose"
prompt: "Fetch manga series metadata:
  ```bash
  .claude/skills/adding-notes/scripts/get-manga-metadata.sh 'SERIES_URL'
  ```
  Return: title, author, cover, volumes, status"

**Agent B - Author Check:**
Task tool with subagent_type: "general-purpose"
prompt: "Check if mangaka exists:
  ```bash
  .claude/skills/adding-notes/scripts/check-author-exists.sh 'Mangaka Name'
  ```
  Return: EXISTS with path, or NOT_FOUND"
```

**Manga-specific fields**:
- `volumes`: Total volume count (number)
- `status`: Series status — `ongoing`, `completed`, or `hiatus`

Create ONE note per manga series, not per volume.

### 2.5 Articles and Other URLs

Spawn **2 parallel agents**:

```markdown
**Agent A - Content Fetch:**
Task tool with subagent_type: "general-purpose"
prompt: "Fetch article content using WebFetch:
  URL: 'ARTICLE_URL'
  Extract: title, description, key points, author if mentioned"

**Agent B - Author Check (if known):**
Task tool with subagent_type: "general-purpose"
prompt: "Check if author exists:
  ```bash
  .claude/skills/adding-notes/scripts/check-author-exists.sh 'Author Name'
  ```
  Return: EXISTS with path, or NOT_FOUND"
```

### 2.6 Collect Results

After spawning parallel agents, use `TaskOutput` (blocking) to collect all results:

```markdown
TaskOutput tool with:
- task_id: [agent A ID]
- block: true

TaskOutput tool with:
- task_id: [agent B ID]
- block: true
```

Combine the results: metadata from Agent A, author status from Agent B.

---

## Phase 3: Parallel Author Creation

For external content types (youtube, podcast, article, book, movie, tv, tweet, course, reddit), authors are **required** in the frontmatter.

Based on Phase 2 author checks, spawn **parallel agents** for each missing author.

### 3.1 Spawn Author Creation Agents

For each author marked as `NOT_FOUND` in Phase 2, spawn a dedicated agent:

```markdown
**For each missing author, spawn in parallel:**

Task tool with subagent_type: "general-purpose"
prompt: "Create author profile for 'Author Name':

1. Use WebSearch to find: '[Author Name] official site bio'
2. Extract:
   - bio: 1-2 sentence professional description
   - avatar: Profile image URL (prefer GitHub, Twitter, official headshots)
   - website: Personal/official website
   - socials: twitter, github, linkedin, youtube handles (not full URLs)

3. Generate frontmatter:
   ```bash
   .claude/skills/adding-notes/scripts/generate-author-frontmatter.sh 'Author Name' \
       --bio 'Description' \
       --avatar 'URL' \
       --website 'URL' \
       --twitter 'handle' \
       --github 'handle'
   ```

4. Save to content/authors/{slug}.md where slug is kebab-case of name.

Return: author slug for frontmatter reference"
```

**Example - 3 authors in parallel:**
```markdown
# Single message with 3 Task tool calls:
Agent 1: Create profile for "Simon Sinek"
Agent 2: Create profile for "Adam Grant"
Agent 3: Create profile for "Brené Brown"
```

### 3.2 Collect Author Results

Use `TaskOutput` (blocking) to collect all author agent results:

```markdown
TaskOutput for each author agent:
- task_id: [agent ID]
- block: true

Collect: author slugs for note frontmatter
```

### 3.3 Special Cases

**Reddit Authors:**
- Use `u/username` format (e.g., `u/mario_candela`)
- Filename: `u-username.md` (e.g., `u-mario-candela.md`)
- **Skip WebSearch** - create minimal profile (pseudonymous users)
- Minimal profile: name and slug only

**Author Not Found Online:**
- If WebSearch yields no results, create minimal profile
- Log: "Created minimal profile for [Author] - bio not found"

**Organizations as Authors:**
- Treat like regular authors (e.g., "HumanLayer Team")
- Avatar can be company logo
- Socials are company accounts

### 3.4 Reference Scripts

```bash
# Check if author exists
.claude/skills/adding-notes/scripts/check-author-exists.sh "Author Name"

# List all existing authors
.claude/skills/adding-notes/scripts/list-existing-authors.sh

# Search for similar names
.claude/skills/adding-notes/scripts/list-existing-authors.sh "partial-name"

# Generate author frontmatter
.claude/skills/adding-notes/scripts/generate-author-frontmatter.sh "Name" \
    --bio "..." --avatar "..." --website "..." \
    --twitter "..." --github "..." --linkedin "..." --youtube "..."
```

---

## Phase 4: Content Generation

Now combine all the data collected from previous phases.

### 4.0 Load Writing Style Guidelines (REQUIRED)

**Before writing any content**, read the writing style skill:

```bash
Read .claude/skills/writing-style/SKILL.md
```

Apply these rules to all generated text (summary, body, connections):
- Use active voice
- No filler phrases ("This note explores...")
- End sentences with the main point
- Everyday words over jargon
- One point per paragraph

**This step is mandatory.** Do not skip it.

### 4.1 Collect Background Semantic Analysis

Retrieve the results from the background agent spawned in Phase 1:

```markdown
TaskOutput tool with:
- task_id: [semantic analysis agent ID from Phase 1]
- block: true

Returns: list of related notes with scores and reasons
```

### 4.2 Compile Frontmatter

Using metadata from Phase 2 and author slugs from Phase 3:

**Title**: Use the actual resource title, cleaned up
- Remove site names (e.g., "- YouTube")
- Keep episode numbers for podcasts

**Authors**: Use slugs from Phase 3 author creation

**Tags**: Generate 3-5 relevant tags
- Use lowercase, hyphenated format: `productivity`, `habit-formation`, `mental-models`
- Check existing tags for consistency:

```bash
.claude/skills/adding-notes/scripts/list-existing-tags.sh          # All tags by frequency
.claude/skills/adding-notes/scripts/list-existing-tags.sh "vue"    # Filter by term
```

**Summary**: Write 1-2 sentences capturing the core idea
- Focus on the main thesis or takeaway
- Be concise but informative

**Notes** (optional): Personal context for your future self
- Why you saved this resource
- Who recommended it
- Leave empty if no personal context needed

### 4.3 Generate Body with Wiki-Links

Using the semantic analysis results from 4.1, add wiki-links for **strong connections only**.

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

**When in doubt, leave it out.** A note with no wiki-links is better than one with weak connections.

Add wiki-links using `[[slug]]` syntax in the body content.

### 4.4 Semantic Analysis Reference

The `find-related-notes.py` script uses a hybrid scoring approach:
- **Semantic similarity** (50 points max) - AI embeddings capture meaning
- **Tag overlap** (weighted by rarity) - Rare shared tags score higher
- **Same author** (15 points) - Strong creator connection
- **Mentions** - Unlinked text references from mentions API

**First run**: Downloads embedding model (~22MB), builds cache (~2-5 seconds).
**Subsequent runs**: Uses cached embeddings (<1 second).

---

## Phase 5: Quality Validation (BLOCKING GATE)

Before saving, spawn **3 parallel validation agents** to check for issues.

### 5.1 Spawn Validation Agents

In a single message, spawn all 3 validators:

```markdown
**Agent 1 - Wiki-Link Validator:**
Task tool with subagent_type: "general-purpose"
prompt: "Validate wiki-links in the generated content:

For each [[link]] found:
1. Check if content/{link}.md exists using Glob
2. Report any missing targets

Return: list of broken links (or 'All links valid')"

**Agent 2 - Duplicate Detector:**
Task tool with subagent_type: "general-purpose"
prompt: "Check for duplicate notes:

1. Search for the title in content/*.md using Grep
2. Check for similar titles (>80% match)
3. Check if the URL already exists in any note

Return: list of potential duplicates (or 'No duplicates found')"

**Agent 3 - Tag Validator:**
Task tool with subagent_type: "general-purpose"
prompt: "Validate tags:

1. Run: .claude/skills/adding-notes/scripts/list-existing-tags.sh
2. Compare note's tags against existing tags
3. Identify new tags (not errors, just info)
4. Suggest related existing tags if any new tags are close matches

Return: tag validation report"
```

### 5.2 Collect Validation Results

Use `TaskOutput` (blocking) to collect all validation results:

```markdown
TaskOutput for each validation agent:
- task_id: [agent ID]
- block: true
```

### 5.3 Handle Validation Issues

**IF any validation agent reports issues:**

Present issues to user in a formatted list:

```markdown
## Quality Validation Issues Found

**Wiki-Links:**
- ❌ [[missing-note]] - target does not exist

**Duplicates:**
- ⚠️ Similar note exists: "Existing Note Title" (content/existing-note.md)

**Tags:**
- ℹ️ New tag: "new-tag" (consider using existing "similar-tag" instead)
```

**BLOCK and ask user:**
```markdown
Quality issues found. Please choose:
a) Proceed anyway - save with issues noted above
b) Fix issues - I'll help resolve the problems
c) Cancel - abort note creation
```

**Wait for user confirmation** before proceeding to Phase 6.

**IF no issues found:**
Log "✓ Quality validation passed" and proceed to Phase 6.

---

## Phase 6: Save Note

### 6.1 Generate Slug

Use the slug generator to create a kebab-case filename:

```bash
.claude/skills/adding-notes/scripts/generate-slug.sh "Title Here"
# Output: title-here
# Warns if file already exists
```

Examples:
- "Atomic Habits" → `atomic-habits`
- "Lex Fridman Podcast #404" → `lex-fridman-podcast-404`

### 6.2 Write Note File

Save to: `content/{slug}.md`

### 6.3 Confirmation

Report to user:
```markdown
✓ Note saved: content/{slug}.md
  - Type: {type}
  - Authors: {author-slugs}
  - Tags: {tag-count} tags
  - Wiki-links: {link-count} connections
```

---

## Phase 7: MOC Placement Suggestions (Non-blocking)

After saving the note, suggest which MOCs (Maps of Content) it should belong to.

### 7.1 Run MOC Analysis

Use the MOC curator script to find matching MOCs:

```bash
python3 .claude/skills/moc-curator/scripts/cluster-notes.py --mode=for-note --note={slug}
```

This checks semantic similarity between the new note and existing MOC centroids.

### 7.2 Present Suggestions (if any)

**If matches found (score >= 0.7):**

```markdown
### MOC Placement Suggestions

This note could belong in these Maps of Content:

1. **[[ai-agents-roadmap]]** (score: 0.82)
   - shares tags: ai-agents, llm

2. **[[context-engineering-guide]]** (score: 0.74)
   - semantic similarity to existing members

Would you like me to add this note to any of these MOCs?
- Reply with numbers (e.g., "1" or "1, 2") to add
- Reply "skip" to skip MOC placement
```

**If no matches:** Skip this phase silently.

### 7.3 Apply MOC Updates (if requested)

For each selected MOC:

1. Read the MOC file
2. Look for a `## Suggested` section at the end
3. If it doesn't exist, create it
4. Append the new note link with a brief description

```markdown
## Suggested

- [[new-note-slug]] - Brief description of the note's contribution
```

### 7.4 Confirmation

```markdown
✓ Added to MOC: [[moc-slug]]
```

**Note**: This phase is non-blocking. If the user doesn't respond or says "skip", the note is already saved from Phase 6. The MOC placement is optional enhancement.

---

## Content Type Patterns

### Books
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

**Reading tracking fields:**
- `readingStatus`: `want-to-read` | `reading` | `finished`
- `startedReading`: Date when started reading (YYYY-MM-DD)
- `finishedReading`: Date when finished reading (YYYY-MM-DD)

### Manga

**Important**: Create ONE note per manga series, not per volume. Use the series URL and aggregate metadata.

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

**Manga-specific fields**:
- `volumes`: Total volume count (number)
- `status`: Series status — `ongoing`, `completed`, or `hiatus`

**Cover display**: Like books, manga notes with a `cover` URL automatically display the cover image.

### Podcasts/YouTube
```markdown
## Key Takeaways
- Point 1 (from transcript analysis)
- Point 2

## Notable Quotes
> "Exact quote from transcript"

## References
Discusses ideas from [[referenced-book]].
```

For YouTube videos, use the transcript to extract accurate quotes and key points rather than relying on page metadata alone.

**YouTube Embed Feature**: Notes with `type: youtube` and a valid `url` field automatically display an embedded YouTube player at the top of the page. The embed uses a facade pattern (thumbnail + play button) for fast page loads, loading the full iframe only when clicked. No additional markup needed - just ensure the `url` field contains a valid YouTube URL.

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

### Reddit Threads
```markdown
## Summary
[What the discussion is about - the core question or topic]

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
- Key consensus or insights from the thread
- Notable counterarguments or alternative perspectives

## Related
See also [[related-topic]].
```

### Personal Notes
```markdown
[Synthesized thoughts and ideas]

Connects to [[concept-1]] and [[concept-2]].
```

### Quotes
```markdown
> "The quote text here"

— Author Name, Source

Context or why this quote resonates.
```

### Courses
```markdown
## Course Overview
[What the course covers]

## Key Lessons
- Lesson 1
- Lesson 2

## Projects/Exercises
[Notable hands-on work]
```

### Evergreen Notes
Use `type: evergreen` for foundational reference notes that synthesize ideas across multiple sources:
```markdown
## Definition
[Core concept explained]

## Key Principles
- Principle 1
- Principle 2

## Sources
Synthesized from [[source-1]], [[source-2]], and [[source-3]].
```

### Map Notes (MOCs)
Use `type: map` for Maps of Content that curate and cluster related notes. Maps appear as **pink hexagons** on the knowledge graph and pull their member notes toward them visually.

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

**Key points for maps:**
- Notes linked via `[[wiki-links]]` become **members** of the map
- Members cluster around the map on the graph visualization
- Notes can belong to **multiple maps** (multi-membership)
- Use maps to create learning paths, topic clusters, or curated collections
- Keep maps focused - 3-10 members is ideal for clear clustering

## Mermaid Diagrams

Add visual diagrams **only when they genuinely clarify structure** that's hard to convey in text. A diagram should make something click that paragraphs couldn't.

### When to Add Diagrams

✅ **Use diagrams for:**
- **Frameworks with spatial structure** - Concentric circles (Golden Circle), matrices (Eisenhower), pyramids
- **Process flows** - Step-by-step sequences, cause-effect chains, decision trees
- **System relationships** - How components interact, feedback loops, hierarchies
- **Timelines** - Historical progression, project phases, learning paths

❌ **Skip diagrams when:**
- Content is naturally a list (just use bullet points)
- The concept is abstract without clear visual structure
- Text already explains it clearly
- You'd be forcing a visual for aesthetics only

### Diagram Syntax

Use the MDC component with `<pre>` to preserve formatting. **Never add colors or styling** — let the app's theme handle appearance.

```markdown
::mermaid
<pre>
graph TD
    A[Start] --> B[Process]
    B --> C[End]
</pre>
::
```

### Diagram Type Cheatsheet

| Content Pattern | Mermaid Type | Example Use |
|-----------------|--------------|-------------|
| Hierarchy/layers | `graph TD` | Maslow's pyramid, org charts |
| Concentric model | `graph TD` with subgraphs | Golden Circle, zones of control |
| Process/workflow | `flowchart LR` | GTD workflow, sales funnel |
| Timeline | `timeline` | Historical events, project phases |
| Comparison | `graph LR` with subgraphs | Before/after, two approaches |
| Cycle | `graph` with circular arrows | Feedback loops, iterative processes |

### Real Examples

**Concentric Framework** (e.g., Golden Circle):
```markdown
::mermaid
<pre>
graph TD
    subgraph Circle[" "]
        WHY((Why))
        HOW[How]
        WHAT[What]
    end
    WHY --> HOW --> WHAT
</pre>
::
```

**Neural Circuit / System** (e.g., goal-pursuit):
```markdown
::mermaid
<pre>
graph LR
    A[Amygdala<br/>Fear/Anxiety] --> BG[Basal Ganglia<br/>Go/No-Go]
    PFC[Prefrontal Cortex<br/>Planning] --> BG
    OFC[Orbitofrontal<br/>Emotion] --> BG
    BG --> Action[Goal Action]
    D((Dopamine)) -.-> A & PFC & OFC
</pre>
::
```

**Process Flow** (e.g., learning loop):
```markdown
::mermaid
<pre>
flowchart LR
    Try[Try Task] --> Result{Success?}
    Result -->|85%| Learn[Consolidate]
    Result -->|15%| Error[Error Signal]
    Error --> Alert[Heightened Attention]
    Alert --> Try
    Learn --> Try
</pre>
::
```

### Integration by Content Type

| Content Type | When to Add Diagram |
|--------------|---------------------|
| **Books** | Core framework is visual (matrices, pyramids, cycles) |
| **YouTube/Podcasts** | Speaker presents a named model or system |
| **Articles** | Technical architecture or process explanation |
| **Courses** | Learning path, module structure, or methodology |
| **Evergreen** | Synthesizing a concept that has structural relationships |

**Placement**: Add a `## Diagram` or `## Visual Model` section after explaining the concept in text. The diagram reinforces understanding; the text remains primary.

## Error Recovery

### Subagent Failures

**Metadata Agent Fails (Phase 2):**
- If transcript agent fails, continue without transcript (degrade gracefully)
- If metadata agent fails completely, prompt user for manual entry
- Log the failure and proceed with available data

**Author Agent Fails (Phase 3):**
- If WebSearch yields no results, create minimal profile (name only)
- Notify user: "Created minimal profile for [Author] - bio not found"
- Continue with note creation using the minimal author

**Semantic Analysis Agent Fails (Phase 1 background):**
- If background agent times out or crashes, proceed without related notes
- Log: "Semantic analysis unavailable - skipping wiki-link suggestions"
- User can manually add wiki-links later

**Validation Agent Fails (Phase 5):**
- If any validator crashes, warn user and proceed with caution
- Log specific validator that failed
- Recommend manual verification of the failed check

### Script-Level Errors

**YouTube Metadata Fails:**
If `get-youtube-metadata.sh` fails (private video, age-restricted, unavailable):
1. Open the video in a browser to verify it's accessible
2. Manually copy the title and channel from the page
3. Continue with the workflow using manual data

**YouTube Transcript Unavailable:**
Some videos don't have transcripts (auto-captions disabled, live streams):
1. Check if the video has CC enabled
2. If no transcript: summarize based on watching/listening
3. Note in the body: "No transcript available - summarized from viewing"

**Reddit Thread Unavailable:**
If `get-reddit-thread.py` fails:
1. Check if the thread is deleted, private, or in a quarantined subreddit
2. If rate-limited (429 error), wait 60 seconds and retry
3. For quarantined subreddits, the JSON API may require authentication
4. Fallback: manually copy key content from the browser

**Goodreads Metadata Fails:**
If `get-goodreads-metadata.sh` fails or returns incomplete data:
1. Open the book page in a browser to verify it's accessible
2. Use WebFetch to extract title, author, and cover from the page
3. The cover URL is typically in the `og:image` meta tag
4. Fallback: manually copy the cover image URL from the page source

**Network Errors:**
If scripts fail due to network issues:
1. Verify internet connectivity
2. Retry the command after a few seconds
3. If persistent, use WebFetch as a fallback for metadata

## Quality Checklist

Phase 5 validates these automatically via parallel agents. Manual verification as backup:

**Validated by Phase 5 Agents:**
- [x] **No duplicate**: URL doesn't already exist (Duplicate Detector agent)
- [x] **Wiki-links valid**: All [[links]] resolve to existing notes (Wiki-Link Validator agent)
- [x] **Tags consistent**: Uses existing tags where possible (Tag Validator agent)

**Manual Verification (always check):**
- [ ] **Writing style applied**: Read `writing-style/SKILL.md` before generating content
- [ ] Title is clean and descriptive
- [ ] Type matches the content format
- [ ] **Authors exist**: All authors in `authors` array have profiles in `content/authors/`
- [ ] URL is valid (for YouTube: ensures video embed displays automatically)
- [ ] **Cover added** (for books/manga): Goodreads cover URL in `cover` field
- [ ] **Manga fields** (for manga): `volumes` (number) and `status` (ongoing/completed/hiatus) filled
- [ ] **Reading status** (for books): `readingStatus` set with appropriate dates
- [ ] 3-5 relevant tags
- [ ] Summary captures the core idea in 1-2 sentences
- [ ] Wiki-links added only for strong, direct connections
- [ ] **Diagram added** if content has a clear visual framework
- [ ] Slug is kebab-case
- [ ] Date is today's date
