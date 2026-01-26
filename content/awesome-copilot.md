---
title: "Awesome Copilot"
type: github
url: "https://github.com/github/awesome-copilot"
stars: 18755
language: "JavaScript"
tags:
  - github-copilot
  - ai-coding
  - prompt-engineering
  - developer-workflow
authors:
  - github
summary: "GitHub's official collection of community-contributed customizations—agents, prompts, instructions, and skills—for extending Copilot's capabilities across domains and workflows."
date: 2026-01-24
---

## Overview

GitHub's official curated collection of Copilot customizations. The repository aggregates community contributions that extend Copilot beyond its defaults: specialized agents for specific workflows, task-specific prompts, coding standard instructions, and portable skill bundles.

The project ships an MCP Server for direct installation into VS Code, allowing users to browse and install customizations without leaving the editor.

## Key Features

- **Agents**: Specialized Copilot agents integrating with MCP servers for workflow-specific capabilities
- **Prompts**: Task-specific prompts accessed via `/` command in Copilot Chat
- **Instructions**: Pattern-based rules that auto-apply to matching files
- **Skills**: Self-contained folders bundling instructions with resources
- **Collections**: Curated sets combining prompts, instructions, agents, and skills by theme

## Code Snippets

### Installing via MCP Server

The repository provides Docker-based installation for direct editor integration:

```bash
# Clone and run the MCP server
docker run -p 3000:3000 ghcr.io/github/awesome-copilot-mcp
```

### Using a Prompt

```text
# In Copilot Chat
/awesome-copilot create-readme

# The prompt loads and guides README generation
```

### Skill Folder Structure

```text
skills/
└── my-custom-skill/
    ├── skill.md          # Triggers, workflow, instructions
    ├── templates/        # Optional: file templates
    └── scripts/          # Optional: automation scripts
```

## Repository Structure

```text
├── prompts/          # Task-specific chat prompts
├── instructions/     # File-pattern-based rules
├── agents/           # MCP-integrated specialized agents
├── collections/      # Themed bundles
├── scripts/          # Maintenance utilities
└── skills/           # Portable workflow folders
```

## Featured Collections

| Collection | Items | Purpose |
|------------|-------|---------|
| Awesome Copilot | 5 | Discovery and customization generation |
| Copilot SDK | 4 | Multi-language SDK implementation |
| Partners | 20+ | Custom agents from GitHub partners |

## Connections

- [[copilot-sdk]] - The underlying SDK this repository's agents build upon; use awesome-copilot for ready-made solutions, the SDK for custom implementations
- [[introducing-agent-skills-in-vs-code]] - Explains the Skills concept in depth; this repo provides a library of community-contributed skills
- [[prompt-files-in-vscode]] - The `.prompt.md` format that powers this repository's prompts collection
- [[moc-vscode-ai-coding]] - The broader map connecting all VS Code AI tooling notes
