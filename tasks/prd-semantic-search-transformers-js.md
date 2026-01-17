# PRD: Semantic Search with Transformers.js

## Introduction

Add semantic (meaning-based) search to the Second Brain knowledge base using Transformers.js. This enables users to discover related content based on conceptual similarity rather than just keyword matching. Embeddings are pre-computed at build time via a script, stored as a static JSON file, and queried client-side using cosine similarity. The search query is converted to an embedding in the browser using Transformers.js.

## Goals

- Enable discovery of conceptually related content even without exact keyword matches
- Combine semantic similarity with existing Fuse.js keyword search for hybrid results
- Pre-compute embeddings at build time to avoid runtime model loading for all content
- Only load Transformers.js model client-side for query embedding (~33MB bge-small-en-v1.5)
- Integrate seamlessly with existing search UI (search page and command palette)

## User Stories

### US-001: Create embedding generation script
**Description:** As a developer, I need a script to generate embeddings for all content at build time so they can be served statically.

**Acceptance Criteria:**
- [ ] Script at `scripts/generate-embeddings.ts` using Transformers.js
- [ ] Uses `bge-small-en-v1.5` model from Hugging Face
- [ ] Processes all markdown files in `content/` directory
- [ ] Generates embeddings from title + summary + first 512 chars of body
- [ ] Outputs to `public/embeddings.json` with format: `{ [slug]: number[] }`
- [ ] Includes content metadata (title, type) for result display
- [ ] Script runs via `pnpm generate:embeddings`
- [ ] Add to package.json scripts
- [ ] Typecheck passes

### US-002: Create embedding storage format
**Description:** As a developer, I need a well-defined storage format for embeddings that balances file size with query performance.

**Acceptance Criteria:**
- [ ] JSON structure: `{ version: string, model: string, embeddings: { [slug]: { vector: number[], title: string, type: string } } }`
- [ ] Vectors stored as arrays of floats (384 dimensions for bge-small)
- [ ] Include model name and version for cache invalidation
- [ ] File served from `/embeddings.json` as static asset
- [ ] Typecheck passes

### US-003: Create semantic search composable
**Description:** As a developer, I need a composable to perform semantic search queries against the pre-computed embeddings.

**Acceptance Criteria:**
- [ ] Composable at `app/composables/useSemanticSearch.ts`
- [ ] Lazy-loads Transformers.js only when search is performed
- [ ] Converts search query to embedding using bge-small-en-v1.5
- [ ] Computes cosine similarity against all pre-computed embeddings
- [ ] Returns top N results sorted by similarity score
- [ ] Caches the model instance after first load
- [ ] Provides loading state for model initialization
- [ ] Typecheck passes

### US-004: Implement cosine similarity function
**Description:** As a developer, I need an efficient cosine similarity implementation for comparing embeddings.

**Acceptance Criteria:**
- [ ] Pure TypeScript function, no external dependencies
- [ ] Handles 384-dimension vectors efficiently
- [ ] Returns similarity score between -1 and 1
- [ ] Unit tests for edge cases (zero vectors, identical vectors)
- [ ] Typecheck passes

### US-005: Create hybrid search scoring
**Description:** As a user, I want search results that combine keyword matches with semantic similarity for the best results.

**Acceptance Criteria:**
- [ ] Hybrid score = (keyword_score * 0.4) + (semantic_score * 0.6)
- [ ] Weights configurable via constants
- [ ] Results sorted by hybrid score descending
- [ ] Keyword-only results included if semantic score is 0
- [ ] Semantic-only results included if keyword score is 0
- [ ] Typecheck passes

### US-006: Integrate semantic search into search page
**Description:** As a user, I want the search page to use hybrid semantic+keyword search.

**Acceptance Criteria:**
- [ ] Search page uses `useSemanticSearch` composable
- [ ] Shows loading indicator while model initializes (first search only)
- [ ] Results show similarity score badge (optional, can be hidden)
- [ ] Fallback to keyword-only if embeddings fail to load
- [ ] Existing keyboard navigation (j/k/enter) continues to work
- [ ] Typecheck passes
- [ ] Verify in browser

