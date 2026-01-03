---
name: adding-tweets
description: Add tweets to the Second Brain. Use when the user provides a Twitter/X URL and asks to "add a tweet", "save this tweet", or "capture this tweet".
allowed-tools: Read, Write, Bash, WebFetch, Glob, Grep, Task, TaskOutput, WebSearch
---

# Adding Tweets to Second Brain

Add tweets with author linking, tags, and personal annotations.

## URL Patterns

| Pattern | Action |
|---------|--------|
| `x.com/*/status/*` | Extract tweet |
| `twitter.com/*/status/*` | Extract tweet |

## Workflow

```text
Phase 1: Parse URL → Extract tweet ID and author handle
Phase 2: Scrape Content → Try nitter, fallback to manual
Phase 3: Author Resolution → Check/create author profile
Phase 4: Generate Tweet File → Write to content/tweets/
Phase 5: Open for Editing → User adds tags and annotations
```

### Phase 1: Parse URL

Extract from URL:
- `tweetId`: The numeric ID from `/status/{id}`
- `authorHandle`: The username from `x.com/{username}/status/`

```bash
# Example: https://x.com/naval/status/1789234567890
tweetId="1789234567890"
authorHandle="naval"
```

### Phase 2: Scrape Content

Run the scrape script:
```bash
python3 .claude/skills/adding-tweets/scripts/scrape-tweet.py "https://x.com/naval/status/1234567890"
```

If scraping fails (returns JSON with `error` field), try WebFetch fallback:
```text
WebFetch: https://nitter.poast.org/{authorHandle}/status/{tweetId}
Prompt: Extract the tweet text content, author display name, and the date it was posted.
```

If WebFetch also fails, prompt user for:
- Tweet text (required)
- Posted date (required)
- Author display name (optional, use handle if not provided)

### Phase 3: Author Resolution

1. Check if author exists:
   ```bash
   ls content/authors/{authorHandle}.md
   ```

2. If not exists, create minimal profile:
   ```yaml
   ---
   name: "{Display Name or Handle}"
   slug: {authorHandle}
   socials:
     twitter: "https://x.com/{authorHandle}"
   ---
   ```

3. For full author enhancement, suggest running `/enhance-author {authorHandle}`

### Phase 4: Generate Tweet File

**Slug format:** `tweet-{tweetId}`

**File path:** `content/tweets/tweet-{tweetId}.md`

**Frontmatter template:**
```yaml
---
type: tweet
title: "{First 50 chars of tweet}..."
tweetId: "{tweetId}"
tweetUrl: "{originalUrl}"
tweetText: "{full tweet text}"
author: {authorHandle}
tweetedAt: {YYYY-MM-DD}
tags:
  - {suggested tags}
---

{User's personal annotations go here}
```

### Phase 5: User Editing

After saving, inform user:
- File location
- Suggest adding tags (use `.claude/skills/adding-notes/scripts/list-existing-tags.sh` for suggestions)
- Suggest adding personal annotations in the body
- Suggest wiki-links to related notes

## Tag Suggestions

Based on tweet content, suggest from existing tags:
```bash
.claude/skills/adding-notes/scripts/list-existing-tags.sh
```

Common tweet themes → tags:
- Wisdom, advice → `mindset`, `philosophy`
- Business, startups → `startup`, `business`
- Technology → `tech`, `programming`
- Productivity → `productivity`, `habit`

## Validation

Before saving, verify:
1. Tweet ID is unique (no duplicate file exists)
2. Author profile exists or was created
3. `tweetedAt` is valid date format
4. `tweetText` is not empty
