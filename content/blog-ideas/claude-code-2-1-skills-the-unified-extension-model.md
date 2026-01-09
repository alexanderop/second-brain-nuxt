---
title: "Claude Code 2.1: Skills Become the Universal Extension"
status: ready
tags:
  - claude-code
  - ai-agents
  - developer-experience
core_idea: "Claude Code 2.1 transforms skills from specialized knowledge containers into a unified abstraction for automation—hot-reloading, forked contexts, lifecycle hooks, and agent specification make skills the default choice for extending Claude Code."
target_audience: "Developers using Claude Code who want to build reusable workflows beyond basic CLAUDE.md configuration"
created: 2026-01-09
updated: 2026-01-09
---

## Core Idea

Skills in Claude Code 2.1 aren't just "markdown files that teach Claude things" anymore—they're now the universal building block for automation. With hot-reloading, forked contexts, hooks support, and default slash command visibility, skills replace what previously required subagents, custom commands, or hook scripts.

## Outline

### 1. The Before: A Fragmented Extension Model

- Before 2.1: four separate mechanisms (CLAUDE.md, skills, slash commands, Task tool subagents)
- Choosing the right abstraction was confusing
- Skills were "auto-triggered knowledge" while slash commands were "user-triggered workflows"
- Subagents required the Task tool for isolated execution
- Hooks lived in settings.json, separate from skill logic

### 2. The Complete Skill Frontmatter Reference

**New in 2.1:**

| Field | Purpose |
|-------|---------|
| `context: fork` | Run skill in isolated sub-agent context |
| `agent` | Specify agent type: `Explore`, `Plan`, `general-purpose`, or custom |
| `hooks` | Define PreToolUse, PostToolUse, Stop hooks scoped to skill lifecycle |
| `once: true` | Hook runs once then auto-removes |

**All frontmatter fields:**

```yaml
---
name: my-skill                    # Required: lowercase, hyphens, max 64 chars
description: "..."                # Required: max 1024 chars, include trigger keywords
allowed-tools:                    # Optional: YAML list or comma-separated
  - Read
  - Grep
  - Bash(git add:*)              # Wildcard syntax for specific commands
model: claude-sonnet-4-20250514  # Optional: specific model
context: fork                     # Optional: isolated execution
agent: Explore                    # Optional: agent type when forked
user-invocable: true             # Optional: show in slash menu (default true)
disable-model-invocation: false  # Optional: block Skill tool invocation
hooks:                           # Optional: lifecycle hooks
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/check.sh"
          once: true
---
```

### 3. Hot-Reloading: The Biggest DX Win

- Skills in `~/.claude/skills` or `.claude/skills` are **immediately available**
- No restart required—iterate on skills like code
- Quote from docs: "Changes take effect immediately"
- Makes skill development feel like normal development

### 4. `context: fork` + `agent`: Skills as Subagents

**Why fork?**
- Main conversation stays clean—only final result returns
- Isolated context for complex multi-step operations
- Cost optimization with cheaper models

**The `agent` field options:**
- `Explore` - Fast, read-only (Haiku model)
- `Plan` - Analysis and planning (Sonnet model)
- `general-purpose` - Full tool access (Sonnet model)
- Custom agent name from `.claude/agents/`

```yaml
---
name: deep-analysis
description: Complex code analysis that needs isolation
context: fork
agent: Explore
model: haiku
---
```

### 5. Hooks in Skill Frontmatter

**Supported events:**
- `PreToolUse` - Before tool execution (can block)
- `PostToolUse` - After tool execution
- `Stop` - When skill finishes

**Key feature: `once: true`**
- Hook runs once per session, then auto-removes
- Perfect for one-time validations or setup checks

**Complete example:**
```yaml
---
name: secure-operations
description: Perform operations with security checks
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/security-check.sh $TOOL_INPUT"
          once: true
  PostToolUse:
    - matcher: "Edit"
      hooks:
        - type: command
          command: "npm run lint -- $FILE_PATH"
---
```

