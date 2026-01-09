---
title: "md-ai"
type: github
url: "https://github.com/ccssmnn/md-ai"
stars: 10
language: "TypeScript"
tags:
  - llm
  - cli
  - markdown
  - developer-experience
  - ai-tools
authors:
  - carl-assmann
summary: "CLI tool that enables LLM conversations through markdown files in your preferred editor, storing chat history as readable documents."
date: 2026-01-03
---

md-ai addresses a friction point with existing LLM chat interfaces: web UIs offer poor editing experiences compared to your local editor. Since LLMs naturally communicate in markdown, this tool bridges the gap by making conversations portable markdown files.

## How It Works

Conversations serialize to markdown after each AI response. User and assistant messages become headings. Tool calls and results get stored in specially-marked code blocks with JSON payloads. This format parses back into messages before sending to the AI, letting you edit conversation history directly.

````markdown
## User

call the tool for me

## Assistant

will do!

```tool-call
{
  "toolCallId": "1234",
  "toolName": "myTool",
  "args": { "msg": "hello tool" }
}
```

## Tool

```tool-result
{
  "toolCallId": "1234",
  "toolName": "myTool",
  "result": { "response": "hello agent" }
}
```
````

## Built-in Tools

The CLI includes file operations (list, read, write with permission safeguards), text searching via grep, shell command execution with approval prompts, and URL content fetching.

## Code Snippets

### Installation and Basic Usage

```bash
npm install -g @ccssmnn/md-ai
md-ai chat.md
md-ai -e 'code --wait' chat.md  # Use VS Code as editor
```

### Library Usage with Custom Tools

```javascript
import { google } from "@ai-sdk/google";
import { runMarkdownAI, tools } from "@ccssmnn/md-ai";

await runMarkdownAI({
  path: "./chat.md",
  editor: "code --wait",
  ai: {
    model: google("gemini-2.0-flash"),
    system: "You are a helpful assistant.",
    tools: {
      readFiles: tools.createReadFilesTool({ cwd: "./" }),
      listFiles: tools.createListFilesTool({ cwd: "./" }),
      writeFiles: tools.createWriteFilesTool({ cwd: "./" }),
      grepSearch: tools.createGrepSearchTool({ cwd: "./" }),
      execCommand: tools.createExecCommandTool({ cwd: "./" }),
    },
  },
});
```

## Connections

Similar approach to [[beads]] in making AI tooling work with plain text files that live in your repo. Complements [[writing-a-good-claude-md]] by providing another way to interact with Claude outside the standard interfaces.
