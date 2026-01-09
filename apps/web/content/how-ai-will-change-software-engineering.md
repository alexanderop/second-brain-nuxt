---
title: "How AI Will Change Software Engineering"
type: youtube
url: "https://www.youtube.com/watch?v=CQmI4XKTa0U"
tags:
  - ai
  - llm
  - software-architecture
  - best-practices
authors:
  - gergely-orosz
  - martin-fowler
summary: "Martin Fowler argues AI represents the biggest shift in software engineering since assembly to high-level languages—not because of abstraction level, but because we now work with non-deterministic systems."
date: 2026-01-04
---

## Key Takeaways

- AI marks the most significant change in software development since the shift from assembly to high-level languages. The comparable historical moment was when FORTRAN and COBOL first let programmers think beyond individual hardware instructions.

- The critical shift isn't about abstraction levels—it's from determinism to non-determinism. Working with systems that don't produce identical outputs from identical inputs requires completely different mental models, similar to how structural engineers think in tolerances.

- Vibe coding works for explorations and throwaway prototypes, but removes the learning loop essential for long-term projects. When you vibe code, you skip understanding what the code does, which prevents you from building the mental models needed to maintain it.

- LLMs excel at helping understand legacy systems. They can analyze existing codebases and explain unfamiliar patterns, making them valuable for working with inherited code.

- Using rigorous notation helps LLMs perform better. Describing chess matches in plain English produces poor results, but using chess notation enables the LLM to understand game strategy. This parallels domain-driven design's emphasis on ubiquitous languages.

- Security incidents from non-deterministic tools are likely inevitable. Teams skating too close to the edge of what AI can reliably do will experience noticeable failures.

## Notable Quotes

> "It's the biggest [change] I think in my career. If we looked back at the history of software development as a whole, the comparable thing would be the shift from assembly language to the very first high-level languages."

> "When you're using vibe coding, you're actually removing a very important part of something, which is the learning loop."

> "The biggest part of it is the shift from determinism to non-determinism—suddenly you're working with an environment that's non-deterministic, which completely changes [everything]."

## References

Martin Fowler is the author of [[refactoring-improving-the-design-of-existing-code]], the Agile Manifesto co-author, and Chief Scientist at Thoughtworks. His colleague Unmesh Jooshi has been exploring co-building abstractions with LLMs—using the abstraction to communicate more effectively with the model.
