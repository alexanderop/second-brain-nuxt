---
title: "Sync Engines and Local Data"
type: youtube
url: "https://www.youtube.com/watch?v=1uVR5X7HpI8"
tags:
  - sync-engines
  - local-first
  - livestore
  - zero
  - instantdb
  - convex
  - electricsql
  - powersync
  - web-development
authors:
  - wes-bos
  - scott-tolinski
summary: "Wes and Scott explore local-first sync engines — why they make apps feel fast, and how LiveStore, Zero, Instant DB, Convex, ElectricSQL, and PowerSync each approach the problem differently."
date: 2025-07-30
---

## Timestamps

| Time  | Topic                                   |
| ----- | --------------------------------------- |
| 00:00 | Intro — what makes apps feel fast       |
| 08:23 | [[livestore]] — deep dive               |
| 18:01 | Zero (Replicache) — how it works        |
| 21:58 | [[instantdb]] — overview and trade-offs |
| 24:43 | [[convex]] — reactive backend           |
| 27:54 | ElectricSQL — Postgres sync             |
| 29:48 | [[powersync]] and PartyKit              |
| 30:51 | How to choose the right sync engine     |

## Key Takeaways

### Why Local Data Matters

Apps that read and write to local data feel instant. No loading spinners, no waiting for network round-trips. The sync engine handles pushing changes to the server in the background.

### Sync Engines Compared

- **LiveStore** — client-side SQLite with event sourcing, works well with frameworks like Vue and React
- **Zero** — from the Replicache team, server-authoritative sync with partial replication
- **Instant DB** — Firebase-like DX with real-time sync and relational queries
- **Convex** — reactive backend with built-in sync, functions run server-side
- **ElectricSQL** — syncs a subset of your Postgres database to the client
- **PowerSync** — Postgres-based sync with offline support, good for mobile

### Choosing the Right Engine

The choice depends on your existing stack, how much control you need over conflict resolution, and whether you want a client-first or server-first architecture. There is no single "best" engine — each makes different trade-offs around consistency, flexibility, and developer experience.

## Related

- [[local-first-guide]]
- [[sync-engines-for-vue-developers]]
- [[a-map-of-sync]]
- [[ux-and-dx-with-sync-engines]]
