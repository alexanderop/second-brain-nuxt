---
title: "The Bitter Lesson"
type: article
url: "http://www.incompleteideas.net/IncIdeas/BitterLesson.html"
tags:
  - ai
  - machine-learning
  - scale
  - philosophy
authors:
  - richard-sutton
summary: "General methods leveraging computation beat hand-crafted human knowledge in the long run—AI progress comes from scale and learning, not clever engineering."
date: 2019-03-13
---

## Core Argument

Sutton distills 70 years of AI research into one uncomfortable truth: general methods that leverage computation consistently outperform approaches built on human knowledge. Moore's law means compute gets cheaper while human expertise stays expensive. Betting on scale wins; betting on cleverness loses.

## The Pattern

The same story repeats across AI history:

1. Researchers inject domain knowledge into systems
2. Early results look promising
3. Progress plateaus
4. Someone tries brute-force search or statistical learning
5. Scale wins decisively

## Historical Evidence

**Chess**: Researchers spent decades encoding chess knowledge—opening theory, positional understanding, endgame patterns. Deep Blue won by searching 200 million positions per second. The chess experts weren't good losers.

**Speech Recognition**: DARPA competitions in the 1970s pitted phoneme-aware, vocal-tract-modeling systems against statistical hidden Markov models. The statistical approach won—then kept winning as compute scaled.

**Computer Vision**: Hand-crafted feature detectors (SIFT, HOG) gave way to convolutional neural networks that learned features from raw pixels. Deep learning didn't encode human vision theories; it learned from data.

## Why It's "Bitter"

The lesson stings because it's anti-anthropocentric. Researchers want their insights to matter. They want understanding chess or language or vision to translate into better AI systems. It doesn't. The systems that work best are the ones that learn on their own.

## Two Methods That Scale

Sutton identifies two general-purpose techniques that compound with compute:

- **Search**: Explore possibilities systematically
- **Learning**: Improve from experience

Both avoid baking in human assumptions about how problems should be solved.

## The Deeper Point

Human minds are irreducibly complex. Stop trying to engineer that complexity directly. Build systems that discover complexity on their own. "We want AI agents that can discover like we can, not which contain what we have discovered."

## Connections

- [[the-importance-of-agent-harness-in-2026]] - Directly applies the Bitter Lesson to agent architecture: build lightweight, deletable systems rather than rigid frameworks
- [[what-is-chatgpt-doing-and-why-does-it-work]] - Wolfram's analysis shows the Bitter Lesson in action: ChatGPT learns patterns from data without explicit programming
