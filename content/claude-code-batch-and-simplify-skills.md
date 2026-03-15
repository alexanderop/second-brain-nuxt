---
title: "Claude Code /batch and /simplify Skills"
type: note
tags:
  - claude-code
  - ai-agents
  - developer-experience
  - automation
  - workflow
authors:
  - alexander-opalic
summary: "How the /batch and /simplify Claude Code skills work — parallel work orchestration and automated code cleanup."
date: 2026-02-28
---

Claude Code ships with extensible skills (slash commands) that automate common workflows. Two that I use regularly are `/simplify` for post-edit cleanup and `/batch` for parallelizing large codebase-wide changes.

## /simplify — Automated Code Cleanup

`/simplify` runs an Opus-powered subagent that reviews recently changed code and autonomously improves it. It has full edit access and makes changes directly.

**What it does:**

- Scopes to files modified in the current session (unless told otherwise)
- Reduces unnecessary complexity, nesting, and redundancy
- Improves variable and function naming
- Follows project conventions from `CLAUDE.md`
- Preserves all functionality — changes _how_ code works, not _what_ it does

**Key rules it enforces:**

- No nested ternaries — prefers `if/else` or `switch`
- Clarity over brevity — won't compress code at the cost of readability
- No over-engineering — won't add abstractions for single-use patterns
- Removes obvious comments that describe self-evident code

The important thing: it never changes behavior. It only refactors the implementation while keeping inputs and outputs identical.

## /batch — Parallel Work Orchestration

`/batch` breaks a large change into independent units and farms them out to parallel agents, each working in an isolated git worktree. It runs in three phases.

### Phase 1: Research and Plan

The coordinator enters plan mode and launches Explore agents to understand the scope — all affected files, patterns, and call sites. It then:

1. **Decomposes** the work into 5–30 independent units, each mergeable on its own
2. **Determines an e2e test recipe** — how each worker verifies its change (browser automation, curl, test suite, etc.)
3. **Writes a plan** with numbered units, file lists, and worker instructions
4. **Presents for approval** before spawning any workers

### Phase 2: Spawn Workers

After approval, the coordinator launches one background agent per work unit — all in parallel, each in its own `isolation: "worktree"` (a separate git worktree).

Every worker's prompt is fully self-contained. After implementing its change, each worker automatically:

1. Runs `/simplify` on its changes
2. Runs unit tests and fixes failures
3. Follows the e2e test recipe
4. Commits, pushes, and creates a PR via `gh pr create`
5. Reports back with `PR: <url>`

### Phase 3: Track Progress

The coordinator maintains a status table tracking all units. As workers complete, it updates with PR links and pass/fail status. Final output is a summary like "22/24 units landed as PRs."

## How They Connect

`/batch` calls `/simplify` as a built-in step inside each worker. So every PR produced by a batch run has already been through the simplification pass. You can also run `/simplify` standalone after any manual editing session.

## When to Use Each

- **`/simplify`** — After writing or modifying code, as a quick cleanup pass
- **`/batch`** — For codebase-wide migrations, renames, pattern changes, or any task that touches many files independently
