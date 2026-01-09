---
title: "Ralph: Step-by-Step Setup Guide"
type: article
url: "https://x.com/ryancarson/status/2008548371712135632"
tags:
  - ai-agents
  - claude-code
  - automation
  - agentic-coding
authors:
  - ryan-carson
  - geoffrey-huntley
summary: "Ralph ships code while you sleep—a bash loop that pipes prompts into your AI agent, picks tasks from a JSON backlog, runs tests, commits passing code, and repeats until done."
date: 2026-01-06
---

## Summary

Ryan Carson shares his practical experience with Ralph, the autonomous AI coding loop created by Geoffrey Huntley. The core insight: Ralph isn't sophisticated orchestration—it's a bash loop that feeds prompts to your agent, picks the next task, implements it, runs verification, commits if passing, and repeats.

## How Ralph Works

A bash loop that:

1. Pipes a prompt into your AI agent (Amp, Claude Code, etc.)
2. Agent picks the next story from `prd.json`
3. Agent implements it
4. Agent runs typecheck + tests
5. Agent commits if passing
6. Agent marks story done and logs learnings
7. Loop repeats until all stories pass

Memory persists only through git commits, `progress.txt` (learnings), and `prd.json` (task status). No server-side memory—the files are the memory.

## File Structure

```text
scripts/ralph/
├── ralph.sh      # The loop script
├── prompt.md     # Instructions for each iteration
├── prd.json      # Task list with priorities and status
└── progress.txt  # Accumulated learnings across sessions
```

## Code Snippets

### The Loop Script (`ralph.sh`)

```bash
#!/bin/bash
set -e

MAX_ITERATIONS=${1:-10}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Starting Ralph"

for i in $(seq 1 $MAX_ITERATIONS); do
  echo "═══ Iteration $i ═══"

  OUTPUT=$(cat "$SCRIPT_DIR/prompt.md" \
    | amp --dangerously-allow-all 2>&1 \
    | tee /dev/stderr) || true

  if echo "$OUTPUT" | grep -q "<promise>COMPLETE</promise>"; then
    echo "Done!"
    exit 0
  fi

  sleep 2
done

echo "Max iterations reached"
exit 1
```

For Claude Code, replace the amp line with:

```bash
claude --dangerously-skip-permissions
```

### Task List (`prd.json`)

```json
{
  "branchName": "ralph/feature",
  "userStories": [
    {
      "id": "US-001",
      "title": "Add login form",
      "acceptanceCriteria": [
        "Email/password fields",
        "Validates email format",
        "typecheck passes"
      ],
      "priority": 1,
      "passes": false,
      "notes": ""
    }
  ]
}
```

### Progress Log (`progress.txt`)

Start with codebase patterns at the top:

```markdown
# Ralph Progress Log
Started: 2026-01-06

## Codebase Patterns
- Migrations: IF NOT EXISTS
- Types: Export from actions.ts

## Key Files
- db/schema.ts
- app/auth/actions.ts
---
```

Ralph appends after each story. Patterns accumulate across iterations.

## Critical Success Factors

| Factor | Why It Matters |
|--------|----------------|
| **Small stories** | Must fit in one context window. "Add login form" not "Build auth system" |
| **Fast feedback** | `npm run typecheck` and `npm test` give Ralph signals about what's broken |
| **Explicit criteria** | "Email/password fields, validates email format, typecheck passes" not "Users can log in" |
| **Learnings compound** | By story 10, Ralph knows patterns from stories 1-9 via progress.txt |
| **AGENTS.md updates** | Document gotchas for future sessions and human developers |

## When NOT to Use

- Exploratory work without clear outcomes
- Major refactors without explicit criteria
- Security-critical code requiring human review
- Anything needing judgment calls

## Connections

- [[ralph-wiggum-technique-guide]] - Comprehensive guide covering context windows, security, and troubleshooting patterns
- [[a-brief-history-of-ralph]] - Dex Horthy's chronicle of Ralph's evolution from fringe experiment to mainstream methodology
- [[spec-driven-development-with-ai]] - GitHub's Spec Kit provides structured specs that feed well into Ralph's prd.json format
