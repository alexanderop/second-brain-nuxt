---
title: "Clawdbot"
type: article
url: "https://clawd.bot/"
tags:
  - claude
  - ai-agents
  - automation
  - open-source
  - self-hosted
authors:
  - peter-steinberger
summary: "A self-hosted Claude-powered assistant that runs across messaging platforms like WhatsApp, Telegram, and Slack—turning natural language into automated workflows for email, calendars, and home automation."
date: 2026-01-10
---

## Summary

Clawdbot brings Claude to your messaging apps. Instead of using a web interface, you interact with Claude through WhatsApp, Telegram, Slack, Discord, Teams, Signal, or iMessage. The tool runs on your own devices, giving you control over your data while enabling agentic workflows.

## Key Features

- **Multi-platform messaging** — Chat with Claude through any major messaging app
- **Self-hosted** — Runs on your devices, not in the cloud
- **Extensible skills** — Build custom automations through an open architecture
- **Service integrations** — Connects to email, calendars, todo lists, JIRA, Linear, and home automation
- **Agentic workflows** — Email management, meeting prep, scheduled briefings
- **Claude Code integration** — Run autonomous Claude Code loops from messaging apps

## Architecture

::mermaid
<pre>
graph LR
    subgraph Messaging["Messaging Platforms"]
        WA[WhatsApp]
        TG[Telegram]
        SL[Slack]
        DC[Discord]
    end

    subgraph Clawdbot["Clawdbot (Self-Hosted)"]
        Core[Message Router]
        Skills[Skills Engine]
        Claude[Claude API]
    end

    subgraph Services["External Services"]
        Email[Email]
        Cal[Calendar]
        Todo[Todo Lists]
        Home[Home Automation]
    end

    WA & TG & SL & DC --> Core
    Core --> Claude
    Claude --> Skills
    Skills --> Services
</pre>
::

## Installation

Requires Node.js 22+ or Bun:

```bash
npm install -g clawdbot
# or clone and build from source
```

## Connections

- [[claude-code-skills]] — Both use extensible skill systems to teach Claude specialized workflows
