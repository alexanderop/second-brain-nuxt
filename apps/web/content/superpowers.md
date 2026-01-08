---
title: "Superpowers"
type: github
url: "https://github.com/obra/superpowers"
stars: 13391
language: "Shell"
tags:
  - claude-code
  - ai-agents
  - ai-tools
  - productivity
  - developer-experience
authors:
  - jesse-vincent
summary: "A skills library for Claude Code that provides structured workflows for AI-assisted development, including brainstorming, implementation planning, TDD, and debugging."
date: 2026-01-03
---

## What It Is

Superpowers is a composable skills library for Claude Code that turns ad-hoc AI coding into a structured development process. Instead of jumping straight into code, it guides agents through design refinement, planning, and verification at every step.

## Installation

```bash
/plugin marketplace add obra/superpowers-marketplace
/plugin install superpowers@superpowers-marketplace
```

Run `/help` to verify the new commands appear.

## Core Skills

**Development Process:**
- Brainstorming: refines requirements through targeted questions
- Implementation plans: breaks work into 2-5 minute tasks
- Subagent execution: coordinates parallel work streams
- TDD cycles: enforces RED-GREEN-REFACTOR discipline

**Supporting Tools:**
- Git worktree management for parallel branches
- Code review workflows
- Root-cause debugging with systematic analysis
- Skill creation for extending the system

## Philosophy

The project prioritizes test-driven development, process over improvisation, and verification over assumption. Every workflow includes quality checkpoints that catch issues before they compound.

## Connections

Relates to [[andrej-karpathy-were-summoning-ghosts-not-building-animals]] on thinking about AI agents as tools rather than autonomous entities. Also connects to [[the-age-of-the-generalist]] on how AI coding tools change the developer landscape.
