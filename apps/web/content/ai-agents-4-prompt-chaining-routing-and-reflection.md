---
title: "AI Agents 4 - Prompt Chaining, Routing and Reflection"
type: youtube
url: "https://www.youtube.com/watch?v=AVAkzPneFOs"
tags:
  - ai-agents
  - prompt-engineering
  - design-patterns
  - langchain
authors:
  - mohammad-ghassemi
summary: "Michigan State University lecture covering three agentic design patterns—prompt chaining, routing, and reflection—with practical LangChain and LangGraph implementations."
date: 2026-01-02
---

## Prompt Chaining

Prompt chaining decomposes a monolithic prompt into sequential subprompts. Each step produces output that feeds into the next step's input.

**Example: Summarization Pipeline**
1. Generate initial summary
2. Critique the summary
3. Refine based on critique

Research shows 2x preference for summaries generated via prompt chaining versus monolithic prompts (Sun et al.). The decomposition lets each step focus on one objective.

**LangChain Implementation:**
```python
summarize_prompt = PromptTemplate("Summarize: {text}")
question_prompt = PromptTemplate("Generate a question about: {summary}")

chain = (
    {"summary": summarize_prompt | llm}
    | question_prompt | llm
)
```

## Routing

Routing adds conditional logic before prompt chains. A router analyzes the user's query and selects the appropriate agent path based on inferred intent.

**When to use routing:**
- Multiple workflows exist (e.g., summarization vs. database lookup)
- Different prompt chains suit different intents
- Tasks require multitask performance

**LangGraph Implementation:**
```python
# Define router node
def do_route(state):
    intent = route_chain.invoke(state)
    return {"intent": intent}

# Add conditional edges
graph.add_conditional_edges(
    "route",
    lambda s: s["intent"],
    {"calc": "calc_node", "joke": "joke_node"}
)
```

Mixture of Agents research shows routing improves Alpaca Eval scores from 50% to nearly 80%—a significant lift from proper intent classification.

## Reflection

The lecture mentions reflection as the third pattern, building on the self-critique loop shown in prompt chaining. An agent evaluates its own output, identifies issues, and iterates toward improvement.

## Connections

This lecture provides practical implementations for patterns covered in [[agentic-design-patterns]]. The prompt chaining section directly relates to [[what-is-prompt-chaining-in-ai-agents]] and [[build-autonomous-agents-using-prompt-chaining-with-ai-primitives]].
