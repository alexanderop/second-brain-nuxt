---
title: "LiveStore"
type: article
url: "https://livestore.dev/"
tags:
  - local-first
  - state-management
  - sync-engines
  - event-sourcing
  - sqlite
authors:
  - johannes-schickling
summary: "A client-centric state management framework combining reactive SQLite with event sourcing and built-in sync, designed for high-performance local-first applications"
date: 2026-01-05
---

## Summary

LiveStore replaces traditional state management libraries (Redux, MobX) by treating SQLite as the reactive data layer. State changes commit as immutable events, which materializers map to SQL statements. The embedded database updates instantly while a sync engine distributes events across clients and server in the background.

## Key Concepts

- **Event Sourcing Foundation**: Git-inspired model where state derives from immutable events. As David Khourshid notes, events capture state more accurately than any derived abstraction.

- **Reactive SQLite**: An embedded, queryable database that responds to events through materializers—callback functions that translate events into SQL. Eliminates loading states and manual cache management.

- **Sync Engine**: Built-in synchronization distributes committed events across clients. Supports complex multi-client scenarios while keeping data local-first.

- **Type-Safe Schema API**: Ergonomic data modeling without database migrations. Define schemas in code, let the framework handle persistence.

## Architecture

The system emerged from research on reactive SQLite as modern state management (the Riffle project). Data persists to device storage while sync happens invisibly. Cross-platform support spans web (Chrome, Vite), mobile (Expo), servers (Node.js), and desktop (Electron, Tauri). Framework adapters exist for React, Solid, Vue, and Svelte.

## Origins

Originally developed as the foundation for Overtone, a music application requiring high performance and offline capability. LiveStore extracts the core data layer into a standalone framework.

## Related

See also [[local-first-software]] for the foundational principles behind this approach.
