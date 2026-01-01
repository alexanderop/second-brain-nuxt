# Second Brain - Product Backlog

> **Vision**: A curated resource library and evergreen knowledge base. Notes are added locally via AI tools (Claude Code), the web interface is for discovery, browsing, and sharing.

---

## Epic 1: Enhanced Discovery

### 1.1 Unlinked Mentions
**Priority**: P1 (High)
**Complexity**: Medium

**User Story**
As a user browsing a note, I want to see other notes that mention this topic without explicit wiki-links, so that I can discover hidden connections in my knowledge base.

**Acceptance Criteria**
- [ ] Backlinks section shows two subsections: "Linked" and "Mentions"
- [ ] Mentions searches for the note's title (case-insensitive) in all other notes
- [ ] Mentions excludes notes that already have explicit `[[links]]`
- [ ] Each mention shows the note title and a snippet with the match highlighted
- [ ] Clicking a mention navigates to that note

---

### 1.2 Local Graph View
**Priority**: P1 (High)
**Complexity**: Medium

**User Story**
As a user viewing a note, I want to see a focused graph of just this note's connections, so that I can explore related content without the noise of the full graph.

**Acceptance Criteria**
- [ ] Each note page has a "Local Graph" toggle/section
- [ ] Shows the current note as center node
- [ ] Shows 1-degree connections (notes this links to + backlinks)
- [ ] Optional: 2-degree depth toggle
- [ ] Clicking a node navigates to that note
- [ ] Uses same visual style as main graph (colors by type)

---

### 1.3 Related Content Suggestions
**Priority**: P2 (Medium)
**Complexity**: Medium

**User Story**
As a user reading a note, I want to see suggested related resources, so that I can explore similar content I may have forgotten about.

**Acceptance Criteria**
- [ ] "Related" section appears on note pages (below backlinks)
- [ ] Algorithm considers: shared tags, shared links, title/content similarity
- [ ] Shows top 5 related notes with type icon and title
- [ ] Excludes notes already linked or in backlinks
- [ ] Can be collapsed/expanded

---

### 1.4 Random Note
**Priority**: P2 (Medium)
**Complexity**: Low

**User Story**
As a user, I want to surface a random note from my collection, so that I can rediscover forgotten resources and make new connections.

**Acceptance Criteria**
- [ ] "Random" button in header navigation
- [ ] Navigates to a random note from the collection
- [ ] Keyboard shortcut: `g r` (go random)
- [ ] Optional: filter random by type (e.g., random evergreen only)

---

## Epic 2: Organization & Status

### 2.1 Reading Status Field
**Priority**: P1 (High)
**Complexity**: Low

**User Story**
As a user, I want to track the status of my resources, so that I can see what I've processed vs what's still in my queue.

**Acceptance Criteria**
- [ ] New frontmatter field: `status` (enum: `inbox`, `reading`, `processed`, `evergreen`)
- [ ] Status displayed as badge on note header
- [ ] Status filter on homepage and type pages
- [ ] Default status is `inbox` if not specified
- [ ] Color coding: inbox (gray), reading (blue), processed (green), evergreen (amber)

**Schema Change**
```ts
status: z.enum(['inbox', 'reading', 'processed', 'evergreen']).optional()
```

---

### 2.2 Inbox / Reading Queue Page
**Priority**: P2 (Medium)
**Complexity**: Low

**User Story**
As a user, I want a dedicated page showing unprocessed resources, so that I can see what needs my attention.

**Acceptance Criteria**
- [ ] New route: `/inbox`
- [ ] Shows all notes with `status: inbox` or `status: reading`
- [ ] Sorted by date added (oldest first - FIFO)
- [ ] Shows count in header navigation badge
- [ ] Empty state: "All caught up!"

---

### 2.3 Favorites / Pinned Notes
**Priority**: P2 (Medium)
**Complexity**: Low

**User Story**
As a user, I want to pin important notes, so that I can quickly access my most referenced resources.

**Acceptance Criteria**
- [ ] New frontmatter field: `pinned: true`
- [ ] Pinned notes appear in a "Pinned" section on homepage (above recent)
- [ ] Star icon on pinned note cards
- [ ] Keyboard shortcut from note page to copy "pin this note" frontmatter
- [ ] Max 10 pinned notes displayed

---

### 2.4 Sort Options
**Priority**: P3 (Low)
**Complexity**: Low

**User Story**
As a user browsing lists, I want to sort by different criteria, so that I can find what I'm looking for faster.

