---
title: "Andrej Karpathy — We're summoning ghosts, not building animals"
type: youtube
url: "https://www.youtube.com/watch?v=lXUZvyajciY"
tags:
  - ai-agents
  - llm
  - learning
authors:
  - andrej-karpathy
  - dwarkesh-patel
summary: "Karpathy argues we're building 'ghosts' that imitate internet documents rather than evolved animals, and that practical AI agents will take a decade—not a year—to fully mature."
date: 2026-01-02
---

## Key Takeaways

- **Decade of agents, not year of agents.** Current agents like Claude and Codex work daily, but lack the reliability to replace an intern. The cognitive deficits—no continual learning, limited multimodality, no persistent memory—will take years to solve.

- **Pre-training is "crappy evolution."** Evolution encodes neural weights in DNA through millennia of optimization. We skip that by imitating internet documents, producing ghost-like entities rather than animal-like ones.

- **Weights store hazy recollection; context is working memory.** Anything compressed into model weights becomes fuzzy. Anything in the context window stays directly accessible—like the difference between remembering a book from years ago versus having it open in front of you.

- **In-context learning may run internal gradient descent.** Papers show transformers doing linear regression in-context implement something resembling gradient descent mechanics within their attention layers.

- **Knowledge crowds out intelligence.** Pre-training gives both knowledge and cognitive algorithms. The knowledge may hold models back—they over-rely on memorized patterns instead of reasoning off-distribution. Future research should extract the "cognitive core" while stripping unnecessary knowledge.

## Notable Quotes

> "We're not building animals. We're building ghosts or spirits, because we're not doing training by evolution. We're doing training by imitation of humans and the data they've put on the Internet."

> "Anything that happens during the training of the neural network, the knowledge is only a hazy recollection of what happened in training time."

## The Missing Brain Parts

Karpathy frames current models as cortical tissue—the transformer is plastic and general, like the cortex. But other brain structures remain unexplored:

- **Prefrontal cortex**: Reasoning traces in thinking models
- **Basal ganglia**: Reinforcement learning fine-tuning
- **Hippocampus**: No equivalent for memory consolidation during "sleep"
- **Amygdala**: Emotions and instincts absent

## Three Seismic Shifts in AI

1. **AlexNet (2012)**: Everyone started training neural networks, but per-task
2. **Atari/RL (2013)**: First agent attempts—turned out to be premature
3. **LLMs**: Seeking representation power before tackling agents

The early agent work (Atari, OpenAI Universe) was a misstep. You need the language model's representations first—keyboard-mashing through sparse rewards burns compute without learning.

## Connections

Builds on [[building-effective-agents]] and [[agentic-design-patterns]] with a longer-term perspective on agent development timelines. The "cognitive core" idea relates to [[context-engineering-guide]]—what matters is the reasoning capability, not memorized facts.
