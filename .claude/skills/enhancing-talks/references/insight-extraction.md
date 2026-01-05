# Insight Extraction Guidelines

This document defines what makes a good "blink" (key insight) and how to extract them from talk transcripts.

## What Is a Key Insight?

A key insight is a standalone piece of wisdom that:
- Makes sense without watching the full talk
- Provides actionable or memorable information
- Represents a core idea the speaker wanted to convey
- Would be worth sharing with someone

## The Blinkist Standard

Blinkist "blinks" follow a specific pattern:

```markdown
**[Concise Title]** (timestamp) - [2-3 sentences with specific detail, examples, or data]
```

### Good Example
```markdown
**CRDTs Are Necessary But Not Sufficient** (8:45) - Skiff, built on yjs CRDTs, still shut down when Notion acquired it. Technology alone doesn't guarantee resilience—the entire application architecture must be built for independence.
```

### Bad Example
```markdown
**Technology Matters** (8:45) - The speaker discusses the importance of choosing the right technology. He emphasizes that technology decisions have significant implications.
```

## Insight Quality Criteria

### 1. Specificity
| Good | Bad |
|------|-----|
| "1% daily improvement = 37x better in a year" | "Small improvements add up" |
| "Skiff, built on yjs, still shut down" | "Some apps have failed" |
| "80% of Superhuman's code handles speed" | "Speed is important to them" |

### 2. Standalone Value
The insight should make sense to someone who hasn't seen the talk:
- Include enough context
- Name specific things (people, companies, techniques)
- Explain the "so what"

### 3. Actionability or Memorability
Either:
- Tells you what to DO differently
- Gives you something to REMEMBER or quote

### 4. Non-Obvious
Skip insights that are:
- Common knowledge
- Obvious from the title
- Generic advice without specifics

## Extraction Process

### Step 1: Identify Candidate Moments

Look for:
- **Claims**: "The key thing is...", "What matters is..."
- **Contrasts**: "Unlike X, we found that Y..."
- **Numbers**: Statistics, percentages, data points
- **Stories**: Specific examples with names and details
- **Frameworks**: 3-step processes, 4 types, etc.
- **Surprises**: "What surprised us was..."
- **Mistakes**: "The biggest mistake is..."

### Step 2: Evaluate Each Candidate

Ask:
1. Would I share this specific point with a colleague?
2. Does it need the talk's context to make sense?
3. Is it specific enough to be memorable?
4. Does it represent something the speaker emphasized?

### Step 3: Craft the Insight

1. **Title**: 3-6 words, captures the essence
2. **Timestamp**: When this insight is discussed
3. **Explanation**: 2-3 sentences with:
   - The core claim
   - Supporting detail (example, data, reason)
   - Implication or takeaway

### Step 4: Order Insights

Arrange insights to:
1. Start with foundational concepts
2. Build toward advanced ideas
3. End with actionable takeaways
4. Follow the talk's logical flow when natural

## Number of Insights

| Talk Duration | Target Insights |
|---------------|-----------------|
| 15-20 min | 6-8 |
| 20-30 min | 8-10 |
| 30-45 min | 10-12 |
| 45-60 min | 10-14 |

Aim for 1 insight per 3-5 minutes of content.

## Common Mistakes

### Too Vague
```markdown
**Communication Is Key** (5:30) - The speaker emphasizes the importance of clear communication in teams.
```
Fix: What SPECIFIC communication technique? What example?

### Too Long
```markdown
**The History of CRDTs** (5:30) - CRDTs were invented in the early 2000s by researchers at INRIA in France, building on earlier work in distributed systems. The key innovation was allowing concurrent edits without coordination. This was important because previous approaches required consensus protocols which were slow and complex. The speaker traces how this academic work eventually made its way into commercial products...
```
Fix: Pick one specific insight from this history, keep to 2-3 sentences.

### Missing Specifics
```markdown
**Users Want Speed** (12:00) - The speaker shows that users prefer fast software. This is an important consideration for product development.
```
Fix: What data? How fast? What specific finding?

### Timestamp Mismatch
Don't attribute insights to the wrong timestamp. The timestamp should point to where this specific insight is discussed, not just somewhere in the talk.

## Template Prompts for Agents

When prompting the insight extraction agent, include:

```text
For each insight:
1. Find a SPECIFIC claim, example, or framework (not a general topic)
2. Note the EXACT timestamp where it's discussed
3. Write a 3-6 word title that captures the essence
4. Explain in 2-3 sentences with concrete details from the talk
5. Include any numbers, names, or examples mentioned

Avoid:
- "The speaker discusses..." or "The talk covers..."
- Generic insights that could apply to any talk on this topic
- Insights without specific details, examples, or data
```

## Quality Checklist

Before finalizing insights:
- [ ] Each title is 3-6 words and captures the essence
- [ ] Each timestamp points to where this insight is discussed
- [ ] Each explanation is 2-3 sentences
- [ ] Each includes specific details (names, numbers, examples)
- [ ] Each makes sense without watching the talk
- [ ] No two insights repeat the same idea
- [ ] Total count is 8-12 insights
- [ ] Insights progress logically from foundational to advanced
