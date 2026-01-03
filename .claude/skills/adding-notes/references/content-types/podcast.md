# Podcast Episodes

Podcast episodes link to their parent show via the `podcast` field.

## Detection

Content is a podcast if:
- URL: spotify.com/episode, podcasts.apple.com/episode
- YouTube from known podcast channel (see `youtube.md` for list)
- Title/description signals: "podcast", "episode", "ep.", "#123", "today's guest"
- Duration 1-3 hours with conversation format

---

## Metadata Collection

**Agent A - Episode Metadata:**
- For YouTube podcasts: `get-youtube-metadata.sh`
- For Spotify/Apple: WebFetch to extract title, show name, description

**Agent B - Podcast Profile Check:**
```bash
ls content/podcasts/ | grep -i "show-name-slug"
```
If NOT found → see `references/podcast-profile-creation.md`

**Agent C - Platform URLs:**
Search for episode on multiple platforms:
- Spotify: `site:open.spotify.com "Episode Title"`
- Apple: `site:podcasts.apple.com "Episode Title"`
- YouTube: `site:youtube.com "Episode Title" "Show Name"`

**Agent D - Transcript Sourcing:**

| Priority | Source | Method | Quality |
|----------|--------|--------|---------|
| 1 | YouTube version | `get-youtube-transcript.py` | High |
| 2 | Show notes page | WebFetch episode URL | Medium |
| 3 | Spotify native | Chrome extension JSON | High |
| 4 | Description only | Spotify/Apple metadata | Low |

**Step 1:** Search for YouTube version
```text
WebSearch: "{episode_title}" "{show_name}" site:youtube.com
```

**Step 2:** Fetch show notes from podcast website
```text
WebFetch: {podcast.website}/{episode-slug}/
```
Extract: timestamps, links/resources, sponsors

**Step 3:** Parse timestamps
```bash
python3 scripts/get-podcast-transcript.py --parse-timestamps <<< "$SHOW_NOTES"
```

**Step 4:** Set `transcript_source` field based on what was available.

---

## Frontmatter

```yaml
---
title: "Episode Title"
type: podcast
podcast: huberman-lab
url: "https://www.youtube.com/watch?v=..."
urls:
  - platform: youtube
    url: "https://youtube.com/watch?v=..."
  - platform: spotify
    url: "https://open.spotify.com/episode/..."
  - platform: apple
    url: "https://podcasts.apple.com/episode/..."
tags:
  - topic-1
  - topic-2
authors:
  - host-slug
guests:
  - guest-slug
summary: "Core message of the episode"
transcript_source: youtube
date: 2026-01-01
---
```

## Podcast-specific Fields

| Field | Required | Description |
|-------|----------|-------------|
| `podcast` | Yes | Slug of show in `content/podcasts/` |
| `guests` | No | Guest author slugs (not hosts) |
| `urls` | No | Array of `{platform, url}` |
| `transcript_source` | Yes | `youtube`, `show_notes`, `spotify_native`, `description_only` |

### Hosts vs Guests

- **Hosts** come from podcast profile's `hosts` array (don't repeat in episode)
- **Guests** are people appearing on this specific episode
- **Authors** field can be used for additional attribution

---

## Transcript Source Quality

| Source | Quality | Note Structure |
|--------|---------|----------------|
| `youtube` | High | Full quotes, timestamps, specific examples |
| `show_notes` | Medium | Timestamps + links, limited detail |
| `spotify_native` | High | Full transcript with timestamps |
| `description_only` | Low | Add disclaimer, summary only |

**If `description_only`:** Add this disclaimer at the top of body:
```markdown
> **Note:** This summary is based on the episode description only.
> Full transcript was not available.
```

---

## Body Template

```markdown
## Timestamps

| Time | Topic |
|------|-------|
| 00:00 | Introduction |
| 05:30 | Main topic discussion |
| 25:00 | Deep dive segment |
| 45:00 | Closing thoughts |

## Key Arguments

### [Topic Name] (05:30)

[2-3 sentences explaining the argument with specific details from the episode.
Include reasoning given, not just the claim.]

### [Another Topic] (25:00)

[Explanation with examples mentioned in the episode.]

## Predictions Made

- **[Prediction]** — [Reasoning given] (Confidence: high/medium/low)
- **[Another prediction]** — [Supporting argument]

## Notable Quotes

> "Exact quote from the episode"
> — Host Name at 32:15

## Resources Mentioned

- [Resource Name](url) — mentioned at 15:00
- [[wiki-linked-note]] — discussed in context of [topic]

## References

Discusses ideas from [[referenced-book]] and [[related-concept]].
```

---

## Content Structure by Podcast Type

| Type | Focus | Examples |
|------|-------|----------|
| News/Analysis | Predictions Made, specific claims | Doppelgänger, All-In |
| Interview | Key Arguments from guest, Quotes | Lex Fridman, Diary of a CEO |
| Educational | Protocols, Actionable advice | Huberman Lab |

---

## Validation

Episode-specific validator checks:
- `podcast` field references existing profile in `content/podcasts/`
- Warn if guest appears in podcast's hosts list (unusual)
- Warn if episode has no guests and no authors (unclear attribution)

---

## Notes

- Always try YouTube first for transcript
- Parse timestamps from show notes even without full transcript
- Multi-platform URLs improve discoverability
- See `references/podcast-profile-creation.md` if show profile doesn't exist
