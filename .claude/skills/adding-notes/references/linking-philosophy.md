# Linking Philosophy

## Core Principles

1. **Quality over quantity** - One genuine connection beats two forced ones. Future you needs to trust the link graph.
2. **Context is mandatory** - Every link needs explanation. Future you needs to know WHY these notes relate.
3. **Organic connections only** - If you wouldn't naturally reference a note when discussing the topic, don't link it.
4. **Orphans are acceptable** - A standalone note is better than one with forced, misleading connections.

## Connection Types (Priority Order)

| Type | Description | Example Context |
|------|-------------|-----------------|
| Same creator | Works by same author/speaker | "Another perspective from the same author" |
| Direct reference | Explicitly cites or responds to | "Directly builds on the framework in..." |
| Same series | Part of course, book series, podcast | "Episode in the same series as..." |
| Shared core concept | Same primary topic | "Both explore the principles of..." |
| Contrasting view | Offers alternative perspective | "Presents a different approach than..." |
| Practical application | Applies theory to practice | "These concepts apply directly to..." |

## Link Context Format

Every wiki-link must have adjacent explanation text. Never use bare links.

**Bad:**
```markdown
## Related

See also [[note-1]] and [[note-2]].
```

**Good:**
```markdown
## Connections

- [[note-1]] - Same author explores this theme from a different angle
- [[note-2]] - Provides the theoretical foundation for these ideas
```

## Standards

- **Context sentence** for each link explaining the relationship
- **Same-author check** - always search for other works by the author
- **Tag-based discovery** - grep for notes sharing the same tags
- **No forced links** - if nothing genuinely relates, save without connections

## Discovery Checklist

Before saving any note:

1. Check if the author has other works in the knowledge base (highest priority)
2. For each tag, grep for notes with that tag
3. For each candidate, ask: "Would I naturally reference this when discussing the topic?"
4. Only add connections that pass the organic test

## Anti-Patterns to Avoid

| Anti-Pattern | Problem | Fix |
|--------------|---------|-----|
| Bare links without context | `See also [[note]]` | Add explanation: `[[note]] - explains why...` |
| Forced connections | Links added to meet a quota | Don't link—save as standalone instead |
| Tenuous tag overlap | "Both tagged with 'programming'" | Only link if discussing same specific concept |
| Linking unread notes | Can't explain relationship properly | Read the note first or don't link |
| Over-linking to hubs | Every note links to same MOC | Link to specific notes, not just hubs |

## When to Create a New MOC

If a tag has 15+ notes and no dedicated MOC exists, consider creating one. MOCs provide:

- Entry points for exploration
- Visual clustering in the knowledge graph
- Learning paths through related content

## Link Density Guide

| Count | Status | Notes |
|-------|--------|-------|
| 0 | Standalone | Fine when no genuine connections exist |
| 1-2 | Connected | Normal for most notes |
| 3-4 | Well-connected | Good for central topics |
| 5+ | Hub-like | Reserved for foundational concepts |
