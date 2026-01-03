# Author Creation Guide

Detailed guidance for creating author profiles in Phase 3.

## When Authors Are Required

External content types require authors in frontmatter:
- youtube, podcast, article, book, manga, movie, tv, tweet, course, reddit, github

## Author Creation Workflow

For each author marked `NOT_FOUND` in Phase 2:

1. **WebSearch**: `[Author Name] official site bio`
2. **Extract**:
   - `bio`: 1-2 sentence professional description
   - `avatar`: Profile image URL (prefer GitHub, Twitter, official headshots)
   - `website`: Personal/official website
   - `socials`: twitter, github, linkedin, youtube handles (not full URLs)

3. **Generate frontmatter**:
   ```bash
   .claude/skills/adding-notes/scripts/generate-author-frontmatter.sh "Name" \
       --bio "Description" \
       --avatar "URL" \
       --website "URL" \
       --twitter "handle" \
       --github "handle"
   ```

4. **Save**: `content/authors/{slug}.md` where slug is kebab-case of name

## Avatar Fallbacks

**Priority order:**
1. Official headshot from website
2. Twitter profile image
3. GitHub avatar: `https://avatars.githubusercontent.com/[github-handle]`

If GitHub handle is known but no other avatar found:
```
https://avatars.githubusercontent.com/ccssmnn
```

## Special Cases

### Reddit Authors

- Use `u/username` format (e.g., `u/mario_candela`)
- Filename: `u-username.md` (e.g., `u-mario-candela.md`)
- **Skip WebSearch** — create minimal profile (pseudonymous users)
- Minimal profile: name and slug only

### Author Not Found Online

- Create minimal profile with name only
- Log: "Created minimal profile for [Author] - bio not found"
- Still try GitHub avatar if handle known

### Organizations as Authors

- Treat like regular authors (e.g., "HumanLayer Team")
- Avatar can be company logo
- Socials are company accounts

## Scripts Reference

```bash
# Check if author exists
.claude/skills/adding-notes/scripts/check-author-exists.sh "Author Name"

# List all existing authors
.claude/skills/adding-notes/scripts/list-existing-authors.sh

# Search for similar names
.claude/skills/adding-notes/scripts/list-existing-authors.sh "partial-name"

# Generate author frontmatter
.claude/skills/adding-notes/scripts/generate-author-frontmatter.sh "Name" \
    --bio "..." --avatar "..." --website "..." \
    --twitter "..." --github "..." --linkedin "..." --youtube "..."
```

## Frontmatter Template

```yaml
---
name: "Author Name"
slug: "author-name"
avatar: "https://..."
bio: "1-2 sentence description"
website: "https://..."
socials:
  twitter: "handle"
  github: "handle"
  linkedin: "handle"
  youtube: "handle"
---
```
