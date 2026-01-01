# Second Brain — Improvement Plan (Template Edition)

## Overview

This document outlines improvements needed to transform the current Second Brain MVP into a **production-ready template** that anyone can clone and use to build their own Zettelkasten-style knowledge base.

**Current Status:** ~85% complete MVP
**Goal:** A polished, well-documented template for personal knowledge management

---

## Improvement Categories

| Category           | Priority      | Description                                           |
| ------------------ | ------------- | ----------------------------------------------------- |
| **P1 - Critical**  | Must have     | Blocking issues or missing core Zettelkasten features |
| **P2 - Important** | Should have   | Significant UX/functionality improvements             |
| **P3 - Polish**    | Nice to have  | Refinements that elevate the template quality         |
| **P4 - Template**  | Documentation | Make it easy for others to use as a template          |

---

## P1 — Critical Improvements

### 1.1 Broken Link Detection

**Problem:** Wiki-links to non-existent notes render as normal links with no indication they're broken.

**Current State:**

- CSS exists for `.wiki-link.broken` (line-through styling)
- No validation logic to detect if target exists

**Solution:**

```typescript
// In modules/wikilinks.ts or server plugin
// 1. Build a Set of all valid slugs at startup
// 2. During transformation, check if target exists
// 3. Add 'broken' class if not found
```

**Implementation:**

- [ ] Create API endpoint `/api/slugs.get.ts` returning all valid content slugs
- [ ] Modify wikilinks module to fetch valid slugs at build time
- [ ] Add `broken` class to links pointing to non-existent content
- [ ] Add visual indicator (tooltip) explaining the link is broken

**Files to modify:**

- `modules/wikilinks.ts`
- `server/api/slugs.get.ts` (new)

---

### 1.2 Link Hover Preview

**Problem:** Users must click a wiki-link to discover what it points to. This breaks flow.

**Current State:**

- Graph has tooltips on hover
- Content pages have no link preview

**Solution:**

Create a hover popover component showing:

- Target note title
- Content type icon
- Summary (first 100 chars)
- Tags

**Implementation:**

- [ ] Create `WikiLinkPreview.vue` component using Nuxt UI `UPopover`
- [ ] Modify wikilinks transformation to wrap links in preview component
- [ ] Fetch preview data via API or embed in page data
- [ ] Add keyboard support (focus shows preview)

**Design:**

```text
┌─────────────────────────────┐
│ 📖 Atomic Habits            │
│ ─────────────────────────── │
│ A guide to building good    │
│ habits through small...     │
│ ─────────────────────────── │
│ #habits #productivity       │
└─────────────────────────────┘
```

**Files to create/modify:**

- `app/components/WikiLinkPreview.vue` (new)
- `server/api/preview/[slug].get.ts` (new)
- `modules/wikilinks.ts`

---

### 1.3 Mobile Navigation

**Problem:** Hamburger menu button exists but does nothing on mobile.

**Current State:**

- Button renders on small screens
- No drawer/sheet implementation

**Solution:**

Use Nuxt UI `USlideover` for mobile navigation drawer.

**Implementation:**

- [ ] Add `USlideover` component to `AppHeader.vue`
- [ ] Create mobile navigation menu with all links
- [ ] Add close-on-navigate behavior
- [ ] Test on various screen sizes

**Files to modify:**

- `app/components/AppHeader.vue`

---

### 1.4 SEO & Open Graph

**Problem:** Shared links have no preview image or rich metadata.

**Current State:**

- Basic `title` and `description` in nuxt.config
- No per-page Open Graph tags

**Solution:**

Add dynamic meta tags for each content page.

**Implementation:**

- [ ] Use `useSeoMeta()` composable on `[...slug].vue`
- [ ] Generate Open Graph title, description, type
- [ ] Add Twitter card meta tags
- [ ] Consider generating OG images (Phase 2)

**Meta tags needed:**

```html
<meta property="og:title" content="Atomic Habits" />
<meta property="og:description" content="A guide to building..." />
<meta property="og:type" content="article" />
<meta property="og:url" content="https://yourdomain.com/atomic-habits" />
<meta name="twitter:card" content="summary" />
```

**Files to modify:**

- `app/pages/[...slug].vue`
- `nuxt.config.ts` (default OG image)

---

## P2 — Important Improvements

### 2.1 Graph Filtering

