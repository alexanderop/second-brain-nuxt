# Second Brain — MVP Product Requirements Document (v2)

## Overview

A personal knowledge base and consumption library built with Nuxt 4, Nuxt UI, and Nuxt Content. A public place to store, organize, and rediscover everything you consume — with Zettelkasten-style connections.

**Tech Stack:** Nuxt 4 + Nuxt UI + Nuxt Content (Markdown-based)

**Core Philosophy:** Flat library with wiki-links. Everything connects to everything. Structure emerges from links, not folders.

---

## Problem Statement

You consume a lot of valuable content (podcasts, videos, articles, etc.) but have no central place to:

- Remember what you've consumed
- Find that "thing you saw once" again
- See how content relates to each other
- Discover unexpected connections

---

## Goals

1. **Capture everything** — One place for all content types
2. **Connect everything** — Wiki-links between related content
3. **Find it later** — Search, tags, backlinks, graph view
4. **Stay simple** — Markdown files, easy to add via Claude Code
5. **Be public** — Share your knowledge library with the world

---

## Target User

You. A curious person who consumes diverse content and wants to see the connections between ideas across different media.

---

## Content Model

Each piece of content is a Markdown file with YAML frontmatter. All content lives flat — type is just metadata, not hierarchy.

### Frontmatter Schema

```yaml
---
title: Episode Title or Content Name # Required
type: podcast # Required (for filtering/icons)
url: 'https://...' # External link (optional)
tags: # Multiple tags
  - productivity
  - ai
  - interviews
summary: AI-generated 1-2 sentence summary # Auto-generated via Claude
notes: My personal thoughts or takeaways # Optional short notes
date: 2025-01-15 # Date added
---

Optional body content with [[wiki-links]] to other notes.

This podcast reminded me of [[atomic-habits]] and connects to
the ideas in [[naval-thread]] about leverage.
```

### Content Types (metadata only)

| Type    | Value     | Description                   |
| ------- | --------- | ----------------------------- |
| YouTube | `youtube` | Videos, channels, playlists   |
| Podcast | `podcast` | Episodes or shows             |
| Article | `article` | Blog posts, news, essays      |
| Book    | `book`    | Books (fiction & non-fiction) |
| Movie   | `movie`   | Films                         |
| TV Show | `tv`      | Series, documentaries         |
| Tweet   | `tweet`   | Tweets, threads               |
| Quote   | `quote`   | Quotes from anywhere          |
| Course  | `course`  | Online courses, tutorials     |
| Note    | `note`    | Personal ideas, thoughts      |

---

## Folder Structure

**Flat structure** — all content in one folder, type is frontmatter metadata:

```
content/
├── atomic-habits.md              # type: book
├── lex-fridman-elon-musk.md      # type: podcast
├── inception.md                  # type: movie
├── naval-thread.md               # type: tweet
├── great-blog-post.md            # type: article
├── random-idea.md                # type: note
└── ...
```

**Why flat?**

- Simpler linking: `[[atomic-habits]]` not `[[books/atomic-habits]]`
- True Zettelkasten: no hierarchy, structure from connections
- Filter by type via frontmatter query

---

## Connection System

### 1. Wiki-Links

Standard Obsidian-style links in markdown body:

```markdown
This podcast about habits connects to [[atomic-habits]]
and the [[compound-effect]] concept.
```

- Links use the filename/slug (without .md)
- Rendered as clickable links
- Need to parse and resolve at build time

### 2. Tags

Multiple tags per item for flexible categorization:

```yaml
tags:
  - productivity
  - habits
  - psychology
```

- Clickable, link to tag pages
- Can filter/browse by tag

### 3. Backlinks

On each content page, show "Linked References":

```
── Linked References ──────────────────
• [[lex-fridman-james-clear]] mentions this
• [[my-note-on-habits]] mentions this
```

- Computed at build time or runtime
- Shows all content that links TO this item
- Essential for discovering connections

### 4. Graph View

Interactive visualization of all connections:

- Each note = node
- Each wiki-link = edge
- Color/shape by content type
- Click node → go to that content
- Filter by type or tag
- Zoom, pan, search within graph

**Tech options:**

- D3.js (flexible, more work)
- vis.js (good for networks)
- Force-graph libraries
- Cytoscape.js

