---
title: "Sync Engines for Vue Developers"
type: note
tags:
  - vue
  - sync-engines
  - local-first
  - reactivity
  - state-management
  - offline-first
  - crdt
  - real-time
authors:
  - alexander-opalic
summary: "Vue already syncs your refs to the DOM. Sync engines extend that same idea to databases — keeping client state and server state in harmony. Here's how Replicache, Zero, Convex, PowerSync, LiveStore, Jazz, and Dexie each approach this differently."
date: 2026-02-21
---

## You Already Use a Sync Engine

Every Vue developer uses a sync engine daily without thinking about it. When you write `const count = ref(0)` and render it in a template, Vue's reactivity system tracks the dependency. When `count.value` changes, Vue updates the DOM. Your ref is the source of truth. The DOM is the target. Vue is the sync engine between them.

Vue 3's reactivity system makes this efficient at two levels. First, fine-grained dependency tracking via Proxies knows exactly _which_ components use `count` — only those re-render. Then, the Virtual DOM diffs the component's output against the real DOM, applying only the minimal patches needed. It is reconciliation — figuring out what changed and surgically updating the target.

This is the core idea behind every sync engine: **keep two data stores consistent with each other**.

```text
  ┌─────────────────────────────────────────────────┐
  │              Vue's Sync Engine                   │
  │                                                  │
  │   ref(0)          Virtual DOM          Real DOM  │
  │   ┌─────┐        ┌─────────┐        ┌─────────┐ │
  │   │  0  │───────▶│  diff   │───────▶│  <div>  │ │
  │   └─────┘        └─────────┘        └─────────┘ │
  │   Source          Reconciler          Target     │
  │   of Truth                                       │
  └─────────────────────────────────────────────────┘
```

## From DOM Sync to Database Sync

Now stretch that mental model. Instead of syncing a ref to a DOM node, imagine syncing it to a row in a database. Your component writes to local state. A sync engine picks up that change, sends it to a server, and distributes it to other clients. When another user makes a change on the server, the sync engine pulls it down and updates your local state — which triggers Vue's reactivity, which updates the DOM.

Two sync layers, stacked:

```text
  ┌─────────────────────────────────────────────────────────────┐
  │                                                              │
  │              Layer 2: Data Sync (bidirectional)              │
  │                                                              │
  │   ┌──────────┐      ┌─────────────┐      ┌──────────────┐  │
  │   │  Local    │◀────▶│ Sync Engine │◀────▶│   Server     │  │
  │   │  Store    │      │             │      │   Database   │  │
  │   └────┬─────┘      └─────────────┘      └──────────────┘  │
  │        │                                                     │
  │        │         Layer 1: UI Sync (one-directional)          │
  │        │                                                     │
  │        ▼                                                     │
  │   ┌──────────┐      ┌─────────────┐      ┌──────────────┐  │
  │   │  ref()   │─────▶│ Virtual DOM │─────▶│   Real DOM   │  │
  │   └──────────┘      └─────────────┘      └──────────────┘  │
  │                                                              │
  └─────────────────────────────────────────────────────────────┘
```

The first layer (UI sync) is primarily one-directional — data flows from refs to the DOM during rendering. (User input via `v-model` flows back, but the ref remains the source of truth — the DOM never independently generates state.) The second layer (data sync) is **bidirectional** — both sides can change independently, and the engine must reconcile conflicts. This is what makes it a distributed systems problem.

As Kyle Mathews put it at Local-First Conf: we are in the "jQuery era of data." We manually fetch, cache, invalidate, and handle errors for every server interaction. Sync engines promise the same leap that reactive frameworks gave us for the DOM — declare what data you want, and the system keeps it in sync.

## Why Pure Local-First Needs Decentralized Conflict Resolution

Here is the key insight: in a server-first architecture, the server decides what happened. Two clients edit the same row? The server picks a winner, or serializes the writes into a transaction. Simple. But in pure local-first, **there is no central authority**. The server — if it exists at all — is just an always-online peer for relaying changes between devices. It does not make decisions. It could be replaced by Bluetooth, a USB stick, WebRTC, or a local WiFi connection. The transport does not matter.

This means you need a conflict resolution strategy that works **without a central arbiter**. Two main approaches exist:

