---
title: "Claude Code Skills"
type: article
url: "https://code.claude.com/docs/en/skills"
tags:
  - claude-code
  - ai-agents
  - developer-experience
  - ai-tools
authors:
  - anthropic
summary: "Official documentation on Skills—markdown files that extend Claude Code with specialized knowledge and workflows, triggered automatically based on semantic matching."
date: 2026-01-03
---

Skills are markdown files that teach Claude how to do something specific. Unlike slash commands requiring explicit invocation, Skills activate automatically when Claude determines a request matches the Skill's description.

## Key Concepts

**Automatic Triggering**: Claude loads only Skill names and descriptions at startup. When a request semantically matches a description, Claude asks permission, then loads the full `SKILL.md` content.

**Storage Locations**:
- `~/.claude/skills/` — Personal (all projects)
- `.claude/skills/` — Project (shared with team)
- Plugin directory — Bundled with plugins
- Enterprise managed settings — Organization-wide

Precedence flows top-to-bottom: Enterprise wins over Personal wins over Project wins over Plugin.

## Creating a Skill

Minimum structure:

```text
my-skill/
└── SKILL.md
```

The `SKILL.md` file requires YAML frontmatter with `name` and `description`:

```yaml
---
name: my-skill
description: What this does and when to use it. Include trigger keywords.
allowed-tools: Read, Grep, Glob
---

# My Skill

Instructions for Claude go here.
```

### Metadata Fields

| Field | Required | Purpose |
|-------|----------|---------|
| `name` | Yes | Lowercase, hyphens only, max 64 chars |
| `description` | Yes | Max 1024 chars. Include trigger keywords users would say |
| `allowed-tools` | No | Restrict Claude to specific tools without permission prompts |
| `model` | No | Specific Claude model for this Skill |

## Progressive Disclosure

Keep `SKILL.md` under 500 lines. Offload details to reference files:

```text
pdf-processing/
├── SKILL.md           # Overview and navigation
├── FORMS.md           # Form-filling details
├── REFERENCE.md       # API documentation
└── scripts/
    └── fill_form.py   # Executes without loading into context
```

Scripts in the `scripts/` directory execute with zero context cost—their code never loads into Claude's context window.

## Skills vs Other Options

| Option | Trigger | Use Case |
|--------|---------|----------|
| Skills | Auto (semantic) | Specialized knowledge |
| Slash Commands | Manual (`/cmd`) | Reusable prompts |
| CLAUDE.md | Always loaded | Project-wide instructions |
| Subagents | Delegated | Isolated context with own tools |
| Hooks | Event-driven | Scripts on tool events |
| MCP Servers | Tool calls | External integrations |

Use Skills for guidance that should apply automatically. Use subagents when isolation matters.

## Related

See also [[understanding-claude-code-full-stack-mcp-skills-subagents-hooks]] for a broader view of Claude Code's extensibility layers.
