---
title: "Claude Code Damage Control"
type: github
url: "https://github.com/disler/claude-code-damage-control"
stars: 178
language: "Python"
tags:
  - claude-code
  - ai-safety
  - hooks
  - security
authors:
  - indydevdan
summary: "PreToolUse hooks provide defense-in-depth protection for Claude Code by intercepting tool calls before execution—blocking dangerous commands and protecting sensitive files."
date: 2026-01-06
---

## Overview

This project implements a security layer for Claude Code through PreToolUse hooks. The hooks intercept bash commands, file edits, and write operations before Claude executes them, checking against configurable security patterns.

The core insight: Claude Code's power comes from autonomous execution, but that same power creates risk. Rather than disabling autonomy, this tool adds guardrails that preserve productivity while blocking destructive operations.

## Key Features

- **Three-tier path protection**: Zero-access paths (credentials, SSH keys), read-only paths (system files), no-delete paths (important project files)
- **Dangerous command detection**: Regex patterns catch destructive shell operations before execution
- **Flexible approval system**: Pattern-specific confirmation dialogs let you approve edge cases
- **Multiple runtimes**: Python/UV and TypeScript/Bun implementations
- **Global and project-level hooks**: Baseline protection plus context-specific rules

## Code Snippets

### Installation

```bash
# Clone into your Claude Code hooks directory
git clone https://github.com/disler/claude-code-damage-control.git ~/.claude/hooks/damage-control

# Or install globally
claude mcp add damage-control
```

### Hook Response Types

The hook returns exit codes to control Claude's behavior:

```python
# Exit codes
0  # Allow - proceed with operation
2  # Block - deny the operation
# JSON output with "ask" triggers confirmation dialog
```

### Path Protection Configuration

```python
ZERO_ACCESS_PATHS = [
    ".env",
    ".ssh/",
    "credentials.json",
]

READ_ONLY_PATHS = [
    "/etc/",
    "/usr/",
]

NO_DELETE_PATHS = [
    "package.json",
    "tsconfig.json",
]
```

## Technical Details

The system intercepts `PreToolUse` events and inspects the tool call payload. For bash commands, it parses the command string against dangerous patterns. For file operations, it checks the target path against protection tiers.

The hook architecture means Claude never sees the block—the operation simply doesn't happen, with an explanation returned to the conversation.

## Connections

- [[claude-code-is-amazing-until-it-deletes-production]] - Same author's video explaining the problem this tool solves
- [[understanding-claude-code-full-stack-mcp-skills-subagents-hooks]] - Explains the hooks mechanism this tool leverages
- [[claude-code-notification-hooks]] - Another hook implementation for Claude Code automation
