---
title: "The Ralph Wiggum Technique: Running Claude Code in a Loop"
type: note
authors:
  - alexander-opalic
tags:
  - ai-agents
  - claude-code
  - automation
  - context-engineering
summary: "Ralph is a bash loop that feeds prompts to AI coding agents repeatedly—the key is one goal per context window, deliberate context allocation, and robust feedback loops."
date: 2026-01-05
---

A practical guide to autonomous coding with Claude Code, based on the original technique by Geoffrey Huntley.

## What is Ralph?

Ralph Wiggum (named after the Simpsons character) is a deceptively simple technique for running coding agents autonomously. In its purest form, **Ralph is a bash loop**.

```bash
while :; do cat PROMPT.md | claude --dangerously-skip-permissions; done
```

You give the LLM a task, run it in a loop, and let it work through your backlog. The beauty of Ralph is that it's deterministically predictable in an unpredictable world.

## Why Ralph Works

Traditional approaches to AI coding orchestration involve complex multi-phase plans where you figure out all the arrows and dependencies upfront. Ralph takes a different approach that mirrors how engineers actually work:

1. Look at the board of tasks
2. Pick the highest priority one
3. Complete it
4. Go back to the board
5. Repeat until done

When you need to add a new task, you just add it to the list. No restructuring your elaborate plan.

### The Key Insight: Context Windows Are Arrays

Think like a C/C++ engineer. Context windows are literally arrays:

- When you chat with the LLM, you allocate to the array
- When it executes bash or another tool, it auto-allocates to the array
- The LLM is essentially a sliding window over this array
- **The less that window needs to slide, the better**

There's no server-side memory. The array *is* the memory. So you want to allocate less and be deliberate about what goes in.

## Setting Up Ralph

### Prerequisites

- Claude Code CLI installed
- A Git repository for your project
- A remote VM or sandbox environment (recommended for safety)

### The Two-Agent Architecture

Anthropic's research identified that long-running agents need two distinct phases:

1. **Initializer Agent**: Runs once at the start to set up the environment
2. **Coding Agent**: Runs in a loop, making incremental progress each iteration

This solves the problem of agents either trying to one-shot everything or declaring victory too early.

## Phase 1: The Initializer

Before running the loop, run a one-time setup that creates the scaffolding:

### `init-prompt.md` - First Run Only

```markdown
# Project Initialization

You are setting up a new project. Your job is to create the foundation for future coding sessions.

## Tasks

1. Read the project requirements below
2. Create a comprehensive `feature-list.json` with ALL features needed
   - Break down high-level requirements into specific, testable features
   - Mark all features as `"passes": false`
   - Include verification steps for each feature
3. Create an `init.sh` script that starts the development environment
4. Create an empty `claude-progress.txt` file for session logs
5. Make an initial git commit with all scaffolding

## Project Requirements

[Your high-level spec goes here]

## Feature List Format

Use this JSON structure - it's less likely to be inappropriately modified than Markdown:

{
  "features": [
    {
      "id": 1,
      "category": "functional",
      "description": "User can open a new chat and see a welcome state",
      "steps": [
        "Navigate to main interface",
        "Click the 'New Chat' button",
        "Verify a new conversation is created",
        "Check that chat area shows welcome state"
      ],
      "passes": false
    }
  ]
}

CRITICAL: Create comprehensive features. For a web app, this might be 50-200+ features.
```

Run the initializer once:

```bash
cat init-prompt.md | claude --dangerously-skip-permissions
```

### What Gets Created

After initialization, you'll have:

```text
project/
├── feature-list.json    # Comprehensive feature requirements
├── init.sh              # Script to start dev environment
├── claude-progress.txt  # Empty, ready for session logs
└── .git/                # Initial commit with scaffolding
```

## Phase 2: The Coding Loop

### `prompt.md` - The Loop Prompt (Alternative File-Based Approach)

If you prefer to keep your prompt in a file instead of inline:

