# GitHub Repositories

GitHub projects and repositories.

## Detection

- URL contains: github.com
- Type auto-detected as `github`
- Always `isTechnical: true`

## Metadata Collection

**Agent A - Repo Metadata:**
```bash
.claude/skills/adding-notes/scripts/get-github-metadata.sh 'URL'
```

**Agent B - Author Check:**
```bash
.claude/skills/adding-notes/scripts/check-author-exists.sh 'owner'
```

**Agent C - Code Extraction** (always runs):
Extract installation and usage examples from README (see `references/code-extraction.md`).

## Frontmatter

```yaml
---
title: "Repository Name"
type: github
url: "https://github.com/owner/repo"
stars: 7600
language: "Go"
tags:
  - topic-1
  - topic-2
authors:
  - owner-slug
summary: "Brief description of what the repository does."
date: 2026-01-02
---
```

## GitHub-specific Fields

| Field | Required | Description |
|-------|----------|-------------|
| `stars` | Yes | Repository star count (number) |
| `language` | Yes | Primary programming language (string) |

## Body Template

```markdown
## Overview

[What the project does and why it exists]

## Key Features

- Feature 1
- Feature 2

## Code Snippets

Quick examples from the README or docs.

### Installation

```bash
go install github.com/owner/repo@latest
```

### Basic Usage

```go
client := repo.NewClient(repo.Config{
    Timeout: 30 * time.Second,
})
result, err := client.Process(data)
```

## Technical Details

[Architecture, tech stack, notable implementation choices]

## Connections

Related to [[other-tool]] or implements patterns from [[related-concept]].
```

## Code Snippet Rules

**Always include 1-3 snippets** from README showing:
1. Installation command
2. Basic usage example
3. Configuration (if relevant)

See `references/code-extraction.md` for detailed guidelines.

## Special Features

**GitHub Card**: Notes with `type: github` automatically display a card with:
- Language badge
- Star count
- Repository link
