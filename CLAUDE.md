# CLAUDE.md

Second Brain is a personal knowledge base for capturing and connecting content (podcasts, articles, books, etc.) using Zettelkasten-style wiki-links.

## Owner

This Second Brain belongs to **Alexander Opalic**. When creating personal notes, TILs, or blog posts, use `authors: [alexander-opalic]` in frontmatter.

## Commands

```bash
pnpm dev               # Start dev server
vp test --project unit  # Run unit tests
pnpm generate:embeddings # Regenerate search embeddings
```

Run `vp check && pnpm typecheck` after code changes.

## Stack

Nuxt 4, @nuxt/content v3, @nuxt/ui v4, Vite+

## Structure

- `app/` - Vue application (pages, components, composables)
- `content/` - Markdown files (flat structure, type via frontmatter)
- `content.config.ts` - Collection schema definitions

## Further Reading

**IMPORTANT:** Before starting any task, identify which docs below are relevant and read them first.

- `docs/nuxt-content-gotchas.md` - Nuxt Content v3 pitfalls
- `docs/nuxt-component-gotchas.md` - Vue/Nuxt component pitfalls
- `docs/SYSTEM_KNOWLEDGE_MAP.md` - Architecture and business rules
- `docs/testing-strategy.md` - Test layers and when to use each
- `docs/nuxt-ui.md` - Nuxt UI conventions and theming

<!--VITE PLUS START-->

# Vite+

This project uses Vite+ (`vp`) — a unified CLI wrapping Vite, Vitest, Oxlint, and Oxfmt. Use `vp` commands instead of running tools directly.

- `vp dev` / `vp build` / `vp preview` — dev server, production build, preview
- `vp check` — format + lint + type-check in one pass
- `vp test` — run tests (Vitest)
- `vp lint` / `vp fmt` — lint or format individually
- `vp add` / `vp remove` — manage dependencies (wraps pnpm)
- `vp dlx` — run one-off binaries (instead of npx)
- `vp install` — install dependencies

Import from `vite-plus`, not `vite` or `vitest`: `import { defineConfig } from 'vite-plus'`, `import { expect, test, vi } from 'vite-plus/test'`.

<!--VITE PLUS END-->
