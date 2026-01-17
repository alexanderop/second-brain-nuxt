# Research: Client-Side Semantic Search with Transformers.js and SQLite

**Date:** 2026-01-17
**Status:** Complete

## Problem Statement

Implement semantic search in the Second Brain without relying on external AI providers. The approach should:
1. Use Transformers.js for local embedding generation (both build-time and client-side)
2. Store pre-computed embeddings alongside Nuxt Content's SQLite database
3. Perform cosine similarity search client-side using the same model
4. Work offline after initial model download

## Key Findings

### Transformers.js Capabilities

Transformers.js enables running Hugging Face models directly in the browser via ONNX Runtime (WebAssembly or WebGPU). It provides a Python-equivalent API for JavaScript.

**Installation:**
```bash
pnpm add @huggingface/transformers
```

**Generating Embeddings:**
```javascript
import { pipeline, cos_sim } from '@huggingface/transformers';

const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
const output = await extractor('Your text here', { pooling: 'mean', normalize: true });
const embedding = output.tolist()[0]; // Float32Array[384]
```

### Recommended Embedding Models

| Model | Size | Dimensions | Notes |
|-------|------|------------|-------|
| **TaylorAI/gte-tiny** | ~15MB | 384 | Smallest, fast, good for browser |
| **Xenova/all-MiniLM-L6-v2** | ~22MB | 384 | Most popular, proven baseline |
| **mixedbread-ai/mxbai-embed-xsmall-v1** | ~25MB | 384 | WebGPU optimized |
| **Supabase/gte-small** | ~33MB | 384 | Better accuracy |

**Recommendation:** Use `Xenova/all-MiniLM-L6-v2` for balance of size, speed, and quality.

### SQLite Vector Storage Options

#### Option A: Store in Nuxt Content Schema (Simplest)

Add an `embedding` field to `content.config.ts`:

```typescript
// content.config.ts
schema: z.object({
  // ... existing fields
  embedding: z.array(z.number()).optional(),
})
```

**Limitation:** Nuxt Content regenerates the database on every build. Embeddings must be computed during the build process using hooks.

#### Option B: Separate Embeddings File (Recommended)

Store embeddings in a separate JSON file shipped with the build:

```
.output/public/embeddings.json
```

Structure:
```json
{
  "model": "Xenova/all-MiniLM-L6-v2",
  "dimensions": 384,
  "embeddings": {
    "content-slug-1": [0.123, -0.456, ...],
    "content-slug-2": [0.789, -0.012, ...]
  }
}
```

#### Option C: sqlite-vec Extension (Best Performance for Large Collections)

