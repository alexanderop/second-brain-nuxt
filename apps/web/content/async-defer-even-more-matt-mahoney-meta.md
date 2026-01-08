---
title: "@async: Defer Even More!"
type: youtube
url: "https://www.youtube.com/watch?v=y_Ekm3dF3qI"
tags:
  - graphql
  - architecture
  - design-patterns
  - developer-experience
  - best-practices
authors:
  - matt-mahoney
summary: "Meta's @async directive solves the problem of paying server compute costs for data that may never be displayed, using a persist-time transform that defers fragments until explicitly requested."
date: 2026-01-03
---

## The Abstraction Lifecycle

Meta uses a structured process for evolving abstractions:

1. **Prototype** — Throw ideas at the wall, recognize what doesn't work
2. **Experiment** — Partner with one product team for close iteration
3. **Adopt** — Bring to broader audience, test at scale
4. **Recommend** — Production-tested, well-documented, officially backed
5. **Discourage** — Old abstraction being replaced (hardest phase)
6. **Deprecate/Delete** — Remove completely

Before starting any abstraction work, identify if you're making something impossible become possible, or making something hard become easy.

## Stream and Defer

Stream and defer break a response into chunks. One request to the server; initial payload contains critical data, subsequent payloads deliver the rest.

- **Stream** — For lists (load items progressively)
- **Defer** — For fragments (delay expensive data)

Facebook Profile was the first adopter. The follow button and verification appear immediately; posts stream in afterward. Today, defer and stream are ubiquitous across Meta's apps.

## The Problem @async Solves

Defer improves time-to-interaction but still computes all deferred data in the background. For Instagram Profiles with a grid of posts, clicking one reveals rich detail (likes, chat heads, songs). With defer, the server computes this detail for every post even though users only click a few.

Splitting into two queries solves the compute problem but adds state management complexity—tracking cursors, knowing which queries to trigger when.

## How @async Works

@async is a fragment spread directive. When the `if` argument is true, it skips the data entirely.

At persist time, the directive transforms the query:
- Replaces `@async` with `@skip`
- Adds an ID field for refetching
- Adds a `__fulfilled` field to track whether data exists

A separate async query can be triggered to expand specific items on demand.

> "We've gotten up to a 75% reduction in how much server data is being computed for their surface."

## Generic Fragments (Prototype)

A pattern for threading fragments through generic logic without dependency cycles. Define a fragment with a generic type parameter, then specify the concrete fragment at spread time.

```graphql
fragment SortedItems<T on Node> on ItemConnection {
  edges { node { ...T } }
}

...SortedItems<ProfileItem> @generic(T: "ProfileItem")
```

Enables product teams to build their own abstractions without infrastructure involvement.

## Key Insight

By treating abstractions as having a lifecycle, Meta prevents experimental features from becoming widely adopted before they're ready—avoiding the pain of supporting discouraged abstractions at scale.
