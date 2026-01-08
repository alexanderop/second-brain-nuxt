---
title: "How to Customize Your Claude Code Status Line"
type: article
url: "https://alexop.dev/posts/customize_claude_code_status_line/"
tags:
  - claude-code
  - cli
  - developer-experience
authors:
  - alexander-opalic
summary: "Configure Claude Code to display model info and context usage in your terminal through a custom status line script that processes JSON data via stdin."
date: 2026-01-03
---

Claude Code pipes JSON data to a custom script, letting you display whatever information matters most in your terminal status line.

## Setup

Create `~/.claude/statusline.sh`:

```bash
#!/bin/bash
input=$(cat)

MODEL=$(echo "$input" | jq -r '.model.display_name')
INPUT_TOKENS=$(echo "$input" | jq -r '.context_window.total_input_tokens')
OUTPUT_TOKENS=$(echo "$input" | jq -r '.context_window.total_output_tokens')
CONTEXT_SIZE=$(echo "$input" | jq -r '.context_window.context_window_size')

TOTAL_TOKENS=$((INPUT_TOKENS + OUTPUT_TOKENS))
PERCENT_USED=$((TOTAL_TOKENS * 100 / CONTEXT_SIZE))

echo "[$MODEL] Context: ${PERCENT_USED}%"
```

Make it executable and configure Claude Code:

```bash
chmod +x ~/.claude/statusline.sh
```

Add to `~/.claude/settings.json`:

```json
{
  "statusLine": {
    "type": "command",
    "command": "~/.claude/statusline.sh"
  }
}
```

## Available Variables

The JSON input includes:
- `model.id` and `model.display_name`
- `context_window.total_input_tokens` and `context_window.total_output_tokens`
- `context_window.context_window_size`
- `cost.total_cost_usd` and `cost.total_duration_ms`
- `workspace.current_dir`

## Code Snippets

### Cost Tracking Status Line

Add cost tracking alongside context usage:

```bash
#!/bin/bash
input=$(cat)

MODEL=$(echo "$input" | jq -r '.model.display_name')
TOTAL_TOKENS=$(($(echo "$input" | jq -r '.context_window.total_input_tokens') +
                 $(echo "$input" | jq -r '.context_window.total_output_tokens')))
CONTEXT_SIZE=$(echo "$input" | jq -r '.context_window.context_window_size')
COST=$(echo "$input" | jq -r '.cost.total_cost_usd')

PERCENT_USED=$((TOTAL_TOKENS * 100 / CONTEXT_SIZE))

printf "[%s] Context: %d%% | $%.2f" "$MODEL" "$PERCENT_USED" "$COST"
```

Output: `[Opus] Context: 12% | $0.45`

## Troubleshooting

Requires `jq` (`brew install jq` on macOS). Test manually:

```bash
echo '{"model":{"display_name":"Opus"},"context_window":{"total_input_tokens":1000,"total_output_tokens":500,"context_window_size":200000}}' | ~/.claude/statusline.sh
```

The `/statusline` slash command provides guided setup without manual configuration.

## Related

- [[claude-code-best-practices]] - general tips for working with Claude Code
- [[awesome-list-of-claude-code-tips-tricks-gotchas]] - more customization options
