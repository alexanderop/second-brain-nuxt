---
title: "Excalidraw MCP App"
type: github
url: "https://github.com/antonpk1/excalidraw-mcp-app"
stars: 413
language: "TypeScript"
tags:
  - mcp
  - excalidraw
  - diagramming
  - claude
  - ai-tools
authors:
  - anton-pidkuiko
summary: "An MCP server that gives Claude the ability to generate and render interactive Excalidraw diagrams directly in conversation, turning text prompts into hand-drawn visuals."
date: 2026-02-06
---

## Overview

Excalidraw MCP App bridges Claude and Excalidraw through the Model Context Protocol. Instead of describing a diagram in text and hoping the user can picture it, Claude generates an interactive hand-drawn diagram rendered inline. Users can pan, zoom, and expand diagrams into a fullscreen editor for further tweaking.

The project leverages the official MCP Apps extension to render HTML content inside Claude's interface, treating Excalidraw as a first-class output format alongside text and code.

## Key Features

- **Inline diagrams** — Claude streams Excalidraw visuals directly into the conversation
- **Viewport control** — smooth camera manipulation for navigating complex diagrams
- **Fullscreen editing** — expand any generated diagram into a full Excalidraw editor
- **Multiple install paths** — cloud-hosted connector, downloadable `.mcpb` bundle, or local build

## Code Snippets

### Cloud Setup (Easiest)

Add the connector in Claude settings:

```text
Settings → Connectors → Add custom connector
URL: https://excalidraw-mcp-app.vercel.app/mcp
```

### Local Installation

```bash
git clone https://github.com/antonpk1/excalidraw-mcp-app.git
cd excalidraw-mcp-app
npm install && npm run build
```

### Claude Desktop Config

```json
{
  "mcpServers": {
    "excalidraw": {
      "command": "node",
      "args": ["/path/to/excalidraw-mcp-app/dist/index.js", "--stdio"]
    }
  }
}
```

### Example Prompts

```text
"Draw a cute cat using excalidraw"
"Draw an architecture diagram showing a user connecting to an API server which talks to a database"
```

## Technical Details

Built with TypeScript (95% of the codebase), Vite for bundling, and deployed on Vercel. The architecture consists of a main entry point (`main.ts`), an MCP server implementation (`server.ts`), and an interactive HTML interface (`mcp-app.html`) that wraps the Excalidraw library. API route handlers bridge the Vercel deployment with the MCP protocol.

## Connections

- [[understanding-claude-code-full-stack-mcp-skills-subagents-hooks]] - Explains the MCP layer that this project plugs into, showing how MCP servers extend Claude's capabilities
- [[why-model-context-protocol-does-not-work]] - Counterpoint exploring MCP's limitations around context bloat and tool schema overhead — relevant context for evaluating MCP-based tools
- [[claude-code-is-a-platform-not-an-app]] - Frames Claude as a composable platform where tools like this MCP server become building blocks
