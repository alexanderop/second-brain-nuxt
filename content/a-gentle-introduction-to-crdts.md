---
title: "A Gentle Introduction to CRDTs"
type: article
url: "https://vlcn.io/blog/intro-to-crdts"
tags:
  - local-first
  - sync-engines
  - distributed-systems
authors:
  - matt-wonlaw
summary: "CRDTs let replicas update independently and merge automatically without conflicts"
date: 2026-01-05
---

## Summary

CRDTs (Conflict-Free Replicated Data Types) enable multiple machines to update data independently without coordination. Changes merge automatically, and all replicas eventually converge to the same state.

## Key Concepts

- **Grow-Only Set**: The simplest CRDT—an unordered, distinct collection that only expands. Merging produces the union of elements without conflicts.

- **Last-Write-Wins**: A merge strategy using timestamps, but with pitfalls: failing to update losing timestamps, inconsistent tie-breaking, clock pushing when proxying changes, and relying on system time.

- **Logical Clocks**: Internal counters incremented per event, avoiding unreliable system clocks. Nodes synchronize by setting their clock to `max(peer_clock, local_clock) + 1` during exchanges.

- **Causality Over Wall Time**: "Happens-before" relationships matter more than absolute timestamps. Time becomes a directed acyclic graph of causality.

## Use Cases

CRDTs power offline-first applications (changes merge on reconnection), real-time systems (local processing without server round-trips), and peer-to-peer networks (serverless merging between equals).

## Related

See also [[local-first-guide]].