**Problem:** Graph shows all nodes at once, becomes overwhelming with many notes.

**Current State:**

- Full graph always displayed
- No way to filter by type or tag
- Specs mention filtering but not implemented

**Solution:**

Add a filter panel to the graph page.

**Implementation:**

- [ ] Add filter sidebar/toolbar to `/graph` page
- [ ] Checkbox filters for each content type
- [ ] Tag filter dropdown (multi-select)
- [ ] "Show only connected" toggle
- [ ] Apply filters reactively to D3 visualization
- [ ] Persist filter state in URL query params

**UI Design:**

```text
┌─ Filters ────────────────┐
│ Types:                   │
│ [x] Books  [x] Podcasts  │
│ [x] Articles  [ ] Notes  │
│                          │
│ Tags: [Select tags... ▼] │
│                          │
│ [ ] Show orphan nodes    │
└──────────────────────────┘
```

**Files to modify:**

- `app/pages/graph.vue`
- `app/components/KnowledgeGraph.vue`
- `app/components/GraphFilters.vue` (new)

---

### 2.2 Node Size by Connections

**Problem:** All graph nodes are the same size regardless of importance.

**Current State:**

- Fixed radius of 8px for all nodes
- Specs mention "Node size = number of connections" but not implemented

**Solution:**

Scale node radius based on connection count.

**Implementation:**

- [ ] Calculate connection count per node in graph API
- [ ] Add `connections` field to node data
- [ ] Use D3 scale for radius: `d3.scaleSqrt().domain([1, maxConnections]).range([6, 20])`
- [ ] Update collision detection to account for variable sizes

**Files to modify:**

- `server/api/graph.get.ts`
- `app/components/KnowledgeGraph.vue`

---

### 2.3 Server-Side Search

**Problem:** Search only works on the dedicated search page, and is client-side only.

**Current State:**

- `/search` page with client-side filtering
- Cmd+K modal exists but doesn't search efficiently
- Doesn't scale to hundreds of notes

**Solution:**

Create a server-side search API using Nuxt Content's capabilities.

**Implementation:**

- [ ] Create `/api/search.get.ts` endpoint
- [ ] Accept `q` query parameter
- [ ] Search across: title, summary, notes, tags, body
- [ ] Return ranked results with snippets
- [ ] Integrate with `SearchModal.vue` for instant results
- [ ] Add debouncing (300ms) for performance

**API Response:**

```json
{
  "results": [
    {
      "slug": "atomic-habits",
      "title": "Atomic Habits",
      "type": "book",
      "snippet": "...building good <mark>habits</mark> through...",
      "score": 0.95
    }
  ]
}
```

**Files to create/modify:**

- `server/api/search.get.ts` (new)
- `app/components/SearchModal.vue`

---

### 2.4 Search Body Content

**Problem:** Full markdown body is not included in search results.

**Current State:**

- Only title, summary, and tags are searched
- Body content (where most wiki-links live) is ignored

**Solution:**

Include parsed body text in search index.

**Implementation:**

- [ ] In search API, include `body.children` text content
- [ ] Strip markdown formatting for clean text matching
- [ ] Extract relevant snippet around match
- [ ] Highlight matched terms in results

**Files to modify:**

- `server/api/search.get.ts`

---

### 2.5 Loading States

**Problem:** Pages show nothing while data loads.

**Current State:**

- `useAsyncData` used but no loading UI
- Graph has a basic "Loading..." fallback

**Solution:**

Add skeleton loaders for better perceived performance.

**Implementation:**

- [ ] Create `ContentCardSkeleton.vue` component
- [ ] Create `ContentPageSkeleton.vue` component
- [ ] Add skeleton to graph while loading
- [ ] Show skeletons during `pending` state

**Files to create:**

- `app/components/ContentCardSkeleton.vue` (new)
- `app/components/ContentPageSkeleton.vue` (new)

---

### 2.6 Orphan Notes Detection

**Problem:** No way to see which notes have no connections.

**Current State:**

- Notes without links appear in graph as isolated nodes
- No dedicated view to find orphans

**Solution:**

Add orphan detection and display.

**Implementation:**

- [ ] In graph API, flag nodes with 0 connections
- [ ] Add "Orphan Notes" section to `/tags` or new page
- [ ] Filter option in graph to highlight orphans
- [ ] Encourage users to connect isolated notes

