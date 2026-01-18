---
title: "Stop Bloating Your CLAUDE.md: Progressive Disclosure for AI Coding Tools"
status: ready
tags:
  - claude-code
  - ai-tools
  - developer-experience
  - productivity
core_idea: "AI coding tools are stateless—every session starts fresh with just an array of tokens. The solution isn't cramming everything into CLAUDE.md, but building a layered context system where learnings accumulate in docs, specialized agents load on-demand, and tooling (ESLint, TypeScript) handles what it can."
target_audience: "Developers using Claude Code, Cursor, or Copilot who've noticed their AI keeps making the same mistakes"
reader_outcome: "After reading, they'll have a concrete system for teaching their AI without bloating their instruction files"
created: 2026-01-18
updated: 2026-01-18
---

Here's the thing: every conversation with your AI coding tool starts from zero.

I spent an hour yesterday explaining a Nuxt Content gotcha to Claude. We figured it out together—you need to use `stem` instead of `slug` in page collection queries. Today, Claude made the same mistake. Yesterday's session? Gone. Vanished into the void.

This is the fundamental constraint of AI coding tools. **Your context is just an array of tokens**—a sliding window that forgets everything the moment the conversation ends.[^1]

Here's what your AI actually sees:

```
┌─────────────────────────────────────────────────────────────────┐
│                      CONTEXT WINDOW                             │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ index[0]    │ System prompt + CLAUDE.md                 │    │
│  ├─────────────┼───────────────────────────────────────────┤    │
│  │ index[1]    │ User: "Add a search feature"              │    │
│  ├─────────────┼───────────────────────────────────────────┤    │
│  │ index[2]    │ Assistant: "I'll query the content..."    │    │
│  ├─────────────┼───────────────────────────────────────────┤    │
│  │ index[3]    │ Tool result: [file contents]              │    │
│  ├─────────────┼───────────────────────────────────────────┤    │
│  │ ...         │ ...                                       │    │
│  ├─────────────┼───────────────────────────────────────────┤    │
│  │ index[n]    │ ← You are here                            │    │
│  └─────────────┴───────────────────────────────────────────┘    │
│                                                                 │
│  Yesterday's session?  ┌─────────────────────────────────────┐  │
│                        │  ∅  Not in the array. Doesn't exist │  │
│                        └─────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

There's no hidden memory. No database of past conversations. Just this array, rebuilt fresh every session.

Dex Horthy, creator of the Ralph technique and author of the 12 Factor Agents manifesto, puts it bluntly:[^6]

> "LLMs are stateless, so the only way to improve output is to optimize input through context engineering."

The array is all you have. Everything that isn't in it doesn't exist to the model. And here's the kicker: that array has a size limit. Fill it with noise, and you're doing all your work in what Dex calls the "dumb zone"—where model performance degrades because there's too much irrelevant context competing for attention.

Most developers respond to this by cramming every lesson learned into their `CLAUDE.md` file. I've seen files balloon to 2000 lines. Style guides, architectural decisions, war stories from that one bug that took three days to fix.

The irony? This makes things worse.

## The Wrong Reflex

When Claude makes a mistake, the instinct is to add a rule: "Never use `slug` in page collection queries—use `stem` instead."

Then another mistake, another rule. Then another.

Before long, your CLAUDE.md looks like this:

```markdown
# CLAUDE.md

## Project Overview
...50 lines...

## Code Style
...200 lines of formatting rules...

## Architecture Decisions
...150 lines of historical context...

## Gotchas
...300 lines of edge cases...

