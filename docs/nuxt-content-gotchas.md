# Nuxt Content v3 Gotchas

Common pitfalls and non-obvious behaviors when working with @nuxt/content v3.

## Minimark Format

Body content uses array format `[tag, props, ...children]`, NOT object format `{ tag, props, children }`.

## Querying Body Content

Must explicitly `.select('body')` - body is not included by default in queries.

## Search Section IDs

Returns IDs with leading slash (`/slug#section`). Don't add another slash when constructing URLs.

## Auto-imports in Composables

`useAsyncData` and `queryCollection` must be explicitly imported from `#imports` in composable files, or typecheck fails:

```typescript
import { useAsyncData, queryCollection } from '#imports'
```

## Page Collection Queries: Use `stem` Not `slug`

The `slug` field doesn't exist in page-type collections. Use `stem` (file path without extension) instead:

```typescript
// ✗ Fails: "no such column: slug"
queryCollection('content').select('slug', 'title', ...).all()

// ✓ Works
queryCollection('content').select('stem', 'title', ...).all()
```

Note: `data`-type collections (like `authors`) can define `slug` in their schema and query it normally.
