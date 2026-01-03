---
title: "No Vibes Allowed: Solving Hard Problems in Complex Codebases"
type: youtube
url: "https://www.youtube.com/watch?v=rmvDxxNubIg"
tags:
  - ai-agents
  - context-engineering
  - llm
  - developer-experience
  - best-practices
authors:
  - dex-horthy
summary: "A practical framework for getting AI coding agents to work reliably in brownfield codebases through context engineering, intentional compaction, and the Research-Plan-Implement workflow."
date: 2026-01-03
---

Dex Horthy shares how his team at HumanLayer achieved 2-3x throughput by rewiring how they collaborate with AI coding agents. The key insight: LLMs are stateless, so the only way to improve output is to optimize input through context engineering.

## The Problem

Most AI-generated code creates "slop" — code that needs constant rework. Studies show developers ship more but spend significant time fixing AI-generated technical debt. This hits hardest in brownfield codebases with 10+ years of history.

## The Dumb Zone

Context windows have diminishing returns. Around 40% capacity, model performance degrades. If your MCPs dump JSON and UUIDs into the context, you're doing all your work in the "dumb zone" with predictably poor results.

## Intentional Compaction

Instead of letting conversations grow until they fail, compress context proactively:

1. **Take snapshots** — Have the agent summarize work into a markdown file with exact files, line numbers, and decisions made
2. **Start fresh** — New context window with the compacted summary gets straight to work without rediscovery
3. **Use sub-agents** — Fork context windows for exploration tasks (finding code, understanding flow), return only the compressed answer

## Research-Plan-Implement

A three-phase workflow that keeps you in the "smart zone":

### Research
Understand how the system works. Find the right files. Stay objective. Output: compressed document of what matters.

### Plan
Outline exact steps with file names, line snippets, and how to test after each change. A good plan makes even simple models succeed.

### Implement
Execute the plan with low context. The least exciting but most reliable phase.

## Mental Alignment

Code review exists for keeping teams on the same page about how the codebase evolves. When AI ships 2-3x more code, plans become the artifact for peer review. Mitchell's approach: attach the AI thread to PRs so reviewers see prompts, steps, and test results.

## Don't Outsource the Thinking

There is no perfect prompt. AI amplifies thinking you've done — or haven't. Bad research sends models in the wrong direction. A bad line of research can mean hundreds of bad lines of code.

## When to Use This

| Complexity | Approach |
|------------|----------|
| Button color change | Just talk to the agent |
| Small feature | Simple plan, implement |
| Medium feature | One research, then plan |
| Complex brownfield work | Full RPI with compaction |

Getting it right takes reps. Pick one tool, get it wrong repeatedly, and learn to calibrate.

## Related

- [[context-engineering-guide]] — Map of context engineering concepts
- [[claude-code-best-practices]] — Practical patterns for AI coding agents
