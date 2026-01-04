# System Knowledge Map

> Auto-generated codebase archaeology report for non-technical stakeholders
> Last updated: 2026-01-04

---

## 1. High-Level Overview

**What is this?** A personal knowledge base application ("Second Brain") that lets you capture, connect, and rediscover content you consume—podcasts, books, articles, videos, and more—using wiki-style linking between notes.

**Core Philosophy:** Everything is flat (no folders). Structure emerges from connections, not hierarchy. This follows the Zettelkasten methodology where ideas link to ideas.

### Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Nuxt 4 (Vue.js meta-framework) |
| **Content** | @nuxt/content v3 (Markdown with SQLite) |
| **UI** | @nuxt/ui v4 (Tailwind-based components) |
| **Language** | TypeScript |
| **Search** | Fuse.js (fuzzy full-text search) |
| **Visualization** | D3.js (force-directed graph) |
| **Deployment** | Vercel (serverless, pre-rendered) |
| **PWA** | @vite-pwa/nuxt (installable app) |

---

## 2. Core Business Entities (The Nouns)

### Content (Primary Entity)
The main collection storing all captured knowledge. Each piece is a Markdown file with YAML frontmatter.

**Key Attributes:**
- `title` — Name of the content (required)
- `type` — Category (see types below)
- `url` — Link to original source
- `cover` — Image URL for books/manga
- `tags[]` — Multiple categorization tags
- `authors[]` — Creator references (links to Author entities)
- `summary` — AI-generated 1-2 sentence description
- `notes` — Personal thoughts and takeaways
- `date` — When added to the knowledge base
- `rating` — 1-7 scale quality assessment

**Content Types:**

| External (requires authors) | Personal |
|-----------------------------|----------|
| youtube, podcast, article, book, manga, movie, tv, tweet, course, reddit, github | quote, note, evergreen, map |

**Special Fields by Type:**
- **Books:** `readingStatus` (want-to-read/reading/finished), `startedReading`, `finishedReading`
- **Manga:** `volumes`, `status` (ongoing/completed/hiatus)
- **GitHub:** `stars`, `language`
- **Podcast Episodes:** `podcast` (show reference), `guests[]`

---

### Authors
People who created the external content. Linked from Content items.

**Key Attributes:**
- `name` — Display name
- `slug` — URL-safe identifier
- `bio` — Short biography
- `avatar` — Profile image URL
- `website` — Personal website
- `socials` — Twitter, GitHub, LinkedIn, YouTube handles

**Example:** James Clear (author of Atomic Habits) has 15+ content items linked to him.

---

### Podcasts
Podcast show definitions (not episodes—those are Content items).

**Key Attributes:**
- `name` — Show title
- `slug` — URL identifier
- `description` — Show description
- `artwork` — Cover art URL
- `hosts[]` — Array of Author slugs
- `feed` — RSS feed URL
- `platforms` — Links to Spotify, Apple, etc.

**Current Shows:** Lex Fridman, Huberman Lab, Joe Rogan, Diary of a CEO, Jocko Podcast, Dwarkesh Podcast, Doppelgänger, Lanz & Precht

---

### Tweets
Saved tweets with full metadata for archival.

**Key Attributes:**
- `tweetId` — Twitter's unique ID
- `tweetUrl` — Original tweet URL
- `tweetText` — Full tweet content
- `author` — Single author reference
- `tweetedAt` — Original tweet timestamp
- `tags[]` — Categorization

---

### Pages
Static pages like About, with optional social links.

---

## 3. Key Capabilities (The Verbs)

### Content Management
| Feature | What Users Can Do |
|---------|-------------------|
| **Capture Content** | Add markdown files with frontmatter via Claude Code or directly |
| **Wiki-Linking** | Connect any content to any other using `[[slug]]` syntax |
| **Tag Content** | Categorize with multiple tags for cross-cutting concerns |
| **Rate Content** | Assign 1-7 quality ratings to external content |
| **Track Reading** | Mark books as want-to-read → reading → finished |

### Discovery & Navigation
| Feature | What Users Can Do |
|---------|-------------------|
| **Full-Text Search** | Search across titles, content, tags, authors (Cmd+K) |
| **Graph View** | Visualize all connections as interactive network |
| **Browse by Type** | Filter to see only books, podcasts, articles, etc. |
| **Browse by Tag** | See all content with a specific tag |
| **Browse by Author** | See all content by a specific creator |
| **View Backlinks** | See what other notes link TO this note |
| **View Mentions** | See title/text mentions (not just wiki-links) |

