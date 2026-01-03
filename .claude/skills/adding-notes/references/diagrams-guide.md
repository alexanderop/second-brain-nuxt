# Mermaid Diagrams Guide

Add visual diagrams **only when they genuinely clarify structure** that's hard to convey in text.

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

## Placement

Add a `## Diagram` or `## Visual Model` section after explaining the concept in text. The diagram reinforces understanding; the text remains primary.