### US-007: Integrate semantic search into command palette
**Description:** As a user, I want the Cmd+K search modal to also use semantic search.

**Acceptance Criteria:**
- [ ] Command palette uses same `useSemanticSearch` composable
- [ ] Model loaded lazily on first search query
- [ ] Results merged with existing Fuse.js results using hybrid scoring
- [ ] No visual regression to command palette UI
- [ ] Typecheck passes
- [ ] Verify in browser

### US-008: Add embeddings generation to build pipeline
**Description:** As a developer, I need embeddings regenerated when content changes.

**Acceptance Criteria:**
- [ ] Add `prebuild` script that runs embedding generation
- [ ] Document in CLAUDE.md: `pnpm generate:embeddings`
- [ ] Embeddings file committed to repo (or generated in CI)
- [ ] Typecheck passes

### US-009: Handle model loading UX
**Description:** As a user, I want clear feedback when the semantic search model is loading.

**Acceptance Criteria:**
- [ ] First search shows "Loading semantic search..." indicator
- [ ] Subsequent searches are instant (model cached)
- [ ] If model fails to load, graceful fallback to keyword search
- [ ] Error message if embeddings.json fails to fetch
- [ ] Typecheck passes
- [ ] Verify in browser

## Functional Requirements

- FR-1: Script generates embeddings using Transformers.js with `Xenova/bge-small-en-v1.5` model
- FR-2: Embeddings stored in `public/embeddings.json` as static asset
- FR-3: Client fetches embeddings.json on first semantic search
- FR-4: Client loads Transformers.js model to embed search query only
- FR-5: Cosine similarity computed between query embedding and all content embeddings
- FR-6: Hybrid scoring combines Fuse.js keyword score with semantic similarity
- FR-7: Results deduplicated by slug (same content may match both ways)
- FR-8: Model and embeddings cached in memory after first load
- FR-9: Graceful degradation to keyword-only search if semantic search fails

## Non-Goals

- No server-side semantic search (all client-side)
- No real-time embedding updates (requires script re-run)
- No semantic search for authors, newsletters, or podcasts (content only)
- No vector database integration (simple JSON file)
- No query expansion or re-ranking models
- No multi-language support (English only with bge-small-en)

## Technical Considerations

- **Model Size:** bge-small-en-v1.5 is ~33MB, loaded lazily only when search is used
- **Embedding Dimensions:** 384 floats per content item
- **Storage Estimate:** ~500 content items × 384 floats × 4 bytes = ~750KB embeddings file
- **Browser Compatibility:** Transformers.js uses WebAssembly, supported in all modern browsers
- **Build Time:** Embedding generation may take 1-2 minutes for large content sets
- **Existing Dependencies:** Fuse.js already in use, will be combined with semantic results

### Integration Points

- `app/pages/search.vue` - Main search page, currently uses Fuse.js
- `app/components/AppSearchModal.vue` - Command palette, uses UCommandPalette with Fuse
- `queryCollectionSearchSections` - Existing content fetching for search

### Recommended Libraries

```bash
pnpm add @huggingface/transformers
```

## Design Considerations

- Loading indicator should be subtle (spinner in search input)
- No changes to result card design
- Optional: Show similarity percentage on hover (not required for MVP)
- Preserve existing keyboard shortcuts and navigation

## Success Metrics

- Users can find related content without exact keyword matches
- First semantic search completes in under 3 seconds (including model load)
- Subsequent searches complete in under 200ms
- No regression in keyword search quality
- Embeddings file stays under 2MB

## Open Questions

1. Should we show a "semantic match" badge to differentiate from keyword matches?
2. Should embeddings.json be committed to git or generated in CI?
3. What's the right hybrid weight balance between keyword and semantic?
4. Should we chunk long content or just use first 512 chars for embedding?
