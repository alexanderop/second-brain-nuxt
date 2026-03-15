---
title: "Talk Outline: Building Websites with Local-First and Vue"
type: note
tags:
  - local-first
  - vue
  - talk
  - sync-engines
  - crdt
  - offline-first
authors:
  - alexander-opalic
summary: "Outline for a talk tracing the journey from manual DOM manipulation to reactive frameworks to offline-first to local-first, with practical Vue examples and sync engine comparisons."
date: 2026-02-28
---

## Talk Outline: Building Websites with Local-First and Vue

### The Narrative Thread: Progressive Reveal of the 7 Ideals

The 7 ideals from the Ink & Switch local-first essay are NOT introduced upfront. Instead, they emerge naturally across the talk — the audience discovers that the principles they've been learning about ARE the local-first ideals. Only in Part 5 do we name them and show the full picture.

```text
  THE 7 IDEALS — PROGRESSIVE REVEAL
  ══════════════════════════════════════════════════════════════════

  Ideal                     Offline-First    Sync Engines    Local-First
  ─────                     ────────────     ────────────    ──────────
  1. Fast (no spinners)        ✓                ✓              ✓
  2. Multi-device              .                ✓              ✓
  3. Works offline             ✓                ✓              ✓
  4. Collaboration             .                ✓              ✓
  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─
  5. Longevity                 .                .              ✓   ← values
  6. Privacy & security        .                .              ✓   ← not just
  7. User control              .                .              ✓   ← technology
  ══════════════════════════════════════════════════════════════════

  Offline-first = 2/7     Sync engines = 4/7     Local-first = 7/7
```

---

### Part 1: The Journey — How We Got Here

**1.1 The jQuery Era: Manual Reactivity**

- We started by writing raw JavaScript to keep the DOM in sync with state
- Every click handler manually updated the DOM
- The problem was fundamentally about **sync** — keeping two things (state and DOM) consistent

```text
  THE JQUERY ERA
  ═══════════════════════════════════════════════════

  User clicks            Developer writes         DOM updates
  ┌──────────┐          ┌──────────────────┐      ┌──────────┐
  │  "Add"   │─────────▶│  getElementById  │─────▶│ <li>Milk │
  │  button  │          │  .appendChild()  │      │ </li>    │
  └──────────┘          │  .innerText =    │      └──────────┘
                        │  .className =    │
                        │  .style =        │
                        │  ... every.      │
                        │  single. change. │
                        └──────────────────┘
                             YOU are the
                             sync engine
```

**1.2 Reactive Frameworks: Vue Abstracts the DOM Sync**

- Vue solved DOM sync — declare state with `ref()`, the framework handles the rest
- Vue's reactivity system IS a sync engine: source → reconciler → target

```text
  VUE'S SYNC ENGINE
  ═══════════════════════════════════════════════════

     Source              Reconciler            Target
     of Truth
  ┌──────────┐       ┌──────────────┐      ┌──────────┐
  │  ref(0)  │──────▶│  Virtual DOM │─────▶│ Real DOM │
  │          │       │  (diff)      │      │ <div>0   │
  └──────────┘       └──────────────┘      │ </div>   │
                                           └──────────┘
  You write:              Vue does:          Browser shows:
  count.value++           track + patch       updated UI
```

- This is the pattern we'll see again and again

**1.3 The Problem That Remains: Two Sources of Truth**

- Vue solved client-side sync, but we still duplicate code and logic across frontend and backend
- State management became its own discipline: Vuex, Pinia, TanStack Query, SWR...
- As Kyle Mathews put it: we're in the **"jQuery era of data"**

```text
  THE REMAINING PROBLEM
  ═══════════════════════════════════════════════════

  ┌─────────────────────┐         ┌─────────────────────┐
  │      FRONTEND       │         │      BACKEND        │
  │                     │         │                     │
  │  ref([])            │  fetch  │  app.get('/todos')  │
  │  loading = true     │◀───────▶│  validate(...)      │
  │  try { ... }        │  POST   │  db.insert(...)     │
  │  catch { ... }      │◀───────▶│  authorize(...)     │
  │  finally { ... }    │         │                     │
  │  invalidateCache()  │         │  SAME LOGIC         │
  │                     │         │  DUPLICATED         │
  │  SAME LOGIC         │         │                     │
  │  DUPLICATED         │         │                     │
  └─────────────────────┘         └─────────────────────┘

  Traditional:                     With a sync engine:
  ─────────────────────            ────────────────────────
  const todos = ref([])            const todos = useQuery(...)
  const loading = ref(true)
  const error = ref(null)          function addTodo(title) {
                                     mutate({ title })
  async function load() {          }
    loading.value = true
    try {                          // No loading. No error.
      todos.value = await fetch    // No cache invalidation.
    } catch (e) {                  // Data is already local.
      error.value = e
    } finally {
      loading.value = false
    }
  }
```

