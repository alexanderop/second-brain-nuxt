---
title: "Claude Code 2.1: Skills Become the Universal Extension"
type: article
tags:
  - claude-code
  - ai-agents
  - developer-experience
  - ai-tools
summary: "Claude Code 2.1 transforms skills from specialized knowledge containers into a unified automation abstraction—hot-reloading, forked contexts, lifecycle hooks, and agent specification make skills the default choice for extending Claude Code."
date: 2026-01-09
authors:
  - alexander-opalic
---

I used to spend too much time deciding _how_ to extend Claude Code. Should this be a CLAUDE.md section? A skill? A slash command? Maybe a Task tool subagent for isolation? Four different mechanisms, each with tradeoffs I had to remember.

Claude Code 2.1 simplifies this. Skills absorbed the best parts of the other abstractions. The answer to "how should I extend Claude Code?" is now almost always: make it a skill.

## What Changed

### Hot-Reloading

This is the biggest developer experience improvement. Skills in `~/.claude/skills` or `.claude/skills` are immediately available—no restart required.

Before 2.1, I'd edit a skill, restart Claude Code, test it, find a bug, restart again. Now I edit and test in the same session. Skill development finally feels like normal development.

### `context: fork` — Skills as Subagents

The new `context: fork` frontmatter option runs a skill in an isolated sub-agent with its own conversation history:

```yaml
---
name: deep-analysis
description: Complex code analysis that needs isolation
context: fork
---
```

The main conversation stays clean—only the final result returns. This is what I previously needed the Task tool for.

You can also specify which agent type to use:

```yaml
---
name: quick-check
description: Fast validation check
context: fork
agent: Explore
model: haiku
---
```

The `agent` field accepts `Explore` (fast, read-only), `Plan` (analysis), `general-purpose` (full tools), or a custom agent name from `.claude/agents/`.

### Hooks in Skill Frontmatter

Skills can now define lifecycle hooks:

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

Three events are supported:
- `PreToolUse` — Before tool execution (can block)
- `PostToolUse` — After tool execution
- `Stop` — When skill finishes

The `once: true` option is particularly useful—the hook runs once then auto-removes. Perfect for one-time validations.

The key improvement: hooks are scoped to the skill's lifecycle. They're cleaned up when the skill finishes. No more global hook configurations that affect everything.

### Visibility Controls

Two settings control how skills appear:

| Setting | Slash menu | Skill tool | Auto-discovery |
|---------|-----------|------------|----------------|
| `user-invocable: true` (default) | Visible | Allowed | Yes |
| `user-invocable: false` | Hidden | Allowed | Yes |
| `disable-model-invocation: true` | Visible | **Blocked** | Yes |

The distinction matters:
- `user-invocable: false` hides from the slash menu but Claude can still invoke via Skill tool
- `disable-model-invocation: true` prevents Claude from invoking programmatically

## The Complete Frontmatter Reference

Here's everything you can put in skill frontmatter as of 2.1:

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

## The New Mental Model

```text
Before: "Should I use a skill, slash command, or subagent?"
After:  "Just make it a skill"
```

| Use case | Solution |
|----------|----------|
| User-invocable workflow | Skill (default behavior) |
| Isolated context | Skill with `context: fork` |
| Specific model | Skill with `model:` |
| Event-driven logic | Skill with `hooks:` |
| Dynamic runtime prompt | Task tool (the exception) |

The Task tool still wins for dynamic scenarios—when you need to compose prompts at runtime or use specialized agent types. But for repeatable workflows with known steps, skills handle it now.

## Skills and Subagents: Two-Way Interaction

**Giving subagents access to skills:**

Subagents don't automatically inherit skills. You grant access explicitly:

```yaml
# .claude/agents/code-reviewer.md
---
name: code-reviewer
description: Review code for quality
skills: pr-review, security-check
---
```

Built-in agents (Explore, Plan, general-purpose) don't have access to custom skills—only custom subagents with an explicit `skills` field.

**Running skills in subagent context:**

Use `context: fork` + `agent` in skill frontmatter. This creates a separate subagent instance.

## Progressive Disclosure

Skills share the context window with your conversation. Keep `SKILL.md` under 500 lines:

