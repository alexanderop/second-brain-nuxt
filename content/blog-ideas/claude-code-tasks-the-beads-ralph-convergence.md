---
title: "Claude Code Tasks: The Beads-Ralph Convergence"
status: idea
tags:
  - claude-code
  - ai-agents
  - context-engineering
  - automation
authors:
  - alexander-opalic
core_idea: "Claude Code's task system merges Beads' file-based memory with Ralph's fresh-context philosophy, unlocking truly parallel AI coding at scale."
target_audience: "Developers using AI coding assistants who want to tackle bigger projects"
created: 2026-01-24
updated: 2026-01-24
---

## Core Idea

The upgrade from todos to tasks in Claude Code isn't an incremental improvement. It's a convergence of two powerful patterns that changes how AI coding works.

## The Convergence

For months, we've had two separate innovations:

**Beads** gave us file-based memory. Tasks persisted to disk. Dependency graphs. State that survives sessions. The agent finally had a brain outside the context window.

**Ralph** gave us isolated execution. Each task gets a fresh context window. No pollution. The agent stays in its "smart zone" instead of degrading as context fills up.

Claude Code's new task system merges both.

## What This Actually Means

Tasks now live in `.claude/tasks/` as JSON files. Every sub-agent reads from and writes to the same task list. Dependencies are tracked—`blocks` and `blockedBy` create execution waves.

Here's the magic: when you spawn a sub-agent for a task, it gets its own context window. Fresh. Clean. Focused solely on that task. Meanwhile, the main session orchestrates, receiving completion signals without inheriting the baggage.

In practice: running tasks in sub-agents consumed 18% of context versus 56% when running everything in the main session.

## Ralph Without the Bash Script

This is essentially Ralph integrated natively. You get:

- Fresh context per task (the core Ralph insight)
- Persistent task state across sessions (the Beads pattern)
- Dependency-aware parallelism (neither had this well)
- A coordinator that doesn't lose its mind

The difference from standalone Ralph: you keep an orchestrator in the loop. Someone's watching. The main session stays lean while heavy lifting happens in isolated workers.

## Why This Changes AI Coding

Before: one session, one context, everything fighting for space.

Now: parallel workers with their own contexts, synchronized through files, coordinated by an orchestrator that only tracks status.

This is how humans work. Projects get broken into tasks. People work in parallel. Handoffs happen. Dependencies block progress until resolved.

Claude Code finally mirrors this. And that's not an iteration—it's a paradigm shift.

## Source Notes

- [[claude-codes-new-task-system-explained]] - Ray's breakdown of the architecture
- [[beads]] - The original file-based task persistence pattern
- [[ralph-wiggum-loop-from-first-principles]] - The fresh-context-per-task philosophy
- [[a-brief-history-of-ralph]] - How isolated loops became mainstream

## Draft Sections

*None yet*

## Open Questions

- Should I benchmark different task counts to show the context savings?
- Worth showing a real multi-agent session with shared task list?
