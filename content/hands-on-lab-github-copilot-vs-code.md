---
title: "Hands-On Lab: The Power of GitHub Copilot in VS Code"
type: youtube
url: "https://www.youtube.com/watch?v=dxDqelvVc2U"
tags:
  - github-copilot
  - ai-tools
  - vs-code
  - context-engineering
authors:
  - visual-studio-code
summary: "Background agents, cloud agents, and plan mode unlock parallel AI workflows—but the real leverage comes from context engineering your instructions and using checklists to keep agents on track."
date: 2026-01-07
---

## Key Takeaways

- **Agents love checklists** - Adding step-by-step task lists to prompts dramatically improves completion rates
- **Keep instructions succinct** - Every token in copilot-instructions.md ships with every request; compress ruthlessly
- **Auto-generated instructions are drafts** - Always refine what Copilot generates; it's a starting point
- **Stricter linting catches agent sloppiness** - Agents add features well but forget to clean up; unused variable checks help
- **Plan mode surfaces assumptions** - Easier to iterate on a plan than on generated code with wrong assumptions baked in

## Three Agent Types

### Background Agents
Run in isolated git work trees. Changes don't conflict with your main branch until you merge them back with "keep and apply." You can spawn multiple background agents and continue working while they run.

### Cloud Agents
Run on GitHub's infrastructure and create PRs directly. Useful for tasks that don't need local context like updating documentation or README files.

### Custom Agents (Slash Commands)
Reusable prompts like `/setup` that automate common workflows. The lab's setup command runs npm install, linting, builds, and dev server automatically.

## Context Engineering Essentials

### Copilot Instructions File
A `.github/copilot-instructions.md` file provides persistent context to all chat interactions. Structure it as:
1. Product overview (what is this repo?)
2. Architecture map (where is what?)
3. Contribution rules (how to work here?)
4. Checklists (lint, build, test after changes)

### Domain-Specific Instructions
Layer additional instruction files for specific concerns:
- **Front-end design instructions** - Nudge AI out of "generic AI aesthetic" (purple gradients, overused fonts)
- **Framework-specific instructions** - For stacks outside training data (e.g., Tailwind v4 specifics)

## Plan Mode

Opens a deeper thinking process before implementation. The agent:
1. Researches the codebase using sub-agents
2. Surfaces assumptions and ambiguities as questions
3. Proposes a structured plan for review
4. Only implements after plan approval

Plan mode is especially valuable for broad, ambiguous requests where the agent might make wrong assumptions.

## Notable Quotes

> "Agents are good at adding new features but really bad at cleaning up after themselves."

> "The more we can optimize these tokens and compress them down and still keep the meaning, the better."

> "Anytime you have a larger code change with more ambiguity, plan mode pulls those assumptions out so you can see them."

## Connections

- [[context-engineering-guide-vscode]] - The official documentation this lab demonstrates. The copilot-instructions.md pattern and planning agents workflow come directly from this guide.
- [[beast-mode-3-1-vs-code-chat-agent]] - A custom chat mode addressing GPT-4.1's speed-over-thoroughness tendency. Uses the same checklist pattern emphasized in this lab.