**Files to modify:**

- `server/api/graph.get.ts`
- `app/pages/tags/index.vue` or new page

---

## P3 — Polish Improvements

### 3.1 Related Content Suggestions

**Problem:** Only explicit wiki-links show connections. No serendipitous discovery.

**Solution:**

Show "Related Notes" based on shared tags.

**Implementation:**

- [ ] On content page, find notes sharing 2+ tags
- [ ] Display in new "Related" section below backlinks
- [ ] Exclude notes already linked via wiki-links
- [ ] Limit to 5 suggestions

**Files to modify:**

- `app/pages/[...slug].vue`
- `app/components/RelatedContent.vue` (new)

---

### 3.2 Date Formatting Consistency

**Problem:** Different date formats across components.

**Current State:**

- ContentCard: `Jan 15, 2025` (short)
- ContentHeader: `January 15, 2025` (long)

**Solution:**

Create a consistent date formatting composable.

**Implementation:**

- [ ] Create `useFormatDate()` composable
- [ ] Define standard formats: `short`, `long`, `relative`
- [ ] Use throughout all components

**Files to create/modify:**

- `app/composables/useFormatDate.ts` (new)
- All components using dates

---

### 3.3 Keyboard Navigation

**Problem:** Limited keyboard support beyond Cmd+K.

**Solution:**

Add keyboard shortcuts for power users.

**Implementation:**

- [ ] `g h` - Go home
- [ ] `g g` - Go to graph
- [ ] `g t` - Go to tags
- [ ] `j/k` - Navigate items in lists
- [ ] `Enter` - Open selected item
- [ ] `Esc` - Close modals/go back

**Files to modify:**

- `app/app.vue` or dedicated composable

---

### 3.4 Table of Contents for Long Notes

**Problem:** Long notes have no navigation.

**Solution:**

Auto-generate TOC from markdown headings.

**Implementation:**

- [ ] Parse `h2`, `h3` headings from content body
- [ ] Display sticky TOC sidebar on desktop
- [ ] Highlight current section on scroll
- [ ] Click to jump to section

**Files to modify:**

- `app/pages/[...slug].vue`
- `app/components/TableOfContents.vue` (new)

---

### 3.5 Graph Mini-Map

**Problem:** Large graphs are hard to navigate.

**Solution:**

Add a mini-map showing current viewport position.

**Implementation:**

- [ ] Render scaled-down version of full graph
- [ ] Show viewport rectangle
- [ ] Click mini-map to navigate
- [ ] Toggle visibility

**Files to modify:**

- `app/components/KnowledgeGraph.vue`
- `app/components/GraphMiniMap.vue` (new)

---

### 3.6 Caching Strategy

**Problem:** Graph and backlinks re-computed on every request.

**Solution:**

Add caching for expensive operations.

**Implementation:**

- [ ] Cache graph data with 5-minute TTL
- [ ] Cache backlinks index
- [ ] Invalidate on content changes (dev mode)
- [ ] Use Nuxt `defineCachedEventHandler`

**Files to modify:**

- `server/api/graph.get.ts`
- `server/api/backlinks.get.ts`

---

### 3.7 Error Handling UI

**Problem:** No user-friendly error pages.

**Solution:**

Create custom error pages.

**Implementation:**

- [ ] Create `error.vue` for global errors
- [ ] Create 404 page for missing content
- [ ] Suggest similar notes on 404 (fuzzy match)
- [ ] Add "Report Issue" link

**Files to create:**

- `app/error.vue`

---

## P4 — Template Documentation

### 4.1 README Overhaul

**Current State:** Basic README exists

**Needed:**

- [ ] Clear project description
- [ ] Screenshot/GIF of the app
- [ ] One-click deploy buttons (Vercel, Netlify)
- [ ] Quick start guide (clone, install, run)
- [ ] How to add your first note
- [ ] Configuration options
- [ ] License information

---

### 4.2 Setup Wizard / First Run

**Problem:** New users face empty state with no guidance.

**Solution:**

Create a first-run experience.

**Implementation:**

- [ ] Detect empty content folder
- [ ] Show welcome page with instructions
- [ ] Provide example content to import
- [ ] Link to documentation

---

### 4.3 Content Examples

**Current State:** 6 example notes

**Needed:**

