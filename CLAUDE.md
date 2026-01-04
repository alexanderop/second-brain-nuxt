# CLAUDE.md

Second Brain is a personal knowledge base for capturing and connecting content (podcasts, articles, books, etc.) using Zettelkasten-style wiki-links.

## Commands

```bash
pnpm dev          # Start dev server at localhost:3000
pnpm build        # Build for production
pnpm lint:fix     # Auto-fix linting issues
pnpm typecheck    # Verify type safety
```

Run `pnpm lint:fix && pnpm typecheck` after code changes.

## Testing

```bash
pnpm test:unit    # Fast tests for local dev (~500ms)
pnpm test:e2e     # E2E tests - CI only (~30s)
```

Always use `pnpm test:unit` for local development.

## Stack

- **Nuxt 4** - Vue framework
- **@nuxt/content v3** - Markdown content with SQLite queries
- **@nuxt/ui v4** - UI components

## Structure

- `app/` - Vue application (pages, components, composables)
- `content/` - Markdown files (flat structure, type via frontmatter)
- `site.config.ts` - Site customization (name, nav, shortcuts)
- `content.config.ts` - Collection schema definitions

## Configuration

All customizable values are in `site.config.ts`. Key composables:
- `useSiteConfig()` - Access site config in components
- `usePageTitle('Page')` - Sets title as "Page - Site Name"

## Key Patterns

- Content uses flat structure with wiki-links: `[[slug]]`
- Query content via `queryCollection('content')`
- Catch-all route at `app/pages/[...slug].vue`

## Further Reading

- `docs/nuxt-content-gotchas.md` - Nuxt Content v3 pitfalls and non-obvious behaviors
- `docs/SYSTEM_KNOWLEDGE_MAP.md` - Architecture, business rules, content conventions
- `docs/testing-strategy.md` - Test layers, when to use each, writing new tests
- `docs/nuxt-ui.md` - Nuxt UI conventions, component usage, theming patterns
