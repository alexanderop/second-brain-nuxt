---
title: "Teaching Claude Code My Obsidian Vault"
type: article
url: "https://mauriciogomes.com/teaching-claude-code-my-obsidian-vault"
tags:
  - claude-code
  - productivity
  - knowledge-management
  - ai-tools
authors:
  - mauricio-gomes
summary: "Using CLAUDE.md to give Claude Code persistent context about your personal knowledge base, preferences, and workflows."
date: 2025-08-09
---

## Summary

Claude Code sessions start with a blank slate, knowing nothing about your note organization, coding preferences, or accumulated knowledge. The solution is a `CLAUDE.md` file at the root of your Obsidian vault that Claude Code reads at the start of every session.

## Key Concepts

- **CLAUDE.md**: A configuration file Claude Code auto-loads, containing instructions about vault organization, coding preferences, and custom workflows
- **Knowledge layer**: Context files defining interests, collections, and research areas that personalize Claude's responses
- **Spotlight integration**: Using macOS's `mdfind` to search through PDFs, research papers, and scanned documents in the vault

## Code Snippets

### Searching documents with Spotlight

```bash
mdfind -onlyin ~/Documents/mauricio "quantum computing"
```

### Extracting text from PDFs

```bash
textutil -convert txt interesting-paper.pdf -output - extracted.txt
```

## Practical Applications

1. **Daily notes**: Say "add this to my notes" and Claude knows the exact path and naming convention
2. **Personalized research**: Claude filters results based on your interests file
3. **PDF retrieval**: Find that paper you scanned years ago through natural language search
4. **Recommendations**: Get suggestions based on your tracked collections

## Related

See also [[writing-a-good-claude-md]].
