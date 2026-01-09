---
title: "The Context Window Problem"
type: article
url: "https://factory.ai/news/context-window-problem"
tags:
  - llm
  - ai-agents
  - architecture
  - developer-experience
authors:
  - varin-nair
summary: "Frontier models cap out at 1-2 million tokens, yet enterprise codebases span several million. Factory's solution: a five-layer context stack that delivers the right information at the right time."
date: 2026-01-03
---

## The Problem

Enterprise repositories contain millions of tokens across thousands of files. Frontier models offer context windows of 1-2 million tokens at best. Larger windows won't save you: they degrade quality through uneven attention, cost more, and drown the model in irrelevant information.

## Seven Context Types Agents Need

Effective coding agents require more than just code files:

1. **Task descriptions** - concrete objectives
2. **Available tools** - system resources the agent can use
3. **Developer persona** - environment and preferences
4. **Code files** - the actual files being modified
5. **Semantic structure** - architectural patterns and business rules
6. **Historical context** - commits and documentation
7. **Collaborative context** - team standards and style guides

## Why Vector Search Falls Short

Naive RAG retrieval fails for code because it:

- Flattens hierarchical structure into undifferentiated chunks
- Struggles with multi-hop reasoning across interconnected systems
- Floods models with irrelevant files, degrading reasoning

## Factory's Context Stack

Five layers working together:

1. **Repository Overviews** - auto-generated architectural summaries
2. **Semantic Search** - code-tuned embeddings returning ranked candidates
3. **File System Commands** - targeted access with line-number specs
4. **Enterprise Integrations** - Sentry, Notion, and similar platforms
5. **Hierarchical Memory** - persistent user and org preferences

This connects to [[12-factor-agents]]'s Factor 3: "Own Your Context Window." Small, focused agents outperform monolithic ones because they stay within context limits. [[building-effective-agents]] makes the same point: composable patterns like prompt chaining exist specifically to work within these constraints.

The real insight echoes [[how-i-use-llms]]: context windows are working memory, and keeping them lean beats stuffing them full. Quality over quantity.

## See Also

- [[context-engineering-guide]] - techniques for providing optimized context to LLMs
