---
title: "Ask HN: How Are You Doing RAG Locally?"
type: article
url: "https://news.ycombinator.com/item?id=46616529"
tags:
  - llm
  - search
  - developer-experience
authors:
  - hacker-news-community
summary: "Simple retrieval often outperforms complex vector infrastructure—BM25, SQLite FTS5, and grep handle most local RAG use cases better than dedicated vector databases."
date: 2026-01-18
---

## Summary

A Hacker News discussion reveals that practitioners building local RAG systems favor lightweight solutions over complex vector database infrastructure. The consensus: start simple, and infrastructure complexity should match actual needs rather than following hype.

## Key Approaches

**Keyword-first retrieval:**
- SQLite with FTS5 for full-text search
- BM25 for keyword ranking
- Trigram indexing for fuzzy matching

**Vector databases (when needed):**
- sqlite-vec and pgvector for embedded solutions
- Qdrant and LanceDB for standalone vector stores
- Smaller embedding models like `mxbai-embed-large` work well on CPU

**Hybrid search:**
- Combine BM25 keyword search with semantic embeddings
- Postgres, DuckDB, or dedicated tools handle both
- Reciprocal Rank Fusion to merge result sets

**Agentic retrieval:**
- Give the LLM tools like ripgrep and LSP integration
- Let the model decide what to search for
- Works especially well for code search

## Notable Observations

- **Vector search underperforms for code**: BM25 and trigram indexing often beat embeddings when searching codebases
- **Grep suffices surprisingly often**: Many respondents report that basic text search handles their use cases
- **Chunk size matters more than embedding model**: Poor chunking undermines any retrieval strategy
- **Reranking adds significant value**: A cheap first-pass retrieval followed by expensive reranking works better than expensive retrieval alone