```text
my-skill/
├── SKILL.md           # Overview (keep under 500 lines)
├── reference.md       # Detailed docs - loaded when needed
├── examples.md        # Usage examples
└── scripts/
    └── helper.py      # Executes without loading into context
```

Utility scripts are particularly efficient—they execute without consuming tokens. Only their output counts.

## Migration Guide

**From slash commands:**
- Move from `~/.claude/commands/` to `~/.claude/skills/`
- Add frontmatter with `name` and `description`
- Benefit: auto-discovery plus slash menu visibility

**From hook scripts:**
- Embed hooks directly in skill frontmatter
- Benefit: hooks scoped to skill lifecycle, cleaned up automatically

**From Task tool static workflows:**
- Convert to skills with `context: fork`
- Benefit: no runtime prompt composition needed

## Real-World Examples

Here are patterns I've found useful that combine multiple 2.1 features.

### Example 1: PR Review with Security Gate

A code review skill that runs in isolation, uses a fast model for initial triage, and blocks merges until security checks pass:

```yaml
---
name: pr-review
description: Review pull request for code quality and security. Use when reviewing PRs, checking code changes, or before merging.
context: fork
agent: Explore
model: haiku
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash(git diff:*)
  - Bash(git log:*)
hooks:
  PreToolUse:
    - matcher: "Bash"
      pattern: "git merge|gh pr merge"
      hooks:
        - type: command
          command: "./scripts/security-scan.sh"
          blocking: true
---

# PR Review

Review the current PR for:
1. Code quality issues
2. Security vulnerabilities (SQL injection, XSS, secrets in code)
3. Test coverage gaps
4. Breaking changes

Output a structured review with severity levels.
```

**Why this works:**
- `context: fork` keeps the review isolated—main conversation stays clean
- `agent: Explore` + `model: haiku` makes it cheap and fast for initial scan
- The `PreToolUse` hook blocks any merge attempt until security scan passes
- `allowed-tools` restricts to read-only operations

### Example 2: Database Migration Safety

A migration skill with one-time backup verification and SQL validation:

```yaml
---
name: db-migrate
description: Run database migrations safely. Use when applying migrations, schema changes, or data transformations.
context: fork
allowed-tools:
  - Read
  - Bash(pnpm drizzle-kit:*)
  - Bash(psql:*)
hooks:
  PreToolUse:
    - matcher: "Bash"
      pattern: "drizzle-kit push|psql.*ALTER|psql.*DROP"
      hooks:
        - type: command
          command: "./scripts/verify-backup.sh"
          once: true
          blocking: true
        - type: command
          command: "./scripts/validate-migration.sh $TOOL_INPUT"
          blocking: true
  PostToolUse:
    - matcher: "Bash"
      pattern: "drizzle-kit"
      hooks:
        - type: command
          command: "./scripts/notify-slack.sh 'Migration completed: $TOOL_INPUT'"
---

# Database Migration

Before running any migration:
1. Verify backup exists (automated, runs once)
2. Validate SQL syntax
3. Check for destructive operations

After migration: notify team via Slack.
```

**Why this works:**
- `once: true` on backup verification—runs first time only, then auto-removes
- Two-layer validation: backup check + SQL validation on every destructive command
- `PostToolUse` for team notification
- Hooks are scoped to this skill—don't affect other database work

### Example 3: Test-Driven Feature Development

A skill that enforces test-first development by blocking implementation until tests exist:

```yaml
---
name: tdd-feature
description: Implement a feature using test-driven development. Use when adding new features, implementing user stories, or when TDD is required.
context: fork
agent: general-purpose
hooks:
  PreToolUse:
    - matcher: "Edit|Write"
      pattern: "app/.*\\.(vue|ts)$"
      exclude: "*.test.ts|*.spec.ts"
      hooks:
        - type: command
          command: "./scripts/check-tests-exist.sh $FILE_PATH"
          blocking: true
          message: "Write tests first. No test file found for $FILE_PATH"
  PostToolUse:
    - matcher: "Edit|Write"
      pattern: "*.test.ts|*.spec.ts"
      hooks:
        - type: command
          command: "pnpm test:unit --run"
---

# TDD Feature Development

Workflow:
1. Write failing test first
2. Implement minimum code to pass
3. Refactor

The PreToolUse hook will block edits to implementation files
until corresponding test files exist.
```