---

### Part 2: Offline-First — The App That Never Stops Working

**2.1 What Is Offline-First?**

- The app works without a network connection — reads and writes happen locally
- The server is still the authority, but the client doesn't wait for it
- When connectivity returns, changes sync up

```text
  OFFLINE-FIRST ARCHITECTURE
  ═══════════════════════════════════════════════════

          ONLINE                          OFFLINE
  ┌─────────────────────┐       ┌─────────────────────┐
  │                     │       │                     │
  │  ┌───────┐  read    │       │  ┌───────┐  read    │
  │  │Local  │◀─────    │       │  │Local  │◀─────    │
  │  │Store  │          │       │  │Store  │          │
  │  │(IDB/  │─────▶    │       │  │(IDB/  │─────▶    │
  │  │SQLite)│  write   │       │  │SQLite)│  write   │
  │  └───┬───┘          │       │  └───┬───┘          │
  │      │              │       │      │              │
  │      │ sync ↕       │       │      │ queued       │
  │      │              │       │      │ ✗ no network │
  │  ┌───▼───┐          │       │  ┌───▼───┐          │
  │  │Server │          │       │  │Pending│          │
  │  │  DB   │          │       │  │Writes │          │
  │  └───────┘          │       │  └───────┘          │
  │                     │       │                     │
  └─────────────────────┘       └─────────────────────┘
                                  Still works! ✓
```

**2.2 What We Already Get (Without Saying "Local-First" Yet)**

Don't name these as "the 7 ideals" — just show what offline-first gives us naturally:

```text
  WHAT OFFLINE-FIRST GIVES US
  ═══════════════════════════════════════════════════

  ┌─────────────────────────────────────────────────┐
  │                                                 │
  │  ✓  FAST — no spinners                         │
  │     Data is local. Reads are instant.           │
  │     No waiting for the network.                 │
  │                                                 │
  │  ✓  WORKS OFFLINE                               │
  │     The whole point. Read and write              │
  │     without connectivity.                        │
  │                                                 │
  │  ·  Multi-device?     Not yet — need sync       │
  │  ·  Collaboration?    Not yet — need sync       │
  │  ·  Longevity?        Not addressed             │
  │  ·  Privacy?          Not addressed             │
  │  ·  User control?     Not addressed             │
  │                                                 │
  │  Score: 2 out of ... something. We'll come      │
  │  back to this.                                  │
  │                                                 │
  └─────────────────────────────────────────────────┘
```

**2.3 PWAs: The Shell That Makes Offline Possible**

- Before we can store data offline, we need the **app itself** to load offline
- Progressive Web Apps (PWAs) give us this via Service Workers

```text
  WHY YOU NEED A PWA FOR OFFLINE-FIRST
  ═══════════════════════════════════════════════════

  WITHOUT PWA                        WITH PWA
  ───────────                        ────────

  User opens app offline:            User opens app offline:

  ┌─────────────────────┐           ┌─────────────────────┐
  │                     │           │                     │
  │    ┌───────────┐    │           │  ┌───────────────┐  │
  │    │           │    │           │  │ Service Worker│  │
  │    │  Chrome   │    │           │  │ intercepts    │  │
  │    │  Dino     │    │           │  │ request       │  │
  │    │  🦕       │    │           │  └───────┬───────┘  │
  │    │           │    │           │          │          │
  │    │  No       │    │           │          ▼          │
  │    │  Internet │    │           │  ┌───────────────┐  │
  │    │           │    │           │  │ Cached HTML,  │  │
  │    └───────────┘    │           │  │ JS, CSS, WASM │  │
  │                     │           │  │ → App loads!  │  │
  └─────────────────────┘           │  └───────────────┘  │
                                    │                     │
  Data in IndexedDB?                │  Now IndexedDB /    │
  Doesn't matter —                  │  SQLite can serve   │
  app can't even load.              │  the data too.      │
                                    └─────────────────────┘
```

