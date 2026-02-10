---
title: "From Tasks to Swarms: Agent Teams in Claude Code"
type: note
tags:
  - claude-code
  - agentic-coding
  - multi-agent
  - ai-agents
  - context-engineering
authors:
  - alexander-opalic
summary: "Claude Code's agent teams upgrade the subagent workflow from star topology to mesh — agents can now message each other, coordinate through shared task lists, and collaborate in real time. Three real sessions show the patterns in action."
date: 2026-02-08
---

In my previous post on [Spec Driven Development: When Architecture Becomes Executable](/spec-driven-development-when-architecture-becomes-executable), I showed how Claude Code's task system turns a single AI session into an orchestrated development team — subagents doing the work, tasks persisted to disk, atomic commits per task. That workflow let me migrate a storage layer from SQLite to IndexedDB in one afternoon.

This week, Anthropic shipped something that makes that workflow look like a warmup.

**Agent teams** landed with Opus 4.6 on February 5, 2026. The core idea: agents can now *talk to each other*. Not just report results back to a parent — they message peers, share discoveries mid-task, challenge each other's approaches, and coordinate through a shared task list. It's the swarm pattern, built into Claude Code as a first-class feature.

The [Claude Code's New Task System Explained](/claude-codes-new-task-system-explained) I covered last time solved **context rot** — each subagent gets a fresh context window. Agent teams solve the next problem: **coordination rot**. When parallel agents work on different assumptions with no way to sync, you get merge conflicts, duplicated work, and inconsistent implementations. The inbox fixes that.

I've been using agent teams daily since they dropped. This post documents three real sessions — the exact prompts, what happened, and what I learned.

<!-- Figure: "From Star to Mesh" -->
<!-- Midjourney prompt: minimal flat technical diagram, left side shows star topology with central hub node connected to 6 outer nodes by one-way arrows pointing inward, labeled "Subagents (before)", right side shows mesh topology with 6 interconnected nodes with bidirectional arrows between all of them plus a slightly larger coordinator node, labeled "Agent Teams (now)", dark background, neon blue connection lines, clean geometric style, no text except labels --ar 16:9 --v 6 -->

## What Changed: The Two New Primitives

The previous post covered the task system (`TaskCreate`, `TaskUpdate`, `TaskList`, `TaskGet`). Agent teams add two things on top:

**Primitive 1: Teams.** `TeamCreate` initializes a named team with a shared task directory. All teammates read from and write to the same board. `TeamDelete` cleans up when you're done.

**Primitive 2: The Mailbox.** `SendMessage` is the communication backbone. Three message types:

| Type | Purpose |
|------|---------|
| `message` | Direct message to a specific teammate |
| `broadcast` | Message all teammates (expensive — use sparingly) |
| `shutdown_request` | Graceful teardown when work is complete |

Plus `plan_approval_response` for the team lead to approve or reject a teammate's implementation plan before they start coding.

### How to Enable

```json
// .claude/settings.json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

### Subagents vs. Agent Teams

| Aspect | Subagents (Previous Post) | Agent Teams (New) |
|--------|--------------------------|-------------------|
| **Lifecycle** | Spawn, execute, return, die | Spawn, persist, work across multiple tasks |
| **Communication** | Report results to parent only | Message any teammate directly |
| **Coordination** | Main agent manages everything | Shared task list + peer-to-peer messaging |
| **Topology** | Star (hub and spoke) | Mesh (any-to-any) |
| **Best for** | Focused, independent work | Cross-cutting work requiring collaboration |

<!-- Figure: "Agent Team Architecture" -->
<!-- Midjourney prompt: clean technical architecture diagram on dark background, center shows a "Team Lead" node connected to a horizontal "Shared Task List" bar below it, three "Teammate" nodes arranged below the task list, each connected to the task list with arrows labeled "claims", bidirectional arrows between teammates labeled "inbox", dotted lines from team lead to each teammate labeled "spawns", flat minimal style, blue and cyan accent colors, monospace labels --ar 16:9 --v 6 -->

## Session 1: The Review Board (10 Agents, 62 Fixes)

My Astro blog has 10 feature modules. I wanted a quality audit of all of them — simultaneously.

### The Prompt

> use a team of agents that will a code review regarding quality and simplification for the whole codebase they should report you back use one per feature

### What Happened

Claude created a team called `codebase-review`, then:

1. **Created 10 tasks** — one per feature module (`agent-teams`, `filetree`, `goals`, `llm-education`, `local-first`, `mdx-components`, `og-images`, `presentation`, `prompts`, `vue-demos`)
2. **Spawned 10 reviewer agents** in parallel, each assigned to one feature
3. **Each reviewer read all files** in their feature, then sent a detailed report back via `SendMessage`
4. Reports arrived as they completed — some in seconds, larger features took longer

Here's what the team lead saw in real-time:

```text
reviewer-agent-teams:  4 issues found (placeholder components shipped)
reviewer-goals:        6 issues (unused barrel export, undefined CSS)
reviewer-vue-demos:    6 issues (null-safety bugs, massive duplication)
reviewer-llm-education: 5 issues (1073-line file needs decomposition)
reviewer-og-images:    7 issues (font loading bug, inconsistent exports)
...
```

After all reviews came in, the team lead spawned **10 fix agents** — one per feature — to implement the suggested changes. Progress was visible in real-time:

```text
5 of 10 agents done:
  fixer-vue-demos:      7 fixes applied
  fixer-mdx-components: 8 fixes applied
  fixer-local-first:    5 fixes applied
  fixer-goals:          6 fixes applied
  fixer-agent-teams:    4 fixes applied
  fixer-filetree:       Running...
  fixer-llm-education:  Running...
  fixer-og-images:      Running...
  fixer-presentation:   Running...
  fixer-prompts:        Running...
```

When all 10 were done, the team lead broadcast a shutdown:

```json
SendMessage({ type: "broadcast", content: "All work complete. Please shut down." })
```

Then ran verification and cleaned up:

```text
Typecheck: 0 errors
Lint: 0 errors
Tests: 363/363 passed

TeamDelete()
```

### The Results

| Feature | Fixes | Highlights |
|---------|------:|-----------|
| **local-first** | 5 | Fixed broken version comparison, wrong status element ID |
| **vue-demos** | 6 | Deleted non-functional TeleportDemo, added null checks |
| **mdx-components** | 8 | Fixed ChatUI duplicate ID, deleted empty file, typed props |
| **goals** | 6 | Fixed undefined CSS, replaced JSON.parse with structuredClone |
| **agent-teams** | 4 | Deleted placeholder components, shared TaskStatus type |
| **filetree** | 5 | Deduplicated 70 lines of icon rendering, shared TreeNode type |
| **llm-education** | 5 | Extracted 8 inner components from a 1073-line file |
| **og-images** | 7 | Fixed font loading bug, shared theme, consistent exports |
| **presentation** | 8 | Deleted dead hook, deduplicated types/constants/utils |
| **prompts** | 8 | Fixed PromptTool type, deduplicated utils, capped animation |

**62 fixes across 10 features. Zero regressions.**

<!-- Figure: "The Review Board Pattern" -->
<!-- Midjourney prompt: technical workflow diagram, top shows single "Team Lead" node, middle layer shows 10 small "Reviewer" nodes in a row each connected to the lead with arrows labeled "report", below that a "Fix Phase" divider, then 10 "Fixer" nodes in a row each connected back to lead, bottom shows a green "Verification" bar with checkmarks for typecheck lint tests, minimal flat design, dark background, blue reviewer nodes, orange fixer nodes, green verification bar --ar 16:9 --v 6 -->

## Session 2: Parallel Implementation (4 Agents, 1 Dependency Chain)

For my Excalidraw clone built with Nuxt, I needed to implement Phase 2: arrow subtypes and arrowheads. The spec defined four agents with a dependency:

```text
Agent A (Data Model) ──┬──> Agent B (Rendering — curves + arrowheads)
                       ├──> Agent C (Tool cycling + wiring)
                       └──> Agent D (Tests)
```

Agent A had to finish first. B, C, D could run in parallel after.

### What Happened

The team lead made a strategic choice: **it did Agent A's work itself** rather than delegating it. Since everything depended on the data model, the lead wanted to be certain it was right before spawning parallel workers.

After completing Agent A (expanding `ArrowheadType` to 11 types, adding `ArrowSubtype`, updating `createElement`/`mutateElement`), it spawned B, C, D simultaneously.

The lead monitored type diagnostics in real-time and could see intermediate states:

```text
All three agents are progressing well. The diagnostics are expected
intermediate states:

- renderElement.ts line 26: Agent B already added the 3rd argument
  to renderArrowheads but hasn't finished rewriting arrowhead.ts
  to accept it yet — still in progress.

- useTool.ts unused imports: Agent C added imports/constants but
  hasn't wired them into the keydown handler yet — still in progress.
```

When Agent C finished first, the lead noticed a type error from cross-agent changes and **fixed it immediately** rather than waiting. This is the key advantage over subagents — the lead has visibility into intermediate states and can intervene.

### The Results

- **Agent A (Data Model)**: 11 arrowhead types, `ArrowSubtype` discriminated union, `useArrowDefaults` composable
- **Agent B (Rendering)**: Bezier curves for round arrows, 11 arrowhead SVG renderers
- **Agent C (Tool Cycling)**: Keyboard shortcuts, subtype cycling, arrowhead picker UI
- **Agent D (Tests)**: Full test coverage for all new types and interactions

**Key insight**: The team lead doing foundational work itself, then delegating parallel work, is a pattern that doesn't exist with subagents. With subagents, you either delegate everything or do everything yourself. Agent teams let the lead be a **player-coach**.

<!-- Figure: "Dependency-Aware Team Execution" -->
<!-- Midjourney prompt: technical execution timeline diagram, horizontal axis is time, vertical shows 4 swim lanes labeled "Lead (Agent A)", "Agent B", "Agent C", "Agent D", Lead lane shows solid blue bar spanning first third, then at the end of Lead's bar three arrows fork down to B C D lanes which show parallel bars spanning the remaining two thirds, a small red diamond marks where Lead fixes a cross-agent type error during Agent C's execution, minimal flat style, dark background, color-coded lanes --ar 16:9 --v 6 -->

## Session 3: Vue Best Practices Audit (Multi-Lens Review)

For the same Excalidraw project, I wanted a different kind of review — not code quality, but Vue-specific best practices.

### The Prompt

> do a review of this code base check if its really using vue in its best practices use a team of agents i like vue code like michael thiessen evan you anthu fu

### What Happened

Claude spawned three specialized review agents:

1. **Vue best practices reviewer** — Component patterns, reactivity, Composition API usage
2. **VueUse opportunities reviewer** — Finding places where VueUse composables could replace manual implementations
3. **Architecture boundary reviewer** — Feature isolation, import rules, dependency direction

Each agent independently read the entire codebase and reported findings. The multi-lens approach caught different issues than a single-pass review would.

## The Team Lifecycle

Here's the full lifecycle, distilled from these sessions:

```text
1. TeamCreate("codebase-review")     → Team + shared task list
2. TaskCreate (x N)                  → Work items with dependencies
3. Task(spawn teammates)             → Each gets fresh context + CLAUDE.md
4. TaskUpdate(owner: "reviewer-X")   → Assign work
5. Teammates read, implement, message → Peer coordination via inbox
6. SendMessage(broadcast: "shutdown") → Graceful teardown
7. Verification                      → typecheck + lint + tests
8. TeamDelete()                      → Clean up directories
```

<!-- Figure: "The Team Lifecycle" -->
<!-- Midjourney prompt: circular workflow diagram with 8 steps arranged clockwise, each step is a rounded rectangle with an icon, steps are: Create Team (puzzle icon), Create Tasks (checklist), Spawn Agents (fork arrows), Assign Work (person+arrow), Agents Work (gear icons with bidirectional message arrows between them), Shutdown (stop sign), Verify (green checkmark), Cleanup (broom), arrows connecting each step clockwise, dark background, gradient from blue to green as steps progress --ar 1:1 --v 6 -->

## Prompt Patterns

Building on the patterns from the previous post, here are the new ones for agent teams:

### 1. One Agent Per Unit

> use a team of agents... use one per feature

Maps naturally to feature modules, components, or bounded contexts. Each agent owns a clear scope.

### 2. Report Back Pattern

> they should report you back

Review agents message the team lead with findings. The lead aggregates, decides what to fix, then spawns fix agents.

### 3. Multi-Lens Review

> use a team of agents... vue best practices... michael thiessen

Spawn specialized reviewers with different expertise. Each catches issues the others miss.

### 4. Player-Coach Lead

Don't always delegate everything. For foundational work that everything depends on, the team lead can implement it directly, then delegate parallel work after.

### 5. Broadcast Shutdown

```json
SendMessage({ type: "broadcast", content: "All work complete. Please shut down." })
```

Always shut down teammates before calling `TeamDelete`. The team lead handles the full lifecycle.

## The Spectrum: From Subagents to Gas Town

Where do agent teams sit in the broader landscape?

| | Subagents | Agent Teams | Ralph | Gas Town |
|---|---|---|---|---|
| **Scale** | 1-5 tasks | 3-15 agents | 1 loop, days | 20-30 agents |
| **Communication** | None (return only) | Peer messaging | None (file only) | Structured mailboxes |
| **Persistence** | Session-scoped | Team-scoped | File-scoped | Git-backed |
| **Coordination** | Star topology | Mesh topology | Stateless loop | Hierarchical roles |
| **Best for** | Independent tasks | Collaborative work | Grinding a backlog | Industrial-scale projects |

**Subagents** (previous post): spawn, execute, return. Perfect for focused work.

**Agent teams** (this post): persistent teammates that communicate. For work requiring coordination.

**Ralph** (`while :; do cat PROMPT.md | claude-code; done`): stateless bash loop. No coordinator, no communication. Best for grinding through a well-defined task list over days. See [The Ralph Wiggum Loop from First Principles](/ralph-wiggum-loop-from-first-principles).

**Gas Town** (Steve Yegge): 20-30 agents with specialized roles (Mayor, Polecats, Witness, Refinery). Git-backed persistent state. For when agent teams aren't enough. See [Welcome to Gas Town](/welcome-to-gas-town).

The C compiler proof-of-concept from Nicholas Carlini at Anthropic showed what's possible at scale: 16 parallel Claude agents, ~2,000 sessions, $20,000 in API costs, producing a 100,000-line Rust compiler that compiles the Linux kernel. The takeaway: **the verifier matters more than the agent**. His CI pipeline and GCC torture test suite were the real differentiator. See [Building a C Compiler with a Team of Parallel Claudes](/building-a-c-compiler-with-a-team-of-parallel-claudes).

<!-- Figure: "The Multi-Agent Spectrum" -->
<!-- Midjourney prompt: horizontal spectrum diagram, left side labeled "Simple" right side labeled "Industrial", four evenly spaced nodes along the spectrum: "Subagents" (small single star icon), "Agent Teams" (mesh network icon), "Ralph" (loop arrow icon), "Gas Town" (factory with smokestacks icon), below each node small text showing key trait: "star topology", "mesh topology", "stateless loop", "hierarchical roles", gradient background from dark blue on left to dark orange on right, minimal flat style --ar 16:9 --v 6 -->

## When to Use Agent Teams

**Sweet spots:**
- Parallel code reviews (one agent per module)
- Cross-layer implementation (frontend + backend + tests)
- Competing hypotheses ([Anthropic Just Dropped Agent Swarms](/anthropic-just-dropped-agent-swarms) calls this the "devil's advocate pattern")
- Large refactors where tasks aren't fully independent

**When to skip:**
- Sequential dependencies (step 2 needs step 1 to finish)
- Same-file edits (agents overwrite each other)
- Simple tasks (coordination overhead > actual work)

**Known limitations** (as of Feb 2026):
- Session resumption can break in-process teammates
- One team per session
- Split-pane mode doesn't work in VS Code terminal or Ghostty

## From the Previous Post to This One

Spec-Driven Development with subagents was a **star pattern**: I was the product owner, Claude was the tech lead, subagents were developers. All communication flowed through the center.

Agent teams turn this into a **mesh**: the tech lead still coordinates, but developers can talk to each other. The frontend agent asks the backend agent about the API contract. The test agent tells the implementation agent about a failing edge case. The spec is still the source of truth — but now agents can resolve ambiguities without escalating everything to the lead.

The spec-driven workflow from the previous post still applies. Research with parallel agents. Write the spec. Refine via interview. Then implement — but now with a team instead of isolated subagents.

## Further Reading

- [Official Agent Teams Docs](https://code.claude.com/docs/en/agent-teams)
- [Building a C Compiler with a Team of Parallel Claudes](/building-a-c-compiler-with-a-team-of-parallel-claudes) — Nicholas Carlini's proof of scale
- [Welcome to Gas Town](/welcome-to-gas-town) — Steve Yegge's industrial-scale orchestration
- [Anthropic's 2026 Agentic Coding Trends Report](https://resources.anthropic.com/hubfs/2026%20Agentic%20Coding%20Trends%20Report.pdf)
- [12 Factor Agents](/12-factor-agents) — Design principles for AI coding agents
- [How to Install and Use Claude Code Agent Teams](/how-to-install-and-use-claude-code-agent-teams) — Setup guide, display modes, and known limitations
- [Understanding Claude Code's Full Stack: MCP, Skills, Subagents, and Hooks](/understanding-claude-code-full-stack-mcp-skills-subagents-hooks) — The broader extensibility stack where agent teams sit

## Conclusion

Two weeks ago, subagents gave us **parallel execution** with fresh context windows. Agent teams give us **parallel collaboration** — agents that share discoveries, challenge assumptions, and coordinate in real time.

The trajectory is clear. Subagents were workers. Agent teams are colleagues. Gas Town is the factory. We're moving from "AI that writes code" to "AI that *organizes* work."

*Try it yourself: Enable `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS`, open a project with multiple modules, and prompt "use a team of agents, one per module." Watch the inbox light up.*

## Connections

- [Spec Driven Development: When Architecture Becomes Executable](/spec-driven-development-when-architecture-becomes-executable) — The previous post covering the subagent + task system workflow that agent teams build on
- [Anthropic Just Dropped Agent Swarms](/anthropic-just-dropped-agent-swarms) — Ray Amjad's breakdown of the same feature: shared task lists + inbox primitives, devil's advocate pattern
- [How to Install and Use Claude Code Agent Teams](/how-to-install-and-use-claude-code-agent-teams) — Tom Crawshaw's setup guide covering display modes, delegate mode, and known limitations
- [Claude Code's New Task System Explained](/claude-codes-new-task-system-explained) — The task system with dependency tracking that agent teams build on for coordination
- [Building a C Compiler with a Team of Parallel Claudes](/building-a-c-compiler-with-a-team-of-parallel-claudes) — Nicholas Carlini's proof of scale: 16 agents, 100K lines, $20K cost
- [Welcome to Gas Town](/welcome-to-gas-town) — Steve Yegge's industrial-scale framework for 20-30 agents with hierarchical roles
- [Advanced Context Engineering for Coding Agents](/advanced-context-engineering-for-coding-agents) — Context management principles that explain why fresh-context-per-agent works
- [Agentic Design Patterns](/agentic-design-patterns) — Theoretical foundation for the multi-agent collaboration patterns agent teams implement
- [Understanding Claude Code's Full Stack: MCP, Skills, Subagents, and Hooks](/understanding-claude-code-full-stack-mcp-skills-subagents-hooks) — The broader Claude Code extensibility stack where agent teams sit alongside MCP, skills, and subagents
