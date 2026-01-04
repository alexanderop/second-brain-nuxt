---
title: "RLHF: Reinforcement Learning from Human Feedback"
type: article
url: "https://huyenchip.com/2023/05/02/rlhf.html"
tags:
  - llm
  - ai
  - best-practices
authors:
  - chip-huyen
summary: "A comprehensive guide explaining the three-phase process (pretraining, supervised fine-tuning, RLHF) used to train models like ChatGPT."
rating: 7
date: 2026-01-04
---

## Summary

ChatGPT-style models are trained in three phases: pretraining on massive text data, supervised fine-tuning on demonstrations, and RLHF to align with human preferences. The technique combines traditional language modeling with reinforcement learning, using human comparisons to train a reward model that guides optimization.

## Three Training Phases

### Phase 1: Pretraining

Train a language model on trillions of tokens from the internet. Models learn to complete text but reflect their training data quality. GPT-3 trained on 0.5T tokens; LLaMA on 1.4T.

### Phase 2: Supervised Fine-Tuning (SFT)

Optimize for dialogue using 10,000-100,000 high-quality (prompt, response) pairs. OpenAI's 1.3B InstructGPT outperformed the 175B GPT-3 on user preferences, demonstrating that quality fine-tuning beats raw scale.

### Phase 3: RLHF

Two components: train a reward model on comparison data (100K-1M examples of winning vs. losing responses), then optimize the language model with Proximal Policy Optimization (PPO) while constraining it to stay close to the SFT model via KL divergence.

## Key Findings

RLHF improves overall quality but makes hallucination worse compared to SFT alone. Human labelers agree on response rankings only 73% of the time, highlighting the challenge of capturing diverse preferences.

The data bottleneck looms large: a trillion tokens equals 15 million books, and we risk exhausting internet data for training.

## Related

See also [[ai-engineering]] for a broader treatment of post-training and alignment techniques.
