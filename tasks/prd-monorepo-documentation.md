# PRD: Monorepo Structure with Docus Documentation Site

## Introduction

Convert the Second Brain project into a pnpm workspaces monorepo and add a comprehensive documentation site using Docus. The documentation will serve users who want to fork and run their own Second Brain, covering features, usage patterns, Claude Code integration, and technical architecture.

**Target Audience:** Developers who want to clone this repository and run their own personal knowledge base.

## Goals

- Convert the existing project to a monorepo with pnpm workspaces
- Create a documentation site using Docus (Nuxt Content's documentation theme)
- Document all 16 content types with examples and field requirements
- Explain the Claude Code integration and all 19+ skills
- Provide getting-started and customization guides
- Enable deployment of docs independently from the main app

## User Stories

### US-001: Initialize pnpm workspaces monorepo structure
**Description:** As a maintainer, I want the project restructured as a monorepo so that the main app and docs can share dependencies and be managed together.

**Acceptance Criteria:**
- [ ] Create `pnpm-workspace.yaml` with `packages: ['apps/*']`
- [ ] Move existing app to `apps/web/`
- [ ] Create `apps/docs/` for Docus site
- [ ] Update root `package.json` with workspace scripts
- [ ] All existing scripts (`pnpm dev`, `pnpm build`, etc.) still work from root
- [ ] Typecheck passes
- [ ] Verify `pnpm dev` runs the web app from root

### US-002: Initialize Docus documentation site
**Description:** As a maintainer, I want a Docus-powered documentation site so that I can write docs in Markdown with automatic navigation.

**Acceptance Criteria:**
- [ ] Initialize Docus in `apps/docs/` using latest stable version
- [ ] Configure `app.config.ts` with Second Brain branding (title, description, socials)
- [ ] Set up basic navigation structure in `content/`
- [ ] Add favicon and logo assets
- [ ] `pnpm --filter docs dev` starts docs site on different port (e.g., 3001)
- [ ] Typecheck passes
- [ ] Verify docs site loads in browser using dev-browser skill

### US-003: Create Getting Started documentation
**Description:** As a forker, I want clear setup instructions so that I can get the project running locally within 10 minutes.

**Acceptance Criteria:**
- [ ] Create `apps/docs/content/1.getting-started/1.introduction.md`
- [ ] Document prerequisites (Node 24.x, pnpm 10+)
- [ ] Step-by-step fork and clone instructions
- [ ] Environment setup (copy `.env.example`, explain variables)
- [ ] First run instructions (`pnpm install`, `pnpm dev`)
- [ ] Verification steps (visit localhost, see homepage)
- [ ] Typecheck passes

### US-004: Document project structure and architecture
**Description:** As a forker, I want to understand the codebase structure so that I know where to find and modify things.

**Acceptance Criteria:**
- [ ] Create `apps/docs/content/1.getting-started/2.project-structure.md`
- [ ] Document monorepo layout (`apps/web`, `apps/docs`)
- [ ] Explain key directories: `app/`, `content/`, `server/`, `modules/`
- [ ] Describe the flat content structure philosophy (no folders, wiki-links for structure)
- [ ] Include architecture diagram (Mermaid)
- [ ] Typecheck passes

### US-005: Create Content Types reference documentation
**Description:** As a forker, I want documentation for each content type so that I know which fields are required and how to use them.

**Acceptance Criteria:**
- [ ] Create `apps/docs/content/2.content/1.overview.md` explaining the content system
- [ ] Create `apps/docs/content/2.content/2.content-types.md` with:
  - External types: youtube, podcast, article, book, manga, movie, tv, tweet, course, reddit, github, newsletter
  - Personal types: quote, note, evergreen, map
- [ ] Document required vs optional fields for each type
- [ ] Include complete frontmatter examples for each type
- [ ] Explain the author requirement for external content
- [ ] Typecheck passes

### US-006: Document wiki-linking and connections
**Description:** As a forker, I want to understand the wiki-link system so that I can effectively connect my notes.

**Acceptance Criteria:**
- [ ] Create `apps/docs/content/2.content/3.wiki-links.md`
- [ ] Explain `[[slug]]` syntax and how it's processed
- [ ] Document backlinks vs mentions (title/text matches)
- [ ] Provide best practices for linking (when to link, avoiding over-linking)
- [ ] Explain MOCs (Maps of Content) and their special visualization
- [ ] Include examples of well-connected notes
- [ ] Typecheck passes

### US-007: Create Authors and Collections documentation
**Description:** As a forker, I want to understand how authors, podcasts, and newsletters work so that I can add my own.

**Acceptance Criteria:**
- [ ] Create `apps/docs/content/2.content/4.collections.md`
- [ ] Document author profiles (bio, avatar, website, socials)
- [ ] Document podcast shows (hosts, feed, platform links)
- [ ] Document newsletters (platform field, issue references)
- [ ] Include example frontmatter for each collection type
- [ ] Typecheck passes

### US-008: Document all features and pages
**Description:** As a forker, I want to know all available features so that I can use the app effectively.

**Acceptance Criteria:**
- [ ] Create `apps/docs/content/3.features/1.overview.md`
- [ ] Create `apps/docs/content/3.features/2.knowledge-graph.md` (D3 visualization, filtering, node interactions)
- [ ] Create `apps/docs/content/3.features/3.search.md` (Command-K, Fuse.js, search history)
- [ ] Create `apps/docs/content/3.features/4.table-view.md` (filtering, sorting, pagination)
- [ ] Create `apps/docs/content/3.features/5.stats-dashboard.md` (metrics, charts)
- [ ] Create `apps/docs/content/3.features/6.keyboard-shortcuts.md` (all shortcuts with descriptions)
- [ ] Typecheck passes

### US-009: Document Claude Code integration overview
**Description:** As a forker, I want to understand how Claude Code integrates with this project so that I can leverage AI-assisted workflows.

**Acceptance Criteria:**
- [ ] Create `apps/docs/content/4.claude-code/1.overview.md`
- [ ] Explain what Claude Code skills are and how they work
- [ ] Document the `.claude/skills/` directory structure
- [ ] Explain `CLAUDE.md` and its purpose
- [ ] List all 19+ available skills with brief descriptions
- [ ] Typecheck passes

### US-010: Document content creation skills
**Description:** As a forker, I want detailed guides for adding content via Claude Code so that I can efficiently capture knowledge.

**Acceptance Criteria:**
- [ ] Create `apps/docs/content/4.claude-code/2.adding-content.md`
- [ ] Document `/adding-notes` skill workflow (URL → frontmatter → wiki-links)
- [ ] Document `/adding-tweets` skill
- [ ] Document `/creating-obsidian-templates` skill
- [ ] Include example conversations showing skill usage
- [ ] Typecheck passes

### US-011: Document content enhancement skills
**Description:** As a forker, I want to know how to enhance existing notes so that I can improve my knowledge base over time.

**Acceptance Criteria:**
- [ ] Create `apps/docs/content/4.claude-code/3.enhancing-content.md`
- [ ] Document `/enhancing-notes` (Blinkist-style summaries, key insights)
- [ ] Document `/enhancing-talks` (transcripts, timestamps, chunking)
- [ ] Document `/enhancing-authors` (bio, avatar, socials via web research)
- [ ] Typecheck passes

### US-012: Document knowledge organization skills
**Description:** As a forker, I want to know how to organize and connect my notes so that knowledge is discoverable.

**Acceptance Criteria:**
- [ ] Create `apps/docs/content/4.claude-code/4.organizing-knowledge.md`
- [ ] Document `/linking-notes` (find connections, semantic similarity)
- [ ] Document `/moc-curator` (suggest MOC updates, clustering)
- [ ] Document `/managing-tags` (cleanup, consolidation, merging)
- [ ] Document `/exploring-graph` (hubs, orphans, clusters analysis)
- [ ] Typecheck passes

### US-013: Document quality and review skills
**Description:** As a forker, I want to maintain high-quality notes so that my knowledge base stays useful.

**Acceptance Criteria:**
- [ ] Create `apps/docs/content/4.claude-code/5.quality-review.md`
- [ ] Document `/reviewing-notes` (audit for quality issues)
- [ ] Document `/summarizing-topic` (synthesize across notes)
- [ ] Document `/writing-style` (clear, economical prose guidelines)
- [ ] Typecheck passes

### US-014: Create customization guide
**Description:** As a forker, I want to customize the app for my own use so that it reflects my personal branding and preferences.

**Acceptance Criteria:**
- [ ] Create `apps/docs/content/5.customization/1.site-config.md`
- [ ] Document all `site.config.ts` options (name, nav, shortcuts, socials)
- [ ] Explain how to add/remove navigation items
- [ ] Document keyboard shortcut customization
- [ ] Create `apps/docs/content/5.customization/2.theming.md` (colors, dark mode)
- [ ] Typecheck passes

### US-015: Document extending the app
**Description:** As a forker, I want to know how to extend the app with new features so that I can adapt it to my needs.

**Acceptance Criteria:**
- [ ] Create `apps/docs/content/5.customization/3.extending.md`
- [ ] Document adding new content types (schema changes, type icons)
- [ ] Document adding new pages/routes
- [ ] Document creating custom composables
- [ ] Document adding new Claude Code skills
- [ ] Typecheck passes

### US-016: Create deployment guide
**Description:** As a forker, I want to deploy my own instance so that I can access it from anywhere.

**Acceptance Criteria:**
- [ ] Create `apps/docs/content/6.deployment/1.vercel.md`
- [ ] Step-by-step Vercel deployment instructions
- [ ] Environment variables configuration
- [ ] Custom domain setup
- [ ] Create `apps/docs/content/6.deployment/2.other-platforms.md` (Netlify, Cloudflare Pages notes)
- [ ] Typecheck passes

### US-017: Create API reference documentation
**Description:** As a forker, I want API documentation so that I can understand the server endpoints.

**Acceptance Criteria:**
- [ ] Create `apps/docs/content/7.api-reference/1.overview.md`
- [ ] Document `/api/graph` endpoint (returns nodes and edges)
- [ ] Document `/api/backlinks` endpoint
- [ ] Document `/api/mentions` endpoint
- [ ] Document `/api/stats` endpoint
- [ ] Document `/api/note-graph/[slug]` endpoint
- [ ] Document `/api/raw-content/[slug]` endpoint
- [ ] Include request/response examples
- [ ] Typecheck passes

### US-018: Add search functionality to docs
**Description:** As a reader, I want to search the documentation so that I can find information quickly.

**Acceptance Criteria:**
- [ ] Enable Docus built-in search functionality
- [ ] Verify search indexes all documentation pages
- [ ] Search results show relevant matches with context
- [ ] Typecheck passes
- [ ] Verify search works in browser using dev-browser skill

### US-019: Configure docs deployment
**Description:** As a maintainer, I want to deploy the docs independently so that documentation is always available.

**Acceptance Criteria:**
- [ ] Add GitHub Actions workflow for docs deployment
- [ ] Configure docs to deploy to subdomain (e.g., `docs.secondbrain.dev`)
- [ ] Set up DNS/Vercel configuration for subdomain
- [ ] Ensure docs build passes in CI
- [ ] Typecheck passes

### US-020: Update root README with monorepo info
**Description:** As a visitor, I want the README to explain the monorepo structure so that I understand the project at a glance.

**Acceptance Criteria:**
- [ ] Update root `README.md` with monorepo overview
- [ ] Add links to documentation site
- [ ] Include quick start commands for both web and docs
- [ ] Document workspace scripts
- [ ] Typecheck passes

## Functional Requirements

- FR-1: The repository must use pnpm workspaces with `apps/web` (main app) and `apps/docs` (documentation)
- FR-2: Running `pnpm dev` from root must start the web app; `pnpm --filter docs dev` must start docs
- FR-3: Documentation must be written in Markdown with Docus conventions (numbered prefixes for ordering)
- FR-4: Documentation must cover all 16 content types with complete frontmatter examples
- FR-5: Documentation must explain all 19+ Claude Code skills with usage examples
- FR-6: Documentation must include architecture diagrams using Mermaid
- FR-7: Documentation must have working search functionality
- FR-8: Both apps must pass typecheck independently
- FR-9: The docs site must be deployable separately from the main web app
- FR-10: Documentation must include step-by-step guides with code blocks and examples

## Non-Goals

- No changes to the existing web app functionality (this PRD is about restructuring and documentation only)
- No automated documentation generation from code (documentation is manually written)
- No documentation translations/i18n
- No PDF export of documentation
- No versioned documentation (single latest version only)
- No comments/feedback system on documentation pages
- No integration tests between docs and web app
- No shared packages between apps (each app is standalone)
- No video walkthroughs in initial release (will be added later)
- No migration of existing `docs/` folder content (stays as internal dev docs)

## Design Considerations

### Documentation Site Structure
```
apps/docs/content/
├── 0.index.md                    # Landing page
├── 1.getting-started/
│   ├── 1.introduction.md
│   ├── 2.project-structure.md
│   └── 3.first-note.md
├── 2.content/
│   ├── 1.overview.md
│   ├── 2.content-types.md
│   ├── 3.wiki-links.md
│   └── 4.collections.md
├── 3.features/
│   ├── 1.overview.md
│   ├── 2.knowledge-graph.md
│   ├── 3.search.md
│   ├── 4.table-view.md
│   ├── 5.stats-dashboard.md
│   └── 6.keyboard-shortcuts.md
├── 4.claude-code/
│   ├── 1.overview.md
│   ├── 2.adding-content.md
│   ├── 3.enhancing-content.md
│   ├── 4.organizing-knowledge.md
│   └── 5.quality-review.md
├── 5.customization/
│   ├── 1.site-config.md
│   ├── 2.theming.md
│   └── 3.extending.md
├── 6.deployment/
│   ├── 1.vercel.md
│   └── 2.other-platforms.md
└── 7.api-reference/
    └── 1.overview.md
```

### Monorepo Structure
```
second-brain-nuxt/
├── apps/
│   ├── web/           # Main Second Brain app (moved from root)
│   │   ├── app/
│   │   ├── content/
│   │   ├── server/
│   │   ├── docs/      # Internal dev docs (existing, stays here)
│   │   ├── nuxt.config.ts
│   │   └── package.json
│   └── docs/          # Docus documentation site (public docs for forkers)
│       ├── content/
│       ├── app.config.ts
│       ├── nuxt.config.ts
│       └── package.json
├── pnpm-workspace.yaml
├── package.json       # Root workspace scripts
├── CLAUDE.md
└── README.md
```

## Technical Considerations

- **Docus Version:** Use latest stable Docus from https://github.com/nuxt-content/docus
- **Port Configuration:** Web app on 3000, docs on 3001 to allow concurrent development
- **Standalone Apps:** Each app in `apps/` is fully self-contained with its own dependencies (no shared packages)
- **Path Aliases:** Update `tsconfig.json` paths for monorepo structure
- **Git History:** Use `git mv` to preserve history when moving files to `apps/web/`
- **CI/CD:** Update GitHub Actions to handle monorepo (matrix builds or separate workflows)
- **Internal vs Public Docs:** The existing `docs/` folder (dev gotchas, testing strategy, etc.) stays in `apps/web/docs/` as internal developer documentation. The new Docus site at `apps/docs/` is public-facing documentation for forkers.

## Success Metrics

- A new user can go from clone to running local dev in under 10 minutes following the docs
- All 16 content types are documented with copy-paste frontmatter examples
- All Claude Code skills are documented with clear usage instructions
- Documentation site scores 90+ on Lighthouse accessibility
- Zero broken links in documentation
- Search returns relevant results for common queries (e.g., "add book", "keyboard shortcut", "wiki-link")

## Open Questions

1. Should there be a "Contributing" section for potential contributors, or keep focus on forkers?

## Resolved Decisions

- **No shared packages:** Each app in `apps/` is standalone with its own dependencies
- **Video walkthroughs:** Will be added in a future iteration, not in initial scope
- **Existing docs/ folder:** Stays in `apps/web/docs/` as internal developer documentation
- **Docs deployment:** Subdomain (e.g., `docs.secondbrain.dev`)
