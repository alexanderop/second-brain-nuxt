---
title: "Claude Code Skills Don't Auto-Activate"
type: article
url: "https://scottspence.com/posts/claude-code-skills-dont-auto-activate"
tags:
  - claude-code
  - developer-experience
  - ai-tools
authors:
  - scott-spence
summary: "Claude Code skills fail to auto-activate despite documentation claims; hook-based workarounds achieve only 40-50% reliability, so manual invocation remains the practical choice."
date: 2026-01-02
---

## The Problem

Claude Code's documentation claims skills are "model-invoked" and autonomously activated. In practice, they consistently fail to engage without explicit intervention. Even when user requests match skill descriptions exactly, Claude ignores them.

## Attempted Workaround

Hook scripts can inject explicit instructions into prompts via `~/.claude/settings.json`. The key distinction:

- **Ineffective:** Gentle reminders like "Check skills"
- **Effective:** Direct commands like "Use Skill(research) to handle this request"

## Reality Check

Testing revealed only 40-50% reliability even with explicit hooks. The workaround is essentially unreliable. Manual skill invocation remains the practical choice when accuracy matters.
