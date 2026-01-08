---
title: "Beast Mode 3.1: AI-Powered VS Code Chat Agent"
type: article
url: "https://burkeholland.github.io/posts/beast-mode-3-1/"
tags:
  - ai-tools
  - vs-code
  - prompt-engineering
  - developer-experience
authors:
  - burke-holland
summary: "A custom VS Code chat mode that fixes GPT-4.1's tendency toward speed over thoroughness using todo lists, sequential thinking prompts, and forced web research."
date: 2025-07-23
---

## The Problem

GPT-4.1 has two critical weaknesses in its default coding behavior:

1. **Lack of agency** - The model discusses actions without executing them
2. **Lack of accuracy** - It works too quickly, skipping crucial thinking steps

## The Solution

Beast Mode is a carefully engineered system prompt that addresses these issues through:

- **Todo lists** - Forces continuous status updates, improving task completion
- **Sequential thinking prompts** - Questions like "What are the edge cases?" encourage deeper analysis
- **Web research requirements** - Leverages VS Code's `fetch` tool to gather current documentation

## Key Features in v3.1

### Memory System

Users can instruct the model to remember project-specific rules, saved to `.github/instructions/memory.instructions.md`. Similar to ChatGPT's memory feature but scoped to projects.

### File Management

Reduces redundant file reading by providing explicit guidance on when re-reading is necessary.

### Git Control

Prevents autonomous staging/committing without explicit user instruction—a safety guardrail against unwanted changes.

## Installation

Retrieve the prompt from Holland's GitHub gist, then create a custom chat mode in VS Code's agent dropdown. Select "User Data Folder" for global access across projects.

## Connections

- [[opus-4-5-is-going-to-change-everything]] - Same author's broader thesis on AI coding. Beast Mode represents the practical tooling that enables the AI-first workflow he advocates.
- [[writing-a-good-claude-md]] - Both address the same challenge: crafting effective instruction files for AI coding agents. Beast Mode's memory system mirrors CLAUDE.md's role as persistent project context.
- [[context-engineering-guide-vscode]] - Microsoft's official guide to VS Code context engineering. Beast Mode's `.github/instructions/` approach aligns with the `.github/copilot-instructions.md` pattern described here.