**Why this works:**
- `PreToolUse` enforces the "test first" constraint at the tool level
- `PostToolUse` runs tests after every test file change
- `context: fork` keeps the TDD workflow isolated
- `exclude` pattern allows editing test files without the check

### Example 4: Cost-Optimized Multi-Stage Review

A review skill that uses cheap models for quick checks, expensive models for deep analysis:

```yaml
---
name: staged-review
description: Multi-stage code review with cost optimization. Use for thorough code reviews on important changes.
user-invocable: true
---

# Staged Review

This skill orchestrates multiple review passes:

## Stage 1: Quick Scan (invoke /quick-lint)
Fast syntax and style check using Haiku.

## Stage 2: Security Review (invoke /security-scan)
Security-focused review using Sonnet.

## Stage 3: Architecture Review (invoke /arch-review)
Deep architectural analysis using Opus (only if stages 1-2 pass).

Invoke each stage skill in order. Stop if any stage fails.
```

With supporting skills:

```yaml
# quick-lint/SKILL.md
---
name: quick-lint
description: Fast linting check
context: fork
model: haiku
user-invocable: false
allowed-tools:
  - Read
  - Grep
---
```

```yaml
# security-scan/SKILL.md
---
name: security-scan
description: Security vulnerability scan
context: fork
model: sonnet
user-invocable: false
allowed-tools:
  - Read
  - Grep
  - Glob
---
```

```yaml
# arch-review/SKILL.md
---
name: arch-review
description: Deep architecture review
context: fork
model: opus
user-invocable: false
allowed-tools:
  - Read
  - Grep
  - Glob
  - LSP
---
```

**Why this works:**
- Parent skill orchestrates, child skills execute in isolation
- Each stage uses appropriate model for cost/capability tradeoff
- `user-invocable: false` on child skills—only parent triggers them
- Fail-fast: expensive Opus review only runs if cheaper stages pass

### Example 5: Self-Documenting Skill with Progressive Disclosure

A complex skill that keeps SKILL.md light and loads details on demand:

```text
api-client-generator/
├── SKILL.md              # 50 lines - overview only
├── openapi-patterns.md   # 200 lines - loaded when generating from OpenAPI
├── graphql-patterns.md   # 150 lines - loaded when generating from GraphQL
├── error-handling.md     # 100 lines - loaded when adding error handling
└── scripts/
    ├── validate-spec.ts  # Validates API spec (no context cost)
    └── generate-types.ts # Generates TypeScript types (no context cost)
```

```yaml
# SKILL.md
---
name: api-client-generator
description: Generate type-safe API clients from OpenAPI or GraphQL specs. Use when creating API clients, generating types from specs, or integrating with external APIs.
context: fork
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash(npx ts-node scripts/*:*)
hooks:
  PreToolUse:
    - matcher: "Write|Edit"
      pattern: "*/api/*"
      hooks:
        - type: command
          command: "npx ts-node scripts/validate-spec.ts"
          once: true
---

# API Client Generator

Generate type-safe clients from API specifications.

## Supported Formats
- OpenAPI 3.x (read openapi-patterns.md for details)
- GraphQL (read graphql-patterns.md for details)

## Workflow
1. Validate spec (automated via hook)
2. Generate types using scripts/generate-types.ts
3. Generate client methods
4. Add error handling (read error-handling.md for patterns)

## Scripts
Scripts in ./scripts/ execute without loading into context.
Use them for validation and code generation.
```

**Why this works:**
- SKILL.md is only 50 lines—fits easily in context
- Reference files loaded only when that specific pattern is needed
- Scripts execute without consuming tokens
- `once: true` on spec validation—validates once per session

## What's Left

A few things I'm still figuring out:
- Performance implications for hot-reloading many skills
- Whether `once: true` hooks can be reset manually
- How `model:` in skill frontmatter interacts with `agent:` field defaults

But overall, skills in 2.1 do what I need. The fragmented extension model is gone. Make it a skill.
