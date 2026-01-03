# Tweets Collection Specification

## Overview

A dedicated collection for capturing and organizing tweets. Tweets are linked to authors, support wiki-links, and can include personal annotations.

## Summary

| Aspect | Decision |
|--------|----------|
| Input method | Tweet URL via CLI skill |
| Content type | Separate `tweets` collection |
| Metadata | Minimal (author, date, text) |
| Author page | Separate "Tweets" section |
| List page | None - access via author pages only |
| Display | Card style (avatar + text + date) |
| Slug format | Tweet ID (e.g., `tweet-1234567890`) |
| Wiki-links | Full support |
| Rating | Not supported |
| Tags | Supported |
| API | None - manual scraping/parsing |

---

## Data Model

### Frontmatter Schema

```yaml
---
type: tweet
title: "Brief description or first words of tweet"
tweetId: "1234567890"           # Twitter/X tweet ID
tweetUrl: "https://x.com/..."   # Original URL
tweetText: "The full tweet content goes here..."
author: naval                    # Author slug (wiki-link target)
tweetedAt: 2024-01-15           # Date tweet was posted
tags:
  - productivity
  - startup
---
```

### Body Content

Personal annotations, thoughts, or notes about the tweet. The tweet text itself lives in `tweetText` frontmatter field.

```markdown
---
type: tweet
tweetId: "1789234567890"
tweetText: "Specific knowledge is found by pursuing your genuine curiosity..."
author: naval
tweetedAt: 2024-01-15
tags:
  - career
  - knowledge
---

This resonates with [[how-to-find-your-niche]] - the idea that authentic interest compounds into expertise.

Related to [[building-wealth]] chapter on leverage.
```

---

## Collection Definition

```typescript
// content.config.ts
const tweets = defineCollection({
  type: 'page',
  source: 'tweets/*.md',  // or flat with type filter
  schema: z.object({
    type: z.literal('tweet'),
    title: z.string(),
    tweetId: z.string(),
    tweetUrl: z.string().url(),
    tweetText: z.string(),
    author: z.string(),  // Author slug
    tweetedAt: z.coerce.date(),
    tags: z.array(z.string()).optional(),
  }),
})
```

---

## File Structure

```
content/
├── tweets/
│   ├── tweet-1789234567890.md
│   ├── tweet-1801234567890.md
│   └── tweet-1823456789012.md
└── authors/
    └── naval.md
```

---

## UI Components

### TweetCard

Card-style display for tweet content.

**Elements:**
- Author avatar (from author profile)
- Tweet text content
- Posted date
- Link to original tweet (external)

**Props:**
```typescript
interface TweetCardProps {
  tweetText: string
  author: {
    name: string
    slug: string
    avatar?: string
    twitterHandle?: string
  }
  tweetedAt: Date
  tweetUrl: string
}
```

**Visual:**
```
┌─────────────────────────────────────────┐
│ [Avatar]  Author Name                   │
│           @handle                       │
│                                         │
│ Tweet text content goes here and can    │
│ wrap to multiple lines as needed...     │
│                                         │
│ Jan 15, 2024                    ↗ Link  │
└─────────────────────────────────────────┘
```

### TweetHeader

Header for individual tweet page (similar to ContentHeader).

**Elements:**
- TweetCard (the tweet itself)
- Tags
- Personal annotations below

---

## Author Page Integration

### Separate Sections

Author pages display two distinct sections:

```
┌─────────────────────────────────────────┐
│ [Avatar]  Naval Ravikant                │
│ Bio text...                             │
├─────────────────────────────────────────┤
│ ## Notes (3)                            │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐    │
│ │ Note 1  │ │ Note 2  │ │ Note 3  │    │
│ └─────────┘ └─────────┘ └─────────┘    │
├─────────────────────────────────────────┤
│ ## Tweets (5)                           │
│ ┌─────────────────────────────────────┐ │
│ │ Tweet card 1                        │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ Tweet card 2                        │ │
│ └─────────────────────────────────────┘ │
│ ...                                     │
└─────────────────────────────────────────┘
```

### Query Pattern

```typescript
// Fetch author's tweets
const tweets = await queryCollection('tweets')
  .where('author', '=', authorSlug)
  .order('tweetedAt', 'desc')
  .all()

// Fetch author's notes (existing content)
const notes = await queryCollection('content')
  .where('author', '=', authorSlug)
  .all()
```

---

## CLI Skill: `/add-tweet`

### Usage

```
/add-tweet https://x.com/naval/status/1234567890
```

### Workflow

1. **Parse URL** - Extract tweet ID from URL
2. **Scrape content** - Fetch tweet text, author handle, date (manual/nitter)
3. **Resolve author** - Check if author exists
4. **Auto-create author** - If not exists, create minimal author profile
5. **Generate slug** - `tweet-{tweetId}`
6. **Create file** - Write `content/tweets/tweet-{id}.md`
7. **Open for editing** - Allow adding tags and annotations

### Author Auto-Creation

When tweet author doesn't exist:

```yaml
# content/authors/{handle}.md
---
type: author
name: "Naval Ravikant"  # Parsed from profile
slug: naval
twitterHandle: naval
---
```

Minimal profile that can be enhanced later with `/enhance-author`.

### Scraping Strategy

Without API access, the skill should:

1. Try fetching via nitter instances (privacy-friendly Twitter frontend)
2. Fall back to prompting user to paste tweet text manually
3. Parse: author handle, tweet text, date from URL/content

```python
# Pseudocode for scraping
def get_tweet_data(url: str) -> TweetData:
    tweet_id = extract_id_from_url(url)

    # Try nitter instances
    for nitter_instance in NITTER_INSTANCES:
        try:
            return scrape_nitter(nitter_instance, tweet_id)
        except:
            continue

    # Fallback: prompt user
    return prompt_manual_entry(tweet_id)
```

---

## Routing

| Route | Purpose |
|-------|---------|
| `/tweets/tweet-{id}` | Individual tweet page |
| `/authors/{slug}` | Author page (includes tweets section) |

No `/tweets` index page - tweets are accessed via author pages.

---

## Wiki-Link Support

Tweets are fully linkable:

```markdown
This reminds me of [[tweet-1234567890]] where Naval talks about...
```

Rendered as a link to the tweet page, showing tweet preview on hover (if implemented).

---

## Migration Notes

### Required Changes

1. **content.config.ts** - Add `tweets` collection definition
2. **Author schema** - Add optional `twitterHandle` field
3. **Author page** - Add tweets section with query
4. **Components** - Create `TweetCard.vue`, `TweetHeader.vue`
5. **Skill** - Create `/add-tweet` skill with scraping script

### New Files

```
app/
├── components/
│   ├── TweetCard.vue
│   └── TweetHeader.vue
├── pages/
│   └── tweets/
│       └── [...slug].vue
content/
└── tweets/
    └── .gitkeep
.claude/skills/
└── adding-tweets/
    ├── SKILL.md
    └── scripts/
        └── scrape-tweet.py
```

---

## Open Questions

1. **Thread support** - Should we support capturing entire threads? (Currently: no)
2. **Media** - Handle tweets with images/videos? (Currently: text only)
3. **Retweets/quotes** - Capture quoted tweets? (Currently: no)
4. **Engagement metrics** - Store likes/retweets? (Currently: no, minimal metadata)
