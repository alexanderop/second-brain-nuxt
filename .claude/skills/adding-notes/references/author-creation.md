# Author Creation Guide

Detailed guidance for creating author profiles in Phase 3.

## When Authors Are Required

External content types require authors in frontmatter:
- youtube, podcast, article, book, manga, movie, tv, tweet, course, reddit, github

## Author Creation Workflow

For each author not found via Glob search:

1. **WebSearch**: `[Author Name] official site bio`
2. **Extract**:
   - `bio`: 1-2 sentence professional description
   - `avatar`: Profile image URL (prefer GitHub, Twitter, official headshots)
   - `website`: Personal/official website
   - `socials`: twitter, github, linkedin, youtube handles (not full URLs)

3. **Write frontmatter directly** (no script needed):
   ```yaml
   ---
   name: "Author Name"
   slug: "author-name"
   bio: "1-2 sentence description"
   avatar: "https://..."
   website: "https://..."
   socials:
     twitter: "handle"
     github: "handle"
     linkedin: "handle"
     youtube: "handle"
   ---
   ```

4. **Save**: `content/authors/{slug}.md`
   - Slug = lowercase name, spaces to hyphens (e.g., "Christina Marfice" → "christina-marfice")

## Avatar Fallbacks

**Priority order:**
1. Official headshot from website
2. Twitter profile image
3. GitHub avatar: `https://avatars.githubusercontent.com/[github-handle]`

If GitHub handle is known but no other avatar found:
```text
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

## Author Lookup (No Scripts)

Use Glob tool instead of scripts:

```text
# Check if author exists
Glob: content/authors/*{lastname}*.md

# Example: checking for "Christina Marfice"
Glob: content/authors/*marfice*.md
```

If partial matches found, read the files to verify identity before reusing or creating new.

## Frontmatter Template

```yaml
---
name: "Author Name"
slug: "author-name"
aliases:                    # Optional: alternate names for lookup
  - "Full Legal Name"
  - "Common Nickname"
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

## Handling Partial Matches

When Glob returns potential matches:

1. **Review the candidates** - Read the matched files to verify
2. **If it's the same person** - Use the existing slug, don't create duplicate
3. **If truly different** - Proceed with creation
4. **Add aliases** - If the existing author lacks the alternate name, add it to their `aliases` field

Example: "David Heinemeier Hansson" → Glob finds `dhh.md`. Read it, confirm it's the same person, use `dhh` as the author slug.
