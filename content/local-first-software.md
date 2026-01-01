---
title: "Local-First Software: You Own Your Data, in Spite of the Cloud"
type: article
url: "https://www.inkandswitch.com/essay/local-first/"
tags: [local-first, crdt, data-ownership, offline-first, collaboration]
authors:
  - Martin Kleppmann
  - Adam Wiggins
  - Peter van Hardenberg
  - Mark McGranaghan
summary: "A foundational essay proposing that data ownership and real-time collaboration are not mutually exclusive, introducing CRDTs as the enabling technology for local-first software."
date: 2026-01-01
---

## Core Thesis

Cloud apps provide collaboration but sacrifice ownership; traditional desktop software offers control but not collaboration. The authors argue we can have both through **local-first software** - where data lives primarily on the user's device, with servers playing a supporting role.

## The Seven Ideals

1. **Speed** - Instant responsiveness without server latency
2. **Multi-device access** - Data flows across all user devices
3. **Offline capability** - Work proceeds regardless of connectivity
4. **Seamless collaboration** - Real-time co-editing without conflicts
5. **Longevity** - Data remains accessible indefinitely
6. **Privacy & security** - End-to-end encryption, no centralized data collection
7. **User control** - Full ownership and agency over personal data

## Key Technology: CRDTs

Conflict-free Replicated Data Types (CRDTs) enable automatic merging of concurrent changes across devices without requiring a central server to resolve conflicts.

## Prototypes

The team built three working prototypes demonstrating feasibility:
- **Trellis** - Kanban board
- **Pixelpusher** - Collaborative drawing
- **PushPin** - Digital corkboard

## Reality Check

The technology is promising but not yet production-ready. Significant challenges remain in performance, networking, and UI design. The authors call for investment in making local-first infrastructure as accessible as Firebase.

## Connections

This essay is the foundational work that defines the local-first paradigm. See [[what-is-local-first-web-development]] for practical implementation approaches.
