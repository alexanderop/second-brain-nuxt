---
title: "I'm Boris and I Created Claude Code"
type: article
url: "https://x.com/bcherny/status/2017742741636321619"
tags:
  - claude-code
  - ai-agents
  - productivity
  - context-engineering
  - developer-experience
authors:
  - boris-cherny
summary: "Productivity with Claude Code comes from parallel worktrees, plan-first workflows, self-evolving CLAUDE.md files, and skills—multiply your throughput by running more concurrent sessions."
date: 2026-01-31
---

## Summary

Boris Cherny shares the Claude Code team's internal tips for maximizing productivity. The core insight: treat Claude sessions like parallel threads of execution. The more you run, the more you ship.

## Key Concepts

### Parallel Worktrees

The single biggest productivity unlock. Spin up 3-5 git worktrees, each running its own Claude session. Some engineers set up shell aliases (`za`, `zb`, `zc`) to hop between worktrees in one keystroke. A dedicated "analysis" worktree stays reserved for logs and BigQuery queries.

### Plan Mode for Complex Tasks

Start every non-trivial task in plan mode. Pour energy into the plan so Claude can one-shot the implementation. One team member has a second Claude review the plan as a staff engineer before execution.

The moment something goes sideways, switch back to plan mode and re-plan. Don't keep pushing through problems.

### Self-Improving CLAUDE.md

After every correction, end with: "Update your CLAUDE.md so you don't make that mistake again." Claude writes rules for itself with surprising accuracy.

Ruthlessly edit CLAUDE.md over time. Keep iterating until Claude's mistake rate measurably drops.

One engineer maintains a notes directory for every task/project, updated after every PR. CLAUDE.md points to it.

### Skills and Commands

If you do something more than once a day, turn it into a skill or command. Examples from the team:

- `/techdebt` — Run at the end of every session to find and kill duplicated code
- Slack/GDrive/Asana/GitHub sync command — Pull 7 days of activity into one context dump
- Analytics-engineer agents — Write dbt models, review code, test changes

### Subagents

Append "use subagents" to any request where you want Claude to throw more compute at the problem. This keeps your main agent's context window clean while offloading individual tasks.

### Terminal Setup

- Ghostty terminal for synchronized rendering and 24-bit color
- `/statusline` to always show context usage and current git branch
- Color-coded and named terminal tabs
- Voice dictation (fn × 2 on macOS) — you speak 3× faster than you type

### Bug Fixing Workflow

Enable the Slack MCP, paste a bug thread into Claude, and say "fix." Or point Claude at docker logs to troubleshoot distributed systems.

For CI failures: "Go fix the failing CI tests." Don't micromanage how.

### Prompting Techniques

- "Grill me on these changes and don't make a PR until I pass your test" — Make Claude your reviewer
- "Prove to me this works" — Have Claude diff behavior between main and feature branch
- "Knowing everything you know now, scrap this and implement the elegant solution" — Prompt after a mediocre fix

### Data and Analytics

Use Claude with the `bq` CLI for on-the-fly metrics queries. The Claude Code team has a BigQuery skill checked into the codebase. Boris hasn't written SQL in 6+ months.

### Learning Mode

- Enable "Explanatory" or "Learning" output style in `/config`
- Have Claude generate visual HTML presentations explaining unfamiliar code
- Ask for ASCII diagrams of protocols and codebases
- Build a spaced-repetition skill: explain your understanding, Claude asks follow-ups to fill gaps

## Connections

- [[boris-cherny-on-what-grew-his-career-and-building-at-anthropic]] — The full interview where Boris discusses his parallel sessions philosophy and Opus 4.5 reasoning
- [[thread-based-engineering-how-to-ship-like-boris-cherny]] — IndyDevDan's framework for thinking about parallel Claude sessions as "threads" of work
- [[self-improving-skills-in-claude-code]] — Deep dive into the CLAUDE.md self-improvement pattern Boris describes here
- [[claude-code-skills]] — How skills work under the hood for the custom commands Boris recommends building
