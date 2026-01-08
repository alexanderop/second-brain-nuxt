---
title: "Get Notified When Claude Code Finishes With Hooks"
type: article
url: "https://alexop.dev/posts/claude-code-notification-hooks/"
tags:
  - claude-code
  - hooks
  - developer-experience
authors:
  - alexander-opalic
summary: "Set up desktop notifications for Claude Code using hooks to get alerted when Claude needs permission or input—no more terminal watching."
date: 2026-01-03
---

Hooks are commands that run at specific points in Claude Code's lifecycle. Instead of polling the terminal, you get notified when something needs your attention.

Claude Code provides two notification hooks:
- **permission_prompt** — Claude needs your permission to do something
- **idle_prompt** — Claude is waiting for your input

## Setup

Create a `.claude/hooks` directory in your project, then add the hook configuration to `.claude/settings.json`:

```json
{
  "hooks": {
    "Notification": [
      {
        "matcher": "permission_prompt|idle_prompt",
        "hooks": [
          {
            "type": "command",
            "command": "npx tsx \"$CLAUDE_PROJECT_DIR/.claude/hooks/notification-desktop.ts\"",
            "timeout": 5
          }
        ]
      }
    ]
  }
}
```

The `$CLAUDE_PROJECT_DIR` environment variable expands to your project root automatically.

**Placement options:**
- `.claude/settings.json` — Project-specific (shared with team)
- `~/.claude/settings.json` — Global user settings (personal only)

## Notification Script

The script reads hook input from stdin and sends macOS notifications via AppleScript:

```typescript
import type { NotificationHookInput } from '@anthropic-ai/claude-agent-sdk'
import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

function sendMacNotification(title: string, message: string): void {
  const escapedTitle = title.replace(/"/g, '\\"')
  const escapedMessage = message.replace(/"/g, '\\"')
  const script = `display notification "${escapedMessage}" with title "${escapedTitle}" sound name "Ping"`
  execSync(`osascript -e '${script}'`, { stdio: 'ignore' })
}

function main(): void {
  const input = JSON.parse(readFileSync(0, 'utf-8')) as NotificationHookInput
  const notificationType = (input as { notification_type?: string }).notification_type

  if (notificationType === 'permission_prompt') {
    sendMacNotification('Claude Code - Permission Required', input.message || 'Claude needs your permission')
  } else if (notificationType === 'idle_prompt') {
    sendMacNotification('Claude Code - Waiting', input.message || 'Claude is waiting for your input')
  }
}

main()
```

## Key Benefit

The notification arrives exactly when you need to engage—no sooner, no later. You reclaim focus by letting Claude work while you work, with attention pulled back only when needed.

See [[claude-code-best-practices]] for more Claude Code optimization techniques.
