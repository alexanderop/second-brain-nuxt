---
title: "How I Use LLMs"
type: youtube
url: "https://www.youtube.com/watch?v=EWvNQjAaOHw"
tags:
  - llm
  - ai-tools
  - productivity
  - prompt-engineering
authors:
  - andrej-karpathy
summary: "Andrej Karpathy's practical guide to using LLMs effectively: understanding them as lossy internet zip files, managing token windows, selecting models across providers, and leveraging thinking models for complex problems."
date: 2026-01-02
---

## The Mental Model

Think of an LLM as a one-terabyte zip file. Pre-training compresses the internet into neural network parameters—a lossy, probabilistic compression where frequently discussed topics are remembered better than obscure ones. Post-training attaches a "smiley face" by training on human-labeled conversations, giving the model its assistant persona.

The model has no calculator, no Python interpreter, no web browser by default. You're talking to a self-contained entity with knowledge frozen at its training cutoff date.

## Token Windows Are Precious

When you type a message and the model responds, you're both writing into a shared one-dimensional token sequence—the context window. This window is the model's working memory.

Keep it lean:
- **Start new chats** when switching topics. Old tokens distract the model and slow inference.
- **Avoid overloading** the window with irrelevant information.
- Longer contexts cost more and can reduce accuracy.

## Model Selection Matters

Different models have different capabilities and price points. Always know which model you're using:

| Provider | Free Tier | Paid Tier | Best Models |
|----------|-----------|-----------|-------------|
| OpenAI | GPT-4o mini | Plus ($20), Pro ($200) | GPT-4o, o1-pro |
| Anthropic | Claude 3 Haiku | Pro | Claude 3.5 Sonnet |
| Google | Limited | Gemini Advanced | Gemini |
| xAI | Limited | Premium | Grok 3 |

Free tiers use smaller, less capable models. For professional work, pay for the flagship models.

## Thinking Models

Reinforcement learning produces "thinking models" that reason before answering. They emit chains of thought, sometimes for minutes, achieving higher accuracy on hard problems.

OpenAI's thinking models: o1, o3-mini, o1-pro (requires $200/month Pro tier).

When to use them:
- Complex coding bugs where standard models miss the issue
- Math and logic problems requiring step-by-step reasoning
- Tasks where accuracy matters more than speed

## When to Trust the Model

Knowledge-based queries work well when:
1. The information isn't recent (within the knowledge cutoff)
2. The topic is frequently discussed on the internet
3. The stakes are low enough to tolerate occasional errors

Always verify against primary sources for important decisions.

## The LLM Council

Ask multiple models the same question. Compare responses from ChatGPT, Claude, Gemini, and Grok. Each has different strengths and training data. Consensus across models increases confidence in the answer.

## Connections

Relates to [[context-engineering-guide]] on managing context effectively. See [[building-effective-agents]] for how these principles apply to agent systems. The model selection advice complements [[claude-code-best-practices]].
