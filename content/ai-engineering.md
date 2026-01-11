---
title: "AI Engineering"
type: book
url: "https://www.goodreads.com/book/show/216848047-ai-engineering"
cover: "https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1733340973i/216848047.jpg"
tags:
  - ai
  - llm
  - prompt-engineering
  - ai-agents
  - best-practices
authors:
  - chip-huyen
summary: "A practitioner's guide to building applications on foundation models, covering prompt engineering, RAG, finetuning, agents, and evaluation."
readingStatus: finished
finishedReading: 2025-01-01
rating: 10
date: 2026-01-04
---

## Core Framework

AI engineering is the process of building applications on top of foundation models. The field sits between traditional ML engineering and software engineering, requiring skills in prompt engineering, RAG, finetuning, and evaluation-driven development.

Three primary techniques for adapting models: prompt engineering (no weight updates), RAG (external knowledge retrieval), and finetuning (weight updates). Most applications combine these approaches.

## Key Concepts

### Foundation Model Fundamentals

- **Tokenization**: Breaking text into tokens the model processes. The vocabulary is the set of all tokens a model works with.
- **Masked vs autoregressive models**: Masked models predict tokens anywhere in sequence (good for classification); autoregressive models predict next tokens (good for generation).
- **Self-supervision**: Models infer labels from input data, overcoming the data labeling bottleneck.
- **Multimodal**: Models working with more than one data modality (text, images, audio).

### Post-Training and Alignment

Pre-training optimizes for text completion, not conversations. Post-training addresses this through demonstration data (how to converse) and preference data (what conversations to have).

Good labelers matter. Unlike traditional data labeling, post-training labeling requires domain expertise and understanding of nuanced responses.

### Prompting Fundamentals

- **System prompt**: Task description and constraints
- **User prompt**: The actual task
- Under the hood, both concatenate into a single prompt following a template

Context refers to information provided so the model can perform the task. Prompt decomposition breaks complex prompts into simpler components.

### Probabilistic Nature

Completions are predictions based on probabilities, not guaranteed correct answers. Ask the same question twice, get different answers. This makes LLMs both exciting and frustrating.

Hallucinations are a form of self-delusion: the model treats its own generated text as given fact, then expands on it.

### RAG (Retrieval-Augmented Generation)

The retrieve-then-generate pattern: retrieve relevant documents, then generate answers using that context. Even with long context windows, RAG remains valuable because:
- Some applications need context longer than any limit
- The amount of available data only grows

### Agents

Intelligent agents are the ultimate goal of AI. An agent with 95% accuracy per step drops to 60% accuracy over 10 steps, and 0.6% over 100 steps. Error compounds quickly.

Tools extend model capabilities. Instead of training models to calculate, give them a calculator. Multi-agent systems separate planning, validation, and execution.

### Data Quality

Data-centric AI focuses on improving data rather than models. A small amount of high-quality data outperforms large amounts of noisy data.

Quality dimensions: relevant, aligned with task requirements, and consistent. Application data is ideal because it matches real distribution.

High-quality code and math data boosts reasoning capabilities more than natural language text.

### Synthetic Data

Model distillation trains a smaller model to mimic a larger one. Risks include quality gaps, model collapse from training on AI-generated content, and obscured data lineage.

### Competitive Advantage

Three types: technology, data, and distribution. With foundation models commoditizing technology, distribution advantages favor big companies. Data becomes the differentiator.

### Observability

Monitoring tells you when something is wrong. Observability helps you figure out what went wrong without shipping new code.

Key metrics: MTTD (mean time to detection), MTTR (mean time to response), CFR (change failure rate).

Log everything: model configs, sampling settings, prompts, full inputs and outputs.

## Highlights

The law firm incident illustrates AI risks: lawyers submitted fictitious legal research to court using ChatGPT, unaware of hallucination tendencies. Air Canada paid damages when its chatbot gave passengers false information. A man committed suicide after chatbot encouragement.

Microsoft's Crawl-Walk-Run framework for AI automation: Crawl (human involvement mandatory), Walk (AI interacts with internal employees), Run (increased automation with direct AI interactions).

LinkedIn chose YAML over JSON for structured output because it's less verbose, requiring fewer tokens.

Evaluation-driven development: define evaluation criteria before building. The purpose of a metric is to tell you when something's wrong and identify improvement opportunities.

