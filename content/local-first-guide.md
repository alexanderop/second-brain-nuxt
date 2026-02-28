---
title: "Local-First Software"
type: map
tags:
  - local-first
  - offline-first
  - data-ownership
  - sync-engines
  - crdt
  - architecture
summary: "A comprehensive map of local-first software — from foundational philosophy and CRDTs to sync engines, tooling, and real-world production stories."
date: 2026-02-25
---

A map of the local-first paradigm: software where data lives on the user's device first and servers are optional infrastructure.

## Philosophy & Vision

The ideas driving the movement — data ownership, malleable software, and user agency.

- [[local-first-software]] - The original Ink & Switch essay that defined the seven ideals of local-first
- [[the-past-present-and-future-of-local-first]] - Kleppmann traces the arc from CRDTs to a proposed definition: software where another computer's availability never blocks the user
- [[15-years-of-local-first]] - Jan Lehnardt's 15-year retrospective from CouchDB to humanitarian deployments — the strongest case for local-first comes from Ebola contact tracing and COVID vaccination systems
- [[local-first-software-pragmatism-vs-idealism]] - Movements succeed when idealists define the vision and pragmatists build the infrastructure
- [[local-first-the-secret-master-plan]] - Ink & Switch's three-part endgame: local-first enables version control enables malleable software
- [[file-over-app]] - Apps are temporary, but plain-text files you control endure
- [[malleable-software]] - A research agenda for tools users can adapt without relying on developers
- [[home-cooked-software-and-barefoot-programmers]] - Local-first as default infrastructure for non-programmers building personal software

## Real-World Apps

- [[the-local-first-litmus-test]] - A directory of real apps across the spectrum: truly local-first, gray zone, and cloud apps marketing as local-first

## Introductions & Overviews

Starting points for understanding the paradigm.

- [[what-is-local-first-web-development]] - An introduction to the paradigm shift of storing data on users' devices first
- [[local-first-software-taking-back-control-of-our-data]] - Local-first as a paradigm where servers become optional and CRDTs enable collaboration without sacrificing ownership
- [[the-big-questions-of-local-first]] - The original essayists clash on whether offline writes should ship today or wait for version-control UX

## UX & Developer Experience

What local-first means for users and developers day-to-day.

- [[the-ux-of-local-first]] - Four unsolved UX challenges standing between local-first and mainstream adoption
- [[unexpected-benefits-of-going-local-first]] - Beyond offline support: eliminating network error handling and enabling synchronous data access
- [[ux-and-dx-with-sync-engines]] - Sync engines remove network latency from the user interaction path entirely

## Adoption & Business

Why it's hard to ship and why it matters anyway.

- [[why-local-first-apps-havent-become-popular]] - Syncing data across distributed devices without losing information is genuinely hard
- [[why-local-first-matters-to-businesses]] - Reliability, speed, revenue — the trap is optimizing for developer fascination instead of real-world impact
- [[local-first-in-production-fosdem-2026-recap]] - Production lessons: save the binary as source of truth, never overwrite, always merge

## CRDTs & Conflict Resolution

The data structures that make collaboration without coordination possible.

- [[a-gentle-introduction-to-crdts]] - CRDTs let replicas update independently and merge automatically without conflicts
- [[crdts-solved-conflicts-not-sync]] - CRDTs are a solid substrate, but transport reliability and distributed deletes are the harder engineering challenges
- [[conflict-resolution-x-notion-blocks]] - Notion had to invent text slices and search labels because their block model breaks standard CRDT assumptions
- [[implementing-fractional-indexing]] - Maintaining ordered sequences in collaborative systems using string-based keys

## Sync Engines

The infrastructure layer between local data and remote peers.

- [[a-map-of-sync]] - Nine dimensions map where every sync platform sits and why no single engine wins everywhere
- [[object-sync-engine]] - The architecture Linear, Figma, and Asana independently converged on
- [[a-tale-of-two-sync-engines]] - Figma runs two sync engines because not all data fits the CRDT model — and scaling the non-CRDT one was the harder problem
- [[general-purpose-sync-with-ivm]] - Query-driven sync at interactive speeds using a novel incremental view maintenance approach
- [[can-sync-be-network-optional]] - The real prize of peer-to-peer isn't ideology — it's sublinear scaling
- [[sync-engines-for-vue-developers]] - How Replicache, Zero, Convex, PowerSync, LiveStore, Jazz, and Dexie each approach sync differently
- [[unleashing-the-power-of-sync]] - Sync engines extend naturally to AI agents reading and writing directly to local databases
- [[sync-protocols-and-the-truth-behind-local-first]] - Offline writes destroy serializability mathematically — start with strong consistency and intentionally weaken it
- [[sync-panel-discussion]] - Where you draw the line between server authority and client autonomy defines your trade-offs
- [[an-interactive-guide-to-tanstack-db]] - TanStack DB adds collections, live queries, and transactional mutations as a drop-in upgrade over TanStack Query
- [[offline-first-apps-with-tanstack-db-and-powersync]] - Most offline conflicts never happen in practice — five escalating resolution strategies for the ones that do

## Tools & Frameworks

Specific libraries and products for building local-first apps.

- [[livestore]] - Client-centric state management combining reactive SQLite with event sourcing and built-in sync
- [[basic-likes-feature-with-livestore]] - Define an event, a materializer, and a reactive query — LiveStore handles offline and cross-device sync
- [[native-grade-web-apps-with-local-first-data]] - Replace server-centric data with client-side SQLite and sync engines to eliminate loading states
- [[the-why-and-how-of-building-a-local-first-music-app]] - Treating the web as a game engine problem with custom schedulers, canvas rendering, and event-sourced SQLite
- [[rstore]] - A reactive normalized cache for Vue and Nuxt — the missing data layer between Pinia and full sync engines
- [[alkalye]] - A local-first markdown editor PWA with E2EE and collaborative editing

## Infrastructure

Storage, security, and the low-level building blocks.

- [[sqlite-persistence-on-the-web]] - SQLite in the browser is production-ready — OPFS with synchronous access handles solved the persistence problem
- [[safe-in-the-keyhive]] - Capability-based certificate chains and a membership CRDT make auth travel with data
- [[powering-offline-first-forestry-in-europes-wilds]] - When users spend entire days offline, local-first isn't optional — it's the only architecture that works

## Social & AI Intersections

Where local-first meets social software, AI agents, and decentralization.

- [[local-first-social-software-in-the-era-of-llms]] - Owning your communication channels becomes the foundation for a trustworthy multi-agent future
- [[a-social-filesystem]] - User-generated social data should behave like files: portable, owned, and platform-independent
- [[i-built-a-context7-local-first-alternative-with-claude-code]] - Pre-built SQLite databases eliminate rate limits and keep AI queries private