```text
  Approach 1: CRDTs                     Approach 2: Deterministic Replay
  ─────────────────                     ────────────────────────────────

  Each value knows how                  Record immutable events.
  to merge with itself.                 Replay them deterministically.
  No coordination needed.               Same events = same state.

  ┌────────┐    ┌────────┐             ┌────────┐    ┌────────┐
  │Client A│    │Client B│             │Client A│    │Client B│
  │set x=1 │    │set x=2 │             │event: 1│    │event: 2│
  └───┬────┘    └───┬────┘             └───┬────┘    └───┬────┘
      │             │                      │             │
      ▼             ▼                      ▼             ▼
  ┌──────────────────────┐             ┌──────────────────────┐
  │  CRDT merge rule     │             │  Deterministic       │
  │  (e.g. LWW: x=2)    │             │  materializer        │
  │  Both clients get    │             │  replays all events  │
  │  same result         │             │  → same SQL state    │
  └──────────────────────┘             └──────────────────────┘
  Used by: Jazz, Dexie                 Used by: LiveStore
```

CRDTs (used by Jazz, DexieCloud) encode the merge rules into the data structure itself. A CoMap uses last-write-wins per key. A CoList handles concurrent inserts with positional merge. The data type guarantees convergence.

Deterministic event replay (used by LiveStore) takes a different path: record immutable events, replay them in a deterministic order, and run a pure materializer function. Same events in, same state out. No CRDT needed — the determinism of the replay is the guarantee.

Both approaches share the same property: **the server is optional infrastructure, not a decision-maker**. As Martin Kleppmann puts it, CRDTs work with any network topology — peer-to-peer, local networks, or cloud relays. You could sync over Bluetooth between two phones sitting on a table, and the data would merge correctly. The transport is irrelevant. What matters is that every device can independently compute the correct state.

This is the fundamental divide in the sync engine world. Server-authoritative engines (Convex, Zero, PowerSync) are simpler because the server resolves all conflicts. Decentralized engines (Jazz, LiveStore, Dexie) are more resilient because no single point of failure can block the user.

## The Spectrum: Server-First to Local-First

Not all sync engines work the same way. They sit on a spectrum from **server-first** (the server is the single source of truth, the client is a thin cache) to **full local-first** (the client has a complete database and can operate indefinitely offline).

Before going further, a distinction worth making: **offline-first** and **local-first** are not the same thing. Offline-first means the app works without a network connection — it caches data locally and syncs when connectivity returns. But the server is still the authority. If the server rejects your offline write, the client rolls back. PowerSync and Replicache are offline-first: full offline capability, server-authoritative conflict resolution.

Local-first goes further. The client _is_ the authority. Your data lives on your device, you own it, and the server — if one exists — is just a convenience for syncing between devices. You could delete the server and your app keeps working. This requires decentralized conflict resolution (CRDTs or deterministic replay) because there is no central arbiter to settle disagreements. Jazz and LiveStore are local-first: the data belongs to the user, not the platform.

In practice, the line blurs. Many engines mix traits from both — but the philosophical difference matters: offline-first asks "how do I keep working without a server?", while local-first asks "why does the server own my data at all?"

Where an engine sits on this spectrum determines its trade-offs:

- **Server-first** engines are simpler to reason about — no conflict resolution, strong consistency, but dependent on connectivity.
- **Offline-first** engines add local storage for reads and writes, but the server remains authoritative and resolves conflicts.
- **Local-first** engines give instant UI, offline support, and data ownership — but must solve the hard problem of merging concurrent changes from multiple clients without a central authority.

Most real-world sync engines land somewhere in between.

```text
  Server-First                                                       Local-First
  ◀──────────────────────────────────────────────────────────────────────────────▶

  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
  │ Convex │ │  Zero  │ │Repli-  │ │ Power- │ │ Dexie  │ │  Jazz  │ │  Live- │
  │        │ │        │ │cache   │ │  Sync  │ │ Cloud  │ │        │ │  Store │
  │Server  │ │Server  │ │Server  │ │Server  │ │Client  │ │CRDTs   │ │Client  │
  │runs all│ │rebases │ │rebases │ │confirm │ │owns,   │ │E2E     │ │owns,   │
  │queries │ │client  │ │you run │ │writes  │ │server  │ │encrypt │ │events  │
  │+writes │ │writes  │ │backend │ │        │ │syncs   │ │mesh    │ │= truth │
  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘ └────────┘ └────────┘
  No offline  Offline    Full       Offline    Full        Full       Full
  store       reads      offline    read+write offline     offline    offline
```

