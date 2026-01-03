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

## Testing

```bash
pnpm test:unit    # Fast tests for local dev (~500ms)
pnpm test:e2e     # E2E tests - CI only (~30s)
```

Always use `pnpm test:unit` for local development. E2E tests (`test:e2e`) run in CI pipeline only.

## Stack

- **Nuxt 4** - Vue framework
- **@nuxt/content v3** - Markdown content with SQLite queries
- **@nuxt/ui v4** - UI components

## Structure

- `app/` - Vue application (pages, components)
- `content/` - Markdown files (flat, type via frontmatter)
- `site.config.ts` - **Main template config** (branding, nav, shortcuts)
- `content.config.ts` - Collection definitions
- `specs.md` - Full project requirements

## Template Configuration

This project is designed as a **GitHub template**. All customizable values are centralized in `site.config.ts`:

```typescript
// site.config.ts
export const siteConfig = {
  name: 'Second Brain',           // Site name (header, page titles, PWA)
  shortName: 'SecondBrain',       // PWA short name
  description: '...',             // SEO description
  themeColor: '#1a1a2e',          // Browser chrome color
  allowIndexing: false,           // robots meta tag
  nav: [...],                     // Navigation links
  shortcuts: {...},               // Keyboard shortcuts
}
```

### Customization Points

| File | What to customize |
|------|-------------------|
| `site.config.ts` | Site name, navigation, shortcuts, theme color |
| `app.config.ts` | UI theme (colors, icons, component defaults) |
| `content/*.md` | Add any custom frontmatter fields (passthrough enabled) |

### Key Composables

- `useSiteConfig()` - Access site config in components
- `usePageTitle('Page')` - Sets title as "Page - Site Name"

## Key Patterns

- Content uses flat structure with wiki-links: `[[slug]]`
- Query content via `queryCollection('content')`
- Catch-all route at `app/pages/[...slug].vue`

## Tag Naming Conventions

- **Format:** lowercase, kebab-case
- **Number:** singular nouns (not plural)
- **Specificity:** prefer precise tags (`ai-agents` over `ai`)
- **Examples:**
  - `productivity`, `habit`, `prompt-engineering`, `local-first`
  - `ai-agents`, `developer-experience`, `knowledge-management`

## Rating System

- **Scale:** 1-7 (optional field for external content)
- **Meaning:** 1 = poor, 4 = average, 7 = exceptional
- **Usage:** Add `rating: 5` to frontmatter for books, articles, podcasts, etc.

## Nuxt Content v3 Gotchas

- **Minimark format**: Body content uses array-based minimark `[tag, props, ...children]`, NOT object AST `{ tag, props, children }`
- **Querying body**: Must explicitly `.select('body')` - not included by default in `.all()`
- **Body structure**: `{ type: 'minimark', value: [...nodes] }`

