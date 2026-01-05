# Transcript Chunking Strategy

This document explains how to segment talk transcripts for effective analysis.

## Why Chunk?

Talk transcripts are long (3,000-15,000 words for 15-60 minute talks). Chunking:
- Makes analysis manageable for each agent
- Preserves context within logical sections
- Enables accurate timestamp attribution
- Identifies natural topic transitions

## Chunking Approaches

### 1. Time-Based Chunking (Default)

Split transcript into ~3-5 minute segments:

```text
Chunk 1: 0:00 - 5:00
Chunk 2: 5:00 - 10:00
Chunk 3: 10:00 - 15:00
...
```

**Pros:** Simple, predictable
**Cons:** May split mid-thought

### 2. Semantic Chunking (Preferred)

Identify natural break points in the transcript:

| Signal | Indicates |
|--------|-----------|
| Long pause (>3s gap between segments) | Topic transition |
| "So...", "Now...", "Moving on..." | Section start |
| "In summary...", "To wrap up..." | Section end |
| "The first/second/third thing..." | Enumeration |
| "Let me show you...", "As you can see..." | Demo/visual |
| Applause or laughter | Punchline/key moment |

**Implementation:**
1. Parse JSON transcript
2. Look for gaps > 3 seconds between segments
3. Scan for transition phrases
4. Group segments into logical chunks
5. Aim for 3-7 chunks total

### 3. Hybrid Approach (Recommended)

Combine time and semantic signals:

1. Start with 5-minute time windows
2. Adjust boundaries to nearest semantic break
3. Merge very short chunks
4. Split very long chunks at sub-transitions

## Chunk Size Guidelines

| Talk Duration | Target Chunks | Words per Chunk |
|---------------|---------------|-----------------|
| 15-20 min | 3-4 | 500-800 |
| 20-30 min | 4-5 | 600-900 |
| 30-45 min | 5-6 | 700-1000 |
| 45-60 min | 6-8 | 800-1200 |
| 60+ min | 7-10 | 900-1500 |

## Transition Phrase Patterns

### Section Starters
```text
"So let's talk about..."
"Now I want to..."
"The next thing is..."
"Moving on to..."
"Let me shift gears..."
"Here's the interesting part..."
"This brings me to..."
```

### Section Enders
```text
"So that's..."
"In summary..."
"To wrap that up..."
"The key takeaway here is..."
"Before I move on..."
```

### Enumeration Markers
```text
"First...", "Second...", "Third..."
"The first thing...", "Another thing..."
"One more point..."
"Finally..."
```

### Visual/Demo Markers
```text
"Let me show you..."
"As you can see here..."
"On this slide..."
"Looking at this diagram..."
"In this example..."
"Watch what happens when..."
```

## Overlap Strategy

For context preservation, include ~30 seconds of overlap between chunks:

```text
Chunk 1: 0:00 - 5:30 (includes 30s of chunk 2)
Chunk 2: 5:00 - 10:30 (overlaps with 1, includes 30s of 3)
Chunk 3: 10:00 - 15:30
...
```

This ensures insights spanning chunk boundaries aren't missed.

## Output Format

When chunking for agent analysis, format as:

```markdown
## Chunk 1 (0:00 - 5:00)
[Transcript text...]

## Chunk 2 (5:00 - 10:00)
[Transcript text...]

## Chunk 3 (10:00 - 15:00)
[Transcript text...]
```

Each chunk includes:
- Chunk number
- Time range
- Full transcript text with embedded timestamps

## Special Cases

### Panel Discussions
- Chunk by speaker turns when possible
- Note speaker changes within chunks
- Longer chunks acceptable (speakers often make extended points)

### Live Coding/Demos
- Keep demo segments together
- Note when visual context is important
- Mark as "Visual demo - transcript may be incomplete"

### Q&A Sections
- Often at end of talk
- May not need deep analysis
- Can be summarized as single chunk

## Implementation Notes

The transcript script's segment merging (30-second target) provides good base units. For chunking:

1. Load JSON transcript
2. Group merged segments into chunks
3. Respect semantic boundaries when possible
4. Provide chunk boundaries to analysis agents