- A Service Worker caches your app shell (HTML, JS, CSS, WASM binaries)
- On subsequent visits, the app loads from cache — **no network needed**
- In Vue/Nuxt: `vite-plugin-pwa` or `@vite-pwa/nuxt` handles this
- The PWA is the **delivery mechanism**, IndexedDB/SQLite is the **data layer**
- Without a PWA, your offline database is useless — the app itself won't load

```text
  THE OFFLINE-FIRST STACK
  ═══════════════════════════════════════════════════

  ┌─────────────────────────────────────────────────┐
  │                   YOUR APP                      │
  │                                                 │
  │  ┌─────────────────────────────────────────┐    │
  │  │         Vue / Nuxt Components           │    │
  │  └────────────────┬────────────────────────┘    │
  │                   │                             │
  │  ┌────────────────▼────────────────────────┐    │
  │  │         Data Layer                      │    │
  │  │   IndexedDB / SQLite (WASM)             │    │
  │  │   Dexie, wa-sqlite, ...                 │    │
  │  └─────────────────────────────────────────┘    │
  │                                                 │
  ├─────────────────────────────────────────────────┤
  │  SERVICE WORKER (PWA)                           │
  │  • Caches app shell for offline loading         │
  │  • vite-plugin-pwa / @vite-pwa/nuxt             │
  │  • Precaches HTML, JS, CSS, WASM                │
  └─────────────────────────────────────────────────┘
```

**2.4 Client-Side Storage: IndexedDB and SQLite**

```text
  CLIENT-SIDE STORAGE OPTIONS
  ═══════════════════════════════════════════════════

  IndexedDB                          SQLite (WASM)
  ──────────                         ─────────────
  ┌─────────────────┐               ┌─────────────────┐
  │ Native browser  │               │ Compiled to WASM│
  │ API since 2015  │               │ via wa-sqlite   │
  │                 │               │ or official SDK │
  │ Object store    │               │                 │
  │ (not relational)│               │ Full SQL engine │
  │                 │               │ ACID, triggers, │
  │ Async only      │               │ FTS, JSON, CTE  │
  │                 │               │                 │
  │ Widely          │               │ OPFS + sync     │
  │ considered slow │               │ handles (2023)  │
  │                 │               │                 │
  │ Works everywhere│               │ ~500KB bundle   │
  └─────────────────┘               └─────────────────┘
       │                                  │
       ▼                                  ▼
  ┌─────────────────┐               ┌─────────────────┐
  │ Dexie           │               │ wa-sqlite       │
  │ Nice API on top │               │ SQLite WASM     │
  │ Live queries    │               │ (official)      │
  │ Transactions    │               │ PGlite          │
  └─────────────────┘               └─────────────────┘
```

**2.5 The Missing Piece: How Do You Sync?**

- Storing data locally is the easy part
- The hard part: what happens when two devices change the same data offline?
- This is a distributed systems problem — and it needs a sync engine

---

### Part 3: Sync Engines — The New Data Layer

**3.1 What Is a Sync Engine?**

- Same pattern as Vue's reactivity, but bidirectional and across the network

```text
  TWO LAYERS OF SYNC
  ═══════════════════════════════════════════════════════════

  Layer 2: DATA SYNC (bidirectional — the hard part)
  ┌──────────────────────────────────────────────────────┐
  │                                                      │
  │  ┌──────────┐     ┌─────────────┐     ┌──────────┐  │
  │  │  Local   │◀───▶│ Sync Engine │◀───▶│  Server  │  │
  │  │  Store   │     │  (protocol) │     │  Database│  │
  │  └────┬─────┘     └─────────────┘     └──────────┘  │
  │       │                                              │
  └───────┼──────────────────────────────────────────────┘
          │
  Layer 1: UI SYNC (one-directional — Vue already solved this)
  ┌───────┼──────────────────────────────────────────────┐
  │       ▼                                              │
  │  ┌──────────┐     ┌─────────────┐     ┌──────────┐  │
  │  │  ref()   │────▶│ Virtual DOM │────▶│ Real DOM │  │
  │  └──────────┘     └─────────────┘     └──────────┘  │
  │                                                      │
  └──────────────────────────────────────────────────────┘
```

**3.2 The Object Sync Engine Pattern**

Three components that Linear, Figma, and Asana all converged on independently:

