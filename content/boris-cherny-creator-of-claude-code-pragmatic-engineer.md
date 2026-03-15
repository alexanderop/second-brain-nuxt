---
title: "Boris Cherny, Creator of Claude Code"
type: podcast
podcast: pragmatic-engineer-podcast
url: "https://www.youtube.com/watch?v=julbw1JuAz0"
tags:
  - claude-code
  - ai-agents
  - software-engineering
  - productivity
  - career
  - anthropic
  - generalist
authors:
  - gergely-orosz
guests:
  - boris-cherny
summary: "Software engineering is undergoing a printing-press moment: coding as a gatekept craft is dissolving, generalists who ship prototypes and adapt weekly to new model capabilities will define the next era."
transcript_source: youtube
date: 2026-03-07
rating: 5
---

## Timestamps

| Time  | Topic                                                                |
| ----- | -------------------------------------------------------------------- |
| 00:00 | Intro and Boris's background                                         |
| 02:00 | Learning to code via Pokemon cards and TI-83 calculators             |
| 05:00 | Early startups and YC (Agile Diagnosis)                              |
| 10:00 | Shadowing doctors — finding product-market fit                       |
| 15:00 | The generalist engineer mindset                                      |
| 20:00 | Meta: code quality measurement and causal analysis                   |
| 25:00 | Joining Anthropic — first PR rejected for being handwritten          |
| 30:00 | Origin story of Claude Code (from chatbot to agentic tool)           |
| 38:00 | Internal debate: should Anthropic keep Claude Code internal?         |
| 42:00 | How the Claude Code team ships: 20-30 PRs/day, zero handwritten code |
| 48:00 | Code review with AI: Claude reviews every PR, then human review      |
| 52:00 | Architecture of Claude Code — "it's very simple"                     |
| 55:00 | RAG vs agentic search — why glob+grep won                            |
| 60:00 | Permission system and sandboxing                                     |
| 65:00 | Member of Technical Staff — why flat titles matter                   |
| 70:00 | No PRDs — prototyping over documentation                             |
| 75:00 | Claude Cowork and agent teams                                        |
| 80:00 | Andrej Karpathy exchange — feeling behind as a programmer            |
| 85:00 | The printing press analogy                                           |
| 90:00 | Skills that still matter vs. skills to leave behind                  |
| 95:00 | Book recommendations                                                 |

## Key Arguments

### The Printing Press Analogy (85:00)

Boris compares the current AI moment to the invention of the printing press. Before the press, less than 1% of Europe was literate. Scribes were a tiny elite employed by kings who were often illiterate themselves. The press dropped the cost of printed material 100x in 30 years and increased quantity 10,000x in a century. The scribes didn't disappear — they became writers and authors, and the entire market for written work expanded beyond prediction. Software engineers are today's scribes; coding is becoming accessible to everyone, and the market for what can be built will expand enormously.

### Why Claude Code Uses Agentic Search Over RAG (55:00)

The team tried local vector databases, recursive model indexing, and various retrieval approaches. RAG had problems: code drifted out of sync with the index, and permissioning the index raised serious privacy/security concerns. In the end, agentic search (glob + grep) outperformed everything. Boris credits his Instagram experience where click-to-definition was broken, so engineers searched with patterns like `foo(` — the same approach works well for models.

### Safety as Swiss Cheese Model (52:00)

There's no single perfect answer for agentic safety. Anthropic uses layered defenses: model alignment (Opus 4.6 is most aligned), runtime classifiers that block prompt-injected requests, and sub-agent summarization (e.g., web fetch results are summarized by a sub-agent before returning to the main agent). For code, every PR gets Claude code review first (~80% of bugs caught), then human review.

### The Year of the Generalist (90:00)

At Anthropic, everyone codes — engineers, designers, data scientists, finance. The flat "Member of Technical Staff" title encodes this expectation. Boris predicts the next trillion-dollar startup may come from one person who thinks across engineering, product, business, and design. Skills to leave behind: strong opinions about code style, languages, and frameworks. Skills that matter more: being methodical and hypothesis-driven, curiosity, adaptability, and context-switching ability.

### How Claude Code Actually Ships (42:00)

Boris writes 10-20 PRs daily. Opus 4.5 with thinking mode wrote 100% of every single one — he didn't edit a single line manually. The team does dozens to hundreds of prototypes before shipping a feature. No PRDs — "better send a PR." Cat Woo, their product lead, is extremely technical and prefers working prototypes over documents.

### Uncorrelated Context Windows and Agent Teams (75:00)

Sub-agents have fresh context windows that don't know about the parent context. This "uncorrelated" approach, combined with throwing more tokens at the problem, is a form of test-time compute that produces better results. Agent teams clicked with Opus 4.6, where agents have "cute exchanges" discussing problems. Best used for complex tasks where a single Claude struggles.

## Predictions Made

- **Everyone will code** — Non-engineers (designers, data scientists, finance) will routinely write code as AI makes it accessible (Confidence: high)
- **The next billion-dollar product may be built by one person** — A generalist who thinks across disciplines (Confidence: medium)
- **Deep coding skills may not be required in 6 months** — Debugging methodology still matters now but the window is closing (Confidence: medium)
- **Coding language/framework debates will become irrelevant** — Models can rewrite between languages trivially (Confidence: high)

## Notable Quotes

> "Now we're at the point where Claude Code writes, I think something like 80% of the code at Anthropic on average. I wrote maybe 10-20 PRs every day. Opus 4.5 and Claude Code wrote 100% of every single one. I didn't edit a single line manually."
> — Boris Cherny at 00:00

> "The model just wants to use tools. If you give it a tool, it will figure out how to use it to get the thing done."
> — Boris Cherny at 35:00

> "Don't try to put the model in a box. Don't try to force it to behave a particular way. Let it do its thing."
> — Boris Cherny at 36:00

> "The scribes didn't disappear. They became writers and authors. And the reason they exist is because the market for literature just expanded a ton."
> — Boris Cherny at 87:00

> "I think the next trillion-dollar startup might just be one person that has some cool idea and their brain is able to think across engineering and product and business."
> — Boris Cherny at 92:00

## Resources Mentioned

- _Accelerando_ by Charles Stross — "essentially the product roadmap for the next 50 years"
- _Functional Programming in Scala_ — "teaches you how to think in types"
- Liu Cixin's short stories (Three-Body Problem author)
- Claude Cowork — Anthropic's new product bringing agentic AI to non-engineers

## Connections

- [[boris-cherny-on-what-grew-his-career-and-building-at-anthropic]] - Earlier interview covering Boris's Meta career and TypeScript book in more depth
- [[im-boris-and-i-created-claude-code]] - Boris's own tips thread on Claude Code productivity (parallel worktrees, CLAUDE.md philosophy)
- [[thread-based-engineering-how-to-ship-like-boris-cherny]] - Deep dive into Boris's shipping methodology
- [[how-ai-is-transforming-work-at-anthropic]] - Broader look at Anthropic's engineering culture
- [[ai-codes-better-than-me-now-what]] - The identity crisis Boris describes around coding skills being commoditized
- [[claude-code-best-practices]] - Practical patterns that align with Boris's described workflow
