---
title: "UX++ and DX++ with Sync Engines"
type: article
url: "https://www.carlassmann.com/blog/improve-ux-dx-with-sync-engines"
tags:
  - sync-engines
  - local-first
  - developer-experience
authors:
  - carl-assmann
summary: "Sync engines remove network latency from the user interaction path by maintaining local data stores that sync bidirectionally with servers in the background."
date: 2026-01-02
---

## The Problem with Current Patterns

Traditional data-fetching patterns like TanStack Query create poor UX through loading state chains. Developers must manually manage cache invalidation, and users wait for network roundtrips on every interaction. The root cause of slow, waitful web experiences is network latency—not framework limitations.

## How Sync Engines Solve This

Sync engines maintain a local data store on the client that syncs with servers in the background. This architecture enables:

- **Instant UI responses** — interactions never wait for network
- **Offline capability** — the app works without connectivity
- **Automatic real-time collaboration** — changes sync across clients
- **Simpler code** — work with local data subscriptions instead of managing remote state

The pattern mirrors React's success: abstract away complexity to provide better developer experience.

## Key Concepts

- **Client view tracking** — the server knows what each client has synced
- **Push/pull synchronization** — bidirectional sync patterns
- **Optimistic UI** — show changes immediately, reconcile later

## Related

Expands on ideas from [[local-first-software]] and [[local-first-guide]]. See also [[what-is-local-first-web-development]] for foundational concepts.