```text
  THE OBJECT SYNC ENGINE (Linear, Figma, Asana)
  ═══════════════════════════════════════════════════

  ┌──────────────┐                    ┌──────────────┐
  │ LOCAL STORE  │                    │ SERVER STORE │
  │              │     Sync           │              │
  │ • Instant    │     Protocol       │ • Authority  │
  │   reads      │◀──────────────────▶│ • Durability │
  │ • Instant    │  (minimal deltas)  │ • Server-    │
  │   writes     │                    │   side       │
  │ • No         │                    │   compute    │
  │   spinners   │                    │              │
  └──────────────┘                    └──────────────┘
        ▲                                    ▲
        │                                    │
        │    3 teams built this              │
        │    independently.                  │
        │    Same architecture.              │
        └────────────────────────────────────┘
```

**3.3 What Sync Engines Add to Our Scorecard**

Now we can update our score — still without naming the ideals:

```text
  WHAT SYNC ENGINES ADD
  ═══════════════════════════════════════════════════

  ┌─────────────────────────────────────────────────┐
  │                          Offline    + Sync      │
  │                          First      Engines     │
  │                                                 │
  │  ✓  FAST (no spinners)    ✓          ✓         │
  │  ✓  WORKS OFFLINE         ✓          ✓         │
  │  ✓  MULTI-DEVICE          ·    ──▶   ✓  NEW   │
  │  ✓  COLLABORATION         ·    ──▶   ✓  NEW   │
  │                                                 │
  │  ·  Longevity?            ·          ·         │
  │  ·  Privacy?              ·          ·         │
  │  ·  User control?         ·          ·         │
  │                                                 │
  │  Score: 4 out of ... something.                │
  │  What are those last 3?                        │
  │                                                 │
  └─────────────────────────────────────────────────┘
```

**3.4 The Spectrum: Server-First → Local-First**

```text
  THE SPECTRUM
  ═══════════════════════════════════════════════════════════════════

  Server-First                                          Local-First
  ◀────────────────────────────────────────────────────────────────▶

  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
  │ Convex │ │  Zero  │ │Power-  │ │ Dexie  │ │  Jazz  │ │ Live-  │
  │        │ │        │ │Sync    │ │ Cloud  │ │        │ │ Store  │
  │--------│ │--------│ │--------│ │--------│ │--------│ │--------│
  │Server  │ │Server  │ │Server  │ │Client  │ │CRDTs   │ │Client  │
  │runs    │ │rebases │ │confirms│ │owns,   │ │E2E     │ │owns,   │
  │all     │ │client  │ │writes  │ │server  │ │encrypt │ │events  │
  │queries │ │writes  │ │        │ │syncs   │ │mesh    │ │= truth │
  │        │ │        │ │        │ │        │ │        │ │        │
  │No      │ │Offline │ │Offline │ │Full    │ │Full    │ │Full    │
  │offline │ │reads   │ │read+   │ │offline │ │offline │ │offline │
  │        │ │        │ │write   │ │        │ │        │ │        │
  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘ └────────┘

  Who decides conflicts?
  ◀── Server decides ──────────────────── Clients decide ──▶
```

**3.5 Let's Build It: Dexie.js + Vue**

Focus on Dexie — the most accessible entry point for Vue developers. Progressive enhancement: start local, add sync later.

```text
  WHY DEXIE FOR VUE DEVELOPERS
  ═══════════════════════════════════════════════════

  ┌─────────────────────────────────────────────────┐
  │                                                 │
  │  1. Wraps IndexedDB with a clean API            │
  │  2. liveQuery() → reactive like computed()      │
  │  3. Works offline out of the box                │
  │  4. Add DexieCloud = instant multi-device sync  │
  │  5. Built-in auth + conflict resolution         │
  │                                                 │
  │  Progressive upgrade path:                      │
  │                                                 │
  │  Dexie (local only)                             │
  │       │                                         │
  │       ▼  npm install dexie-cloud-addon          │
  │                                                 │
  │  DexieCloud (sync + auth + collaboration)       │
  │       Same API. Same queries. Now it syncs.     │
  │                                                 │
  └─────────────────────────────────────────────────┘
```

**Step 1: Define Your Database**

```ts
// db/todo.ts
import Dexie, { type Table } from "dexie";
import dexieCloud from "dexie-cloud-addon";

export interface Todo {
  id?: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}

export class TodoDB extends Dexie {
  todos!: Table<Todo>;

  constructor() {
    super("TodoDB", { addons: [dexieCloud] });
    this.version(1).stores({
      todos: "@id, title, completed, createdAt",
      //      ^^^ Dexie Cloud generates IDs
    });
  }
}

export const db = new TodoDB();

// Configure sync (one line!)
db.cloud.configure({
  databaseUrl: import.meta.env.VITE_DEXIE_CLOUD_URL,
  requireAuth: true,
});
```

