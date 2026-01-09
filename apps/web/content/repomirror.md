---
title: "RepoMirror"
type: github
url: "https://github.com/repomirrorhq/repomirror"
stars: 481
language: "TypeScript"
tags:
  - ai-agents
  - claude-code
  - automation
  - code-porting
authors:
  - repomirrorhq
summary: "Running Claude Code in headless loops can port entire codebases overnight—the key is simple prompts, one goal per iteration, and letting agents self-terminate when stuck."
date: 2026-01-06
---

## Overview

RepoMirror automates code porting by running Claude Code as a headless agent in continuous loops. Born from a YC Agents hackathon experiment, it successfully ported six codebases overnight with ~1,100 commits—costing roughly $800 total.

The core technique is disarmingly simple:

```bash
while :; do cat prompt.md | claude -p --dangerously-skip-permissions; done
```

## Key Features

- **Headless operation**: Runs Claude Code without human interaction
- **Self-managing agents**: Maintains a `.agent/` scratchpad for progress tracking
- **Commit-per-change**: Agent commits after each file modification
- **Self-termination**: Agents detect infinite loops and stop themselves

## Code Snippets

### Installation

```bash
npm install -g repomirror
```

### Initialize a Project

```bash
repomirror init --source ./react-lib --target ./vue-lib
```

This generates three files: a prompt spec, a sync script, and execution config.

### Run Continuously

```bash
repomirror sync-forever
```

For single iterations, use `repomirror sync` instead.

## Technical Details

The team discovered that simpler prompts outperform complex ones. A 103-word prompt beat a 1,500-word version—the longer prompt made the agent "slower and dumber."

**Emergent behaviors** surprised the team:
- Agents wrote tests without being asked
- Projects stayed focused without scope drift
- Agents self-terminated when detecting loops

**Economics**: Sonnet costs roughly $10.50/hour. Expect 90% completion—human refinement handles edge cases and specific demonstrations.

## Connections

- [[ralph-wiggum-technique-guide]] - RepoMirror implements the exact Ralph loop pattern, validating that bash loops scale to production porting tasks
- [[building-effective-agents]] - Demonstrates the "simplicity first" principle in practice—complex orchestration wasn't needed
