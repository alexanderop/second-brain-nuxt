---
title: "Ralph Guide"
type: map
tags:
  - ralph
  - ai-agents
  - automation
  - context-engineering
summary: "The Ralph Wiggum technique: a bash loop that runs AI agents autonomously, resetting context each iteration to stay in the 'smart zone'"
date: 2026-01-11
---

Ralph ships code while you sleep. Created by [[authors/geoffrey-huntley|Geoffrey Huntley]], this technique runs AI coding agents in a loop—each iteration gets fresh context, implements one task, commits, and repeats. Results: $50K contracts completed for $297 in API costs, 6 repos shipped overnight, entire programming languages built autonomously.

## The Core Insight

Context windows are arrays. When you chat, you allocate to the array. When tools execute, they auto-allocate. The LLM slides a window over this array—**the less sliding required, the better the results**.

Ralph exploits this by resetting context between iterations. Each task gets the full "smart zone" instead of degrading as context fills.

```bash
while :; do cat PROMPT.md | claude --dangerously-skip-permissions; done
```

## Learning Path

Start here, progress downward:

1. [[ralph-wiggum-as-a-software-engineer]] - Geoffrey Huntley's original article introducing the technique
2. [[ralph-wiggum-loop-from-first-principles]] - First principles: context as arrays, deterministic allocation, the economics ($10.42/hour)
3. [[a-brief-history-of-ralph]] - Dex Horthy chronicles the evolution from fringe experiment to mainstream methodology

## Getting Started

- [[ralph-step-by-step-setup-guide]] - Ryan Carson's practical walkthrough with file structure and code snippets
- [[claude-code-ralph-loop-tutorial]] - Video tutorial for the Ralph Loop plugin

## Deep Dives

- [[ralph-wiggum-technique-guide]] - Comprehensive guide: two-agent architecture, security patterns, troubleshooting, context math
- [[stop-chatting-with-ai-start-loops-ralph-driven-development]] - Luke Parker's 5-phase methodology: planning, execution, verification backpressure

## Tools

- [[ralph]] - Ryan Carson's TypeScript implementation for Amp (GitHub)

## Pure Ralph vs Plugin Ralph

A critical distinction:

- [[ralph-wiggum-and-why-claude-codes-implementation-isnt-it]] - Why Anthropic's plugin differs: outer orchestrators reset context fully, inner plugins use lossy auto-compaction

## When NOT to Use

From [[ralph-wiggum-loop-honest-reviews|community discussion]]:

- Exploratory work without clear outcomes
- Major refactors without explicit acceptance criteria
- Security-critical code requiring human review
- Brownfield codebases with complex implicit requirements

Ralph works best for greenfield projects with auto-validatable success criteria.

## Alternative Approach

- [[12-factor-agents]] - HumanLayer's contrasting philosophy: deterministic workflows over "loop until solved" patterns

## Connections

- [[ai-agents-guide]] - Broader AI agent patterns
- [[claude-code-guide]] - Claude Code usage and best practices
- [[context-engineering-guide]] - The array-allocation mental model in depth
