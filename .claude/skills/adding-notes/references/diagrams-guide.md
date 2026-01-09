# Mermaid Diagrams Guide

Add visual diagrams **only when they genuinely clarify structure** that's hard to convey in text.

---

## REQUIRED: Decision Tree

**Every note must evaluate this tree. This is not optional.**

```text
1. NAMED FRAMEWORK?
   ("Habit Loop", "Golden Circle", "Four Laws of...")
   → YES: LIKELY ADD - Named models deserve visualization

2. PROCESS or SEQUENCE?
   (steps, workflow, cause-effect chain)
   → YES: LIKELY ADD - Use flowchart LR

3. SYSTEM RELATIONSHIPS?
   (components, feedback loops, hierarchies)
   → YES: LIKELY ADD - Use graph with connections

4. TIMELINE or PROGRESSION?
   (phases, evolution, history)
   → YES: LIKELY ADD - Use timeline or graph LR

5. LOW priority content type?
   (quote, note, map, reddit, manga, movie)
   → LIKELY SKIP - Log reason and proceed

6. None of the above?
   → SKIP: "No visual structure identified"
```

### Type Priority Matrix

| Priority | Content Types | Action |
|----------|---------------|--------|
| **HIGH** | book, talk, course, article (tech), youtube (tech) | Actively look for diagram opportunities |
| **MEDIUM** | evergreen, podcast, github | Evaluate if frameworks are presented |
| **LOW** | quote, note, map, reddit, newsletter, manga, movie | Skip unless obvious visual structure |

---

## When to Add Diagrams

✅ **Use diagrams for:**
- **Frameworks with spatial structure** - Concentric circles, matrices, pyramids
- **Process flows** - Step-by-step sequences, cause-effect chains, decision trees
- **System relationships** - Component interactions, feedback loops, hierarchies
- **Timelines** - Historical progression, project phases, learning paths

❌ **Skip diagrams when:**
- Content is naturally a list (just use bullets)
- The concept is abstract without clear visual structure
- Text already explains it clearly
- You'd be forcing a visual for aesthetics only

## Syntax

Use MDC component with `<pre>` to preserve formatting. **Never add colors or styling** — let the app's theme handle appearance.

```markdown
::mermaid
<pre>
graph TD
    A[Start] --> B[Process]
    B --> C[End]
</pre>
::
```

## Diagram Type Cheatsheet

| Content Pattern | Mermaid Type | Example Use |
|-----------------|--------------|-------------|
| Hierarchy/layers | `graph TD` | Maslow's pyramid, org charts |
| Concentric model | `graph TD` with subgraphs | Golden Circle, zones of control |
| Process/workflow | `flowchart LR` | GTD workflow, sales funnel |
| Timeline | `timeline` | Historical events, project phases |
| Comparison | `graph LR` with subgraphs | Before/after, two approaches |
| Cycle | `graph` with circular arrows | Feedback loops, iterative processes |

## Examples

### Concentric Framework (e.g., Golden Circle)

```markdown
::mermaid
<pre>
graph TD
    subgraph Circle[" "]
        WHY((Why))
        HOW[How]
        WHAT[What]
    end
    WHY --> HOW --> WHAT
</pre>
::
```

### Neural Circuit / System

```markdown
::mermaid
<pre>
graph LR
    A[Amygdala<br/>Fear/Anxiety] --> BG[Basal Ganglia<br/>Go/No-Go]
    PFC[Prefrontal Cortex<br/>Planning] --> BG
    OFC[Orbitofrontal<br/>Emotion] --> BG
    BG --> Action[Goal Action]
    D((Dopamine)) -.-> A & PFC & OFC
</pre>
::
```

### Process Flow (e.g., learning loop)

```markdown
::mermaid
<pre>
flowchart LR
    Try[Try Task] --> Result{Success?}
    Result -->|85%| Learn[Consolidate]
    Result -->|15%| Error[Error Signal]
    Error --> Alert[Heightened Attention]
    Alert --> Try
    Learn --> Try
</pre>
::
```

## When to Add by Content Type

| Content Type | When to Add Diagram |
|--------------|---------------------|
| **Books** | Core framework is visual (matrices, pyramids, cycles) |
| **YouTube/Podcasts** | Speaker presents a named model or system |
| **Articles** | Technical architecture or process explanation |
| **Courses** | Learning path, module structure, or methodology |
| **Evergreen** | Synthesizing a concept with structural relationships |

---

## Diagram Triggers by Content Type

### Books
Look for these patterns that signal diagram opportunities:
- "The [X] Model" or "The [X] Framework"
- "Four laws of...", "Three pillars of...", "Five stages of..."
- Circular relationships ("A leads to B leads to C leads to A")
- Before/after transformations
- Concentric circles or layers ("at the core...", "surrounding that...")

### Talks/YouTube
Watch for:
- Speaker draws on whiteboard or shows diagram slide
- Mentions "let me show you how this works"
- Describes a cycle or loop
- Compares two approaches side-by-side

### Technical Content (articles, courses, github)
- Architecture diagrams
- Data flow descriptions
- Request/response cycles
- Component relationships
- Pipeline stages

---

## Placement

Add a `## Diagram` or `## Visual Model` section after explaining the concept in text. The diagram reinforces understanding; the text remains primary.

---

## Quick Reference: Common Patterns

### The "Loop" Pattern
Content says: "X leads to Y, which reinforces X"

```text
graph LR
    A[X] --> B[Y]
    B -.->|reinforces| A
```

### The "Hierarchy" Pattern
Content says: "At the core is X, surrounded by Y, then Z"

```text
graph TD
    subgraph Outer[" "]
        subgraph Middle[" "]
            Core[X]
        end
        Y[Y surrounds]
    end
    Z[Z encompasses all]
```

### The "Process" Pattern
Content says: "First X, then Y, then Z"

```text
flowchart LR
    X[Step 1] --> Y[Step 2] --> Z[Step 3]
```

### The "Decision" Pattern
Content says: "If X, do Y; otherwise do Z"

```text
flowchart TD
    X{Decision?}
    X -->|Yes| Y[Path A]
    X -->|No| Z[Path B]
```

### The "Cycle" Pattern (e.g., Habit Loop)
Content says: "A triggers B, B produces C, C reinforces A"

```text
graph LR
    A[Cue] --> B[Craving]
    B --> C[Response]
    C --> D[Reward]
    D -.->|reinforces| A
```
