---
title: "VS Code Copilot Workshop"
type: talk
tags:
  - vs-code
  - github-copilot
  - ai-agents
  - context-engineering
  - workshop
authors:
  - alexander-opalic
summary: "Workshop covering the transformation from LLM to Agent, context engineering, AGENTS.md, subagents, and skills in VS Code Copilot."
date: 2026-01-24
---

## Slide 1: Introduction

**About Me**
- [Your introduction here]
- Why I'm excited about AI coding assistants

---

## Slide 2: Workshop Outline

1. What is an Agent? (LLM → Agent transformation)
2. Context Engineering (the real skill)
3. agents.md (open standard)
4. Subagents (specialized invocation)
5. Skills (portable workflows)
6. Live Demo

---

## Slide 3: What is an Agent?

**The Transformation: LLM → Agent**

| Plain LLM | Agent |
|-----------|-------|
| Responds to prompts | Takes actions |
| Generates text | Executes tools |
| One-shot | Loops until done |

> "Agents don't just suggest code—they autonomously perform work while you maintain oversight."
> — [VS Code Docs: Using Agents](https://code.visualstudio.com/docs/copilot/agents/overview)

---

## Slide 4: The Agentic Loop (nanocode)

Reference: [github.com/alexanderop/nanocode](https://github.com/alexanderop/nanocode)

```
User Input
    ↓
┌─────────────────────────────┐
│ 1. Send to LLM              │
│ 2. Get response + tool calls│
│ 3. Execute tools            │  ← Loop
│ 4. Feed results back        │
│ 5. Repeat until done        │
└─────────────────────────────┘
    ↓
Final Response
```

**~350 lines of TypeScript** to understand how Claude Code works.

---

## Slide 5: The Basic Tools Every Code Agent Needs

From nanocode and real agents:

| Tool | Purpose |
|------|---------|
| `read` | Read file contents |
| `write` | Create/overwrite files |
| `edit` | Find and replace |
| `glob` | Find files by pattern |
| `grep` | Search contents |
| `bash` | Run commands |

---

## Slide 6: What is Context Engineering?

> "Context engineering is prompt engineering's grown-up sibling. It's the discipline of curating what goes into an agent's context window."
> — [Anthropic: Effective Context Engineering for AI Agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)

**The Problem:** Context windows are finite. Every token has an opportunity cost.

---

## Slide 7: Context as Budget

```
┌─────────────────────────────────┐
│  Context Window (Finite)        │
│  ┌───────────────────────────┐  │
│  │ System Prompt             │  │
│  │ Current Task              │  │
│  │ Tool Definitions          │  │
│  │ Compacted Memory          │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
        ↑
    External Memory (Just-in-Time)
```

**Key insight:** Give agents tools to *find* information rather than stuffing it in context.

---

## Slide 8: Three Long-Horizon Techniques

From [Anthropic's guide](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents):

1. **Compaction** — Summarize history, reset periodically
2. **Structured note-taking** — External memory systems
3. **Sub-agent architectures** — Distribute work across focused contexts

---

## Slide 9: AGENTS.md

**What:** An open standard for agent-specific documentation
**Where:** Repository root (works in monorepos too)
**Who:** Works with Copilot, Claude, Cursor, Devin, 20+ agents

> "While README.md targets humans, AGENTS.md contains the extra context coding agents need."

---

## Slide 10: AGENTS.md Structure

```markdown
# AGENTS.md

## Dev Environment
- How to set up and navigate

## Build & Test Commands
- `pnpm install && pnpm dev`
- `pnpm test:unit`

## Code Style
- TypeScript strict mode
- Prefer composition over inheritance

## PR Instructions
- Keep PRs small and focused
```

**Key:** No required fields—use what helps your project.

---

## Slide 11: Subagents in VS Code

**How to invoke:**
1. Enable tools in Copilot Chat (hammer icon)
2. Call explicitly with `@subagent`
3. Or accept when Copilot suggests one

**Use cases:**
- Complex multi-step tasks
- Specialized domain work
- Planning before implementation

---

## Slide 12: The Four Agent Types

From [VS Code Docs](https://code.visualstudio.com/docs/copilot/agents/overview):

| Type | Best For |
|------|----------|
| **Local** | Interactive, real-time feedback |
| **Background** | Autonomous, well-defined tasks |
| **Cloud** | Team collaboration, PRs |
| **Third-party** | Specialized domain tools |

All share unified session management.

---

## Slide 13: What Are Skills?

> "Agent skills aren't just fancy instructions. They're portable, task-specific workflows that load only when you need them."
> — [VS Code: Introducing Agent Skills](https://www.youtube.com/watch?v=JepVi1tBNEE)

**Key difference from instructions:**
- Instructions = global coding standards
- Skills = on-demand workflows with actions

---

## Slide 14: Skill Structure

```
skills/
└── prd-writing/
    ├── skill.md          # Required
    └── helpers.js        # Optional scripts
```

**skill.md frontmatter:**
```yaml
name: PRD Writing
when: User asks to write a product spec
workflow:
  - Gather requirements
  - Generate structured document
  - Review with user
```

---

## Slide 15: How Skills Load

```
User Request
    ↓
Agent Detects Match? → No → Standard Response
    ↓ Yes
Load skill.md + Resources
    ↓
Execute Workflow with Context
    ↓
Domain-Specific Output
```

Skills are portable across VS Code, GitHub Copilot Cloud, and CLI.

---

## Slide 16: The Full Picture

```
                    ┌──────────────┐
                    │  AGENTS.md   │  ← Project context
                    └──────┬───────┘
                           ↓
User Request → Agent Loop → Tools
                           ↓
              ┌────────────┴────────────┐
              │   Context Engineering   │
              │  (Just-in-time loading) │
              └────────────┬────────────┘
                           ↓
              ┌────────────┴────────────┐
              │ Skills    │  Subagents  │
              │ (Workflows)│ (Specialized)│
              └─────────────────────────┘
```

---

## Slide 17: Live Demo

**Plan:**
1. Show nanocode running (agent loop)
2. Create/show AGENTS.md in a project
3. Invoke a subagent in VS Code
4. Trigger a skill
5. Show context engineering in action

---

## Key Takeaways

1. **Agents = LLM + Tools + Loop** (nanocode shows this simply)
2. **Context is finite** — treat tokens as budget
3. **AGENTS.md** — standardized project context
4. **Subagents** — specialized agents for complex tasks
5. **Skills** — portable workflows that load on demand

## Resources

- [VS Code: Using Agents](https://code.visualstudio.com/docs/copilot/agents/overview) - Agent types and session management
- [Anthropic: Effective Context Engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) - Context engineering guide
- [VS Code: Introducing Agent Skills](https://www.youtube.com/watch?v=JepVi1tBNEE) - Agent Skills deep dive
- [VS Code: Context Engineering Guide](https://code.visualstudio.com/docs/copilot/guides/context-engineering-guide) - Microsoft's context engineering workflow
- [AGENTS.md](https://agents.md/) - Open standard for agent documentation
- [nanocode](https://github.com/alexanderop/nanocode) - Minimal agent implementation in TypeScript
