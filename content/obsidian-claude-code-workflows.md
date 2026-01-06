---
title: "Obsidian + Claude Code Workflows"
type: tweet
url: "https://x.com/kepano/status/2007223691315499199"
tags:
  - claude-code
  - knowledge-management
  - ai-tools
  - productivity
authors:
  - steph-ango
summary: "Community-sourced patterns for combining Obsidian vaults with Claude Code: master context files, batch editing, backlink discovery, and metadata management."
date: 2026-01-02
---

## Original Thread

> **@kepano**: if you're using Obsidian with Claude Code, tell me about your workflow, and what you've used it for
>
> **@alexanderOpalic**: I created my own obsidian like with Nuxt and nuxt content. My workflow is that I can copy past notes easy and Claude code will fetch YouTube transcripts and find the author he will then add everything into my second brain.
>
> **@internetvin**: I am using this combination so much. I have started maintaining specific master context files in Obsidian that I repeatedly pass into Claude Code instead of explaining things repeatedly. I have a file like this now for every major project or area of my life that I'm working on right now. When I work on something significant or make progress I'll ask Claude Code to review the master context file and adjust based on what's happened.
>
> I have a sub agent called cross-file-patterns that I use to find patterns across files related to something I am working on, I'll search a specific term in Obsidian, then get all the file names references using copy search results and send that to the sub agent which finds comprehensive patterns across those files.
>
> **@belindmo**: I used Claude code yesterday to review 2025, and I have all my goals from the last few years on there, asked it to find trends! To help plan 2026
>
> **@poetengineer__**: 1. batch editing that use more complicated bash commands i wouldn't have done otherwise: adding links, editing properties, .etc; 2. create specific folders for current projects that im working on and load all the notes/pdfs/there for claude to read. make claude put on a critique
>
> **@davidhoang**: Identify new backlinks to add, synthesize knowledge base and generate summaries, batch re-organization.
>
> **@jmduke**: mass metadata editing, mostly, also "insert backlinks that I missed"

## Emerging Patterns

The thread reveals several distinct workflow categories:

**Master Context Files** — @internetvin's approach of maintaining project-specific context files that persist across Claude sessions. When progress happens, Claude updates the context file itself, creating a living record.

**Batch Operations** — Multiple users leverage Claude Code for operations too tedious to do manually: mass property edits, backlink insertion, file reorganization. Claude handles the bash complexity.

**Knowledge Synthesis** — Using Claude to analyze an entire vault: find trends in goals (@belindmo), identify missing backlinks (@davidhoang, @jmduke), generate summaries.

**Cross-File Pattern Detection** — @internetvin's subagent approach: search Obsidian, copy result file names, pass to Claude for pattern analysis across those specific files.

## Connections

- [[teaching-claude-code-my-obsidian-vault]] - Detailed walkthrough of the CLAUDE.md approach for vault integration
- [[claude-code-skills]] - Skills enable the automated workflows mentioned here, like adding notes or fetching transcripts