**Step 2: The Composable — Compare This to Traditional Fetching**

```text
  TRADITIONAL VUE                   WITH DEXIE
  ═══════════════                   ═════════
  const todos = ref([])             const todos = useObservable(
  const loading = ref(true)           from(liveQuery(() =>
  const error = ref(null)               db.todos
                                          .orderBy('createdAt')
  async function load() {                 .toArray()
    loading.value = true             ))
    try {                           )
      const res = await fetch(...)
      todos.value = res.json()      function addTodo(title) {
    } catch (e) {                     db.todos.add({
      error.value = e                   title,
    } finally {                         completed: false,
      loading.value = false             createdAt: new Date()
    }                                 })
  }                                 }

  // 15 lines                       // 8 lines
  // loading states                 // no loading states
  // error handling                 // no error handling
  // cache invalidation             // no cache invalidation
  // works online only              // works offline + syncs
```

```ts
// composables/useTodos.ts — the actual code
import { db, type Todo } from "@/db/todo";
import { useObservable } from "@vueuse/rxjs";
import { liveQuery } from "dexie";
import { from } from "rxjs";
import { computed, ref } from "vue";

export function useTodos() {
  const newTodoTitle = ref("");

  // Reactive query — like computed() but for IndexedDB
  const todos = useObservable<Todo[]>(
    from(liveQuery(() => db.todos.orderBy("createdAt").toArray())),
  );

  const pendingTodos = computed(() => todos.value?.filter((t) => !t.completed) ?? []);

  const addTodo = async () => {
    if (!newTodoTitle.value.trim()) return;
    await db.todos.add({
      title: newTodoTitle.value,
      completed: false,
      createdAt: new Date(),
    });
    newTodoTitle.value = "";
  };

  const toggleTodo = async (todo: Todo) => {
    await db.todos.update(todo.id!, {
      completed: !todo.completed,
    });
  };

  return { todos, newTodoTitle, pendingTodos, addTodo, toggleTodo };
}
```

**Step 3: How Dexie Handles Conflicts**

```text
  DEXIE'S CONFLICT RESOLUTION
  ═══════════════════════════════════════════════════

  Two users edit the same todo offline:

  ┌──────────────────┐           ┌──────────────────┐
  │    User A        │           │    User B        │
  │                  │           │                  │
  │  Changes TITLE   │           │  Toggles DONE    │
  │  "Buy milk"      │           │  completed: true │
  │  → "Buy oat milk"│           │                  │
  └────────┬─────────┘           └────────┬─────────┘
           │                              │
           │  reconnect + sync            │
           │                              │
           ▼                              ▼
  ┌────────────────────────────────────────────────┐
  │                                                │
  │  Different fields? → AUTO-MERGE                │
  │  title: "Buy oat milk" + completed: true  ✓   │
  │                                                │
  │  Same field? → LAST-WRITE-WINS                 │
  │  Server version takes priority                 │
  │                                                │
  │  Delete vs update? → DELETE WINS               │
  │  Prevents "zombie" records                     │
  │                                                │
  └────────────────────────────────────────────────┘

  You don't write this logic. Dexie handles it.
```

**What It Looks Like in IndexedDB (DevTools)**

```text
  // Application tab → IndexedDB → TodoDB

  {
    "id": "tds0PI7ogcJqpZ1JCly0qyAheHmcom",
    "title": "Buy oat milk",
    "completed": true,
    "createdAt": "2025-01-21T07:40:59.000Z",
    "owner": "alex@example.com",     ← added by DexieCloud
    "realmId": "alex@example.com"    ← added by DexieCloud
  }

  // Dexie also creates internal stores ($syncState,
  // $todos_mutations, etc.) to track changes for sync.
  // You never touch these — Dexie manages them.
```

**But Wait — Is Dexie Cloud Truly Local-First?**

This is the honest part. Dexie Cloud is **offline-first**, not local-first. Here's why:

