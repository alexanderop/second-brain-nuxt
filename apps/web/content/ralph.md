---
title: "Ralph"
type: github
url: "https://github.com/snarktank/ralph"
stars: 86
language: "TypeScript"
tags:
  - ai-agents
  - automation
  - amp
  - context-engineering
authors:
  - ryan-carson
summary: "Ralph solves the context window limitation by breaking work into independent iterations—each Amp session gets a fresh context, implements one story, and commits before the next iteration begins."
date: 2026-01-06
---

## Overview

Ralph implements the Ralph Wiggum technique for autonomous AI development using Amp. Rather than attempting massive one-shot implementations that exceed context limits, Ralph carves work into discrete chunks. Each iteration spawns a fresh Amp instance, picks the highest-priority incomplete story from a JSON spec, implements it, and commits—repeating until all requirements pass.

## Key Features

- **Iterative execution**: Fresh context per iteration keeps the agent in its "smart zone"
- **Persistent memory**: Context survives across sessions through git history, `progress.txt`, and `prd.json` status tracking
- **Quality gates**: Automated typechecking, tests, and browser verification ensure code quality compounds
- **Knowledge accumulation**: Updates `AGENTS.md` with discovered patterns for subsequent iterations

## Code Snippets

### Installation

```bash
# Option 1: Copy to your project
cp ralph.sh prompt.md scripts/

# Option 2: Install as global Amp skill
cp -r . ~/.config/amp/skills/ralph
```

### Basic Usage

```bash
# Run the loop with a PRD
./ralph.sh
```

### The Core Loop

```bash
#!/bin/bash
# Simplified version of the loop logic

while true; do
  # Read PRD, find incomplete story
  story=$(jq -r '.stories[] | select(.status != "done") | .id' prd.json | head -1)

  if [ -z "$story" ]; then
    echo "All stories complete"
    exit 0
  fi

  # Run Amp on single story
  amp -p "Implement story $story from @prd.json. Run tests. Commit when done."

  # Update status
  jq ".stories[$story].status = \"done\"" prd.json > tmp && mv tmp prd.json
done
```

## Technical Details

Ralph uses a bash-based orchestration layer that:

1. Selects incomplete stories from `prd.json`
2. Spawns Amp with clean context for each story
3. Runs quality checks (typecheck, tests, browser verification)
4. Commits successful changes with descriptive messages
5. Updates PRD status and progress log
6. Repeats until all requirements pass or iteration limit reached

The key insight: context windows are arrays. The less the sliding window needs to slide, the better the results. By resetting context between iterations, each task gets the full "smart zone" of the context window.

## Connections

- [[ralph-wiggum-technique-guide]] - Comprehensive implementation guide covering the underlying technique Ralph implements
- [[a-brief-history-of-ralph]] - Chronicles how this methodology evolved from fringe experiment to mainstream approach
- [[12-factor-agents]] - HumanLayer's complementary framework for deterministic agent workflows
