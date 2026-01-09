---
title: "Context Engineering for AI Agents with LangChain and Manus"
type: youtube
url: "https://www.youtube.com/watch?v=6_BcCthVvb8"
tags:
  - context-engineering
  - ai-agents
  - llm
  - architecture
authors:
  - langchain
summary: "Context engineering—filling the context window with the right information at each step—determines agent performance more than model choice or complex frameworks."
date: 2026-01-06
---

A deep-dive webinar featuring Lance Martin from LangChain and Yichao "Peak" Ji (MIT Innovators Under 35) from Manus, sharing battle-tested strategies for managing context windows in production agents.

## Core Definition

Context engineering is "the art and science of filling the context window with just the right information at each step of an agent's trajectory." This is the number one job of AI Engineers—not prompt engineering, not framework selection.

## The Four Patterns

Context management breaks into four operations:

1. **Writing context** — Save information outside the context window (files, databases, memory systems)
2. **Selecting context** — Pull relevant information into the context window when needed
3. **Compressing context** — Retain only the tokens required; discard or compact stale information
4. **Isolating context** — Split context across sub-agents to help each perform focused tasks

## Manus Production Insights

Manus operates at scale with demanding metrics:

- **100:1 input-to-output token ratio** — Most tokens consumed are context, not generation
- **50 tool calls per task** — Average task requires extensive tool interaction
- **Context compaction** — Older tool results get swapped for compact summaries while preserving the ability to fetch full results

Their multi-agent architecture isolates context deliberately:

- **Planner** — Assigns tasks and maintains high-level strategy
- **Knowledge Manager** — Reviews conversations, decides what persists to filesystem
- **Executor** — Performs tasks assigned by planner with focused context

## The Counterintuitive Insight

> "As models get stronger, we shouldn't be building more scaffolding, we should be getting out of the model's way."

Manus has been rewritten five times. In the last six months, their biggest performance gains came from removing things—not adding complex RAG pipelines or fancy routing logic. Deletion beats addition.

## Connections

- [[context-engineering-guide]] — MOC connecting context engineering strategies across tools and agents
- [[12-factor-agents]] — Factor 3 ("Own Your Context Window") provides complementary principles; the "small, focused agents" factor aligns with Manus's isolation strategy
- [[building-effective-agents]] — Anthropic's guide to composable patterns shares the anti-framework philosophy
- [[the-importance-of-agent-harness-in-2026]] — Philipp Schmid's analysis references this webinar's insights on Manus's five rewrites and the harness-as-OS metaphor