```text
  THE INCREDIBLE JOURNEY TEST (Kleppmann)
  ═══════════════════════════════════════════════════

  "Does your app survive the developer shutting down?"

  ┌──────────────────────────────────────────────────┐
  │                                                  │
  │  Dexie Cloud shuts down tomorrow.                │
  │                                                  │
  │  ✓  Your local data? Still in IndexedDB.         │
  │  ✓  Your app? Still works offline.               │
  │  ✗  Sync between devices? GONE.                  │
  │  ✗  New device setup? BROKEN.                    │
  │  ✗  Collaboration? GONE.                         │
  │                                                  │
  │  You can't switch to another sync provider.      │
  │  You're locked in.                               │
  │                                                  │
  └──────────────────────────────────────────────────┘

  Dexie Cloud scores:
  ✓ Fast  ✓ Offline  ✓ Multi-device  ✓ Collaboration
  · Longevity?  · Privacy?  · User control?

  Still 4/7. Offline-first, not local-first.
```

This applies to most sync engines today — Zero, PowerSync, Convex — they all tie you to their infrastructure. If they disappear, your sync breaks.

**Other Sync Engines Worth Knowing**

The ecosystem is growing — mention these as further reading:

```text
  THE LANDSCAPE (for reference)
  ═══════════════════════════════════════════════════

  Server-auth          Hybrid              Full local-first
  ──────────           ──────              ────────────────
  Zero                 PowerSync           Jazz
  Convex               Dexie Cloud         LiveStore

  For this talk: Dexie. Best starting point today.
  See alexop.dev/posts/sync-engines-for-vue-developers
  for the full comparison.
```

---

### Part 4: CRDTs — How Conflicts Resolve Themselves (Brief)

**4.1 We Already Saw Conflict Resolution**

Dexie uses field-level last-write-wins. But what if there's no server to decide? That's where CRDTs come in — data structures that merge themselves.

**4.2 The G-Counter: Simplest CRDT**

```text
  G-COUNTER
  ═══════════════════════════════════════════════════

  Rule: each device only increments its OWN slot.

  ┌──────────────────┐           ┌──────────────────┐
  │    Device A      │           │    Device B      │
  │  { A: 3, B: 0 } │           │  { A: 0, B: 2 } │
  └────────┬─────────┘           └────────┬─────────┘
           │                              │
           └──────┐       ┌───────────────┘
                  ▼       ▼
              ┌──────────────┐
              │    MERGE     │
              │ A: max(3,0)=3│
              │ B: max(0,2)=2│
              │ Total = 5    │
              └──────────────┘

  No server needed. Order doesn't matter.
  Merge twice? Same result. Always converges.
```

- Libraries like Jazz and Automerge use CRDTs under the hood
- You don't write CRDT code yourself — the library handles it
- The point: conflict resolution without a central authority is a solved problem

---

### Part 5: Local-First — It's About Values, Not Just Technology

**5.1 The Reveal: The 7 Ideals**

Now name what we've been building toward all along. Show the full picture from [[local-first-software]]:

```text
  THE 7 IDEALS OF LOCAL-FIRST SOFTWARE (Ink & Switch, 2019)
  ═══════════════════════════════════════════════════════════════════

  ┌─────────────────────────────────────────────────────────────────┐
  │                                                                 │
  │  TECHNOLOGY  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─   │
  │                                                                 │
  │   1. ✓ FAST           No spinners. Data is local.              │
  │   2. ✓ MULTI-DEVICE   Sync across all your devices.            │
  │   3. ✓ WORKS OFFLINE  Network is optional.                     │
  │   4. ✓ COLLABORATION  Real-time co-editing.                    │
  │                                                                 │
  │  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─   │
  │                                                                 │
  │  VALUES  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─   │
  │                                                                 │
  │   5. ✓ LONGEVITY      Data accessible forever.                 │
  │                        Survives the developer shutting down.    │
  │   6. ✓ PRIVACY        End-to-end encryption.                   │
  │                        The server never sees your data.         │
  │   7. ✓ USER CONTROL   You own your data. Full stop.            │
  │                        Export it. Delete it. Script against it. │
  │                                                                 │
  └─────────────────────────────────────────────────────────────────┘
```

**5.2 The Full Scorecard — Where Each Step Lands**

