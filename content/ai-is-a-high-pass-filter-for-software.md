---
title: "AI Is a High-Pass Filter for Software"
type: newsletter
newsletter: 5-minute-devops
url: "https://bryanfinster.substack.com/p/ai-is-a-high-pass-filter-for-software"
tags:
  - ai-tools
  - continuous-delivery
  - software-engineering
  - skill-acquisition
authors:
  - bryan-finster
summary: "AI amplifies existing capability rather than replacing it—developers and organizations with strong engineering foundations gain exponentially while those without see problems compound faster."
date: 2026-02-08
---

## Key Ideas

### AI as Signal Amplifier, Not Equalizer

Finster borrows the signal processing concept of a high-pass filter to frame AI's impact on software development. Strong signals (skilled developers, mature organizations) pass through amplified. Weak signals (poor fundamentals, broken processes) get attenuated or distorted. The gap between high and low performers widens rather than closing.

### Individual Amplification

Developers with strong fundamentals—testing discipline, design thinking, critical evaluation skills—experience compounding returns from AI. They recognize bad output, iterate faster, and learn new domains quickly. Developers lacking those foundations produce more output but not more value. AI generates plausible-looking code regardless of quality, and only the skilled developer knows the difference.

### Organizational Bottlenecks Exposed

Companies with good delivery flow (trunk-based development, CI/CD, small batches) absorb AI acceleration naturally. Companies with approval chains, manual gates, and siloed teams just pile up inventory at existing bottlenecks faster. AI doesn't fix organizational structure—it reveals where structure is broken.

## Five Flaws in AI Research

Finster identifies why studies often show minimal AI benefit:

- **Wrong metrics** — measuring lines of code instead of business outcomes
- **No maturity controls** — averaging results across wildly different skill levels
- **Ignoring dysfunction** — testing AI in broken delivery systems
- **Reporting averages** — masking the divergence between high and low performers
- **Missing workflow adaptation** — not tracking how teams restructure around AI

## Actionable Takeaways

- **Invest in foundations first** — trunk-based development, automated testing, continuous integration, and small batch sizes are prerequisites for AI gains
- **Measure outcomes, not output** — lines of code and PR velocity miss the point; track cycle time and defect rates instead
- **Treat AI as amplifier** — if your process is broken, AI makes it break faster

## Notable Quotes

> "AI will confidently generate plausible-looking garbage, and you won't know the difference."
> — Bryan Finster

## Connections

- [[some-software-devs-are-ngmi]] — Geoffrey Huntley makes the same argument from the adoption angle: developers who refuse AI tools face natural attrition as peers achieve massive productivity gains
- [[the-way-to-deliver-fast-with-ai-quality]] — Tsvetan Tsvetanov arrives at the same conclusion from the quality side: testing, strict types, and clean APIs are what enable AI to actually accelerate delivery
- [[deliberate-intentional-practice-with-ai]] — Huntley's counterpoint to "AI doesn't work for me": the gap Finster describes stems partly from insufficient deliberate practice with AI tools