**Scope:** Hooks are cleaned up when skill finishes—they don't affect other skills or main conversation.

### 6. Visibility Controls: Two Different Settings

| Setting | Slash menu | Skill tool | Auto-discovery |
|---------|-----------|------------|----------------|
| `user-invocable: true` (default) | Visible | Allowed | Yes |
| `user-invocable: false` | Hidden | Allowed | Yes |
| `disable-model-invocation: true` | Visible | **Blocked** | Yes |

**Key distinction:**
- `user-invocable: false` = hides from slash menu but Claude can still invoke via Skill tool
- `disable-model-invocation: true` = prevents Claude from invoking programmatically at all

### 7. The New Mental Model

```
Before: "Should I use a skill, slash command, or subagent?"
After:  "Just make it a skill"
```

| Use case | Solution |
|----------|----------|
| User-invocable workflow | Skill (default `user-invocable: true`) |
| Isolated context | Skill with `context: fork` |
| Specific model | Skill with `model:` |
| Event-driven logic | Skill with `hooks:` |
| Dynamic runtime prompt | Task tool (the exception) |

### 8. Skills and Subagents: Two-Way Interaction

**Option A: Give subagents access to skills**

Subagents do NOT automatically inherit skills. Grant access explicitly:

```yaml
# .claude/agents/code-reviewer.md
---
name: code-reviewer
description: Review code for quality
skills: pr-review, security-check
---
```

**Important:** Built-in agents (Explore, Plan, general-purpose) do NOT have access to custom skills.

**Option B: Run skill in subagent context**

Use `context: fork` + `agent` in skill frontmatter—this creates a separate subagent instance.

### 9. What Still Needs Task Tool

- **Dynamic prompts** composed at runtime based on context
- **Specialized agent types** not available via `agent` field
- **Ad-hoc one-off tasks** without pre-definition
- **Runtime flexibility** when skill's fixed prompt isn't enough

### 10. Progressive Disclosure Pattern

```
my-skill/
├── SKILL.md           # Required - overview (keep under 500 lines)
├── reference.md       # Detailed docs - loaded when needed
├── examples.md        # Usage examples
└── scripts/
    └── helper.py      # Executes without loading into context
```

**Token optimization:**
- Keep `SKILL.md` under 500 lines
- Utility scripts execute without consuming tokens (only output counts)
- Claude loads supporting files only when needed

### 11. Migration Guide

**From slash commands:**
- Move from `~/.claude/commands/` to `~/.claude/skills/`
- Add frontmatter with `name` and `description`
- Benefit: auto-discovery + slash menu visibility

**From hook scripts:**
- Embed hooks directly in skill frontmatter
- Benefit: hooks scoped to skill lifecycle, cleaned up automatically

**From Task tool static workflows:**
- Convert to skills with `context: fork`
- Benefit: no runtime prompt composition needed

## Source Notes

- [[claude-code-2-1-skills-convergence]] - My original note on the context:fork and model: changes
- [[claude-code-skills]] - Official documentation on skills
- [[understanding-claude-code-full-stack-mcp-skills-subagents-hooks]] - The seven extensibility layers (now simplified)
- [[self-improving-skills-in-claude-code]] - The self-improvement pattern via CLAUDE.md

## Open Questions (Answered)

- **How do hooks in skill frontmatter interact with global hooks?** Skill hooks are scoped and cleaned up when skill finishes—they don't affect global hooks or other skills.
- **What happens when a forked skill calls another skill?** Built-in agents don't have access to custom skills; only custom subagents with explicit `skills` field can use them.
- **Token cost of skills?** Skills share context window with conversation; keep SKILL.md under 500 lines, use progressive disclosure for details.

## Remaining Questions

- Performance implications for hot-reloading many skills?
- Can `once: true` hooks be reset manually?
- Interaction between `model:` in skill and `agent:` field model defaults?