**Acceptance Criteria**
- [ ] Sort dropdown on list pages (home, tags, type)
- [ ] Options: Date (newest), Date (oldest), Title (A-Z), Most Connected
- [ ] Persists sort preference in localStorage
- [ ] Default: Date (newest)

---

## Epic 3: Improved Browsing

### 3.1 Hover Previews
**Priority**: P3 (Low)
**Complexity**: Medium

**User Story**
As a user reading a note, I want to preview linked notes on hover, so that I can get context without navigating away.

**Acceptance Criteria**
- [ ] Hovering over a wiki-link shows a tooltip/popover
- [ ] Popover shows: title, type, summary (first 200 chars)
- [ ] Delay before showing: 300ms
- [ ] Click still navigates to note
- [ ] Works on both wiki-links and backlink items

---

### 3.2 Table of Contents / Outline
**Priority**: P3 (Low)
**Complexity**: Low

**User Story**
As a user reading a long note, I want to see the document outline, so that I can navigate to specific sections.

**Acceptance Criteria**
- [ ] Sidebar or floating TOC on note pages
- [ ] Extracts all headings (h2, h3, h4)
- [ ] Clicking heading scrolls to that section
- [ ] Highlights current section while scrolling
- [ ] Collapsible on mobile

---

### 3.3 Copy Share Link
**Priority**: P2 (Medium)
**Complexity**: Low

**User Story**
As a user, I want to easily share a note with others, so that I can reference my resources in conversations.

**Acceptance Criteria**
- [ ] "Share" button on note header (next to existing copy link)
- [ ] Copies full URL to clipboard
- [ ] Toast confirmation: "Link copied!"
- [ ] Works on deployed site

---

## Epic 4: Maps of Content (MOCs)

### 4.1 MOC Note Type
**Priority**: P2 (Medium)
**Complexity**: Low

**User Story**
As a user, I want to create curated index notes, so that I can organize related resources around a topic.

**Acceptance Criteria**
- [ ] New content type: `moc` (Map of Content)
- [ ] MOC icon: `Map` or `Compass`
- [ ] MOCs displayed prominently (special styling)
- [ ] MOC pages show a structured list of linked resources
- [ ] Optional: auto-generate list of notes linking TO this MOC

---

### 4.2 MOC Discovery
**Priority**: P3 (Low)
**Complexity**: Low

**User Story**
As a user viewing a note, I want to see which MOCs reference it, so that I can understand how it fits in my knowledge structure.

**Acceptance Criteria**
- [ ] "Appears in" section on note pages
- [ ] Shows MOCs that link to this note
- [ ] Displayed above regular backlinks
- [ ] Special MOC badge/icon

---

## Epic 5: Enhanced Graph

### 5.1 Graph Search
**Priority**: P3 (Low)
**Complexity**: Medium

**User Story**
As a user on the graph page, I want to search for a specific node, so that I can quickly locate and center on a note.

**Acceptance Criteria**
- [ ] Search input on graph page
- [ ] Autocomplete with note titles
- [ ] Selecting a result centers and highlights that node
- [ ] Clears current selection

---

### 5.2 Graph Clustering
**Priority**: P3 (Low)
**Complexity**: High

**User Story**
As a user, I want to see visual clusters of related content, so that I can identify knowledge themes.

**Acceptance Criteria**
- [ ] Option to color nodes by cluster (auto-detected)
- [ ] Clusters based on link density
- [ ] Cluster labels shown on hover
- [ ] Toggle between type-coloring and cluster-coloring

---

## Implementation Order

| Phase | Features | Focus |
|-------|----------|-------|
| **Phase 1** | 1.1 Unlinked Mentions, 2.1 Status Field, 1.4 Random Note | Quick wins, discovery |
| **Phase 2** | 1.2 Local Graph, 2.2 Inbox Page, 2.3 Favorites | Organization |
| **Phase 3** | 1.3 Related Content, 3.3 Share Link, 4.1 MOC Type | Connections |
| **Phase 4** | 3.1 Hover Previews, 3.2 TOC, 2.4 Sort Options | Polish |
| **Phase 5** | 5.1 Graph Search, 4.2 MOC Discovery, 5.2 Clustering | Advanced |

---

## Notes for AI-Assisted Development

When implementing features via Claude Code:

1. **Adding new frontmatter fields**: Update `content.config.ts` schema first
2. **New routes**: Create in `app/pages/`
3. **Shared logic**: Add composables in `app/composables/`
4. **API endpoints**: Add in `server/api/`
5. **After changes**: Run `pnpm lint:fix && pnpm typecheck`

---

*Last updated: January 2025*