### Visualization & Stats
| Feature | What Users Can Do |
|---------|-------------------|
| **Knowledge Graph** | Interactive D3 force-directed visualization |
| **Filter Graph** | Show/hide by type, tag, author, orphan status |
| **Note Mini-Graph** | Per-note visualization of its connections |
| **Statistics Dashboard** | View totals by type, tag, author, month |
| **Quality Metrics** | Track notes with/without summaries, notes |
| **Connection Metrics** | See orphan %, hub notes, avg connections |

### Reading Experience
| Feature | What Users Can Do |
|---------|-------------------|
| **Books Page** | See currently reading, want-to-read, finished by year |
| **Podcasts Page** | Browse podcast shows and episodes |
| **Keyboard Shortcuts** | Navigate with G+H (home), G+B (books), J/K (list nav) |
| **Dark Mode** | Automatic based on system preference |
| **PWA Install** | Install as native app on desktop/mobile |

---

## 4. Business Rules & Logic

### Content Validation (content.config.ts:77-103)
```text
IF type is external (youtube, podcast, article, book, manga, movie, tv, tweet, course, reddit, github)
  THEN authors[] is REQUIRED (validation fails otherwise)

IF type is "manga"
  THEN volumes AND status are REQUIRED
```

### Reading Status Flow (books.vue)
```text
Book lifecycle:
  want-to-read → reading → finished

Books page groups by:
  1. Currently Reading (reading)
  2. Want to Read (want-to-read)
  3. Finished by Year (grouped by finishedReading year)
  4. Untracked (no status, legacy books)
```

### Connection Counting (graph.get.ts:71-83)
```text
For each edge (wiki-link):
  - Increment source node connection count
  - Increment target node connection count

Node with 0 connections = "orphan"
Top 5 most-connected = "hubs"
```

### Rating System
```text
Scale: 1-7 (optional for external content)
  1 = poor
  4 = average
  7 = exceptional
```

### Tag Naming Convention
```text
Format: lowercase, kebab-case
Number: singular nouns (not plural)
Examples: productivity, habit, ai-agents, local-first
```

### Stats Caching (stats.get.ts:146-199)
```text
Stats API is cached for 10 minutes with stale-while-revalidate
Prevents expensive recalculation on every request
```

---

## 5. Integrations

### External Services

| Service | Purpose | Location |
|---------|---------|----------|
| **Vercel** | Hosting & serverless functions | nuxt.config.ts, .vercel/ |
| **SQLite (in-memory)** | Content database | nuxt.config.ts:33 |
| **Fontsource** | Geist font family | nuxt.config.ts:66-69 |

### Internal Modules

| Module | Purpose |
|--------|---------|
| `./modules/wikilinks` | Custom remark plugin for `[[slug]]` syntax |
| `@vite-pwa/nuxt` | Progressive Web App support |
| `@vueuse/nuxt` | Vue composition utilities |

### Claude Code Integration
The primary workflow for adding content:
1. User tells Claude what to add (paste URL, context)
2. Claude generates markdown file with frontmatter + wiki-links
3. File saved to `content/` folder
4. Git commit & deploy

---

## 6. API Surface

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/graph` | GET | Returns all nodes and edges for knowledge graph |
| `/api/backlinks` | GET | Returns index of what links to what |
| `/api/mentions` | GET | Returns title/text mentions across all content |
| `/api/stats` | GET | Returns aggregated statistics (cached 10min) |
| `/api/note-graph/[slug]` | GET | Returns mini-graph for a specific note |
| `/api/raw-content/[slug]` | GET | Returns raw markdown content |

---

## 7. File Structure (Key Locations)

```text
secondBrain/
├── app/
│   ├── pages/           # Route handlers (Vue SFCs)
│   │   ├── [...slug].vue    # Content detail page (catch-all)
│   │   ├── books.vue        # Books with reading status
│   │   ├── graph.vue        # Knowledge graph visualization
│   │   ├── search.vue       # Full-text search
│   │   └── stats.vue        # Statistics dashboard
│   ├── components/      # Reusable UI components
│   └── composables/     # Vue composition functions
├── content/             # Markdown files (FLAT structure)
│   ├── atomic-habits.md     # Example: book
│   ├── authors/             # Author profiles
│   └── podcasts/            # Podcast show definitions
├── server/
│   └── api/             # Server API routes
├── site.config.ts       # Site customization (name, nav, shortcuts)
├── content.config.ts    # Content schema definitions
└── nuxt.config.ts       # Nuxt configuration
```

---

## 8. Current Scale

Based on exploration:
- **~100+ Content Items** (books, podcasts, articles, videos, etc.)
- **~100 Authors** in the authors collection
- **8 Podcast Shows** defined
- **Multiple Content Types** in active use