Let me walk through each engine, starting with the one that kicked off the modern sync engine era.

## Replicache: Where It Started

[Replicache](https://replicache.dev/) by Rocicorp popularized the **server-authoritative rebase** model for web applications, and the design influenced much of this space. The core idea: give the client a local key-value store for instant reads and writes, but let the server remain the authority on what actually happened.

The developer writes **mutators** — named functions that modify data. Here is the critical design choice: you write each mutator **twice**. Once in JavaScript for the client (for instant optimistic updates), once in your backend language for the server (for authoritative execution). The client runs the mutator locally, records it as pending, then sends it to the server. The server runs its own version against the real database. On the next pull, the client rebases its pending mutations on top of the server's state.

```text
  ┌─────────────────┐                    ┌─────────────────┐
  │     Client      │                    │     Server      │
  │                 │                    │                 │
  │  mutator:       │     push           │  mutator:       │
  │  addTodo(       │  ──────────▶       │  addTodo(       │
  │    "Buy milk"   │  (name + args)     │    "Buy milk"   │
  │  )              │                    │  )              │
  │                 │                    │                 │
  │  runs locally   │     pull           │  runs against   │
  │  against IDB    │  ◀──────────       │  real database  │
  │  (optimistic)   │  (server state)    │  (authoritative)│
  │                 │                    │                 │
  │  rebase pending │                    │                 │
  │  on new state   │                    │                 │
  └─────────────────┘                    └─────────────────┘
       Same logic,                           Same logic,
       JS version                         backend version
```

Replicache was deliberately minimal — client-side only, two HTTP endpoints (push and pull), bring your own backend. This simplicity made it easy to adopt but created friction at scale. Storing all data on the client was not practical for large apps, and computing per-user data diffs got expensive. These limitations led directly to Zero.

**When to pick Replicache:** You want maximum control over your backend, you are comfortable writing mutators twice, and you need a proven, minimal sync primitive. Note that Rocicorp now focuses on Zero as the next generation.

## Zero: Speed Without the Boilerplate

[Zero](https://zerosync.dev/) is Replicache's successor, also by Rocicorp. It solves Replicache's biggest pain point: **you no longer write mutators twice**. Their thesis remains the same — the primary reason to sync data to the client is **speed**. You can make your dropdown menu render in 1ms, but if clicking an item takes 500ms to cross the network, you have lost.

Zero provides a **Zero Cache Server** (ZCS) that sits between your clients and Postgres. You write queries and mutations in client-side JavaScript only — the ZCS watches Postgres's logical replication stream and pushes changes to clients via WebSocket.

Zero maintains a **normalized client-side cache** backed by a custom row store on top of IndexedDB. You write queries using their reactive query language (ZQL) — declare what data you want, and Zero keeps it up to date. Think `computed()` but for database queries. Results come from the local cache — instant. Writes hit the cache first, then sync to the server in the background.

The rebase mechanism is the same as Replicache — server-authoritative, Git-style. Your pending mutations replay on top of the latest server state. The server always wins, but the UI never waits.

```text
  Client                              Server (Postgres)
  ──────                              ─────────────────

  1. User clicks "rename"
     ┌─────────────────┐
     │ Mutation: rename │──────────────▶ Apply mutation
     │ (pending)        │               against server DB
     └─────────────────┘                      │
                                              ▼
  2. Server state arrives           Server state: v42
     ◀──────────────────────────────── (pull response)
           │
           ▼
  3. Rebase: replay pending
     mutations on top of v42
     ┌─────────────────┐
     │ v42 + rename    │ = new local state
     └─────────────────┘
```

**When to pick Zero:** You want Linear-quality speed for an online app. You have Postgres. You do not need full offline writes (offline is currently out of scope — Aaron Boodman has stated the UX challenges make it a non-goal for now). Speed is the primary goal, not offline autonomy.

## Convex: Reactive Queries, Server Authority

[Convex](https://convex.dev/) takes the opposite position on the spectrum. James Cowling, Convex co-founder, said it plainly at Local-First Conf: "Throw your laptop in the lake — that's okay because the important state lives on the server."

Convex is not a sync engine in the local-first sense. It is a **reactive backend**. You write TypeScript query and mutation functions that run on Convex's servers. The client subscribes to queries over a WebSocket. When underlying data changes, Convex automatically re-runs the query and pushes the new result. Think of it as `computed()` — but the computation runs on the server, and the result streams to every subscribed client.

By default there is no persistent client-side database — the client holds query results in memory. Mutations are server-side functions — optimistic updates are possible, but the server runs real ACID transactions. No last-write-wins, no CRDTs needed. Conflicts cannot happen because all writes are serialized on the server. (Convex is experimenting with offline support via [Curvilinear](https://github.com/get-convex/curvilinear), an alpha offline sync engine that adds IndexedDB persistence and Automerge-based CRDT sync — but this is not yet part of the core product.)

```text
  Client A             Convex Server              Client B
  ────────             ────────────               ────────

  subscribe(           ┌──────────────┐           subscribe(
    "listTodos"  ─────▶│  Run query   │◀───────     "listTodos"
  )                    │  Track deps  │           )
                       └──────┬───────┘
                              │
                       ┌──────▼───────┐
  mutation(    ───────▶│  ACID txn    │
    "addTodo"          │  on server   │
  )                    └──────┬───────┘
                              │
                       ┌──────▼───────┐
  new result   ◀───────│  Re-run      │──────▶  new result
  pushed via WS        │  affected    │         pushed via WS
                       │  queries     │
                       └──────────────┘
```

**When to pick Convex:** You want the simplest possible developer experience. You are building a collaborative app that is always online. You do not need offline support. You want real-time reactivity without building WebSocket infrastructure yourself.

## PowerSync: Postgres Everywhere

[PowerSync](https://www.powersync.com/) sits between Zero and full local-first. Its pitch: if you already have Postgres, PowerSync gives every client their own SQLite database that stays in sync with it.

PowerSync reads Postgres's logical replication stream (the WAL). Changes flow through **sync rules** — declarative filters that determine which data each client receives. The client has a real SQLite database (via `wa-sqlite` in the browser, native SQLite on mobile). Reads are local SQL queries — instant, offline-capable.

Writes work differently. The client writes optimistically to local SQLite, then sends the change to your backend API (not directly to Postgres). Your backend validates and applies it. The result flows back through Postgres replication. If the server rejects the write, the local state corrects on the next sync.

```text
                    ┌───────────────────────┐
                    │   PowerSync Service   │
                    │                       │
  ┌─────────┐      │  ┌─────────────────┐  │      ┌──────────┐
  │ Client  │◀─────│──│  Sync Rules     │──│─────▶│ Postgres │
  │ SQLite  │      │  │  (filter what   │  │      │   (WAL)  │
  │ (WASM)  │      │  │   each client   │  │      └────┬─────┘
  └────┬────┘      │  │   receives)     │  │           │
       │           │  └─────────────────┘  │           │
       │ write     └───────────────────────┘           │
       ▼                                               │
  ┌─────────┐          ┌──────────┐                    │
  │ Upload  │─────────▶│ Your API │────────────────────┘
  │ Queue   │          │ (validate│    write to Postgres
  └─────────┘          │ + apply) │    flows back via WAL
                       └──────────┘
```

**When to pick PowerSync:** You have an existing Postgres database and want to add local-first capabilities without rewriting your backend. You want full SQL on the client. You need mobile support (React Native, Flutter) alongside web.

## LiveStore: Event Sourcing Meets Reactive SQLite

[LiveStore](https://livestore.dev/), built by Johannes Schickling (co-founder of Prisma), takes the most radically local-first approach. Schickling's position: forget about the server database entirely. Start from the client. (Note: LiveStore is currently in **beta** — most APIs are stable but breaking changes are still possible before 1.0.)

LiveStore combines **event sourcing** with a **reactive SQLite** database running on the client (via WASM in the browser). Instead of mutating rows directly, you record immutable events — like bank transactions rather than balance updates. Materializers (pure functions) translate events into SQL statements. The SQLite database rebuilds from the event log.

Sync happens at the event level. Clients exchange events, not state. Each client replays the full event log and materializes its own database. Because the materializer is deterministic, every client converges to the same state — no conflict resolution algorithm needed.

The API is synchronous. Queries return data immediately, no loading states. Events commit locally and sync in the background. Schickling calls it "git for application data" — branch, replay, recompute.

```text
  Client A                                          Client B
  ────────                                          ────────

  User action                                       User action
       │                                                 │
       ▼                                                 ▼
  ┌──────────┐                                     ┌──────────┐
  │  Event:  │                                     │  Event:  │
  │  LikeAdd │                                     │  Rename  │
  └────┬─────┘                                     └────┬─────┘
       │                                                 │
       ▼                                                 ▼
  ┌──────────┐     sync events      ┌──────────┐  ┌──────────┐
  │  Event   │◀────────────────────▶│  Sync    │──│  Event   │
  │  Log     │                      │  Server  │  │  Log     │
  └────┬─────┘                      └──────────┘  └────┬─────┘
       │                                                │
       ▼                                                ▼
  ┌──────────┐    same events =    ┌──────────┐
  │Materiali-│    same state       │Materiali-│
  │zer (SQL) │                     │zer (SQL) │
  └────┬─────┘                     └────┬─────┘
       ▼                                ▼
  ┌──────────┐                    ┌──────────┐
  │  SQLite  │   ══════════════   │  SQLite  │
  │  (same)  │   identical state  │  (same)  │
  └──────────┘                    └──────────┘
```

**When to pick LiveStore:** You are building personal or small-group software (a notes app, a family grocery list, a music tool). You want full data ownership and offline support. You want an audit trail of every change via the event log. You value the ability to rewrite materializers and recompute state from history.

## Jazz: CRDTs With Built-In Everything

[Jazz](https://jazz.tools/), built by Anselm Eickhoff, takes the most vertically integrated approach. Where other engines solve sync and leave auth, permissions, and encryption to you, Jazz fuses them all at the data layer.

The core primitive is the **CoValue** (Collaborative Value) — a typed CRDT that automatically tracks edit history, resolves conflicts, and syncs across devices. CoValues are small and granular: a CoMap for key-value objects, a CoList for ordered arrays, a CoFeed for append-only per-user logs, CoText for collaborative text editing, FileStream for binary data, and CoRecord for typed key-value pairs. You compose them into larger structures by reference.

```text
  ┌──────────────────────────────────────────────────────┐
  │                    CoValue Graph                      │
  │                                                      │
  │   CoMap: Project           CoList: Tasks             │
  │   ┌──────────────┐        ┌─────────────────┐       │
  │   │ name: "App"  │───────▶│ ┌─────────────┐ │       │
  │   │ tasks: ──────│        │ │ CoMap: Task  │ │       │
  │   └──────────────┘        │ │ title: "..." │ │       │
  │                           │ │ done: false  │ │       │
  │                           │ └─────────────┘ │       │
  │   Each CoValue:           │ ┌─────────────┐ │       │
  │   • Is a CRDT             │ │ CoMap: Task  │ │       │
  │   • Has full history      │ │ title: "..." │ │       │
  │   • Auto-merges           │ │ done: true   │ │       │
  │   • E2E encrypted         │ └─────────────┘ │       │
  │   • Has permissions       └─────────────────┘       │
  └──────────────────────────────────────────────────────┘
```

The architecture is a **distributed mesh** rather than client-server. Clients connect to sync nodes (Jazz Cloud or self-hosted) via WebSocket. Sync nodes are not authoritative servers — they are always-online peers that relay and persist data. Every CoValue is **end-to-end encrypted** on the device before transmission using Ed25519 signatures, XSalsa20 stream cipher encryption, and BLAKE3 hashing. Symmetric read keys managed by Groups control access — the server never sees plaintext.

Conflict resolution varies by CoValue type: last-write-wins per key for CoMaps, positional merge for CoLists, append-only for CoFeeds. Because they are CRDTs, changes merge automatically without coordination — no central authority needed.

```text
  Client A                 Sync Node                Client B
  ────────              (peer, not server)           ────────

  CoMap.set(             ┌──────────────┐
    "title",       ─────▶│  Relay +     │
    "New name"           │  Persist     │
  )                      │              │
                         │  (encrypted  │◀─────  CoMap.set(
  CRDT auto-merge        │   blobs,     │          "done",
  on both sides    ◀─────│   never      │─────▶    true
                         │   plaintext) │        )
                         └──────────────┘
                                                  CRDT auto-merge
  Result:                                         on both sides
  title="New name"
  done=true                                       Result:
  (no conflict)                                   title="New name"
                                                  done=true
```

**When to pick Jazz:** You want a complete toolkit — sync, auth, permissions, encryption, file handling, and multiplayer in one package. You are building collaborative software where data privacy matters. You do not want to run a traditional backend. You are comfortable with the CRDT mental model.

## Dexie (DexieCloud): Progressive Enhancement

[Dexie](https://dexie.org/) is a popular, feature-rich IndexedDB library with support for transactions, compound indexes, and live queries — many developers already use it as their client-side database. [DexieCloud](https://dexie.org/cloud/) adds sync on top without changing the API.

Each client has an IndexedDB database managed by Dexie. DexieCloud's hosted server replicates changes between clients using version vectors and a last-write-wins default strategy (custom merge logic is configurable). It includes built-in access control — you can mark objects as owned by specific users or shared within groups.

The strength is progressive enhancement. If you are already using Dexie, adding sync is a configuration change, not an architecture rewrite. You keep your existing queries, indexes, and data model — just add the cloud plugin and authentication. The downside is IndexedDB itself — it has storage limits and performance constraints compared to SQLite-based solutions, and lacks the relational query power of SQL.

```text
  ┌─────────────────────────────────────────────┐
  │           Dexie → DexieCloud upgrade         │
  │                                              │
  │   Step 1: You already have Dexie             │
  │   ┌──────────────────────────────────┐       │
  │   │  const db = new Dexie('mydb')    │       │
  │   │  db.version(1).stores({          │       │
  │   │    todos: '++id, title, done'    │       │
  │   │  })                              │       │
  │   └──────────────────────────────────┘       │
  │                                              │
  │   Step 2: Add DexieCloud (same API)          │
  │   ┌──────────────────────────────────┐       │
  │   │  import dexieCloud from          │       │
  │   │    'dexie-cloud-addon'           │       │
  │   │  const db = new Dexie('mydb', {  │       │
  │   │    addons: [dexieCloud]          │       │
  │   │  })                              │       │
  │   │  db.cloud.configure({            │       │
  │   │    databaseUrl: '...'            │       │
  │   │  })                              │       │
  │   └──────────────────────────────────┘       │
  │                                              │
  │   Same queries. Same indexes. Now it syncs.  │
  └─────────────────────────────────────────────┘
```

**When to pick Dexie:** You want the lowest-friction path to sync. You are already using IndexedDB. You want built-in access control and sharing. Your dataset fits within browser storage limits.

## The Trade-Off Matrix

|                       | **Replicache**    | **Zero**               | **Convex**                 | **PowerSync**              | **LiveStore**        | **Jazz**             | **DexieCloud**   |
| --------------------- | ----------------- | ---------------------- | -------------------------- | -------------------------- | -------------------- | -------------------- | ---------------- |
| **Client store**      | IndexedDB (KV)    | Custom row store (IDB) | In-memory                  | SQLite (WASM)              | SQLite (WASM)        | IndexedDB            | IndexedDB        |
| **Server store**      | Your DB           | Postgres               | Convex DB                  | Postgres                   | Pluggable            | Sync nodes           | DexieCloud       |
| **What syncs**        | Mutations + state | Normalized rows        | Query results              | Filtered rows (sync rules) | Events               | CoValues (CRDTs)     | Changes          |
| **Offline reads**     | Yes               | Yes                    | No                         | Yes                        | Yes                  | Yes                  | Yes              |
| **Offline writes**    | Yes               | No (out of scope)      | No (alpha via Curvilinear) | Yes                        | Yes                  | Yes                  | Yes              |
| **Conflict strategy** | Server rebase     | Server rebase          | Server txns                | Server-auth                | Deterministic replay | CRDT merge           | Last-write-wins  |
| **E2E encryption**    | No                | No                     | No                         | No                         | No                   | Yes (default)        | No               |
| **Local-first?**      | Yes (server-auth) | Online-first           | Server-first               | Hybrid                     | Full                 | Full                 | Full             |
| **Best for**          | Custom backends   | Speed-first apps       | Collaborative SaaS         | Postgres brownfield        | Personal/small group | Privacy-first collab | Progressive sync |

## Mapping It Back to Vue

If you think in Vue concepts, the mapping is straightforward:

```text
  Vue Concept                         Sync Engine Equivalent
  ───────────                         ──────────────────────

  ref() / reactive()            ───▶  Local database
                                      (SQLite, IndexedDB, in-memory)

  watch() / computed()          ───▶  Reactive queries
                                      (re-run when data changes)

  Virtual DOM diffing           ───▶  Sync protocol
                                      (compute minimal updates)

  The real DOM                  ───▶  Server database
                                      (the other store to keep in sync)

  ┌──────────────────────────────────────────────────┐
  │                                                   │
  │  Vue:    ref ──────▶ VDOM diff ──────▶ DOM        │
  │          (one direction)                          │
  │                                                   │
  │  Sync:   client ◀──── protocol ────▶ server      │
  │          (bidirectional — the hard part)           │
  │                                                   │
  └──────────────────────────────────────────────────┘
```

To make this concrete, here is how a traditional Vue composable for fetching todos compares to a sync engine approach:

```ts
// Traditional: fetch, cache, invalidate, handle errors
function useTodos() {
  const todos = ref([]);
  const loading = ref(true);
  const error = ref(null);

  async function load() {
    loading.value = true;
    try {
      todos.value = await fetch("/api/todos").then((r) => r.json());
    } catch (e) {
      error.value = e;
    } finally {
      loading.value = false;
    }
  }

  async function addTodo(title) {
    // Optimistic update
    const temp = { id: Date.now(), title, done: false };
    todos.value.push(temp);
    try {
      const real = await fetch("/api/todos", {
        method: "POST",
        body: JSON.stringify({ title }),
      }).then((r) => r.json());
      // Replace temp with real
      const idx = todos.value.indexOf(temp);
      todos.value[idx] = real;
    } catch (e) {
      // Rollback on failure
      todos.value = todos.value.filter((t) => t !== temp);
      error.value = e;
    }
  }

  load();
  return { todos, loading, error, addTodo };
}
```

```ts
// With a sync engine (Zero-style pseudocode):
// No loading states. No error handling. No cache invalidation.
function useTodos() {
  const z = useZero();
  const todos = useQuery(z.query.todo.orderBy("created", "desc"));

  function addTodo(title) {
    z.mutate.todo.insert({ title, done: false });
  }

  return { todos, addTodo };
}
```

The sync engine version is not just less code — it is fundamentally different. Reads are synchronous (data is already local). Writes are instant (mutate local, sync in background). Reactivity is automatic (the query re-runs when data changes, just like `computed()`).

The difference: Vue's reconciliation is one-directional (refs → DOM). Sync engines are bidirectional (client ↔ server). Both sides can change independently, and the engine must reconcile. This is what makes sync fundamentally harder — and why there are so many different approaches.

## Notable Mentions

The engines above are the primary players, but several others are worth knowing about:

**[Electric](https://electric-sql.com/)** (formerly ElectricSQL) — A read-path sync engine for Postgres. Electric 1.0 is now GA and syncs data from Postgres to clients via "Shapes" — declarative subsets of your database. It focuses on the read side (syncing data out to clients efficiently) rather than providing a full client-side mutation layer. If you already have a Postgres backend and want to add real-time data delivery, Electric is a strong option. Its new Durable Streams primitive is the foundation for Electric 2.0.

**[Triplit](https://www.triplit.dev/)** — A full-stack syncing database with both client and server components. Triplit 1.0 is production-ready with CRDT-based conflict resolution at the attribute level, reactive queries, offline support, and pluggable storage (IndexedDB, SQLite, Cloudflare Durable Objects). It has official Vue/Svelte/React/Solid bindings, making it one of the more framework-friendly options.

**[InstantDB](https://www.instantdb.com/)** — A modern Firebase alternative with a relational data model instead of NoSQL. Provides real-time sync, optimistic updates, graph-style nested queries, and built-in presence (cursors, typing indicators). Server-authoritative with offline support. Think Firebase but with proper relations and a cleaner query API.

**[Y.js](https://yjs.dev/)** — The most widely deployed CRDT library for real-time collaborative text editing. If you use Tiptap in Vue, you are already using Y.js under the hood. It solves a specific kind of sync (collaborative rich text, shared data structures) rather than general database sync. Worth knowing as a specialized tool in the sync ecosystem.

## How to Choose

The right engine depends on your constraints, not which one is "best." Walk through these questions:

```text
  Do you need offline writes?
  ├── No ──▶ Is speed your primary goal?
  │          ├── Yes ──▶ Zero (with Postgres)
  │          └── No ───▶ Convex (simplest DX)
  │
  └── Yes ─▶ Do you have an existing Postgres database?
             ├── Yes ──▶ PowerSync
             └── No ───▶ Do you need E2E encryption?
                         ├── Yes ──▶ Jazz
                         └── No ───▶ What kind of app?
                                     ├── Personal/small group ──▶ LiveStore
                                     ├── Already using IndexedDB ──▶ DexieCloud
                                     └── Need full-stack sync ──▶ Triplit
```

## What About Pinia?

If you are using Pinia today, sync engines do not necessarily replace it. Pinia manages **client-side application state** — UI state, form state, feature flags, user preferences. Sync engines manage **persistent data that lives across client and server**.

In practice, you might use both: Pinia for local UI state (sidebar open, selected tab, draft form values) and a sync engine for domain data (todos, documents, user profiles). The sync engine replaces the `fetch` + `cache` + `invalidate` pattern, not the `ref()` + `computed()` pattern.

If your Pinia stores are mostly thin wrappers around API calls (`fetchTodos`, `createTodo`, `updateTodo`), those are the stores that sync engines make obsolete.

## Practical Considerations

**Bundle size matters.** SQLite WASM alone adds ~500KB to your bundle. Engines with richer feature sets (Jazz, LiveStore) carry more weight than thin clients (Zero, Convex). Measure the impact against your performance budget before committing.

**Schema evolution is hard.** When your database lives on the client, you cannot just run a migration on one server. Every client has its own copy of the schema. Each engine handles this differently — some version the schema (Dexie), some use event replay (LiveStore can recompute state from a new materializer), some use migration functions (Jazz). Plan for this upfront.

**Testing sync is different.** You need to test conflict scenarios, offline-to-online transitions, and eventual consistency. This is a different class of testing than standard Vue component tests. Most engines provide test utilities, but the mental model is closer to distributed systems testing than frontend testing.

As Tuomas Artman from Linear put it after building with a sync engine for years: it is a cheat code. Once your data layer handles sync, your components become trivially simple. No loading states. No error handling for network failures. No cache invalidation. Two lines to render a list. One line to mutate.

The rendering era is over. The data layer is where the innovation is happening now. If you are building a new Vue app that touches server data, try building one feature with a sync engine. Feel the difference between manually wiring `fetch` → `ref` → `watch` → `invalidate` versus declaring what data you want and letting the engine handle the rest. The best way to understand the shift is to experience it firsthand.

## Related

- [[what-is-local-first-web-development]] — My introduction to local-first principles for web developers
- [[ux-and-dx-with-sync-engines]] — How sync engines improve both user and developer experience
- [[sync-panel-discussion]] — Aaron Boodman, James Cowling, Johannes Schickling, and Kyle Mathews debate the trade-offs live
- [[native-grade-web-apps-with-local-first-data]] — Schickling's ViteConf talk on why data architecture determines app quality
- [[livestore]] — Deep dive into LiveStore's reactive SQLite and event sourcing model
- [[basic-likes-feature-with-livestore]] — A practical tutorial building a feature with LiveStore
- [[unleashing-the-power-of-sync]] — The evolution from manual state management through TanStack Query to sync engines
- [[local-first-software]] — The foundational Ink & Switch essay defining the seven ideals
- [[a-gentle-introduction-to-crdts]] — Understanding the conflict resolution technique that underlies Jazz and other CRDT-based sync approaches
- [[alien-signals-deep-dive]] — How Vue's reactivity system achieves its performance at the lowest level
- [[unexpected-benefits-of-going-local-first]] — Linear's experience: developer productivity was the biggest surprise
- [[why-local-first-apps-havent-become-popular]] — The genuine distributed systems challenges that make sync hard
- [[local-first-software-pragmatism-vs-idealism]] — The tension between purist local-first and pragmatic approaches
- [[the-past-present-and-future-of-local-first]] — Kleppmann's updated definition and vision for commoditized sync
- [[alkalye]] — A real-world local-first app built with Jazz, showing CoValues in practice
- [[its-time-to-change-your-database]] — Theo Browne on why Convex's unified TypeScript backend changes the game for AI-assisted development