```text
  THE PROGRESSIVE SCORECARD
  ═══════════════════════════════════════════════════════════════════

                        Offline     Sync        LOCAL-
                        First       Engines     FIRST
  ─────────────────────────────────────────────────────────────────
  1. Fast                 ✓           ✓           ✓
  2. Multi-device         ·           ✓           ✓
  3. Works offline        ✓           ✓           ✓
  4. Collaboration        ·           ✓           ✓
  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─
  5. Longevity            ·           ·           ✓  ◀── NEW
  6. Privacy              ·           ·           ✓  ◀── NEW
  7. User control         ·           ·           ✓  ◀── NEW
  ─────────────────────────────────────────────────────────────────
  Score:                 2/7         4/7         7/7

  ┌─────────────────────────────────────────────────────────────┐
  │                                                             │
  │  Offline-first = a SUBSET of local-first                   │
  │  Sync engines  = a BIGGER subset                           │
  │  Local-first   = THE WHOLE PICTURE                         │
  │                                                             │
  │  The first 4 are technology.                               │
  │  The last 3 are VALUES.                                    │
  │  That's what makes local-first different.                  │
  │                                                             │
  └─────────────────────────────────────────────────────────────┘
```

**5.3 Offline-First vs. Local-First: The Philosophical Difference**

```text
  TWO DIFFERENT QUESTIONS
  ═══════════════════════════════════════════════════

  OFFLINE-FIRST asks:               LOCAL-FIRST asks:
  ─────────────────                  ────────────────

  "How do I keep working            "Why does the server
   without a server?"                own my data at all?"

  ┌─────────────────┐              ┌─────────────────┐
  │    Server is     │              │    YOU are      │
  │    the owner     │              │    the owner    │
  │                  │              │                 │
  │    Client is     │              │    Server is    │
  │    a cache       │              │    a utility    │
  └─────────────────┘              └─────────────────┘

  If server rejects                 Server can't reject
  your write →                      your write →
  client rolls back                 it just relays
```

**5.4 The Honest Truth: Real Local-First Is Still Hard**

```text
  WHY 7/7 IS HARD TODAY
  ═══════════════════════════════════════════════════

  The only app that truly nails local-first?
  Obsidian.

  ┌─────────────────────────────────────────────────┐
  │                                                 │
  │  OBSIDIAN                                       │
  │                                                 │
  │  ✓ Fast         — local markdown files          │
  │  ✓ Multi-device — Obsidian Sync / git / iCloud  │
  │  ✓ Offline      — plain files on your disk      │
  │  ✓ Collab       — limited (git, shared vaults)  │
  │  ✓ Longevity    — it's just .md files!          │
  │  ✓ Privacy      — your files, your disk         │
  │  ✓ User control — open any folder, no lock-in   │
  │                                                 │
  │  Score: ~7/7                                    │
  │                                                 │
  │  BUT: sync = git or paid Obsidian Sync          │
  │  Non-technical users can't use git.             │
  │  And building this for the WEB? Much harder.    │
  │                                                 │
  └─────────────────────────────────────────────────┘
```

- Obsidian works because it uses the filesystem — plain files, no database
- On the web, we don't have that luxury — we need IndexedDB/SQLite + a sync layer
- Every sync engine today ties you to their cloud (Dexie Cloud, Jazz Cloud, etc.)
- If they shut down → your sync breaks → ideal 5 (longevity) fails
- The tooling for true local-first web apps **doesn't fully exist yet**

**5.5 What's Missing: The Generic Sync Engine**

From [[the-past-present-and-future-of-local-first]] — Kleppmann at Local-First Conf 2024:

```text
  WHAT WE HAVE vs. WHAT WE NEED
  ═══════════════════════════════════════════════════

  TODAY: Every sync engine = proprietary cloud
  ─────────────────────────────────────────────

  ┌──────────┐    locked to    ┌──────────────┐
  │ Your App │◀──────────────▶│ Dexie Cloud  │
  │          │   their API     │ (proprietary)│
  └──────────┘                 └──────────────┘

  They shut down? Sync is gone.
  Switch provider? Rewrite your app.


  WHAT'S MISSING: A generic, stupid sync service
  ────────────────────────────────────────────────

  ┌──────────┐    open protocol   ┌──────────────┐
  │ Your App │◀──────────────────▶│ ANY provider │
  │          │    standardized    │              │
  │ ALL biz  │                    │ Just relays  │
  │ logic    │                    │ bytes.       │
  │ lives    │                    │              │
  │ HERE     │                    │ AWS, Azure,  │
  └──────────┘                    │ self-hosted, │
                                  │ your NAS     │
  ┌──────────┐    same protocol   │              │
  │ Device B │◀──────────────────▶│ Swap with    │
  └──────────┘                    │ one config   │
                                  │ change.      │
                                  └──────────────┘

  Like email: you pick Gmail, Fastmail, self-host —
  the protocol is the same. Your data moves freely.
```

