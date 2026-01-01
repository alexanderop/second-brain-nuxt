---
title: "Awesome list of Claude Code tips, tricks, gotchas"
type: reddit
url: "https://www.reddit.com/r/ClaudeCode/comments/1q193fr/awesome_list_of_claude_code_tips_tricks_gotchas/"
author: "u/Prize-Individual4729"
tags:
  - claude-code
  - developer-experience
  - agentic-workflows
  - productivity
summary: "A community-sourced collection of Claude Code tips covering skills-based workflows, spec-driven development, git worktrees, and autonomous coding sessions."
date: 2026-01-01
---

## Summary

A New Year's community thread collecting practical Claude Code tips. The OP shares a workflow emphasizing custom skills, spec-driven development, and git worktrees for parallel feature work.

## Key Tips from OP

- **Next prompt prediction as pseudo-memory** - Create custom skills for each workflow part; Claude Code predicts task-to-skill relationships via tab completion
- **Commit before worktrees** - Dirty changes don't clone to worktrees; commit first or sync after
- **Spec-driven > plan mode** - Create expectations → requirements → technical design → task breakdown to force deeper thinking
- **Autonomous mode + worktree + spec** - This combination enables 20-30 minute autonomous sessions that complete 90% of work
- **Keep context lean** - Avoid jamming context with MCPs; use `/context` command to monitor, prune skills regularly
- **Playwright e2e testing** - Build regression harness around key user journeys; use visual testing to avoid faked tests

## Workflow Pattern

> Create a skill workflow to constrain one feature slice level expectation → specifications → tasks breakdown. This will usually last 1-2 auto compact sessions.

The thread advocates for a structured approach: isolate work in git worktrees, drive implementation from specs rather than ad-hoc prompting, and let autonomous mode handle execution.

## Related

See also [[claude-code-best-practices]] and [[writing-a-good-claude-md]].
