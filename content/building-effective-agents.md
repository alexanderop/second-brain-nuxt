---
title: "Building Effective Agents"
type: article
url: "https://www.anthropic.com/engineering/building-effective-agents"
tags:
  - ai-agents
  - llm
  - best-practices
  - architecture
authors:
  - erik-schluntz
  - barry-zhang
summary: "Anthropic's guide to building agentic LLM systems, advocating for simple composable patterns over complex frameworks."
date: 2026-01-02
---

The most successful agent implementations use simple, composable patterns rather than complex frameworks. Success comes from building the right system for specific needs, not the most sophisticated one.

## Agentic Systems Taxonomy

The article distinguishes two categories:

- **Workflows**: LLMs and tools orchestrated through predefined code paths
- **Agents**: LLMs dynamically direct their own processes and tool usage

Start with workflows when possible. Move to agents only when you need flexibility at runtime.

## Workflow Patterns

Five composable patterns for orchestrating LLMs:

1. **Prompt Chaining** — Sequential decomposition with gates between steps. Each LLM call handles one focused task.

2. **Routing** — Classification directs tasks to specialized handlers. Good for separating distinct request types.

3. **Parallelization** — Run multiple LLM calls concurrently. Use "sectioning" to split work or "voting" for consensus.

4. **Orchestrator-Workers** — Central LLM delegates subtasks dynamically. Useful when work can't be predetermined.

5. **Evaluator-Optimizer** — Iterative refinement loops where one LLM generates and another critiques.

## Core Principles

Three principles guide effective agent design:

**Simplicity first.** Resist adding complexity. Each abstraction layer adds latency and failure modes.

**Transparency in planning.** Make the agent's reasoning visible. Users need to understand what it's doing and why.

**Agent-Computer Interface (ACI).** The interface between agent and tools matters as much as the UI between human and software. Invest in clear documentation, error messages, and tool design.

## The Building Block

Every agentic system builds on the **augmented LLM**: a language model enhanced with retrieval, tools, and memory. Get this foundation right before adding orchestration.

## Connections

Extends the design patterns covered in [[agentic-design-patterns]]. Complements [[build-autonomous-agents-using-prompt-chaining-with-ai-primitives]] with Anthropic's production insights. See [[12-factor-agents]] for operational best practices.
