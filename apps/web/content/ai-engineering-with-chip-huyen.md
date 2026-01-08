---
title: "AI Engineering with Chip Huyen"
type: podcast
url: "https://www.youtube.com/watch?v=98o_L3jlixw"
tags:
  - ai
  - llm
  - ai-agents
  - best-practices
authors:
  - gergely-orosz
  - chip-huyen
podcast: pragmatic-engineer-podcast
summary: "Chip Huyen explains how AI engineering differs from ML engineering, walking through the practical developmental path from prompts to RAG to fine-tuning."
date: 2026-01-04
---

## Key Takeaways

AI engineering flips the traditional ML workflow. ML engineers went from data to model to product. AI engineers start with a product demo, then gather data, then potentially build models. The barrier to entry dropped because you can now access powerful capabilities through API calls without needing your own training data or ML expertise.

The developmental path for most AI applications:

1. Understand what makes a good response (LinkedIn spent most time on this)
2. Write clear prompts with guidelines
3. Add examples to the prompt
4. Augment context with retrieval (RAG)
5. Fine-tuning as last resort

RAG doesn't mean jumping to vector databases. Start with keyword retrieval—BM25 is 20+ years old and still hard to beat. Vector embeddings can obscure exact keywords (like error codes). Hybrid search combining term-based and semantic retrieval often works best. Data preparation (chunking, metadata extraction, contextual summaries) provides bigger gains than database choice.

Fine-tuning brings a host of new problems: hosting, maintenance, and keeping up with rapidly improving base models. A fine-tuned model might be outperformed by a new release within weeks.

## AI Engineering vs ML Engineering

The key distinctions:

- **No training required**: Access capabilities via API instead of building models
- **No data required upfront**: Start with a working demo, gather data later
- **Product-first**: Demo → data → model (reversed from ML's data → model → product)
- **More engineering, less ML**: Focus shifts to product and data as competitive advantages

Most AI systems still contain traditional ML components: intent classifiers, routers, PII detectors, toxicity filters. These classifiers route requests and validate outputs.

## On Writing the Book

Chip researched over 1,000 papers and 800+ GitHub repositories. She found that fundamentals persist despite rapid change. Language modeling dates to Claude Shannon's 1950s work. Retrieval and vector databases existed before ChatGPT.

She made bets on what would last: prompt tips about "bribing" models are fading as models become robust. Context length is expanding fast, so she focused on context efficiency instead. Multimodality felt inevitable despite skeptics in 2023.

## References

Discusses concepts from [[ai-engineering]], Chip Huyen's book on building applications with foundation models.
