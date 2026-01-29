---
title: "A Software Library with No Code"
type: article
url: "https://www.dbreunig.com/2026/01/08/a-software-library-with-no-code.html"
tags:
  - ai-agents
  - software-architecture
  - open-source
authors:
  - drew-breunig
summary: "Specification-only libraries work for simple utilities but foundational software still requires actual code, community oversight, and sustained maintenance."
date: 2026-01-08
---

## Summary

Drew Breunig released `whenwords`, a relative time formatting library containing only specifications and tests—no implementation code. AI coding agents generate the actual implementation on-demand for any language. The experiment reveals both the promise and limits of specification-driven development.

## Key Points

- **The premise**: With models like Claude Opus 4.5, developers can substitute traditional code libraries with tightly defined specs that agents implement fresh each time
- **Five reasons code still matters**:
  1. Performance requirements—complex systems need optimized implementations specifications can't guarantee
  2. Testing complexity—verifying spec changes across languages and AI models creates exponential overhead
  3. Support and debugging—probabilistic outputs make bug replication nearly impossible when code regenerates each time
  4. Continuous updates—security patches require maintained implementations, not just specs
  5. Community value—open source communities provide testing, contributions, and cultural crystallization

## Connections

- [[spec-driven-development-with-ai]] - Both explore separating intent from implementation, though Spec Kit focuses on workflow phases while `whenwords` pushes specifications to replace code entirely
- [[12-factor-agents]] - Factor 4 (tools are just structured outputs) connects to Breunig's insight that specifications can trigger deterministic code generation, but the 12-factor emphasis on "mostly just software" aligns with his conclusion that foundational systems need actual code
