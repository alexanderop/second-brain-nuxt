---
title: "Advanced Context Engineering for Coding Agents"
type: github
url: "https://github.com/humanlayer/advanced-context-engineering-for-coding-agents"
stars: 1216
language: "Markdown"
tags:
  - context-engineering
  - ai-agents
  - llm
  - best-practices
authors:
  - humanlayer-team
summary: "Systematic context management—through frequent intentional compaction and a Research-Plan-Implement workflow—enables productive AI-assisted development in complex production codebases."
date: 2026-01-06
---

## Overview

Contemporary AI models struggle with large, complex codebases. Stanford research found that AI tools often generate redundant code requiring rework—performing worse than traditional development in established codebases. This guide argues the problem isn't model capability but context management.

The core thesis: strategic context engineering, termed "frequent intentional compaction," enables productive AI-assisted development without sacrificing code quality. The only lever affecting output quality is input quality—keep context utilization in the 40-60% range.

## Key Features

- Research-Plan-Implement workflow for complex codebases
- Context compaction techniques for maintaining model performance
- Subagent delegation patterns for isolated context-intensive tasks
- Real-world case studies with measurable outcomes

## The Research-Plan-Implement Workflow

Three phases keep the agent in the "smart zone":

1. **Research**: Understand codebase architecture and problem scope. Output: compressed document of what matters.
2. **Plan**: Outline precise steps with file names, line snippets, verification procedures. A good plan makes even simple models succeed.
3. **Implement**: Execute the plan in phases with continuous status compaction.

## Context Management Principles

The optimization hierarchy:

1. **Correctness** — Eliminate false information
2. **Completeness** — Include necessary details
3. **Size** — Minimize token consumption

Compaction techniques include intentional distillation of search results, subagent delegation for focused tasks, and frequent markdown documentation of progress.

## Case Studies

**BAML Bug Fix (300k LOC Rust)**
Single developer unfamiliar with the codebase achieved one-shot PR approval within 24 hours—demonstrating feasibility in unfamiliar domains.

**Cancellation & WASM Support (35k LOC)**
Two engineers, 7 hours total effort. Estimated at 3-5 days for senior engineers. Shows scalability on complex features.

**The Failure Case**
Parquet-Java dependency removal attempt highlighted boundaries: insufficient codebase expertise and incomplete dependency analysis defeated the workflow. Single-domain specialists remain necessary for some problems.

## Human Leverage

> "A flawed specification cascades through hundreds of lines; flawed research generates thousands of bad lines."

Code review focus shifts from implementation inspection to specification/plan validation—capturing errors at highest-leverage points. When AI ships 2-3x more code, plans become the artifact for peer review.

## Connections

- [[no-vibes-allowed-solving-hard-problems-in-complex-codebases]] - The talk version of this guide by Dex Horthy, with the same Research-Plan-Implement framework
- [[12-factor-agents]] - Same author's principles for building context-aware production agents
- [[context-engineering-guide]] - The broader map connecting context engineering techniques across AI tools
