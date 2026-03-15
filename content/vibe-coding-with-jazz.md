---
title: "Vibe Coding with Jazz"
type: talk
url: "https://www.youtube.com/watch?v=tPzHi9QiPcw"
conference: "Local-First Conf 2025"
tags:
  - jazz
  - local-first
  - crdt
  - vibe-coding
  - real-time-collaboration
  - sync-engines
  - end-to-end-encryption
authors:
  - anselm-eickhoff
summary: "A hands-on workshop building a multiplayer chat app with Jazz — demonstrating how local-first shared state replaces traditional backends, databases, and file storage with a single reactive abstraction."
date: 2026-03-08
---

## Timestamps

| Time  | Topic                                                                  |
| ----- | ---------------------------------------------------------------------- |
| 00:00 | Intro — session structure and what to expect                           |
| 01:04 | What is Jazz and Garden Computing                                      |
| 02:30 | The core insight: every stack is just reinventing shared state         |
| 04:26 | From HTML to React to Jazz — progressive steps of abstraction          |
| 05:23 | Schema definition and `useCoState` — the Jazz equivalent of `useState` |
| 06:51 | Live demo: building a chat app from scratch                            |
| 08:22 | Creating objects and navigating by co-value IDs                        |
| 10:13 | Jazz Inspector — looking under the hood                                |
| 11:12 | Adding timestamps via built-in edit history                            |
| 13:06 | Sharing the app live with the audience via port forwarding             |
| 15:25 | Accounts and profiles as co-values                                     |
| 17:17 | Editable usernames with instant sync                                   |
| 18:09 | Anonymous accounts and progressive authentication                      |
| 18:39 | Adding image uploads — files as co-values                              |
| 23:15 | Root and profile — per-user persistent state                           |
| 24:43 | Schema migrations for evolving account data                            |
| 27:08 | Offline-first sync — create locally, sync when online                  |
| 27:37 | Showcase: Invoice Raider — end-to-end encrypted invoice management     |
| 29:32 | Showcase: Hend — AI-powered language learning app                      |
| 30:31 | Getting started: `npx create-jazz-app` and AI tooling                  |
| 31:59 | VIP Coder certification program                                        |

## Key Arguments

### Every Stack is Just Reinventing Shared State (02:30)

The central thesis: every backend, database, and API layer you've ever built was really just making it possible to share state between users and devices. Jazz asks "what if we just started from shared state?" and provides sync and storage infrastructure that handles the rest. You define a schema, use `useCoState` instead of `useState`, and reactivity extends from one device to all connected users automatically.

### The Progressive Abstraction Ladder (04:26)

Anselm draws a line from raw HTML files (magical first render) → React (local reactivity without DOM manipulation) → Jazz (collaborative reactivity without backend plumbing). The jump from React to Jazz is just replacing `useState` with `useCoState` — the mental model stays the same but now state syncs across devices.

### Built-in Edit History as a Feature (11:12)

Because Jazz implements full edit history through CRDTs, metadata like "when was this created" and "who created it" comes for free. No need for `created_at` columns or audit tables — you just access `lastEditOf("text")` on any co-value. This turns what's traditionally a feature you build into a property of the data model itself.

### Local-First Permissions via Cryptography (28:36)

Jazz's permission system uses public key cryptography rather than server-side access control. When you create an object, you hold the encryption keys. Sharing means giving someone the same keys. Data syncs through Jazz infrastructure without the infrastructure ever seeing plaintext. This enables apps like Invoice Raider where users share sensitive financial data without trusting any server.

### Files and Images as Co-Values (18:39)

Traditional file upload flows (blob storage → database reference → client fetch) collapse into a single abstraction. `createImage` creates a co-value that automatically scales into multiple resolutions. `ProgressiveImage` lazily loads from low-res previews to full resolution — working well over sketchy connections and offline.

## Notable Quotes

> "Completely forget everything you've learned. Forget what you identify as. Think back to the first HTML page that you built where you just made a new file, put something in it, and you could open it in your browser, and it rendered it, and that's magical. That to me is vibe coding."
> — Anselm Eickhoff at 03:57

> "You can literally create objects in your button onClick handlers."
> — Anselm Eickhoff at 09:45

> "Isn't it refreshing if your problem isn't like, oh, what went wrong between these 10 systems? Like, no, I just forgot to put the button onClick handler."
> — Anselm Eickhoff at 22:46

## Connections

- [[local-first-software]] - The foundational principles that Jazz implements
- [[a-gentle-introduction-to-crdts]] - The underlying data structure powering Jazz's sync
- [[crdts-for-mortals]] - James Long's approach to CRDTs — Jazz takes this further with a full framework
- [[sync-engines-and-local-data]] - Comparison of sync engines including Jazz
- [[local-first-software-taking-back-control-of-our-data]] - The philosophical case for local-first that Jazz embodies
