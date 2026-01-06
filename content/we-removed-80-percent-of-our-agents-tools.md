---
title: "We Removed 80% of Our Agent's Tools"
type: article
url: "https://vercel.com/blog/we-removed-80-percent-of-our-agents-tools"
tags:
  - ai-agents
  - llm
  - simplicity
  - architecture
authors:
  - andrew-qu
summary: "Stripping a text-to-SQL agent down to a single bash tool produced a 3.5x speedup, 100% success rate, and 37% fewer tokens—proving that simpler agent architectures outperform elaborate tooling."
date: 2025-12-22
---

## The Problem

Vercel built a sophisticated text-to-SQL agent with specialized tools: schema lookups, query validators, error recovery mechanisms, and dimensional attribute retrievers. Each edge case demanded another tool. Maintenance grew unbearable as models updated.

## The Solution

They stripped the system to a single capability: bash execution. The agent now uses `grep`, `cat`, `find`, and `ls` to navigate a well-documented semantic layer (YAML and JSON files containing dimension definitions and join relationships).

## Results

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Execution time | 274.8s | 77.4s | 3.5x faster |
| Success rate | 80% | 100% | +20pp |
| Token usage | ~102k | ~61k | 37% fewer |
| Processing steps | ~12 | ~7 | 42% fewer |

## Technical Stack

- **Model**: Claude Opus 4.5 via AI SDK
- **Execution**: Vercel Sandbox
- **Infrastructure**: Next.js API route with Slack integration
- **Data**: Cube semantic layer as structured files

## Key Lessons

**Trust the model's reasoning.** Advanced models perform better when decision-making isn't artificially constrained by custom retrieval logic.

**Quality foundations matter.** Success depends on well-structured, documented data—not clever tooling. The semantic layer already contained everything the agent needed.

**Build for emerging models.** Design architectures that let you delete yesterday's assumptions. The winning strategy is subtraction, not addition.

> "Don't fight gravity." Unix tools remain powerful abstractions.

## Connections

- [[context-engineering-for-ai-agents-with-langchain-and-manus]] - Manus discovered the same counterintuitive insight: "As models get stronger, we should be getting out of the model's way." Both teams found that removing scaffolding beats adding it.
- [[building-effective-agents]] - Anthropic's "simplicity first" principle in action. Vercel's stripped-down agent exemplifies resisting complexity and letting the foundation (well-documented files) do the work.
- [[the-importance-of-agent-harness-in-2026]] - Validates the "design for deletion" strategy. Manus rewrote their harness five times; Vercel deleted 80% of their tools. Lightweight beats elaborate.
