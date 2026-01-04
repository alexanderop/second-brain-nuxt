---
title: "Local First: the secret master plan"
type: talk
url: "https://www.youtube.com/watch?v=9s8OA08ggbM"
conference: "Local-First Conf 2024"
tags:
  - local-first
  - malleable-software
  - version-control
  - tools-for-thought
authors:
  - peter-van-hardenberg
summary: "Ink & Switch's three-part vision: local-first software enables universal version control, which enables malleable software where users customize their tools without waiting for developers."
date: 2026-01-04
---

## Overview

Peter van Hardenberg reveals Ink & Switch's research agenda as a three-part "secret master plan": local-first software enables universal version control (for everyone, not just developers), which in turn enables malleable software where users can customize and extend their tools.

## Key Arguments

### Universal Version Control

Version control shouldn't require Git expertise. Writers want creative privacy before sharing drafts with editors. Designers spatialize their version history across artboards. Journalists copy documents to shadow IT systems just to work privately. The industry has hoarded these tools for developers while giving everyone else Google Docs—where your thesis supervisor can pop in uninvited mid-edit.

Automerge, their CRDT implementation, captures every change intrinsically. This enables branching and merging for any document type, not just plain text. The same infrastructure that syncs changes between computers can move them between document versions.

### Patchwork: Version Control for Everyone

Their prototype editor Patchwork demonstrates the vision:

- Branch a document for private editing with automatic change tracking
- Toggle change highlighting on or off as needed
- Send branches for review with inline comments
- Merge approved changes back to main

The same capabilities extend to diagrams (via TLDraw) and spreadsheets—developers only implement highlighting, not the entire version infrastructure.

### Formality on Demand

Early-stage work needs minimal friction; late-stage work needs formal review. Patchwork supports the full spectrum without forcing either. Informal editing feels like any other editor; formal review surfaces when needed.

### AI Collaboration as Version Control

LLM collaboration is fundamentally a version control problem. An AI can wreck your document in 16 seconds flat. Version control primitives—branches, diffs, review, revert—become essential for AI collaboration, not just offline sync.

### Malleable Software

Apps silo data and interoperate only when vendors cut business deals. A well-appointed woodworking shop or kitchen lets craftspeople build anything with general-purpose tools. Software should work the same way.

Patchwork is extensible: tools are React components that receive an Automerge document. Anyone can write a new tool in Cursor, push it with their CLI, and install it—affecting only their instance. No permission needed. Share tools like any other document.

Examples from their field trials:
- A word-count-by-section tool written in an afternoon
- A zoomed-out essay visualization taking a few hours
- Many experimental failures that simply fall away without codebase refactoring

## Notable Quotes

> "Your scientists were so preoccupied with whether they could do it. They didn't stop to think if they should."
> — Dr. Ian Malcolm (on sync engines that only converge, ignoring the creative need for divergence)

> "Version control should be a platform feature."

## Practical Takeaways

- Design sync engines for divergence and experimentation, not just convergence
- Version control primitives become critical for AI collaboration
- "Formality on demand" lets systems serve both casual and rigorous workflows
- Tools as plugins (not monolithic apps) restore user agency
- Small, personal tools that serve 200 people still matter

## References

Builds on [[local-first-software]], the foundational essay van Hardenberg co-authored. Companion talk to [[the-past-present-and-future-of-local-first]] by Martin Kleppmann at the same conference. The malleable software vision is detailed in [[malleable-software]].
