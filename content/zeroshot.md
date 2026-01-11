---
title: "Zeroshot"
type: github
url: "https://github.com/covibes/zeroshot"
stars: 0
language: "TypeScript"
tags:
  - ai-agents
  - claude-code
  - automation
  - developer-experience
authors:
  - covibes
summary: "Multi-agent validation prevents self-deception in autonomous coding—the validator didn't write the code, so it can't lie about tests."
date: 2026-01-11
---

## Overview

Zeroshot automates engineering tasks by pointing Claude Code at a GitHub issue and letting multiple isolated agents check each other's work. The key insight: a validator that didn't write the code has no stake in defending it.

## Key Features

- **Multi-agent validation** - Separate agents write and validate code, eliminating self-serving bias
- **Crash recovery** - `zeroshot resume` restores multi-hour tasks after interruptions
- **Daemon mode** - Run overnight batch processing with `-d` flag
- **GitHub integration** - Point directly at issues for end-to-end automation

## Code Snippets

### Installation

```bash
npm install -g @covibes/zeroshot
```

Requires Node 18+, Claude Code CLI, and GitHub CLI.

### Basic Usage

```bash
# Point at a GitHub issue
zeroshot run --issue 123

# Resume after crash
zeroshot resume

# Daemon mode for overnight runs
zeroshot run -d --issue 123
```

## When to Use Zeroshot

Zeroshot excels with well-defined tasks where you can describe what "done" looks like:

- **Known unknowns** (implementation unclear) - The planner figures it out
- **Clear acceptance criteria** - Validators can verify completion

For **unknown unknowns**, use single-agent Claude Code for exploration first, then return with a defined task.

## Connections

- [[ralph-wiggum-technique-guide]] - Zeroshot productionizes the Ralph loop concept, adding multi-agent validation to the simple bash loop pattern
- [[building-effective-agents]] - Implements the orchestrator-workers pattern from Anthropic's agent design guide
- [[12-factor-agents]] - Embodies factors like "small focused agents" and "own your control flow" through its multi-agent architecture