---

## Pages & Routes

| Route          | Description                           |
| -------------- | ------------------------------------- |
| `/`            | Homepage — Recent additions feed      |
| `/search`      | Search page (Nuxt Content search)     |
| `/graph`       | Interactive graph view of all content |
| `/tags`        | All tags overview                     |
| `/tags/[tag]`  | Content filtered by tag               |
| `/type/[type]` | Content filtered by type              |
| `/[slug]`      | Individual content page               |

### URL Examples

```
/                           → Homepage (recent)
/graph                      → Graph visualization
/search                     → Search page
/tags                       → All tags
/tags/productivity          → All items tagged "productivity"
/type/podcast               → All podcasts
/type/book                  → All books
/atomic-habits              → Individual content page
/lex-fridman-elon-musk      → Individual content page
```

---

## Features — MVP

### 1. Homepage (Recent Additions)

- Display latest 20-30 items
- Each item shows: type icon, title, tags, date
- Click to go to detail page
- Clean, minimal feed layout

### 2. Individual Content Page

**Header:**

- Title
- Type (with icon)
- External link button (if URL exists)
- Date added
- Tags (clickable pills)

**Body:**

- AI summary
- Personal notes (if any)
- Markdown body with rendered wiki-links

**Backlinks Section:**

- "Linked References" or "Mentioned In"
- List of all content that links to this page
- Clicking goes to that content

### 3. Search Page

- Nuxt Content full-text search
- Keyboard shortcut: `Cmd/Ctrl + K` (Nuxt UI command palette)
- Search across: title, tags, summary, notes, body
- Results show type icon, title, snippet

### 4. Graph View Page

Interactive network visualization:

- All content as nodes
- Wiki-links as edges
- Node color/shape = content type
- Node size = number of connections (optional)
- Hover: show title
- Click: navigate to content
- Filter panel: show/hide by type or tag
- Search: highlight specific node

### 5. Tags Pages

**`/tags`** — Overview:

- All tags in alphabetical order or by count
- Show count per tag
- Click to filter

**`/tags/[tag]`** — Filtered view:

- All content with that tag
- Same layout as homepage

### 6. Type Filter Pages

**`/type/[type]`** — Filtered view:

- All content of that type (e.g., all podcasts)
- Same layout as homepage

### 7. Navigation

**Header:**

- Logo / site name
- Links: Home, Graph, Tags
- Search shortcut indicator (⌘K)

**Mobile:**

- Hamburger menu
- Same links

---

## Design Requirements

### Visual Style

- **Aesthetic:** Minimal, clean, black and white
- **Typography:** Clear, readable, monospace accents optional
- **Spacing:** Generous whitespace
- **Colors:**
  - Background: white or near-white
  - Text: black or near-black
  - Accents: subtle grays
  - Links: subtle underline or color
- **Dark mode:** Optional (respect system preference)

### Content Type Icons

Simple, monochrome:

| Type    | Icon          |
| ------- | ------------- |
| YouTube | ▶ Play        |
| Podcast | 🎙 Mic        |
| Article | 📄 Doc        |
| Book    | 📖 Book       |
| Movie   | 🎬 Clapper    |
| TV      | 📺 Screen     |
| Tweet   | 💬 Message    |
| Quote   | ❝ Quote marks |
| Course  | 🎓 Cap        |
| Note    | ✏️ Pencil     |

_(Use Nuxt UI icons or Lucide for clean monochrome versions)_

### Wiki-Link Styling

```css
/* Internal links */
a.wiki-link {
  text-decoration: underline;
  text-decoration-style: dotted;
}

/* Broken links (target doesn't exist) */
a.wiki-link.broken {
  color: gray;
  text-decoration: line-through;
}
```

### Backlinks Section Styling

- Subtle separator or box
- Smaller text
- List of linked items with type icon

### Graph Styling

- Minimal, fits black/white aesthetic
- Nodes: circles or dots
- Edges: thin gray lines
- Selected/hovered: slight highlight
- Type colors: subtle grays or single accent

---

## Technical Implementation

### Wiki-Links Parsing

Need to handle `[[slug]]` syntax:

**Option A: Nuxt Content Plugin/Transformer**