```markdown
# Coding Session

You are continuing work on this project. Follow these steps exactly.

## Step 1: Get Your Bearings

1. Run `pwd` to see your working directory
2. Read `claude-progress.txt` to see what was recently worked on
3. Run `git log --oneline -20` to see recent commits
4. Read `feature-list.json` to see all features and their status

## Step 2: Verify Current State

1. Run `./init.sh` to start the development environment
2. Do a basic end-to-end test to verify the app works
3. If anything is broken, fix it BEFORE starting new work

## Step 3: Implement One Feature

1. Choose the highest-priority feature that has `"passes": false`
2. Implement ONLY that single feature
3. Test it thoroughly (types, unit tests, and end-to-end verification)
4. Only mark it as `"passes": true` after careful testing

## Step 4: Clean Up

1. Make a git commit with a descriptive message
2. Append a summary to `claude-progress.txt`:
   - What you implemented
   - Any issues encountered
   - Suggestions for next session
3. Leave the codebase in a clean, mergeable state

## Rules

- Work on ONE feature per session
- It is unacceptable to remove or edit feature descriptions - only change the `passes` field
- Always verify features end-to-end, not just with unit tests
- If all features pass, output: <promise>COMPLETE</promise>
```

Matt's inline approach using `-p` and `@` file references is more common because the `@` syntax automatically loads files into context and keeps everything in one script.

### `feature-list.json` - Your Task List

Created by the initializer, this uses a structured format that's hard to accidentally corrupt:

```json
{
  "features": [
    {
      "id": 1,
      "category": "functional",
      "description": "User can log in with email and password",
      "steps": [
        "Navigate to login page",
        "Enter valid email and password",
        "Click submit button",
        "Verify redirect to dashboard",
        "Verify user session is active"
      ],
      "passes": false
    }
  ]
}
```

**Why JSON instead of Markdown?** Anthropic found that models are less likely to inappropriately modify JSON files. The structured format makes it harder to accidentally delete or rewrite features.

**Why verification steps?** Each feature includes explicit steps for how to test it. This prevents the agent from marking features complete without proper end-to-end testing.

### `claude-progress.txt` - The LLM's Memory

A free-text log that the LLM appends to with its learnings:

```text
## Session 1 - 2025-01-05
- Implemented login feature
- Note: Auth tokens stored in localStorage for now
- Next: Consider dashboard implementation

## Session 2 - 2025-01-05
- Completed dashboard statistics
- Used Chart.js for visualizations
- The API response format changed, updated types accordingly
```

This serves as memory across loop iterations. Combined with git history, it gives the next agent everything it needs to continue.

## The Loop Script

### Basic Version (`ralph.sh`)

Here's Matt Pocock's implementation:

```bash
#!/bin/bash
set -e

if [ -z "$1" ]; then
  echo "Usage: $0 <iterations>"
  exit 1
fi

for ((i=1; i<=$1; i++)); do
  echo "Iteration $i"
  echo "--------------------------------"
  result=$(claude --permission-mode acceptEdits -p "@plans/prd.json @progress.txt \
1. Find the highest-priority feature to work on and work only on that feature. \
This should be the one YOU decide has the highest priority - not necessarily the first in the list. \
2. Check that the types check via pnpm typecheck and that the tests pass via pnpm test. \
3. Update the PRD with the work that was done. \
4. Append your progress to the progress.txt file. \
Use this to leave a note for the next person working in the codebase. \
5. Make a git commit of that feature. \
ONLY WORK ON A SINGLE FEATURE. \
If, while implementing the feature, you notice the PRD is complete, output <promise>COMPLETE</promise> \
")

  echo "$result"

  if [[ "$result" == *"<promise>COMPLETE</promise>"* ]]; then
    echo "PRD complete, exiting."
    exit 0
  fi
done

echo "Reached maximum iterations"
```

**Key details:**

- **`--permission-mode acceptEdits`**: Safer than `--dangerously-skip-permissions` — allows file edits but still prompts for other actions
- **`-p` flag**: Passes the prompt inline instead of piping from a file
- **`@` syntax**: References files directly (`@plans/prd.json @progress.txt`) — Claude Code reads these into context
- **`<promise>COMPLETE</promise>`**: Uses XML tags for the completion signal (easier to parse reliably)

Run it with:

```bash
./ralph.sh 20  # Run up to 20 iterations
```

## Critical Concepts

### One Goal Per Context Window

The most important principle: **set only one goal and objective in that context window**.

Why? As the context window fills up, the model gets "dumber." If you ask it to do multiple tasks:
- Some results will be poor quality
- The important finalizing work (running tests, committing) happens in the "dumb zone"
- Previous completed goals still take up context space

Instead: one task, one commit, reset. This keeps everything in the "smart zone."

### The Smart Zone vs. The Dumb Zone

