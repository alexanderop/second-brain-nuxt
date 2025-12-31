# CLAUDE.md

Second Brain is a personal knowledge base for capturing and connecting content (podcasts, articles, books, etc.) using Zettelkasten-style wiki-links. See `specs.md` for detailed requirements.

## Commands

```bash
pnpm dev          # Start dev server at localhost:3000
pnpm build        # Build for production
pnpm lint:fix     # Auto-fix linting issues
pnpm typecheck    # Verify type safety
```

Run `pnpm lint:fix && pnpm typecheck` after code changes.

## Stack

- **Nuxt 4** - Vue framework
- **@nuxt/content v3** - Markdown content with SQLite queries
- **@nuxt/ui v4** - UI components

## Structure

- `app/` - Vue application (pages, components)
- `content/` - Markdown files (flat, type via frontmatter)
- `content.config.ts` - Collection definitions
- `specs.md` - Full project requirements

## Key Patterns

- Content uses flat structure with wiki-links: `[[slug]]`
- Query content via `queryCollection('content')`
- Catch-all route at `app/pages/[...slug].vue`

## Documentation

Use specialized subagents before implementing:

- **nuxt-specialist** - Configuration, routing, data fetching, server routes, middleware
- **nuxt-content-specialist** - Collections, queries, MDC syntax
- **nuxt-ui-specialist** - Components, theming, forms
- **vue-specialist** - Reactivity, Composition API, components, TypeScript
