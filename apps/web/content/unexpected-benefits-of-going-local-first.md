---
title: "Unexpected benefits of going local-first"
type: talk
url: "https://www.youtube.com/watch?v=VLgmjzERT08"
conference: "Local-First Conf 2024"
tags:
  - local-first
  - sync-engines
  - developer-experience
  - architecture
authors:
  - tuomas-artman
rating: 7
summary: "Beyond performance and offline support, local-first architecture dramatically improves developer productivity by eliminating network error handling and enabling synchronous data access."
date: 2026-01-04
---

## Overview

Tuomas Artman built sync engines for 20 years before co-founding Linear, where he finally got to build a product local-first from day one. Linear's first lines of code were the sync engine. While they expected performance, realtime, and offline benefits, the biggest surprise was developer productivity gains.

## Key Arguments

### The Sync Engine Architecture

Linear loads data from IndexedDB into an in-memory object pool at startup. From this pool, they generate a cyclical graph of model objects: organizations contain teams, teams have issues, issues have comments. Engineers access this graph synchronously without waiting for network calls.

MobX binds views to this object graph. When any model property changes, views automatically re-render. The change source doesn't matter: local user action or remote update from another user both flow through the same code path.

### Developer Productivity Is the Real Win

Traditional React code requires state for data, loading, and errors. Every mutation needs network request handling, error states, and UI updates. With Linear's sync engine, rendering a list of comments becomes two lines of code: access the collection and loop over it.

Mutations are equally simple: change a property, call save. The sync engine creates a transaction, sends it to the server, and handles rejection by reverting the change and showing a toast. Engineers wrote manual error handling in only 15 places across the entire Linear codebase.

### Prototype Without a Backend

Linear engineers can mark new models as "don't sync to backend" during development. The sync engine still saves to IndexedDB locally, so the feature works end-to-end. Once the data schema stabilizes, they implement the GraphQL endpoints and enable synchronization.

### Infrastructure Cost Savings

Because everything renders locally, Linear's servers handle minimal load. Their European data center runs 1,000 concurrent users (roughly 10,000 total users) on pods that show nearly idle CPU usage. Artman calculated they could run all of European Linear on two CPU cores for $80/month.

## Notable Quotes

> "I think we've sort of unlocked in my mind some sort of cheat code. If you go back to any other architecture where you have to make your network calls yourself or handle those errors, you're just so much faster at shipping features with a synchronization engine."

## Practical Takeaways

- Build the sync engine first, not as an afterthought
- Use observable bindings (like MobX) so views automatically update regardless of change source
- Local changes and remote changes should run through identical code paths
- Server-side validation with transaction rejection keeps clients honest while maintaining optimistic UI

## References

Discusses principles from [[local-first-software]] and relates to [[ux-and-dx-with-sync-engines]].
