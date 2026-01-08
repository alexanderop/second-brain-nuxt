---
title: "AI-Powered Search"
type: book
url: "https://www.goodreads.com/book/show/50311847-ai-powered-search"
cover: "https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1578305810i/50311847.jpg"
tags:
  - llm
  - ai
  - search
  - rag
authors:
  - trey-grainger
  - doug-turnbull
  - max-irwin
summary: "The holy grail for AI-powered search lies at the intersection of semantic search, personalized search, and domain-aware recommendations—systems that understand the domain, the user, and can match arbitrary queries to any content."
readingStatus: finished
finishedReading: 2025-12-31
rating: 6
date: 2026-01-04
---

## Core Framework

Search engines do three things: ingest content (indexing), return matching content (matching), and sort results by relevance (ranking). The book builds systems that excel at all three through AI.

The holy grail sits at the intersection of three capabilities:

1. **Semantic search** — When keyword search overlaps with knowledge graphs, you get domain-specific understanding
2. **Personalized search** — When keyword search overlaps with recommendations, results adapt to each user
3. **Domain-aware recommendations** — Understanding entities, terminology, and relationships specific to your corpus

A search engine is one of the most cross-functional systems in software engineering. Due to Conway's law, recommendation teams (data scientists) and search teams (engineers) often operate separately, missing opportunities to combine their strengths.

## Key Concepts

- **Reflected intelligence**: Users issue queries, see results, take actions. Those signals get processed into learned models that improve future searches. The system learns from its own users.
- **Unstructured data paradox**: Text isn't actually unstructured—it's "hyper-structured." Documents contain a giant graph of fuzzy foreign keys and entity relationships packed into flexible formats.
- **Distributional hypothesis**: Words in similar contexts share similar meanings. "You shall know a word by the company it keeps."
- **Sparse vs dense retrieval**: Inverted indexes map terms to document lists (sparse). Embeddings encode meaning into vectors where similar concepts cluster together (dense). Both matter.
- **Bi-encoders vs cross-encoders**: Bi-encoders generate separate embeddings for queries and documents—fast but less accurate. Cross-encoders pass both together through attention—slower but catches nuances like "mountain hike" vs "beginner snow hiking."

## RAG and Question Answering

Generative AI relies on search for retrieval augmented generation (RAG)—finding relevant context so models generate accurate responses. The book distinguishes:

- **Extractive QA**: Finds and returns relevant passages from documents
- **Abstractive QA**: Synthesizes a new response by interpreting multiple sources

## Performance Optimization

Dense vector search gets expensive at scale. The book covers optimization techniques:

- **ANN search**: Like an inverted index for vectors—filters to likely candidates before expensive similarity calculations
- **Quantization**: Trade small recall loss for major storage and speed gains (scalar, binary)
- **Chunking**: Break documents into overlapping sections so splits don't destroy context
- **Reranking**: Use fast bi-encoders for initial retrieval, accurate cross-encoders for top-N refinement