## Testing Conventions
...100 lines...
```

**Half your context budget is gone before any work begins.**

HumanLayer keeps their CLAUDE.md under 60 lines.[^2] Frontier LLMs reliably follow 150-200 instructions—and Claude Code's system prompt already uses about 50 of those.[^2]

The math doesn't work. You can't stuff everything in one file.

## Let Tooling Do Tooling's Job

Here's what I stopped putting in CLAUDE.md: anything a tool can enforce.

❌ **Don't write prose about style rules:**
```markdown
## Code Style
- Use 2-space indentation
- Prefer single quotes
- Always add trailing commas
- Maximum line length: 100 characters
```

✅ **Let ESLint handle it:**
```json
{
  "extends": ["@nuxt/eslint-config"]
}
```

The AI can run `pnpm lint:fix && pnpm typecheck` and know immediately if it violated a rule. No interpretation needed. No ambiguity.

**If a tool can enforce it, don't write prose about it.** ESLint for style. TypeScript for types. Prettier for formatting. These rules are verifiable, not interpretable.

My CLAUDE.md now just says:

```markdown
Run `pnpm lint:fix && pnpm typecheck` after code changes.
```

One line instead of two hundred.

## But Some Things Can't Be Linted

ESLint won't catch this:

> "Nuxt Content v3 caches aggressively in `.data/`. When you modify transformation logic in hooks, you must clear the cache to test changes."

Or this:

> "Don't mock `@nuxt/content/server` internals in tests—it breaks when Nuxt Content updates. Extract pure logic to `server/utils/` instead."

Or this:

> "Wiki-links to data collections require path prefixes. Use `[[authors/john-doe]]`, not `[[john-doe]]`."

These are *gotchas*—non-obvious behaviors that bite you once. The kind of thing you'd tell a new team member on their first day. They need documentation, but they don't belong in CLAUDE.md.

**The key insight: CLAUDE.md is for universal context. Gotchas are situational.**

You don't need the wiki-link prefix rule in every conversation—only when you're writing content with author links. Loading it every time wastes tokens.[^3]

## The /learn Pattern

Here's my system. When I notice Claude struggling with something we've solved before, I run `/learn`.

This is a Claude Code skill I built. It:

1. Analyzes the conversation for reusable, non-obvious insights
2. Finds the right place in `/docs` to save it (or proposes a new file)
3. Asks for my approval before saving

The result is a growing knowledge base in my docs folder:

```
docs/
├── nuxt-content-gotchas.md    # 15 hard-won lessons
├── nuxt-component-gotchas.md  # Vue-specific pitfalls
├── testing-strategy.md        # When to use which test type
└── SYSTEM_KNOWLEDGE_MAP.md    # Architecture overview
```

**CLAUDE.md stays stable.** It just tells Claude where to look:

```markdown
## Further Reading

- `docs/nuxt-content-gotchas.md` - Nuxt Content v3 pitfalls
- `docs/testing-strategy.md` - Test layers and when to use each
```

When Claude needs to work with Nuxt Content, it reads the gotchas doc. When it's writing tests, it reads the testing strategy. Progressive disclosure—the right context at the right time.[^2]

## Layered Context with Agents

I take this further with custom agents. Each agent has its own documentation file that loads only when needed:

```
.claude/agents/
├── nuxt-content-specialist.md   # Content queries, MDC, search
├── nuxt-ui-specialist.md        # Component styling, theming
├── vue-specialist.md            # Reactivity, composables
└── nuxt-specialist.md           # Routing, config, deployment
```

When I'm debugging a content query, Claude loads the nuxt-content-specialist. When I'm styling a component, it loads nuxt-ui-specialist. The specialist agents know to fetch the latest documentation from official sources—they don't rely on stale training data.

Here's how the layers work:

```
┌─────────────────────────────────────────────────────┐
│                    CLAUDE.md                        │
│           (Entry point - ~50 lines)                 │
│    Stack overview, commands, pointers to docs       │
└─────────────────────┬───────────────────────────────┘
                      │
        ┌─────────────┴─────────────┐
        ▼                           ▼
┌───────────────────┐     ┌───────────────────┐
│      /docs        │     │  .claude/agents   │
│  (Learnings)      │     │  (Specialists)    │
│                   │     │                   │
│ • gotchas         │     │ • nuxt-content    │
│ • patterns        │     │ • nuxt-ui         │
│ • architecture    │     │ • vue             │
└───────────────────┘     └───────────────────┘
        │                           │
        └─────────────┬─────────────┘
                      ▼
            Loaded on demand
```

**The stateless nature of AI tools isn't a bug to fight—it's a constraint to design around.**[^4]

## The Feedback Loop That Compounds

Here's where it gets powerful. This system creates a feedback loop:

1. Claude makes a mistake
2. We fix it together in the conversation
3. I run `/learn` to capture the insight
4. The learning gets saved to the right doc
5. Next session, Claude reads the doc and avoids the mistake

Over time, my `/docs` folder becomes a curated knowledge base of *exactly the things AI coding tools get wrong* in my codebase. It's like fine-tuning, but under my control.

Boris Cherny's team at Anthropic does this multiple times per week. Every team member contributes. They describe their codebase as a "self-correcting organism."[^5]

Here's an actual entry from my `nuxt-content-gotchas.md`:

```markdown
## Page Collection Queries: Use `stem` Not `slug`

The `slug` field doesn't exist in page-type collections.
Use `stem` (file path without extension) instead:

// ❌ Fails: "no such column: slug"
queryCollection('content').select('slug', 'title').all()

// ✅ Works
queryCollection('content').select('stem', 'title').all()
```

Claude will never make this mistake again in my project. Not because I added it to CLAUDE.md—but because when it's working with content queries, it reads the gotchas doc first.

## Keep CLAUDE.md Boring

My CLAUDE.md is about 50 lines. Here's the structure:

```markdown
# CLAUDE.md

Second Brain is a personal knowledge base using
Zettelkasten-style wiki-links.

