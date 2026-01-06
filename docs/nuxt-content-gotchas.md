# Nuxt Content v3 Gotchas

Common pitfalls and non-obvious behaviors when working with @nuxt/content v3.

## Minimark Format

Body content uses array format `[tag, props, ...children]`, NOT object format `{ tag, props, children }`.

**Body wrapper structure**: When querying body content, it returns:

```typescript
{ type: 'root', children: [...nodes] }
```

Note: Some older code/docs reference `{ type: 'minimark', value: [...] }` - this is outdated. Always check for `children` first when extracting links from body content.

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

## Deriving Types from Generated Collection Types

Nuxt Content generates TypeScript interfaces from your Zod schemas (e.g., `ContentCollectionItem` from the `content` collection). Import these from `@nuxt/content` to derive types rather than duplicating them:

```typescript
import type { ContentCollectionItem, NewslettersCollectionItem } from '@nuxt/content'

// Derive types from generated collection types
export type ContentType = ContentCollectionItem['type']
export type ReadingStatus = NonNullable<ContentCollectionItem['readingStatus']>
export type NewsletterPlatform = NonNullable<NewslettersCollectionItem['platform']>
```

**Why this matters**: The Zod schema in `content.config.ts` is the single source of truth. Deriving types from the generated interfaces ensures they stay in sync automatically.

**Gotcha**: Don't import directly from `content.config.ts` in tests—it triggers Nuxt Content module initialization and fails. Instead, create a constants file that imports from `@nuxt/content`.

**Validating runtime arrays**: Use `satisfies` to catch drift between arrays and the schema:

```typescript
export const contentTypeValues = [
  'youtube', 'podcast', 'article', ...
] as const satisfies readonly ContentType[]
```

If the array contains a value not in the Zod schema, TypeScript will error.

## Excluding Directories from Collections

To exclude entire directories from a collection (e.g., local-only synced content like Readwise), add glob patterns to the `source.exclude` array in `content.config.ts`:

```typescript
// content.config.ts
const content = defineCollection({
  source: {
    include: '**/*.md',
    exclude: ['authors/**', 'pages/**', 'Readwise/**']
  },
  // ...
})
```

This prevents excluded content from being:
- Queried via `queryCollection()`
- Indexed for search
- Appearing in any collection-based views

**When to use**: Prefer collection-level exclusion over query-level filtering when you never want the content in that collection. It's cleaner and more performant.

## Testing Server Handlers with queryCollection

**Don't mock `@nuxt/content/server` internals.** Using `vi.mock('@nuxt/content/server')` is fragile and breaks when Nuxt Content updates.

**Pattern: Extract pure logic to `server/utils/`**

```typescript
// ✗ Fragile: Mocking queryCollection in tests
vi.mock('@nuxt/content/server', () => ({
  queryCollection: vi.fn().mockResolvedValue(fixtures)
}))
const { default: handler } = await import('../../server/api/graph.get')
```

```typescript
// ✓ Better: Extract pure logic, test without mocking
// server/utils/graph.ts
export function buildGraphFromContent(allContent: ContentItem[]): GraphData {
  const nodes = allContent.map(createNode)
  const edges = allContent.flatMap(item => extractEdges(item, existingNodes))
  return { nodes, edges }
}

// server/api/graph.get.ts - thin wrapper
export default defineEventHandler(async (event) => {
  const allContent = await queryCollection(event, 'content').all()
  return buildGraphFromContent(allContent)  // Pure function
})

// tests/unit/utils/graph.test.ts - no mocking needed!
describe('buildGraphFromContent', () => {
  it('creates edges from wiki-links', () => {
    const result = buildGraphFromContent(fixtures.linkedNotes)
    expect(result.edges).toHaveLength(1)
  })
})
```

**Why this works:**
- Pure functions in `server/utils/` are unit testable without any framework mocking
- Handler becomes a thin wrapper that only fetches data
- Tests don't break when Nuxt Content internals change
- For component tests that need API responses, use `registerEndpoint` from `@nuxt/test-utils/runtime` to mock at HTTP level
