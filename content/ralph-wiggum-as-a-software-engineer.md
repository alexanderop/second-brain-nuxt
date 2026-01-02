---
title: "Ralph Wiggum as a Software Engineer"
type: article
url: "https://ghuntley.com/ralph/"
author: "[[geoffrey-huntley]]"
tags:
  - ai-agents
  - automation
  - developer-experience
  - productivity
summary: "A Bash loop technique ('Ralph') that feeds prompts to AI coding agents repeatedly, enabling autonomous project development with iterative refinement."
notes: ""
date: 2026-01-01
---

## The Technique

Ralph is a simple automation pattern: a Bash loop that continuously pipes a prompt file into an AI coding agent:

```bash
while :; do cat PROMPT.md | npx --yes @sourcegraph/amp ; done
```

This enables the agent to autonomously build projects, with the human refining the prompt between iterations based on failure patterns.

## Key Insight

> "That's the beauty of Ralph—the technique is deterministically bad in an undeterministic world."

The approach embraces imperfection. Initial outputs are flawed, but each failure informs better prompts. The author uses a playground metaphor: adding "safety signs" that gradually redirect the agent toward correct behavior.

## Results

- Shipped 6 repositories overnight during a Y Combinator hackathon
- Created an esoteric programming language
- One case study: reduced a $50K outsourcing contract to $297 in AI costs

## Trade-offs

Ralph works best for greenfield projects where:
- The output is "good enough" to ship or iterate on
- Time-to-value matters more than perfection
- The human can interpret failures and tune prompts

Contrast this with [[12-factor-agents]], which argues for integrating focused micro-agents into deterministic workflows rather than naive "loop until solved" patterns.
