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

#### For Other URLs

Use WebFetch to extract:
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

Use the MDC component with `<pre>` to preserve formatting:

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
| Concentric model | `graph TD` with styling | Golden Circle, zones of control |
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
    style WHY fill:#f9d71c,stroke:#333
    style HOW fill:#87ceeb,stroke:#333
    style WHAT fill:#98fb98,stroke:#333
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
- [ ] URL is valid (for YouTube: ensures video embed displays automatically)
- [ ] 3-5 relevant tags (check existing tags with `grep -h "^  - " content/*.md | sort | uniq -c | sort -rn`)
- [ ] Summary captures the core idea in 1-2 sentences
- [ ] Wiki-links added only for strong, direct connections (or none if no strong matches)
- [ ] **Diagram added** if content has a clear visual framework (or skipped if not)
- [ ] Slug is kebab-case
- [ ] Date is today's date
