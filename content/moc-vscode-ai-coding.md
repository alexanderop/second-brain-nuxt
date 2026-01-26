---
title: "VS Code AI Coding"
type: map
tags:
  - vs-code
  - ai-coding
  - github-copilot
  - developer-experience
summary: "A collection of notes on AI-assisted coding in VS Code, covering GitHub Copilot, Agent Skills, context engineering, and development environments."
date: 2026-01-17
---

## Overview

VS Code has become a hub for AI-assisted coding. This map covers the ecosystem: from GitHub Copilot's core features to advanced techniques like agent skills and context engineering.

## Context Engineering

Understanding how to feed the right information to AI coding assistants.

- [[context-engineering-guide-vscode]] - Microsoft's official guide to custom instructions, planning agents, and structured workflows
- [[prompt-files-in-vscode]] - Reusable, on-demand prompt workflows with .prompt.md files for task-specific AI interactions
- [[beast-mode-3-1-vs-code-chat-agent]] - A custom chat mode that fixes GPT-4.1's speed-over-thoroughness tendency using todo lists and sequential thinking

## Agents

Understanding VS Code's agent architecture and capabilities.

- [[using-agents-in-vscode]] - Four agent types (local, background, cloud, third-party) with unified session management
- [[mastering-subagents-in-vs-code-copilot]] - Using #runSubagent for isolated, autonomous task execution in Git worktrees
- [[introducing-agent-skills-in-vs-code]] - The Agent Skills open standard: portable workflows that load on demand
- [[nuxt-skills]] - Practical implementation of skills for Nuxt development

## Development Environments

Isolated, reproducible environments for safe AI agent execution.

- [[run-your-ai-coding-agent-in-containers]] - Dev containers for sandboxed AI agent execution with Docker and Codespaces

## Building & Extending

SDKs and tools for building your own AI coding experiences.

- [[copilot-sdk]] - GitHub's official SDK for embedding Copilot into applications via JSON-RPC
- [[build-and-deploy-a-cursor-clone]] - Building a Cursor-like editor from scratch with Next.js

## Connections

- [[context-engineering-guide]] - Broader context engineering principles beyond VS Code
- [[writing-a-good-claude-md]] - Same concepts applied to Claude Code instruction files