- Custom remark plugin to parse `[[...]]`
- Convert to `<a href="/slug" class="wiki-link">Title</a>`
- Resolve title from target frontmatter

**Option B: Runtime Component**

- Custom Vue component `<WikiLink to="slug" />`
- Rendered in markdown via MDC

**Recommendation:** Remark plugin at build time for cleaner markdown.

### Backlinks Computation

At build time or via API:

1. Parse all content files
2. Extract all `[[slug]]` links from each file
3. Build reverse index: `{ slug: [files that link to it] }`
4. Inject backlinks into page data or query at runtime

**Nuxt Content approach:**

- Use `queryContent()` to find all docs containing `[[this-slug]]`
- Or pre-compute and store in a JSON file

### Graph Data Generation

Build a JSON structure for the graph:

```json
{
  "nodes": [
    { "id": "atomic-habits", "title": "Atomic Habits", "type": "book" },
    { "id": "lex-fridman-123", "title": "Lex Fridman #123", "type": "podcast" }
  ],
  "edges": [
    { "source": "lex-fridman-123", "target": "atomic-habits" }
  ]
}
```

- Generate at build time
- Serve as static JSON or API endpoint
- Load in graph component

---

## Adding Content (Workflow)

### Via Claude Code

1. Tell Claude what to add (paste URL, give context)
2. Claude creates markdown file with:
   - Frontmatter (type, title, url, tags)
   - AI summary
   - Your notes
   - Wiki-links to related existing content
3. File saved to `content/` folder
4. Commit & deploy

### Example Prompt

> "Add this podcast: [URL]. It's about habits and connects to [[atomic-habits]]. Tags: habits, productivity. My note: Great practical tips."

### Example Output

```markdown
---
title: "Huberman Lab: The Science of Habits"
type: podcast
url: "https://youtube.com/watch?v=..."
tags:
  - habits
  - productivity
  - neuroscience
summary: "Andrew Huberman explains the neuroscience behind habit formation and practical protocols for building good habits."
notes: "Great practical tips."
date: 2025-01-15
---

Excellent deep dive into habit science. Connects well with
[[atomic-habits]] — Huberman references James Clear's work.

Also related to [[dopamine-nation]] concepts about reward systems.
```

---

## Out of Scope (Post-MVP)

Explicitly NOT in MVP:

- [ ] Auto-fetch metadata from URLs
- [ ] Reading/watch status tracking
- [ ] Statistics dashboard
- [ ] AI-powered semantic search
- [ ] RSS feed
- [ ] Browser extension
- [ ] Import from other apps
- [ ] Comments / reactions
- [ ] User accounts
- [ ] Full-text content (just summaries/notes)

---

## Success Criteria

MVP is successful when:

1. ✅ Can add content via markdown with wiki-links
2. ✅ Wiki-links render and navigate correctly
3. ✅ Backlinks show on each content page
4. ✅ Graph view displays all connections
5. ✅ Search works across all content
6. ✅ Tags filter correctly
7. ✅ Type filter works
8. ✅ Design is minimal black & white
9. ✅ Site is public and shareable

---

## Open Questions

1. **Site name / domain?** — Need for branding
2. **Hosting?** — Vercel, Netlify?
3. **Graph library?** — D3, vis.js, force-graph?

---

## Development Phases

### Phase 1: Foundation

- [ ] Nuxt 4 + Nuxt UI + Nuxt Content setup
- [ ] Flat content folder structure
- [ ] Basic frontmatter schema
- [ ] Homepage with recent items

### Phase 2: Core Pages

- [ ] Individual content page
- [ ] Search page with Cmd+K
- [ ] Type filter pages
- [ ] Tags pages

### Phase 3: Connections

- [ ] Wiki-link parsing (remark plugin)
- [ ] Backlinks computation
- [ ] Backlinks display on content pages

### Phase 4: Graph

- [ ] Graph data generation
- [ ] Graph visualization page
- [ ] Filtering/interaction

### Phase 5: Polish

- [ ] Final styling (B&W minimal)
- [ ] Mobile responsiveness
- [ ] SEO basics
- [ ] Deploy

---

_Document created: December 2024_
_Version: 2.0 — Zettelkasten Edition_
_Status: Ready for development_
