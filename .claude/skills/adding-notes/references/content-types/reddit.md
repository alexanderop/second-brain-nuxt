# Reddit Threads

Reddit discussions and posts.

## Detection

- URL contains: reddit.com
- Type auto-detected as `reddit`

## Metadata Collection

**Agent A - Thread Content:**
```bash
python3 .claude/skills/adding-notes/scripts/get-reddit-thread.py 'URL' --comments 10
```

**Agent B - Author Check:**
```bash
.claude/skills/adding-notes/scripts/check-author-exists.sh 'u/username'
```

**Note:** Author format uses `u/` prefix (e.g., `u/mario_candela`).

## Frontmatter

```yaml
---
title: "Thread Title"
type: reddit
url: "https://www.reddit.com/r/..."
tags:
  - topic-1
  - topic-2
authors:
  - u-username
summary: "Core insight: What key takeaway emerged from this discussion? (assertion, not description)"
date: 2026-01-01
---
```

## Body Template

```markdown
## Summary

[Core question or topic being discussed]

## Key Points from OP

- Main argument or question
- Supporting context provided

## Notable Comments

> "Quote from highly-upvoted comment"
>
> — u/commenter (X points)

> "Another insightful response"
>
> — u/other_user (Y points)

## Discussion Takeaways

- Key consensus or insights
- Notable counterarguments

## Connections

[Each link must explain WHY you're connecting these notes. Minimum 2 links required.]

- [[related-topic]] - [1-sentence explanation of the relationship]
- [[another-note]] - [1-sentence explanation of the relationship]
```

## Error Handling

| Error | Recovery |
|-------|----------|
| 429 rate limit | Wait 60s and retry |
| Quarantined subreddit | Manually copy content |
| Thread deleted | Note "Thread no longer available" |

## Notes

- Reddit author slugs use `u-` prefix in filename: `content/authors/u-username.md`
- Include upvote counts for context on comment quality
- Focus on top-voted comments for key insights

---

## Diagram Evaluation

**Priority: LOW** — Reddit discussions rarely present formal frameworks.

**Default action:** Skip unless a highly-upvoted comment explains a visual process.

**Log outcome:** `✓ No diagram needed: Discussion thread without visual concepts`
