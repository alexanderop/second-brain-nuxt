---
name: adding-notes
description: Add new notes to the Second Brain knowledge base. Use when the user provides a resource (URL, book, podcast, article, GitHub repo, Reddit thread) and asks to "add a note", "create a note", "save this", "add to my notes", "take notes on", or "capture this".
allowed-tools: Read, Write, Bash, WebFetch, Glob, Grep, Task, TaskOutput, WebSearch
---

# Adding Notes to Second Brain

Add content to the knowledge base with proper frontmatter, tags, summaries, and wiki-links.

## Content Type Routing

Detect type from URL, then load the appropriate reference file.

| URL Pattern | Type | Reference |
|-------------|------|-----------|
| youtube.com | See [YouTube Classification](#youtube-classification) | `content-types/youtube.md` or `talk.md` or `podcast.md` |
| reddit.com | reddit | `content-types/reddit.md` |
| github.com | github | `content-types/github.md` |
| goodreads.com/series/ | manga | `content-types/manga.md` |
| goodreads.com, amazon.com (books) | book | `content-types/book.md` |
| spotify.com/episode, podcasts.apple.com | podcast | `content-types/podcast.md` |
| udemy.com, coursera.org, skillshare.com | course | `content-types/course.md` |
| Other URLs | article | `content-types/article.md` |
| No URL | note | `content-types/note.md` |
| Manual: `quote` | quote | `content-types/quote.md` |
| Manual: `evergreen` | evergreen | `content-types/evergreen.md` |
| Manual: `map` | map | `content-types/map.md` |

### YouTube Classification

YouTube URLs require sub-classification before processing:

1. **Known podcast channel?** → `content-types/podcast.md`
2. **Known talk channel OR conference title?** → `content-types/talk.md`
3. **Tutorial signals?** → `content-types/youtube.md` with `isTechnical: true`
4. **Default** → `content-types/youtube.md`

See `content-types/youtube.md` for full classification logic and channel lists.

---

## Scripts Reference

| Script | Purpose |
|--------|---------|
| `generate-frontmatter.sh URL [type]` | Create dated template with auto-detected type |
| `get-youtube-metadata.sh URL` | Fetch video title, channel |
| `get-youtube-transcript.py URL` | Fetch video transcript |
| `get-podcast-transcript.py [opts]` | Multi-source podcast transcript |
| `get-reddit-thread.py URL --comments N` | Fetch thread and top comments |
| `get-goodreads-metadata.sh URL` | Fetch book title, author, cover |
| `get-manga-metadata.sh URL` | Fetch series metadata |
| `get-github-metadata.sh URL` | Fetch repo name, stars, language |
| `check-author-exists.sh NAME` | Check if author profile exists |
| `generate-author-frontmatter.sh NAME` | Generate author profile |
| `list-existing-tags.sh [filter]` | List tags by frequency |
| `generate-slug.sh "Title"` | Generate kebab-case filename |
| `find-related-notes.py FILE --limit N` | Find semantically related notes |

---

## Workflow Phases

```
Phase 1: Type Detection → Route to content-type file
Phase 2: Parallel Metadata Collection → Per-type agents
Phase 3: Author Creation → See references/author-creation.md
Phase 4: Content Generation → Apply writing-style, generate body
Phase 5: Quality Validation → 4 parallel validators (BLOCKING)
Phase 6: Save Note → Write to content/{slug}.md
Phase 7: MOC Placement → Suggest placements (non-blocking)
```

### Phase 1: Type Detection & Dispatch

1. Run `generate-frontmatter.sh "[URL]"` to auto-detect type
2. **Load the content-type reference file** for detailed handling
3. Start background semantic analysis agent:
   ```
   Task: "Run python3 scripts/find-related-notes.py content/TEMP.md --limit 10"
   run_in_background: true
   ```
4. Detect `isTechnical` flag (see content-type file for criteria)

### Phase 2: Metadata Collection

Spawn parallel agents as specified in the content-type file. Each file lists:
- Required scripts to run
- Agent configuration
- Special handling notes

**If `isTechnical: true`:** Also spawn code extraction agent (see `references/code-extraction.md`).

### Phase 3: Author Creation

For external content types, authors are **required**. For each missing author, see `references/author-creation.md`.

Quick flow:
1. WebSearch: `[Author Name] official site bio`
2. Extract: bio, avatar, website, socials
3. Generate with `generate-author-frontmatter.sh`
4. Save to `content/authors/{slug}.md`

### Phase 4: Content Generation

1. **Load writing-style skill** (REQUIRED): `Read .claude/skills/writing-style/SKILL.md`
2. Collect semantic analysis results from Phase 1
3. If `isTechnical`: collect code snippets from Phase 2
4. **Compile frontmatter** using template from content-type file
5. **Generate body** with wiki-links for strong connections only
6. Add diagrams if applicable (see `references/diagrams-guide.md`)

**Tags:** 3-5 relevant tags, check existing: `list-existing-tags.sh`

**Wiki-links:** Link only when same author, explicit reference, same core topic, or same series. When in doubt, leave it out.

### Phase 5: Quality Validation (BLOCKING)

Spawn 4 parallel validators:

| Validator | Checks |
|-----------|--------|
| Wiki-link | Each `[[link]]` exists in `content/` |
| Duplicate | Title/URL doesn't already exist |
| Tag | Tags match or similar to existing |
| Type-specific | E.g., podcast: profile exists, guest not in hosts |

**IF issues found:** Present to user, BLOCK until confirmed.
**IF no issues:** Log "✓ Validation passed" and proceed.

### Phase 6: Save Note

```bash
.claude/skills/adding-notes/scripts/generate-slug.sh "Title"
```

Save to `content/{slug}.md`. Confirm:
```
✓ Note saved: content/{slug}.md
  - Type: {type}
  - Authors: {author-slugs}
  - Tags: {tag-count} tags
  - Wiki-links: {link-count} connections
```

### Phase 7: MOC Placement (Non-blocking)

```bash
python3 .claude/skills/moc-curator/scripts/cluster-notes.py --mode=for-note --note={slug}
```

If suggestions score >= 0.7, present to user. Apply selections to MOC's `## Suggested` section.

---

## Error Handling

| Error | Recovery |
|-------|----------|
| Metadata agent fails | Prompt for manual entry or WebFetch fallback |
| Transcript unavailable | Note "No transcript available" in body |
| Author not found online | Create minimal profile (name only) |
| Reddit 429 | Wait 60s and retry |
| Semantic analysis timeout | Proceed without wiki-link suggestions |
| Validation crash | Warn user, recommend manual check |

---

## Reference Files

| File | Purpose |
|------|---------|
| `references/author-creation.md` | Author profile workflow |
| `references/diagrams-guide.md` | When/how to add mermaid diagrams |
| `references/code-extraction.md` | Technical content code snippets |
| `references/podcast-profile-creation.md` | Creating podcast show profiles |
| `references/content-types/*.md` | Type-specific templates and handling |
