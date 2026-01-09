---
title: "CallMe"
type: github
url: "https://github.com/ZeframLou/call-me"
stars: 529
language: "TypeScript"
tags:
  - claude-code
  - mcp
  - ai-tools
  - developer-experience
authors:
  - zeframlou
summary: "A Claude Code plugin that phones you when the AI finishes a task, gets stuck, or needs a decision—enabling true asynchronous collaboration without constant monitoring."
date: 2026-01-07
---

## Overview

CallMe bridges the gap between AI autonomy and human oversight through phone calls. Start a task, walk away, and receive a call when Claude needs interaction. The plugin enables multi-turn voice conversations, so you can discuss blockers or provide guidance without returning to your terminal.

The core insight: developers shouldn't babysit AI agents. CallMe treats phone calls as a communication channel, letting Claude reach out when it matters rather than requiring constant attention.

## Key Features

- **Asynchronous workflow** - Start tasks and get notified via phone when Claude needs input
- **Multi-turn voice conversations** - Natural dialogue during calls, not just notifications
- **Device flexibility** - Works with smartphones, smartwatches, and landlines
- **Composable tools** - Claude can execute web searches or other actions while maintaining call context

## Code Snippets

### Installation

```bash
/plugin marketplace add ZeframLou/call-me
/plugin install callme@callme
```

### Available Tools

The plugin exposes four tools to Claude:

```typescript
// Begin a new call with opening message
initiate_call({ message: "I've finished the refactoring. Want me to summarize the changes?" })

// Capture user response and continue conversation
continue_call()

// Speak without waiting for response (useful before long operations)
speak_to_user({ message: "Starting the build now, this might take a few minutes..." })

// End the call session
end_call()
```

### Environment Configuration

```bash
# Phone provider (Telnyx or Twilio)
TELNYX_API_KEY=...
TELNYX_PHONE_NUMBER=+1...
USER_PHONE_NUMBER=+1...

# Speech processing
OPENAI_API_KEY=...

# Webhook tunnel
NGROK_AUTH_TOKEN=...
```

## Technical Details

The architecture chains four components: Claude Code plugin → local MCP server → ngrok tunnel → phone provider (Telnyx/Twilio). Audio flows through OpenAI's Whisper for speech-to-text and their TTS API for responses.

Cost runs approximately $0.03-0.04 per minute of conversation, combining phone charges (~$0.007-0.014/min), speech recognition (~$0.006/min), and text-to-speech (~$0.02/min).

## Connections

- [[understanding-claude-code-full-stack-mcp-skills-subagents-hooks]] - Explains the MCP server architecture that CallMe builds on
- [[claude-code-is-a-platform-not-an-app]] - The platform philosophy that makes plugins like CallMe possible
