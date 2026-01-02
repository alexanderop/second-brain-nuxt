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

### 2. Fetch Resource Details

#### For YouTube Videos (WebFetch doesn't work on YouTube)

Use these dedicated scripts instead:

```bash
# Get title and channel (requires jq)
.claude/skills/adding-notes/scripts/get-youtube-metadata.sh "URL"

# Get full transcript for content analysis
python3 .claude/skills/adding-notes/scripts/get-youtube-transcript.py "URL"
```

Use the transcript to:
- Extract accurate key takeaways
- Find notable quotes (exact wording)
- Understand the full context of the video

#### For Reddit Threads (WebFetch doesn't work on Reddit)

Use the dedicated script:

```bash
# Get thread metadata and top comments
python3 .claude/skills/adding-notes/scripts/get-reddit-thread.py "URL"

# Optionally limit comments or filter by score
python3 .claude/skills/adding-notes/scripts/get-reddit-thread.py "URL" --comments 5 --min-score 10
```

Use the output to:
- Extract the OP's main argument or question
- Identify the most insightful responses
- Note any consensus or counterpoints in the discussion

Author should be the OP's username with `u/` prefix (e.g., `u/mario_candela`).

#### For Books (Goodreads)

Use the dedicated script to fetch book metadata including cover image:

```bash
# Get title, author, and cover image URL
.claude/skills/adding-notes/scripts/get-goodreads-metadata.sh "URL"
```

Use the output to populate:
- **title**: The book title
- **authors**: The author name (create profile if needed)
- **cover**: The high-resolution cover image URL (displays on book detail page)

**Book Cover Feature**: Notes with `type: book` and a valid `cover` URL automatically display the book cover image at the top of the page, below the header. No additional markup needed.

#### For Manga (Goodreads Series URLs)

When adding a manga, use the series metadata script with the **series URL** (not a volume URL):

```bash
# Fetch manga series metadata
.claude/skills/adding-notes/scripts/get-manga-metadata.sh "https://www.goodreads.com/series/57513-slam-dunk"
```

**Output**:
```text
Title: Slam Dunk           # Series name (may be in Japanese - use WebFetch to get English title if needed)
Author: Takehiko Inoue     # Mangaka
Cover: https://...         # First volume cover
Volumes: 31                # Total volume count
Status: completed          # ongoing | completed | hiatus
```

**Manga workflow**:
1. Pass `type="manga"` to `generate-frontmatter.sh` or set manually
2. Run `get-manga-metadata.sh` with the **series URL**
3. Use the series URL as the note's `url` field
4. Fill in `volumes` and `status` from script output
5. If title is in Japanese, use WebFetch to get the English title
6. Create ONE note for the entire series

#### For Other URLs

Use WebFetch to extract:
- **Title**: The main heading or page title
- **Description**: Meta description or first paragraph
- **Key content**: Main points, quotes, or takeaways

### 3. Handle Authors

For external content types (youtube, podcast, article, book, movie, tv, tweet, course, reddit), authors are **required** in the frontmatter.

#### Check for Existing Authors

```bash
# Check if author exists
.claude/skills/adding-notes/scripts/check-author-exists.sh "Author Name"

# List all existing authors for reference
.claude/skills/adding-notes/scripts/list-existing-authors.sh

# Search for similar names (disambiguation)
.claude/skills/adding-notes/scripts/list-existing-authors.sh "partial-name"
```

#### Create Missing Authors

For each author referenced in the note that does not exist:

1. **Use WebSearch** to find the author's official presence:
   - Search for: `"Author Name" official site`
   - Look for: personal website, Wikipedia, LinkedIn, Twitter/X, GitHub, YouTube channel

2. **Extract author information:**
   - **bio**: 1-2 sentence professional description
   - **avatar**: Profile image URL (prefer official headshots, GitHub avatars)
   - **website**: Personal/official website
   - **socials**: Extract handles (not full URLs) for twitter, github, linkedin, youtube

3. **Generate the author profile:**

```bash
# Generate frontmatter with extracted info
.claude/skills/adding-notes/scripts/generate-author-frontmatter.sh "Author Name" \
    --bio "Description here" \
    --avatar "https://example.com/avatar.jpg" \
    --website "https://author.com" \
    --twitter "handle" \
    --github "handle" \
    --linkedin "handle" \
    --youtube "handle"
```

4. **Save silently** to `content/authors/{slug}.md` without user confirmation.

Generate the slug (kebab-case filename) from the author name:
- "Simon Sinek" → `simon-sinek.md`
- "Andrew Huberman" → `andrew-huberman.md`

#### Multiple Authors

When content has multiple authors (e.g., co-authored books, academic papers):

1. Check each author separately using `check-author-exists.sh`
2. For each missing author, **prompt the user**:
   - "Author 'X' not found. Should I create a profile? (yes/no/skip)"
3. If yes, proceed with web search and creation
4. If skip, omit that author from the note's `authors` array