Use [sqlite-vec](https://github.com/asg017/sqlite-vec) for indexed KNN queries:

```sql
CREATE VIRTUAL TABLE vec_content USING vec0(
    slug TEXT PRIMARY KEY,
    embedding FLOAT[384] distance_metric=cosine
);
```

**Trade-off:** Requires WASM extension loading; adds complexity.

### Cosine Similarity Implementation

Transformers.js provides a built-in `cos_sim` function:

```javascript
import { cos_sim } from '@huggingface/transformers';

const similarity = cos_sim(queryEmbedding, documentEmbedding);
// Returns: -1 (opposite) to 1 (identical)
```

Manual implementation for reference:
```javascript
function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
```

## Codebase Patterns

### Current Search Implementation

The project already has **Fuse.js full-text search** at `app/pages/search.vue`:
- Searches content sections via `queryCollectionSearchSections('content')`
- Weighted fields: title (1.0), tags (0.9), content (0.7)
- Debounced input, keyboard navigation, snippet highlighting

### Content Structure

From `content.config.ts`, key fields for embedding:
- `title` - Short, focused (high semantic signal)
- `summary` - AI-generated 1-2 sentence description (ideal for embeddings)
- `body` - Full markdown content

### Query Patterns

```typescript
// Get all content with body
queryCollection('content').select('stem', 'title', 'summary', 'body').all()

// Get searchable sections (includes heading anchors)
queryCollectionSearchSections('content')
```

### Build-Time Hooks

Nuxt Content provides hooks for pre-processing:

```typescript
// nuxt.config.ts
hooks: {
  'content:file:afterParse'(ctx) {
    // Generate embedding here
    ctx.content.embedding = await generateEmbedding(ctx.content.body);
  }
}
```

## Recommended Approach

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      BUILD TIME                              │
├─────────────────────────────────────────────────────────────┤
│  1. Parse all content files                                  │
│  2. Generate embeddings via Transformers.js (Node.js)        │
│  3. Write embeddings.json to .output/public/                 │
│  4. Build SQLite database (Nuxt Content normal flow)         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      RUNTIME (Browser)                       │
├─────────────────────────────────────────────────────────────┤
│  1. Load embeddings.json on app init                         │
│  2. Lazy-load Transformers.js model on first search          │
│  3. Generate query embedding client-side                     │
│  4. Compute cosine similarity against all documents          │
│  5. Combine with Fuse.js results for hybrid search           │
└─────────────────────────────────────────────────────────────┘
```

### Implementation Steps

#### Step 1: Build Script for Embedding Generation

Create `scripts/generate-embeddings.ts`:

```typescript
import { pipeline } from '@huggingface/transformers';
import { readFile, writeFile } from 'fs/promises';
import { glob } from 'glob';
import matter from 'gray-matter';

const MODEL = 'Xenova/all-MiniLM-L6-v2';

async function main() {
  const extractor = await pipeline('feature-extraction', MODEL);
  const files = await glob('content/**/*.md');

  const embeddings: Record<string, number[]> = {};

  for (const file of files) {
    const content = await readFile(file, 'utf-8');
    const { data, content: body } = matter(content);

    // Combine title + summary + first 500 chars of body
    const text = [data.title, data.summary, body.slice(0, 500)]
      .filter(Boolean)
      .join(' ');

    const output = await extractor(text, { pooling: 'mean', normalize: true });
    const slug = file.replace('content/', '').replace('.md', '');
    embeddings[slug] = Array.from(output.data);
  }

  await writeFile('public/embeddings.json', JSON.stringify({
    model: MODEL,
    dimensions: 384,
    generated: new Date().toISOString(),
    embeddings
  }));

  console.log(`Generated embeddings for ${Object.keys(embeddings).length} documents`);
}

main();
```

#### Step 2: Composable for Semantic Search

Create `app/composables/useSemanticSearch.ts`:

```typescript
import { ref, shallowRef } from 'vue';
import { pipeline, cos_sim, type FeatureExtractionPipeline } from '@huggingface/transformers';

const MODEL = 'Xenova/all-MiniLM-L6-v2';

interface Embeddings {
  model: string;
  dimensions: number;
  embeddings: Record<string, number[]>;
}

const extractor = shallowRef<FeatureExtractionPipeline | null>(null);
const embeddings = shallowRef<Embeddings | null>(null);
const isLoading = ref(false);
const isModelReady = ref(false);

export function useSemanticSearch() {

  async function loadEmbeddings() {
    if (embeddings.value) return;
    const response = await fetch('/embeddings.json');
    embeddings.value = await response.json();
  }

  async function loadModel() {
    if (extractor.value) return;
    isLoading.value = true;
    extractor.value = await pipeline('feature-extraction', MODEL);
    isModelReady.value = true;
    isLoading.value = false;
  }

  async function search(query: string, topK = 10) {
    await Promise.all([loadEmbeddings(), loadModel()]);

    if (!extractor.value || !embeddings.value) {
      throw new Error('Model or embeddings not loaded');
    }

    // Generate query embedding
    const output = await extractor.value(query, { pooling: 'mean', normalize: true });
    const queryVector = Array.from(output.data) as number[];

    // Calculate similarities
    const results = Object.entries(embeddings.value.embeddings)
      .map(([slug, docVector]) => ({
        slug,
        score: cos_sim(queryVector, docVector)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    return results;
  }

  return {
    search,
    loadModel,
    isLoading,
    isModelReady
  };
}
```

#### Step 3: Hybrid Search Component

Combine semantic search with existing Fuse.js:

```vue
<script setup lang="ts">
const { search: semanticSearch, isModelReady, loadModel } = useSemanticSearch();
const query = ref('');
const results = ref([]);

// Start loading model in background on mount
onMounted(() => {
  loadModel();
});

async function handleSearch() {
  const [semanticResults, fuseResults] = await Promise.all([
    semanticSearch(query.value, 10),
    fuseSearch(query.value) // existing Fuse.js search
  ]);

  // Merge and dedupe results, prioritizing semantic matches
  results.value = mergeResults(semanticResults, fuseResults);
}
</script>
```

#### Step 4: Add Build Script to package.json

```json
{
  "scripts": {
    "generate:embeddings": "tsx scripts/generate-embeddings.ts",
    "prebuild": "pnpm generate:embeddings"
  }
}
```

### Performance Considerations

| Aspect | Recommendation |
|--------|----------------|
| **Model Loading** | Lazy-load on first search; cache in IndexedDB automatically |
| **Main Thread** | Use Web Worker for embedding generation to prevent UI blocking |
| **Memory** | ~50MB for model + embeddings; acceptable for desktop/modern mobile |
| **Initial Load** | Show Fuse.js results immediately; semantic results appear when model ready |
| **WebGPU** | Enable with `{ device: 'webgpu' }` for 10-100x speedup where supported |

### Web Worker Implementation (Recommended)

Create `app/workers/embedding.worker.ts`:

```typescript
import { pipeline, type FeatureExtractionPipeline } from '@huggingface/transformers';

let extractor: FeatureExtractionPipeline | null = null;

self.onmessage = async (event) => {
  const { type, payload } = event.data;

  if (type === 'init') {
    extractor = await pipeline('feature-extraction', payload.model);
    self.postMessage({ type: 'ready' });
  }

  if (type === 'embed') {
    if (!extractor) throw new Error('Model not loaded');
    const output = await extractor(payload.text, { pooling: 'mean', normalize: true });
    self.postMessage({ type: 'embedding', data: Array.from(output.data) });
  }
};
```

## Trade-offs and Alternatives

### Build-Time vs Runtime Embeddings

| Approach | Pros | Cons |
|----------|------|------|
| **Build-time (recommended)** | Fast search, works offline, no runtime cost | Requires rebuild for new content |
| **Runtime** | Always current | API latency, requires connectivity |
| **Hybrid** | Best of both | Complex implementation |

### sqlite-vec vs JSON File

| Approach | Pros | Cons |
|----------|------|------|
| **JSON file (recommended)** | Simple, no WASM extension | Linear scan, slower for >10K docs |
| **sqlite-vec** | Indexed KNN, fast at scale | Complex setup, WASM loading |

For a Second Brain with <1000 documents, JSON file approach is sufficient.

### Model Selection

| If you need... | Use... |
|----------------|--------|
| Smallest download | `TaylorAI/gte-tiny` (15MB) |
| Best balance | `Xenova/all-MiniLM-L6-v2` (22MB) |
| Multilingual | `Xenova/multilingual-e5-small` (118MB) |
| Highest accuracy | `Supabase/gte-small` (33MB) |

## Browser Compatibility

| Browser | WASM (default) | WebGPU (faster) |
|---------|----------------|-----------------|
| Chrome 113+ | Yes | Yes |
| Firefox | Yes | Behind flag |
| Safari 15.4+ | Yes | Behind flag |
| Edge 113+ | Yes | Yes |

WASM provides ~100% browser coverage. WebGPU offers 10-100x speedup but limited support.

## Sources

### Official Documentation
- [Transformers.js Documentation](https://huggingface.co/docs/transformers.js/en/index)
- [Transformers.js Pipelines API](https://huggingface.co/docs/transformers.js/en/api/pipelines)
- [Transformers.js WebGPU Guide](https://huggingface.co/docs/transformers.js/en/guides/webgpu)
- [Nuxt Content v3 Database](https://content.nuxt.com/docs/advanced/database)
- [Nuxt Content v3 Hooks](https://content.nuxt.com/docs/advanced/hooks)

### SQLite Vector Extensions
- [sqlite-vec GitHub](https://github.com/asg017/sqlite-vec)
- [sqlite-vec Node.js Docs](https://alexgarcia.xyz/sqlite-vec/js.html)
- [How sqlite-vec Works](https://medium.com/@stephenc211/how-sqlite-vec-works-for-storing-and-querying-vector-embeddings-165adeeeceea)

### Implementation References
- [SemanticFinder - Browser Semantic Search](https://github.com/do-me/SemanticFinder)
- [client-vector-search NPM](https://www.npmjs.com/package/client-vector-search)
- [MeMemo - Browser Vector Search with HNSW](https://github.com/poloclub/mememo)
- [Simon Willison: OpenAI Embeddings for Related Content](https://til.simonwillison.net/llms/openai-embeddings-related-content)

### Performance and Best Practices
- [Transformers.js v3 WebGPU Announcement](https://huggingface.co/blog/transformersjs-v3)
- [Client-Side AI Performance Guide](https://web.dev/articles/client-side-ai-performance)
- [Mozilla 3W Pattern (WebLLM + WASM + WebWorkers)](https://blog.mozilla.ai/3w-for-in-browser-ai-webllm-wasm-webworkers/)
- [IndexedDB as a Vector Database](https://paul.kinlan.me/idb-as-a-vector-database/)

### Embedding Models
- [Open Source Embedding Models Benchmark](https://research.aimultiple.com/open-source-embedding-models/)
- [Best Embedding Models Benchmarked](https://supermemory.ai/blog/best-open-source-embedding-models-benchmarked-and-ranked/)
