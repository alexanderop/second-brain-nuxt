---
title: "What is Prompt Chaining in AI Agents? - Theory and Code"
type: youtube
url: "https://www.youtube.com/watch?v=iDu0FB3nwig"
tags:
  - ai-agents
  - llm
  - prompt-engineering
  - architecture
authors:
  - yacine-mahdid
summary: "Prompt chaining breaks complex LLM tasks into sequential steps, each with a specific job and structured input/output, trading latency for reliability."
date: 2026-01-02
---

## Core Concept

Prompt chaining connects multiple LLM calls in sequence. Each call has one specific task, receives structured input, and produces structured output for the next step. XML works well for data exchange between steps.

## When to Use It

Use prompt chaining when you have clear subtasks. Breaking down work reduces context load on each LLM call, making individual steps less confused and more reliable.

## The Trade-offs

**Benefits:**
- Reduced context load per LLM call
- Deterministic gates between steps (conditionals that don't need LLM)
- Improved reliability through tightly constrained calls

**Costs:**
- Increased maintenance from prompt proliferation
- Higher latency (more round trips)
- May become unnecessary as models handle complexity better

## Example: Email Parsing

The video demonstrates parsing unstructured emails into structured data. A single prompt approach struggled with accuracy. Breaking it into steps improved results:

1. **Formatter** - Convert raw text to XML structure
2. **Translator** - Handle French-to-English conversion
3. **Tagger** - Identify if RFQ or PO
4. **ID Analyzer** - Extract the reference ID
5. **Summarizer** - Condense the exchange
6. **Analyst** - Propose next steps

The chained approach produced better summaries and next steps, but took 30 seconds versus instant single-prompt responses.

## Backend Engineering Insight

Reduce LLM work by leveraging existing structure. Email already has EML format with inherent structure. Extract what you can deterministically first, then use LLM only for contextual interpretation. Augment with database lookups for known information like user roles.

> "The best AI engineers I know have a backend background."

## Connections

Builds on the same pattern covered in [[build-autonomous-agents-using-prompt-chaining-with-ai-primitives]]. Related to [[agentic-design-patterns]] which catalogs this as one of several agent architectures.
