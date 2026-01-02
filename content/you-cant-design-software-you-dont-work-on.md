---
title: "You Can't Design Software You Don't Work On"
type: article
url: "https://www.seangoedecke.com/you-cant-design-software-you-dont-work-on/"
tags:
  - software-design
  - architecture
  - best-practices
  - leadership
authors:
  - sean-goedecke
summary: "Effective software design requires hands-on codebase knowledge—architects who don't implement their designs lack accountability and produce solutions that ignore concrete system constraints."
date: 2026-01-02
---

## Core Argument

Concrete factors dominate generic factors. Developers working on a system understand its constraints, dependencies, and quirks in ways that theoretical design advice cannot capture. Books and blogs offer generic patterns, but real systems demand specific solutions shaped by their current state.

## Key Points

**Consistency beats perfection.** In established codebases, matching the existing style matters more than achieving textbook design. The system's interconnections constrain what's actually possible.

**Architects without skin in the game fail.** When architects design systems they won't implement, they can claim credit for successes while blaming teams for "execution failures." This accountability gap produces designs divorced from reality.

**Generic advice has narrow uses.** Theoretical guidance helps with greenfield projects, tie-breaking between acceptable options, and company-wide technology decisions. It fails when redesigning existing systems.

## When Design Knowledge Applies

| Context | Generic Design | Hands-On Knowledge |
|---------|----------------|-------------------|
| New project | ✓ Useful | Not yet available |
| Existing system | Limited value | ✓ Essential |
| Tech stack decisions | ✓ Useful | Less relevant |
| Implementation details | Insufficient | ✓ Required |

## Connections

This argument reinforces [[the-testing-pyramid-is-dead]]—there's no universal testing strategy because each project's architecture demands its own approach. Both reject one-size-fits-all solutions.

The accountability theme echoes [[extreme-ownership-jocko-willink-tedx]]: leaders (and architects) must own outcomes, not just designs.

Contrasts with [[building-effective-agents]], which provides generic patterns but acknowledges they require adaptation to specific codebases.
