---
title: "Writing a Good CLAUDE.md"
type: article
url: "https://www.humanlayer.dev/blog/writing-a-good-claude-md"
tags:
  - claude-code
  - ai-tools
  - developer-experience
  - productivity
  - llm
summary: "Guidelines for crafting an effective CLAUDE.md file, emphasizing brevity, universal applicability, and progressive disclosure to maximize Claude Code's instruction-following capacity."
notes: ""
date: 2026-01-01
---

## Key Insight

LLMs are stateless—they have no memory between sessions. `CLAUDE.md` is the primary file that enters every conversation, making it the highest leverage point for configuring Claude Code.

## Core Principles

### Less is More
Frontier LLMs can reliably follow 150-200 instructions. Claude Code's system prompt already contains ~50 instructions, leaving limited capacity for your custom file. Keep it under 300 lines (HumanLayer keeps theirs under 60).

### Universal Applicability
Since `CLAUDE.md` appears in every session, content should be broadly useful. Avoid task-specific instructions that distract from unrelated work.

### Progressive Disclosure
Store detailed instructions in separate markdown files and guide Claude to relevant documents as needed, rather than cramming everything into one file.

## What to Include

Cover the **WHY**, **WHAT**, and **HOW**:
- **Why**: Project purpose and context
- **What**: Technical stack and structure
- **How**: Development workflows and commands

## What to Avoid

- **Code style guidelines**: Use linters and formatters instead
- **Auto-generated content**: Don't use `/init`—this high-leverage file deserves careful manual crafting
- **Task-specific instructions**: Keep those in separate files

## Notable Quote

> "CLAUDE.md is the highest leverage point of the harness...you should spend some time thinking carefully about every line."
