---
title: "Superhuman Is Built for Speed"
type: article
url: "https://blog.superhuman.com/superhuman-is-built-for-speed/"
tags:
  - productivity
  - developer-experience
  - ux-design
authors:
  - christina-marfice
summary: "Speed is Superhuman's core feature. Every interaction under 100ms feels instantaneous, and the product achieves this through local caching, preloading, and keyboard-first design."
date: 2026-01-05
---

## Summary

Gmail creator Paul Buchheit established the 100ms rule: interactions faster than 100ms feel instantaneous. Superhuman targets sub-50ms when possible, despite running atop Gmail and Outlook APIs. The business case is clear—Amazon found every 100ms delay costs 1% in sales.

## Key Points

- **The 100ms threshold** separates "fast" from "instant" in user perception. Below this mark, interfaces feel like direct manipulation rather than request-response cycles.

- **Local caching defeats latency** by storing email databases offline. No round-trip to servers means no propagation delay, transmission bottlenecks, or network hops.

- **Preloading anticipates behavior** by fetching likely-next email threads before users request them. The data arrives before intention becomes action.

- **Keyboard shortcuts outpace mouse navigation** because they eliminate the visual search, cursor movement, and click confirmation that pointing devices require.

- **Command palettes (Cmd+K)** compress multi-step workflows into search queries, trading menu hierarchy traversal for direct intent expression.

## Related

The local-first approach to speed connects directly to [[local-first-software]], where instant responsiveness ranks first among the seven ideals for software that respects user ownership.
