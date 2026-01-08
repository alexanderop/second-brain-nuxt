---
title: "How AI Is Transforming Work at Anthropic"
type: article
url: "https://www.anthropic.com/research/how-ai-is-transforming-work-at-anthropic"
tags:
  - claude-code
  - ai-agents
  - productivity
  - developer-experience
  - ai-safety
authors:
  - anthropic
summary: "AI coding assistants boost productivity dramatically but create a supervision paradox: effectively overseeing AI requires the deep technical skills that may erode from overreliance."
date: 2025-12-02
---

## Summary

Anthropic surveyed 132 engineers and researchers, conducted 53 interviews, and analyzed 200,000 Claude Code transcripts to understand how AI reshapes internal work practices. The findings reveal a doubling of self-reported productivity alongside emerging concerns about skill atrophy, changing team dynamics, and career uncertainty.

## Key Findings

### Productivity Shifts

- Employees use Claude in **60% of daily work** (up from 28% a year prior)
- Self-reported **50% productivity boost** (compared to 20% previously)
- **27% of Claude-assisted work** consists of tasks that wouldn't have been done otherwise
- Most employees can only "fully delegate" **0-20%** of their work

### The Skill Paradox

Engineers report expanding capabilities into new domains while simultaneously losing deep expertise through reduced hands-on practice. Teams become more "full-stack," tackling work outside core expertise—but at what cost to mastery?

The supervision challenge: effective Claude oversight requires the technical skills that may erode from overreliance. As one engineer noted: "When producing output is so easy and fast, it gets harder and harder to actually take the time to learn something."

### Changing Work Dynamics

- Claude replaces colleagues as the "first stop" for routine questions
- Traditional mentorship interactions decrease
- Engineers increasingly see themselves as "managers of AI agents" rather than individual contributors
- **8.6% of tasks** address previously-neglected "papercut fixes"—quality-of-life improvements

### Usage Evolution (Feb → Aug 2025)

| Metric | February | August |
|--------|----------|--------|
| Task complexity (1-5) | 3.2 | 3.8 |
| Max consecutive autonomous actions | 9.8 | 21.2 |
| Human turns per task | 6.2 | 4.1 |
| Feature implementation share | 14.3% | 36.9% |

## Delegation Patterns

Engineers delegate tasks that are:
- **Easily verifiable** — can check correctness quickly
- **Low-stakes** — mistakes won't cause major damage
- **Outside their context** — unfamiliar codebases or languages
- **Repetitive** — tedious but well-defined

High-level design decisions remain firmly with humans.

## Connections

- [[self-improving-skills-in-claude-code]] — Describes the CLAUDE.md self-correction pattern referenced here, including the finding that 80-90% of Claude Code is now written by Claude Code itself
- [[claude-code-is-amazing-until-it-deletes-production]] — Explores the flip side of autonomous AI coding: without proper guardrails, the same productivity gains create catastrophic risks
