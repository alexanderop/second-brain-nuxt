---
title: "No Server, No Database: Smarter Related Posts in Astro with transformers.js"
type: article
url: "https://alexop.dev/posts/semantic-related-posts-astro-transformersjs/"
tags:
  - programming
  - typescript
  - ai
  - astro
  - embeddings
authors:
  - alexander-opalic
summary: "Embeddings capture semantic meaning better than tags—run Hugging Face models in JavaScript with transformers.js to generate truly related post suggestions without any backend infrastructure."
date: 2025-05-18
---

## Summary

Tag-based related posts fail because they match labels, not meaning. Embeddings solve this by converting text into numeric vectors that represent semantic content. Two posts become related when their vectors point in similar directions, not when their tags happen to overlap.

This article walks through implementing semantic recommendations for a static Astro blog using transformers.js—Hugging Face models running directly in Node.js without Python or external servers.

## Key Concepts

- **Embeddings over tags**: Tags categorize; embeddings understand. A post about "JavaScript performance" relates to "optimizing React renders" even without shared tags
- **Cosine similarity**: Measures the angle between vectors, ignoring length. Two conceptually similar posts score close to 1.0 regardless of word count
- **transformers.js**: Runs Hugging Face models in JavaScript environments. No Python dependencies, no API calls, no server required

## Pipeline

::mermaid
<pre>
flowchart LR
    A[Markdown Files] --> B[Strip Formatting]
    B --> C[Generate Embeddings]
    C --> D[Calculate Similarity]
    D --> E[Top 5 Related]
    E --> F[similarities.json]
    F --> G[Astro Component]
</pre>
::

## Code Snippets

### Loading the Model

The embedding model runs entirely in JavaScript.

```typescript
import { pipeline } from "@xenova/transformers";

const embedder = await pipeline(
  "feature-extraction",
  "Snowflake/snowflake-arctic-embed-m-v2.0"
);
```

### Calculating Similarity

Normalize vectors and compute dot product for cosine similarity.

```typescript
function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.hypot(...a);
  const magB = Math.hypot(...b);
  return dot / (magA * magB);
}
```

## Connections

- [[how-to-implement-a-cosine-similarity-function-in-typescript-for-vector-comparison]] - Same author; provides the mathematical foundation that powers this implementation
