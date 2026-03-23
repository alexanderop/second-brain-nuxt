# CLAUDE.md

Second Brain is a personal knowledge base for capturing and connecting content (podcasts, articles, books, etc.) using Zettelkasten-style wiki-links.

## Owner

This Second Brain belongs to **Alexander Opalic**. When creating personal notes, TILs, or blog posts, use `authors: [alexander-opalic]` in frontmatter.

## Commands

```bash
pnpm dev                # Start dev server
pnpm test:unit          # Run unit tests
pnpm generate:embeddings # Regenerate search embeddings
```

Run `pnpm check` after code changes.

## Stack

Nuxt 4, @nuxt/content v3, @nuxt/ui v4

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