- All business logic lives in the client — the server is "stupid," it only relays bytes
- Standardized open protocols so providers are interoperable
- Users switch providers by changing a config flag — no rewrite
- This is what makes ideals 5, 6, 7 possible on the web
- **It doesn't exist yet.** But this is the direction the ecosystem is moving.

**5.6 Pragmatism vs. Idealism: Where To Start**

- From [[local-first-software-pragmatism-vs-idealism]]: movements succeed when idealists define the vision and pragmatists build the infrastructure
- Historical parallels: Cypherpunks → SSL → Let's Encrypt, Free Software → Open Web
- We're in the **pragmatist phase** — the tools aren't perfect, but you can start today

```text
  WHAT YOU CAN DO TODAY
  ═══════════════════════════════════════════════════

  ┌─────────────────────────────────────────────────┐
  │                                                 │
  │  STEP 1: Use Dexie.                             │
  │          Offline-first. 4/7 ideals.             │
  │          Real improvement for your users.       │
  │                                                 │
  │  STEP 2: Let users export their data.           │
  │          JSON, CSV — whatever. Give them         │
  │          a download button. This is the          │
  │          simplest local-first gesture.           │
  │                                                 │
  │  STEP 3: Watch this space.                      │
  │          The generic sync engine is coming.      │
  │          When it arrives, upgrading from          │
  │          offline-first to local-first will       │
  │          be a configuration change, not          │
  │          a rewrite.                              │
  │                                                 │
  └─────────────────────────────────────────────────┘
```

---

### Closing: The Rendering Era Is Over

```text
  THE ARC OF FRONTEND DEVELOPMENT
  ═══════════════════════════════════════════════════════════════════

  jQuery era        Reactive era       Sync era          Local-first era
  ─────────         ─────────          ─────────         ───────────────

  Manual DOM        Vue/React/Svelte   Sync engines      All logic in
  manipulation      handle the DOM     handle the data   the client.
                                                         User owns data.

  ┌──────┐         ┌──────┐           ┌──────┐          ┌──────┐
  │ DOM  │         │ DOM  │           │ DOM  │          │ DOM  │
  │ sync │  ──▶    │ sync │    ──▶    │ sync │   ──▶   │ sync │
  │ = you│         │ = Vue│           │ = Vue│          │ = Vue│
  └──────┘         └──────┘           │      │          │      │
                                      │ Data │          │ Data │
                                      │ sync │          │ sync │
                                      │ = eng│          │ = eng│
                                      └──────┘          │      │
                                                        │ Data │
                                                        │ own- │
                                                        │ ership│
                                                        └──────┘

  We solved rendering. The data layer is where it's happening now.
  ═══════════════════════════════════════════════════════════════════
```

---

## Suggested References to Show/Cite

- [[local-first-software]] — The original Ink & Switch essay (2019)
- [[the-past-present-and-future-of-local-first]] — Kleppmann at Local-First Conf 2024
- [[sync-engines-for-vue-developers]] — Your own article comparing 7 sync engines through Vue's lens
- [[a-gentle-introduction-to-crdts]] — Matt Wonlaw's CRDT primer
- [[local-first-software-pragmatism-vs-idealism]] — Adam Wiggins on movements
- [[object-sync-engine]] — The pattern Linear/Figma/Asana converged on
- [[sqlite-persistence-on-the-web]] — SQLite WASM is production-ready

## Talk Flow / Timing Estimate

| Section   | Topic                                                      | Ideals Revealed   | ~Minutes       |
| --------- | ---------------------------------------------------------- | ----------------- | -------------- |
| Part 1    | The Journey (jQuery → Vue → remaining problem)             | none yet          | 5–6            |
| Part 2    | Offline-First (PWA, storage, scorecard 2/7)                | ✓1 ✓3 (2/7)       | 4–5            |
| Part 3    | Sync Engines + Dexie code + "but is it local-first?"       | +✓2 +✓4 (4/7)     | 8–10           |
| Part 4    | CRDTs (G-Counter visual, brief)                            | (supports 4)      | 2              |
| Part 5    | Local-First = Values, Obsidian, what's missing, what to do | +✓5 +✓6 +✓7 (7/7) | 7–8            |
| Closing   | The rendering era is over                                  | —                 | 2              |
| **Total** |                                                            |                   | **~28–33 min** |
