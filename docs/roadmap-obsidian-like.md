# Roadmap: Obsidian Publish Parity

Comparison of Second Brain features vs Obsidian Publish, with a roadmap for achieving feature parity.

## Obsidian Publish Features

| Feature | Description |
|---------|-------------|
| Hover previews | Wikipedia-style popover on links |
| Graph view | Interactive connection visualization |
| Stacked pages | Horizontal panes that stack like pages |
| Backlinks | Auto-list pages that reference current page |
| Custom CSS/JS | Full theming control |
| Custom domain | Branded URLs |
| Password protection | Restrict access with passwords |
| SEO optimization | Perfect Lighthouse scores |
| Social sharing cards | OG images, Twitter cards |
| Analytics | Google Analytics, Plausible, Fathom |
| Mobile publishing | Publish from mobile app |

---

## Second Brain: Current Features

**We have MORE than Obsidian Publish in many areas:**

| Category | Features |
|----------|----------|
| **Graph** | Full interactive graph + per-note mini-graphs, filtering by type/tags/authors, orphan detection, hub analysis |
| **Search** | Command palette (Cmd+K), full-text search with Fuse.js, fuzzy matching, section breadcrumbs |
| **Backlinks** | Backlinks + unlinked mentions with context snippets |
| **Wiki-links** | Hover previews with type badge, summary, tags |
| **Content Types** | 16 types: books, podcasts, articles, YouTube, manga, tweets, GitHub repos, etc. |
| **Reading Tracker** | Want to read → Reading → Finished with dates |
| **Stats Dashboard** | Growth charts, quality metrics, connection analytics |
| **Navigation** | Extensive keyboard shortcuts, focus mode, ToC sidebar |
| **Theming** | Dark/light mode, responsive design |
| **Specialized Pages** | Books, Podcasts, Newsletters, Authors, Tags, Table view |

---

## Missing Features (Gap Analysis)

| Priority | Feature | Why It Matters | Status |
|----------|---------|----------------|--------|
| 🔴 **High** | **Stacked Pages (Sliding Panes)** | Signature Obsidian UX - open links in side-by-side panes | ⬜ Todo |
| 🔴 **High** | **Social Sharing Cards (OG Images)** | Rich previews when sharing links on Twitter/Discord/Slack | ⬜ Todo |
| 🟡 **Medium** | **Password Protection** | Restrict access to certain content | ⬜ Todo |
| 🟡 **Medium** | **Analytics Integration** | Plausible/Fathom for privacy-friendly visitor tracking | ⬜ Todo |
| 🟡 **Medium** | **RSS Feed** | Allow others to subscribe to your content | ⬜ Todo |
| 🟡 **Medium** | **Sitemap** | Better SEO crawling | ⬜ Todo |
| 🟢 **Low** | **Reading Progress** | Track scroll position / reading time | ⬜ Todo |
| 🟢 **Low** | **Page Transitions** | Smooth animations between pages | ⬜ Todo |
| 🟢 **Low** | **Outline View in Graph** | Show folder/collection structure | ⬜ Todo |

---

## Implementation Roadmap

### Phase 1: Core Obsidian Features

#### 1. Stacked Pages / Sliding Panes
- Click a wiki-link → opens in a new pane to the right
- Browse connections without losing context
- Very "Obsidian-like" and powerful for exploring
- **Implementation**: Create a pane manager composable, modify wiki-link click behavior

#### 2. Dynamic OG Images
- Auto-generate social cards with title, type icon, summary
- Use `@nuxt/og-image` or Satori for server-side generation
- Makes sharing look professional
- **Implementation**: Install nuxt-og-image, create templates per content type

### Phase 2: Discovery & SEO

#### 3. RSS Feed
- Generate RSS/Atom feed for content
- Allow filtering by type (e.g., just articles, just notes)
- **Implementation**: Use `@nuxtjs/feed` or custom server route

#### 4. Sitemap
- Auto-generate sitemap.xml
- Include all public content
- **Implementation**: Use `@nuxtjs/sitemap`

### Phase 3: Analytics & Privacy

#### 5. Privacy-Friendly Analytics
- Integrate Plausible, Umami, or Fathom
- No cookies, GDPR compliant
- **Implementation**: Add script tag or use official module

#### 6. Content Protection (Optional)
- Auth layer for private notes
- Password-protect specific content
- **Implementation**: Nuxt auth middleware, content-level flags

### Phase 4: Polish

#### 7. Reading Time Estimates
- Calculate from word count
- Display on content pages
- **Implementation**: Simple utility function

#### 8. Recently Updated / Changelog
- Show what content changed recently
- Track modification dates
- **Implementation**: Use git history or frontmatter dates

#### 9. Page Transitions
- Smooth animations between pages
- **Implementation**: Vue transitions, view transitions API

---

## Technical Notes

### Stacked Pages Implementation Ideas

```text
┌─────────────┬─────────────┬─────────────┐
│   Note A    │   Note B    │   Note C    │
│             │  (clicked   │  (clicked   │
│  (initial)  │  from A)    │  from B)    │
└─────────────┴─────────────┴─────────────┘
```

- Use a pane stack in Pinia/composable
- Each pane has its own scroll position
- Close panes from the right with X or Escape
- Keyboard navigation between panes

### OG Image Template

```text
┌────────────────────────────────────┐
│  📖  BOOK                          │
│                                    │
│  Atomic Habits                     │
│                                    │
│  Build good habits, break bad      │
│  ones with this practical guide    │
│                                    │
│  #productivity #habits #self-help  │
└────────────────────────────────────┘
```

---

## References

- [Obsidian Publish](https://obsidian.md/publish)
- [Nuxt OG Image](https://nuxtseo.com/og-image)
- [Nuxt Sitemap](https://nuxtseo.com/sitemap)
- [Plausible Analytics](https://plausible.io)
