---
title: "How to Implement a Cosine Similarity Function in TypeScript for Vector Comparison"
type: article
url: "https://alexop.dev/posts/how-to-implement-a-cosine-similarity-function-in-typescript-for-vector-comparison/"
tags:
  - programming
  - typescript
  - ai
  - search
authors:
  - alexander-opalic
summary: "Cosine similarity measures the angle between two vectors—not their magnitude—making it the essential building block for semantic search, AI recommendations, and any application comparing text embeddings."
date: 2025-03-08
---

## Summary

Cosine similarity calculates how similar two vectors are by measuring the angle between them. Unlike Euclidean distance, it ignores magnitude and focuses on direction. This matters for AI applications where words and documents get converted into high-dimensional embeddings—you care about semantic similarity, not vector length.

## Key Concepts

- **Angle over magnitude**: Two documents about the same topic should score similarly even if one is twice as long
- **Similarity scale**: Results range from -1 (opposite) through 0 (unrelated) to 1 (identical direction)
- **Pre-compute embeddings**: Store vector representations ahead of time rather than computing per-request—vector databases like Pinecone or Qdrant handle this at scale

## Code Snippets

### Cosine Similarity Implementation

The complete function in TypeScript.

```typescript
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.hypot(...vecA);
  const magnitudeB = Math.hypot(...vecB);
  return dotProduct / (magnitudeA * magnitudeB);
}
```

The formula breaks into three parts: dot product (multiply corresponding elements and sum), magnitudes (length of each vector via Pythagorean theorem), and the final division that normalizes the result.

## Connections

- [[ai-powered-search]] - Explains dense vector retrieval, bi-encoders, and why similarity calculations matter at scale
- [[ai-engineering-with-chip-huyen]] - Covers the RAG pipeline where cosine similarity powers semantic retrieval