## Commands
pnpm dev          # Start dev server
pnpm lint:fix     # Auto-fix linting issues
pnpm typecheck    # Verify type safety

Run `pnpm lint:fix && pnpm typecheck` after code changes.

## Stack
- Nuxt 4, @nuxt/content v3, @nuxt/ui v3

## Structure
- `app/` - Vue application
- `content/` - Markdown files
- `content.config.ts` - Collection schemas

## Further Reading
- `docs/nuxt-content-gotchas.md`
- `docs/testing-strategy.md`
- `docs/SYSTEM_KNOWLEDGE_MAP.md`
```

That's it. Universal context only. Everything else lives in docs, agents, or tooling.

## What This Looks Like in Practice

Yesterday I was implementing semantic search. Claude suggested using `slug` in a query. I corrected it—we use `stem` for page collections. Claude apologized and fixed it.

Then I ran `/learn`.

Claude analyzed the conversation, found the existing entry in `nuxt-content-gotchas.md`, and noted that we'd already captured this pattern. No duplicate needed.

But during the same session, we discovered something new: `queryCollectionSearchSections` returns IDs with a leading slash. Don't add another slash when constructing URLs.

```markdown
## Search Section IDs

Returns IDs with leading slash (`/slug#section`).
Don't add another slash when constructing URLs.
```

That got added. Next time I work on search, Claude will know.

---

The stateless nature of AI tools isn't something to fight. It's a design constraint—like limited screen real estate or slow network connections. Once you accept it, you can build systems that work with it.

**Keep CLAUDE.md minimal. Let tooling enforce what it can. Capture learnings as you go. Load context on demand.**

The AI forgets. Your documentation doesn't.

What patterns have you found for teaching your AI coding tools? I'm curious how others are solving this.

---

[^1]: LLMs have no memory between sessions—context is just tokens in a sliding window. See Factory's analysis in [The Context Window Problem](https://factory.ai/news/context-window-problem).

[^2]: HumanLayer's guide on [Writing a Good CLAUDE.md](https://www.humanlayer.dev/blog/writing-a-good-claude-md) recommends keeping files under 60 lines and using progressive disclosure for detailed instructions.

[^3]: Larger context windows don't help—they degrade quality through uneven attention and drown the model in irrelevant information. Factory's [context stack approach](https://factory.ai/news/context-window-problem) delivers the right information at the right time instead.

[^4]: The [12 Factor Agents](https://www.humanlayer.dev/blog/12-factor-agents) manifesto calls this "Own Your Context Window"—small, focused agents outperform monolithic ones because they stay within context limits.

[^5]: Boris Cherny's team at Anthropic adds mistakes to their documentation multiple times per week, creating what they call a "self-correcting organism." See [Self-Improving Skills in Claude Code](https://www.youtube.com/watch?v=-4nUCaMNBR8).

[^6]: Dex Horthy, [No Vibes Allowed: Solving Hard Problems in Complex Codebases](https://www.youtube.com/watch?v=rmvDxxNubIg). Dex is the founder of HumanLayer and creator of the Ralph technique for autonomous AI coding. His [12 Factor Agents](https://www.humanlayer.dev/blog/12-factor-agents) manifesto includes "Make Your Agent a Stateless Reducer" as Factor 12.

## Distribution

### Teaser Hook

Every AI coding session starts from zero. Yesterday's hard-won lesson about your codebase? Gone. Most devs respond by bloating their CLAUDE.md to 2000 lines. Here's why that backfires—and what to do instead.

### Thread Points

1. AI coding tools are stateless. Your context is just tokens in a sliding window. The careful explanation you gave yesterday vanishes when the session ends.

2. The natural reflex—stuff everything into CLAUDE.md—backfires. Half your context budget is gone before work begins. HumanLayer keeps theirs under 60 lines. LLMs reliably follow ~150 instructions max.

3. If a tool can enforce it, don't write prose about it. ESLint for style, TypeScript for types, Prettier for formatting. My CLAUDE.md went from 200 lines of style rules to one line: "Run lint:fix && typecheck after changes."

4. But some things can't be linted: framework gotchas, caching behaviors, architectural patterns. These need docs—but loaded on demand, not in every conversation.

5. The system: When Claude struggles with something we've solved before, I run /learn. It captures the insight to /docs. CLAUDE.md stays minimal—just pointers to relevant docs.

6. The feedback loop compounds. Claude makes mistake → we fix it → /learn captures it → next session Claude reads the doc → no mistake. Your docs become a knowledge base of exactly what AI tools get wrong.

### Pull Quotes

- "The stateless nature of AI tools isn't a bug to fight—it's a constraint to design around."
- "If a tool can enforce it, don't write prose about it."
- "The AI forgets. Your documentation doesn't."
