---
title: "LocalFirst: You Keep Using That Word"
type: article
url: "https://www.deobald.ca/essays/2026-01-01-localfirst-you-keep-using-that-word/"
tags:
  - local-first
  - open-source
  - data-ownership
  - offline-first
authors:
  - steven-deobald
summary: "Local-first is a spectrum, not a binary—and true local-first requires open source, native apps, and multi-device sync, not just offline capability."
date: 2026-01-01
---

## Summary

Steven Deobald argues that "local-first" has become a loosely applied term that needs clearer boundaries. True local-first software is a spectrum with essential requirements often overlooked: open source code, native applications, and multi-device synchronization. Merely working offline doesn't qualify.

## Key Points

- **Servers aren't forbidden** - Local-first doesn't mean eliminating servers entirely. A cloud service can play a supporting role for sync and discovery without violating local-first principles.

- **Offline-first ≠ local-first** - Single-device offline apps miss the mark. True local-first demands data sync across multiple devices—the "local" in local-first refers to the user's ecosystem, not a single machine.

- **Open source is implied** - Proprietary software cannot guarantee long-term data ownership. When companies shut down, users lose access to both features and data. Local-first requires the code be inspectable and forkable.

- **Native apps matter** - Web applications inherently "phone home" through URLs. Browser-based local-first software is conceptually contradictory since URLs require network connectivity.

- **UX standard: no spinners** - Applications should display cached data immediately while syncing in the background. Loading spinners indicate a failure of local-first principles.

- **Multiplayer is optional** - Collaboration features enhance but don't define local-first. Single-user applications prioritizing data ownership and offline access qualify as genuinely local-first.

## Connections

- [[local-first-software]] - The foundational Ink & Switch essay that Deobald references for Kleppmann's definition: "the availability of another computer should never prevent you from working."

- [[the-past-present-and-future-of-local-first]] - Kleppmann's talk that similarly argues for sharper definitions and emphasizes that CRDTs alone don't guarantee local-first resilience.