#### Special Cases

**Reddit Authors:**
- Use `u/username` format (e.g., `u/mario_candela`)
- Filename: `u-username.md` (e.g., `u-mario-candela.md`)
- Skip WebSearch for Reddit users (pseudonymous, no reliable public profiles)
- Create minimal profile: name and slug only, leave other fields empty

**Author Not Found Online:**
- Create a minimal profile with just `name` and `slug`
- Leave `bio`, `avatar`, `website`, and `socials` empty

**Organizations as Authors:**
- Treat like regular authors (e.g., "HumanLayer Team")
- Avatar can be company logo
- Socials are company accounts

### 4. Generate Content

Fill in the frontmatter:

**Title**: Use the actual resource title, cleaned up
- Remove site names (e.g., "- YouTube")
- Keep episode numbers for podcasts

**Tags**: Generate 3-5 relevant tags
- Use lowercase, hyphenated format: `productivity`, `habit-formation`, `mental-models`
- Include topic tags and format tags where relevant
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
- When to revisit (e.g., "after finishing project X")
- Leave empty if no personal context needed

### 5. Discover Related Notes

After saving the note, use the AI-powered related notes finder to discover connections:

```bash
# Find semantically related notes using AI embeddings
.claude/skills/adding-notes/scripts/find-related-notes.py content/my-note.md

# Options:
#   --limit 10       Max suggestions (default: 10)
#   --min-score 5    Minimum score threshold (default: 5)
#   --no-mentions    Skip mentions API if dev server not running
```

**First run**: Downloads the embedding model (~22MB) and builds cache for all notes (~2-5 seconds).
**Subsequent runs**: Uses cached embeddings, runs in <1 second.

**Dependencies**: `pip install sentence-transformers numpy`

The script uses a hybrid scoring approach:
- **Semantic similarity** (50 points max) - AI embeddings capture meaning
- **Tag overlap** (weighted by rarity) - Rare shared tags score higher
- **Same author** (15 points) - Strong creator connection
- **Mentions** - Unlinked text references from mentions API

Review the suggestions and **be selective with connections.** Only add wiki-links when there is a strong, direct relationship:

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

### 6. Generate Slug and Save

Use the slug generator to create a kebab-case filename:

```bash
.claude/skills/adding-notes/scripts/generate-slug.sh "Title Here"
# Output: title-here
# Warns if file already exists
```

Examples:
- "Atomic Habits" → `atomic-habits`
- "Lex Fridman Podcast #404" → `lex-fridman-podcast-404`

Save to: `content/{slug}.md`

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

### YouTube Metadata Fails
If `get-youtube-metadata.sh` fails (private video, age-restricted, unavailable):
1. Open the video in a browser to verify it's accessible
2. Manually copy the title and channel from the page
3. Continue with the workflow using manual data

### YouTube Transcript Unavailable
Some videos don't have transcripts (auto-captions disabled, live streams):
1. Check if the video has CC enabled
2. If no transcript: summarize based on watching/listening
3. Note in the body: "No transcript available - summarized from viewing"

### Reddit Thread Unavailable
If `get-reddit-thread.py` fails:
1. Check if the thread is deleted, private, or in a quarantined subreddit
2. If rate-limited (429 error), wait 60 seconds and retry
3. For quarantined subreddits, the JSON API may require authentication
4. Fallback: manually copy key content from the browser

### Goodreads Metadata Fails
If `get-goodreads-metadata.sh` fails or returns incomplete data:
1. Open the book page in a browser to verify it's accessible
2. Use WebFetch to extract title, author, and cover from the page
3. The cover URL is typically in the `og:image` meta tag
4. Fallback: manually copy the cover image URL from the page source

### Network Errors
If scripts fail due to network issues:
1. Verify internet connectivity
2. Retry the command after a few seconds
3. If persistent, use WebFetch as a fallback for metadata

## Quality Checklist

Before saving, verify:
- [ ] **No duplicate**: URL doesn't already exist in `content/*.md`
- [ ] **Slug available**: No existing file at `content/{slug}.md`
- [ ] Title is clean and descriptive
- [ ] Type matches the content format
- [ ] **Authors exist**: All authors in `authors` array have profiles in `content/authors/`
- [ ] URL is valid (for YouTube: ensures video embed displays automatically)
- [ ] **Cover added** (for books/manga): Goodreads cover URL in `cover` field
- [ ] **Manga fields** (for manga): `volumes` (number) and `status` (ongoing/completed/hiatus) filled
- [ ] 3-5 relevant tags (check existing tags with `grep -h "^  - " content/*.md | sort | uniq -c | sort -rn`)
- [ ] Summary captures the core idea in 1-2 sentences
- [ ] Wiki-links added only for strong, direct connections (or none if no strong matches)
- [ ] **Diagram added** if content has a clear visual framework (or skipped if not)
- [ ] Slug is kebab-case
- [ ] Date is today's date