- [ ] At least 2 examples per content type (20 total)
- [ ] Demonstrate various wiki-link patterns
- [ ] Show interconnected topic clusters
- [ ] Include example of orphan note (for comparison)

**Example clusters:**

- Productivity cluster: atomic-habits, deep-work, getting-things-done
- Science cluster: why-we-sleep, huberman-episodes, neuroscience-articles
- Tech cluster: programming-books, tech-podcasts, coding-tutorials

---

### 4.4 Customization Guide

**Needed documentation:**

- [ ] How to change site name/branding
- [ ] How to customize colors (Nuxt UI theme)
- [ ] How to add/remove content types
- [ ] How to modify frontmatter schema
- [ ] How to customize the graph appearance
- [ ] Deployment instructions for various platforms

---

### 4.5 Claude Code Integration Guide

**Purpose:** Make it easy to add content via Claude Code

**Needed:**

- [ ] Example prompts for adding content
- [ ] Snippet/template for Claude to follow
- [ ] Instructions in CLAUDE.md for the AI
- [ ] Workflow documentation

---

## Implementation Order

### Sprint 1: Critical Path (P1)

1. Broken link detection
2. Mobile navigation
3. SEO/Open Graph tags

### Sprint 2: Core UX (P2)

4. Server-side search
5. Search body content
6. Graph filtering

### Sprint 3: Enhancements (P2)

7. Link hover preview
8. Node size by connections
9. Loading states

### Sprint 4: Polish (P3)

10. Related content suggestions
11. Orphan notes detection
12. Date formatting consistency

### Sprint 5: Template Ready (P4)

13. README overhaul
14. Content examples
15. Customization guide
16. First-run experience

---

## Technical Debt

### Code Quality

- [ ] Extract shared markdown parsing logic (used in both backlinks.get.ts and graph.get.ts)
- [ ] Add TypeScript strict mode
- [ ] Add unit tests for wiki-link parsing
- [ ] Add E2E tests for critical flows

### Performance

- [ ] Lazy load D3.js (large bundle)
- [ ] Image optimization for any content images
- [ ] Analyze and reduce initial bundle size

---

## Success Criteria (Template Edition)

The template is ready when:

1. **Core Features Work**
   - [ ] Wiki-links render correctly (with broken detection)
   - [ ] Backlinks compute and display
   - [ ] Graph is filterable and scales well
   - [ ] Search finds content in all fields

2. **UX is Polished**
   - [ ] Mobile navigation works
   - [ ] Loading states are smooth
   - [ ] Link previews aid discovery
   - [ ] Keyboard shortcuts for power users

3. **Documentation is Complete**
   - [ ] README has quick start guide
   - [ ] Customization is documented
   - [ ] Example content demonstrates features
   - [ ] One-click deploy works

4. **Template is Reusable**
   - [ ] Easy to clone and customize
   - [ ] Branding is configurable
   - [ ] No hardcoded personal data
   - [ ] Clear licensing

---

## Open Questions

1. **OG Image Generation** — Should we auto-generate Open Graph images per page? (Satori, @nuxt/og-image)

2. **Search Technology** — Is Nuxt Content search sufficient, or should we add Algolia/MeiliSearch for larger libraries?

3. **Graph Library** — Should we consider switching from D3 to a higher-level library (Cytoscape.js, Sigma.js) for better features?

4. **Export/Import** — Should users be able to export their data or import from Obsidian/Notion?

5. **PWA Support** — Should this be installable as a Progressive Web App?

---

## Zettelkasten Best Practices (Reference)

To make this a true Zettelkasten tool, ensure these principles are supported:

| Principle               | How We Support It                            |
| ----------------------- | -------------------------------------------- |
| **Atomic notes**        | One topic per markdown file, flat structure  |
| **Unique IDs**          | Filename/slug serves as unique identifier    |
| **Wiki-links**          | `[[slug]]` syntax with bidirectional linking |
| **Backlinks**           | Computed and displayed on every page         |
| **Emergent structure**  | No folders, connections emerge from links    |
| **Personal notes**      | `notes` field in frontmatter for thoughts    |
| **Source attribution**  | `url` field links to original source         |
| **Tags for discovery**  | Multi-tag support with filtering             |
| **Graph visualization** | Interactive D3 network view                  |

---

_Document created: December 2024_
_Version: 1.0_
_Status: Ready for implementation_
