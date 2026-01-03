---
title: "Deep Dive into LLMs like ChatGPT"
type: youtube
url: "https://www.youtube.com/watch?v=7xTGNNLPyMI"
tags:
  - llm
  - deep-learning
  - ai
  - andrej-karpathy
authors:
  - andrej-karpathy
summary: "A comprehensive introduction to how large language models work, covering the entire pipeline from internet data collection through tokenization, neural network training, and inference."
date: 2026-01-03
---

Andrej Karpathy walks through the complete pipeline of building an LLM like ChatGPT, aimed at a general audience. The video demystifies what happens behind the text box where you type your prompts.

## The Pre-training Pipeline

### Data Collection

Building an LLM starts with downloading and processing the internet. The Fine Web dataset exemplifies this process—44 terabytes of filtered text from Common Crawl, which has indexed 2.7 billion web pages since 2007.

The filtering pipeline removes:
- Malware, spam, and adult content (URL filtering)
- HTML markup, keeping only text (text extraction)
- Non-English content below 65% threshold (language filtering)
- Personally identifiable information like addresses and SSNs

### Tokenization

Neural networks need a finite set of symbols in a one-dimensional sequence. Raw text gets converted through byte pair encoding:

1. Start with raw UTF-8 bytes (256 possible values)
2. Find common consecutive byte pairs
3. Merge them into new symbols
4. Repeat until vocabulary reaches ~100,000 tokens

GPT-4 uses 100,277 tokens. "Hello world" becomes just two tokens. The tokenizer at [tiktokenizer](https://tiktokenizer.vercel.app/) lets you explore how text maps to tokens.

## Neural Network Training

The network learns statistical patterns of how tokens follow each other. Training works by:

1. Taking random windows of tokens (up to 8,000)
2. Predicting which token comes next
3. Comparing prediction to actual next token
4. Adjusting parameters to increase correct token's probability

Modern networks have billions of parameters—knobs that get tuned during training. The Transformer architecture processes input tokens through layers of attention and multi-layer perceptrons until outputting probability distributions.

## Inference

Generating text means sampling from the model's learned distributions:

1. Start with input tokens
2. Get probability distribution over all possible next tokens
3. Sample one token (flip a biased coin)
4. Append sampled token to input
5. Repeat

This stochastic process produces text that's statistically similar to training data but not identical—remixes rather than copies.

## Key Insight

When you use ChatGPT, you're doing inference on a model trained months ago. The parameters stay fixed. You provide tokens, it completes sequences based on patterns learned during training.

## Related

- [[andrej-karpathy-were-summoning-ghosts-not-building-animals]] - Karpathy's perspective on what LLMs actually are