```text
┌─────────────────────────────────────┐
│ Context Window Start                │
│ ─────────────────────               │
│ System prompt                       │
│ Your specs                          │  ← Smart Zone
│ Implementation plan                 │    (High performance)
│ Progress.txt                        │
│ ─────────────────────               │
│ Working context...                  │
│ Tool calls...                       │
│ More work...                        │
│ ─────────────────────               │
│ Testing & verification              │  ← Keep this here!
│ Git commit                          │
│ ─────────────────────               │  ← Performance degrades
│ ... more stuff ...                  │    (Dumb Zone)
└─────────────────────────────────────┘
```

Leave headroom for the finalization work. Small tasks = more room for verification.

### Deliberate Context Allocation

The first few allocations in your context window are special. On vibes, it feels more deterministic if you allocate the first things deliberately:

1. **First**: Application context (specs, what you're building)
2. **Second**: The task list / implementation plan
3. **Third**: Progress log

These appear in every loop iteration, providing consistent grounding.

## Feedback Loops Are Essential

Ralph only works with robust feedback loops. The LLM needs to know when things are working.

### The Testing Problem

Anthropic found a critical failure mode: Claude tends to mark features as complete without proper testing. It would make code changes, maybe run some unit tests or curl commands, but fail to recognize that the feature didn't work end-to-end.

**The solution: Test like a human user would.**

### End-to-End Testing with Browser Automation

For web apps, connect Claude to browser automation tools. The Puppeteer MCP server lets Claude:
- Navigate to pages
- Click buttons and fill forms
- Take screenshots to verify UI state
- Test the full user flow

```markdown
## In your prompt, add:

Before marking any feature as complete:
1. Run the development server
2. Use browser automation to test the feature as a user would
3. Take a screenshot to verify the UI looks correct
4. Only mark as `"passes": true` after end-to-end verification
```

This dramatically improves performance because Claude can identify bugs that aren't obvious from code alone.

### Pro Tip: Fix Your Test Runner Output

Most test runners output too many tokens. You only want the failing test case, not pages of passing tests.

Create a wrapper script that:
- Streams output normally
- On failure, shows only the relevant error
- Avoids `tail -100` (misses errors at the top)
- Avoids `head -50` (misses errors at the bottom)

## Security: The Lethal Trifecta

Running `--dangerously-skip-permissions` is dangerous. Understand the risks:

**The Lethal Trifecta:**
1. Access to execute code/tools
2. Access to the network
3. Access to private data

If all three are present, you're at risk. Mitigation strategies:

### Run on Isolated Infrastructure

- Use a dedicated GCP/AWS VM
- No public IP if possible
- Only credentials it needs (deploy keys, API keys)
- Think: "It's not *if* it gets compromised, it's *when*. What's the blast radius?"

### Never Run From Your Laptop

Your laptop has:
- Browser cookies (GitHub, Slack, etc.)
- SSH keys
- Cryptocurrency wallets
- Personal files

A compromised agent could exfiltrate all of this.

### Minimal Permissions

The VM should only have:
- Your Anthropic API key
- Deploy keys for the specific repos it needs
- Nothing else

## The Anthropic Ralph Plugin vs. Pure Ralph

Anthropic has released an official Ralph plugin for Claude Code. The key difference:

### Pure Ralph (Bash Loop)
- Fresh context window each iteration
- No auto-compaction
- Deterministic context allocation
- You control exactly what goes in

### Plugin-Based Ralph
- May use auto-compaction when context gets full
- Compaction is lossy (can remove specs, objectives)
- Context extends continuously rather than resetting
- The sliding window has to cover completed goals too

The recommendation: start with pure Ralph to understand the fundamentals, then experiment with plugins.

## Advanced Patterns

### Human On The Loop (Not In The Loop)

You're not injecting yourself into every decision. Instead:
- Architect the loop upfront
- Watch it like a fireplace
- Notice patterns and tendencies
- Tune the prompt/specs when you see issues

### The Outer Orchestrator

You can have a supervisor script that chains multiple Ralph loops together:

```bash
#!/bin/bash

# Main implementation loop
./loop.sh 5

# Verification loop
cat verify-translations.md | claude --dangerously-skip-permissions

# Quality check loop
cat check-tests.md | claude --dangerously-skip-permissions
```

### Git Worktrees for Parallel Ralph

Run multiple Ralph instances on different branches, then use another Claude instance to merge results:

```bash
# Terminal 1: Feature A
cd worktree-feature-a
./loop.sh 10

# Terminal 2: Feature B
cd worktree-feature-b
./loop.sh 10

# Terminal 3: Supervisor
# Watches both, merges when ready
```

## Context Window Math

Know your limits:

- **200k tokens** is the advertised limit
- **~16k tokens** for system overhead
- **~16k tokens** for harness overhead
- **~170k usable** for your actual work

To visualize: the Star Wars Episode 1 movie script is about 60k tokens (136 KB on disk). You can fit about 2-3 movie scripts in a context window.

### Tokenize Your Rules

Run your `claude.md` or `AGENTS.md` through a tokenizer:

```bash
npx tiktoken-cli encode < AGENTS.md | wc -l
```

If your rules file is 5,000 tokens, that's 5,000 tokens of your budget on every iteration. Keep it under 60-80 lines ideally.

## Common Failure Modes and Solutions

| Problem | Cause | Solution |
|---------|-------|----------|
| Agent declares victory too early | No clear feature list, or list is too vague | Use comprehensive `feature-list.json` with 50-200+ specific features |
| Agent tries to one-shot everything | No incremental constraints | Prompt to work on ONE feature per session |
| Leaves environment with bugs | No verification step at session start | Run `init.sh` and basic tests before starting new work |
| Marks features complete prematurely | No end-to-end testing | Require browser automation/screenshot verification |
| Spends time figuring out setup | No initialization script | Initializer agent creates `init.sh` |
| Progress lost between sessions | No persistent memory | Use `claude-progress.txt` + git commits |
| Inappropriately modifies task list | Using Markdown for features | Use JSON (harder to accidentally corrupt) |

## Troubleshooting

### Ralph Finishes Too Early

Problem: Outputs the completion promise after one task instead of looping.

Solution: Remove any mention of "promise" or "complete" from places the LLM might read it prematurely. The "don't think of an elephant" problem—if it's in context, it might trigger.

### Ralph Gets Stuck in a Loop

Problem: Keeps trying the same failing approach.

Solutions:
1. Check if the task is too large (break it down)
2. Check if tests are flaky
3. Add more specific guidance in specs
4. Reset and try again with adjusted technique

### Agent Leaves Broken Code

Problem: Next session starts with bugs from previous session.

Solution: Add verification at the START of each session. Prompt the agent to:
1. Run `./init.sh`
2. Do a basic end-to-end test
3. Fix any broken state BEFORE starting new work

### Compaction Removes Important Context

Problem: Auto-compaction drops your specs or objectives.

Solution: Use pure Ralph (bash loop) instead of plugins that use compaction. Or make critical context more prominent/repeated.

## Quick Start Checklist

1. Create isolated VM/sandbox environment
2. Set up deploy keys (minimal permissions)
3. Create your repo with:
   - `init-prompt.md` (for first run)
   - `prompt.md` (for loop)
   - `loop.sh`
4. Run the initializer once to create:
   - `feature-list.json` (comprehensive, 50-200+ features)
   - `init.sh` (dev environment startup)
   - `claude-progress.txt` (empty log file)
   - Initial git commit
5. Set up feedback loops (types, unit tests, browser automation)
6. Run `./loop.sh 5` and watch
7. Tune based on what you observe
8. Gradually increase autonomy

## Key Takeaways

1. **Ralph is just a bash loop** - no magic orchestration needed
2. **One goal per context window** - keep tasks small
3. **Deliberate context allocation** - control what goes in first
4. **Robust feedback loops** - tests, types, verification
5. **Isolated environments** - assume it will get compromised
6. **Watch and learn** - treat it like a fireplace, notice patterns
7. **Never blame the model** - tune your prompts and specs instead

Ralph is deterministically bad in an undeterministic world. Each time it does something wrong, you tune it—like a guitar.

## Connections

- [[ralph-wiggum-as-a-software-engineer]] - Geoffrey Huntley's original article introducing the technique
- [[ralph-wiggum-and-why-claude-codes-implementation-isnt-it]] - Explains why Anthropic's plugin differs from pure Ralph
- [[ralph-wiggum-loop-honest-reviews]] - Community discussion on when Ralph works and when it doesn't
- [[context-engineering-guide]] - The array-allocation mental model applies to all context engineering
- [[12-factor-agents]] - Alternative approach using deterministic workflows instead of loops
