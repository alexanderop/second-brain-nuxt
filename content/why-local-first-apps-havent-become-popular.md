---
title: "Why Local-First Apps Haven't Become Popular"
type: article
url: "https://marcobambini.substack.com/p/why-local-first-apps-havent-become"
tags:
  - local-first
  - architecture
  - distributed-systems
authors:
  - marco-bambini
summary: "Explains why local-first apps remain niche despite their advantages—syncing data across distributed devices without losing information is genuinely hard."
date: 2026-01-03
---

Local-first apps sound ideal: fast responses, offline capability, data ownership. Yet they remain rare. The core problem? Syncing is hard.

## The Distributed Systems Challenge

Building local-first means creating a distributed system where multiple devices independently mutate data and must later converge to identical states. Two obstacles stand in the way.

### Problem 1: Unreliable Ordering

Events occur across devices at different times. Without coordination, applying changes in different sequences produces inconsistent results.

**Solution: Hybrid Logical Clocks (HLCs)**

HLCs combine physical time with logical counters. Devices can determine event ordering without synchronized clocks, generating comparable, causally-consistent timestamps.

### Problem 2: Conflicts

When devices modify the same data independently, manual conflict resolution becomes error-prone and frustrating.

**Solution: CRDTs (Conflict-Free Replicated Data Types)**

CRDTs guarantee commutativity and idempotence. A Last-Write-Wins strategy uses timestamps to determine final values. The system converges regardless of message application order.

## Practical Implementation

Bambini describes using SQLite as the foundation, storing changes in a messages table with timestamps, dataset identifiers, row information, columns, and values. This approach leverages SQLite's reliability while enabling sync.

## Key Insight

Developers should embrace eventual consistency using proven distributed-systems techniques rather than faking offline support through request queues. The infrastructure exists—CRDTs, HLCs, and sync engines—but packaging them into developer-friendly tools remains the gap.

This echoes challenges documented in [[local-first-software]], where the technology shows promise but production-readiness lags. The [[ux-and-dx-with-sync-engines]] discussion addresses how sync engines could bridge this gap by abstracting away the complexity. For practical implementation patterns, see [[what-is-local-first-web-development]].
