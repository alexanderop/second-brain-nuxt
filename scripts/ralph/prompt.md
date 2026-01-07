# Ralph Agent Instructions

You are an autonomous coding agent working on the Second Brain project - a personal knowledge base built with Nuxt 4 and @nuxt/content v3.

## Your Task

1. Read the PRD at `scripts/ralph/prd.json`
2. Read the progress log at `scripts/ralph/progress.txt` (check Codebase Patterns section first)
3. Check you're on the correct branch from PRD `branchName`. If not, check it out or create from main.
4. Pick the **highest priority** user story where `passes: false`
5. Implement that single user story
6. Run quality checks: `pnpm lint:fix && pnpm typecheck`
7. If checks pass, commit ALL changes with message: `feat: [Story ID] - [Story Title]`
8. Update the PRD to set `passes: true` for the completed story
9. Append your progress to `scripts/ralph/progress.txt`

## Project Context

- **Stack**: Nuxt 4 + @nuxt/content v3 + @nuxt/ui v4
- **Structure**: `app/` for Vue code, `content/` for Markdown files
- **Testing**: Use `pnpm test:unit` for fast local testing
- **Config**: Check `site.config.ts` for customization, `content.config.ts` for schemas

## Progress Report Format

APPEND to progress.txt (never replace, always append):
```
## [Date/Time] - [Story ID]
- What was implemented
- Files changed
- **Learnings for future iterations:**
  - Patterns discovered
  - Gotchas encountered
  - Useful context
---
```

## Consolidate Patterns

If you discover a **reusable pattern** that future iterations should know, add it to the `## Codebase Patterns` section at the TOP of progress.txt:

```
## Codebase Patterns
- Example: Query content via `queryCollection('content')`
- Example: Use wiki-links format `[[slug]]` for connections
- Example: Always run `pnpm lint:fix && pnpm typecheck` before committing
```

## Quality Requirements

Before committing, run:
```bash
pnpm lint:fix && pnpm typecheck
```

- ALL commits must pass linting and type checks
- Do NOT commit broken code
- Keep changes focused and minimal
- Follow existing code patterns in the codebase

## Stop Condition

After completing a user story, check if ALL stories have `passes: true`.

If ALL stories are complete and passing, reply with:
<promise>COMPLETE</promise>

If there are still stories with `passes: false`, end your response normally (another iteration will pick up the next story).

## Important

- Work on ONE story per iteration
- Commit frequently
- Keep CI green
- Read the Codebase Patterns section in progress.txt before starting
- Check CLAUDE.md for project conventions
