# Code Extraction

Guidelines for extracting code snippets from technical content.

## When to Extract

Content triggers code extraction if `isTechnical: true`. Set this flag when ANY:

| Signal | Examples |
|--------|----------|
| Type | `github`, `course` |
| URL domain | github.com, stackoverflow.com, dev.to, hashnode.dev, medium.com (tech), smashingmagazine.com, egghead.io |
| Title contains | code, api, sdk, tutorial, implement, build, programming, developer, library, framework, typescript, javascript, python, vue, react |
| Content discusses | implementation details, code examples, CLI commands, configuration |

---

## Agent Configuration

Spawn code extraction agent in parallel with other Phase 2 agents:

```
Task: "Extract practical code snippets from [SOURCE].

Source-specific strategy:
- YouTube/Podcast: Parse transcript for code patterns
- Article: Extract fenced code blocks from WebFetch content
- GitHub: Extract from README (installation, quick start, basic usage)
- Reddit: Extract from top-voted comments with code

Return: Array of {code, language, purpose, lines} objects.
Keep only snippets that are 5-30 lines and self-contained."

run_in_background: true
```

---

## Source-Specific Strategies

### YouTube Transcript Patterns

Look for:
- Variable declarations: `const`, `let`, `var`, `function`, `class`
- Imports: `import`, `from`, `require`
- CLI commands: lines starting with `$`, `>`, `npm`, `pnpm`, `yarn`, `git`

**Spoken code reconstruction:**
| Spoken | Code |
|--------|------|
| "equals" | `=` |
| "dot" | `.` |
| "open paren" / "close paren" | `()` |
| "arrow function" | `=>` |
| "backtick" | `` ` `` |
| "curly braces" | `{}` |
| "square brackets" | `[]` |

**Note:** Add verification note if reconstructed from spoken code:
```markdown
> Reconstructed from spoken code—verify against video
```

### Article Code Extraction

1. Find all fenced code blocks (` ```lang ... ``` `)
2. Prioritize blocks that:
   - Follow "Example:", "Here's how:", "Usage:" headings
   - Contain complete implementations (not just imports)
   - Show the "after" in before/after comparisons
3. Skip: import-only blocks, single-line examples, incomplete fragments

### GitHub README Extraction

Target sections:
- "Quick Start"
- "Getting Started"
- "Installation"
- "Usage"
- "Example"

Extract:
- Installation commands
- Basic usage patterns
- Configuration examples

Skip:
- Badges
- Contributing guidelines
- License sections

### Reddit Comments

- Extract from top-voted comments containing code
- Prioritize upvoted solutions
- Include comment context as explanation

---

## Snippet Selection Criteria

From extracted snippets, choose **1-3** based on:

| Priority | Criteria |
|----------|----------|
| 1 | Demonstrates the **core concept** of the resource |
| 2 | **Self-contained** (works without extensive context) |
| 3 | **Practical** (you'd actually copy-paste this) |
| 4 | **Non-obvious** (teaches something, not boilerplate) |

### Good Snippets

- Core API usage patterns
- Configuration examples
- Common gotchas with fixes
- Reusable utility functions
- "After" in before/after comparisons

### Skip These

- Import-only blocks
- Framework scaffolding / boilerplate
- Obvious/trivial examples
- Incomplete fragments requiring surrounding code
- Invented examples (if source has none, skip section entirely)

---

## Formatting

```markdown
## Code Snippets

### [Pattern/Purpose Name]

Brief explanation of what this demonstrates (1 sentence).

```language
// the actual code
```
```

### Rules

- **5-20 lines** per snippet (trim if longer)
- Use **correct language tag** for syntax highlighting
- **One-line explanation** above each block
- **Descriptive H3 headings** (not "Example 1")

---

## Edge Cases

| Situation | Action |
|-----------|--------|
| No snippets extracted | Skip "Code Snippets" section entirely |
| Source is conceptual (no code in original) | Skip section, don't invent examples |
| Transcript code unclear | Add note: "Reconstructed from spoken code—verify against video" |
| Only 1 good snippet exists | Include just that one (don't pad with weak examples) |
| All snippets are boilerplate | Skip section, note "No unique code patterns" |
