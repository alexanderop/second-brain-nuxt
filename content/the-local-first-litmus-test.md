---
title: "The Local-First Litmus Test: Real Examples Across the Spectrum"
type: note
tags:
  - local-first
  - data-ownership
  - sync-engines
  - offline-first
  - software-philosophy
authors:
  - alexander-opalic
summary: "Not everything that caches locally is local-first. The real test: does the app still work if the company disappears? A categorized directory of real apps across the spectrum."
date: 2026-02-25
---

## The Test

The original [[local-first-software]] essay defines seven ideals. The one that separates genuinely local-first apps from fast cloud apps is **The Long Now**: your software and data must survive the company that made it.

The litmus test is simple: **if the company shuts down tomorrow, can you still use the app and access your data?**

Most apps that market themselves as "local-first" are really just using sync engines for performance — caching data on-device so the UI feels instant. That's a great UX pattern, but it's not local-first.

## Truly Local-First

These pass the litmus test. Data lives in open formats or the app is open source. The company can disappear and you keep everything.

### Note-Taking & Knowledge Management

- **[Obsidian](https://obsidian.md)** — Plain Markdown files on your filesystem. Obsidian dies, you still have every note in a format any text editor can open. Optional E2EE sync is a paid add-on, but the core is just files.
- **[Logseq](https://logseq.com)** — Same principle: plain Markdown/Org-mode files on disk. Open source (AGPL). New DB version adds CRDT sync but files remain the ground truth.
- **[Anytype](https://anytype.io)** — Open source protocol (any-sync), peer-to-peer, E2EE, no central server required. CRDTs stored as encrypted DAGs. The most architecturally radical option.
- **[AFFiNE](https://affine.pro)** — Open source (MIT). Built on Yjs CRDTs (y-octo Rust port). Data local by default with optional cloud sync.
- **[AppFlowy](https://appflowy.io)** — Open source. Flutter frontend, Rust backend. Uses Yrs (Rust Yjs port). Local-first with optional Supabase sync.
- **[Joplin](https://joplinapp.org)** — Open source. Local SQLite database. Sync to your own Nextcloud, WebDAV, Dropbox, or OneDrive. AES-256 E2EE.
- **[TriliumNext](https://triliumnotes.org)** — Open source. Local SQLite. Self-hosted sync. The community fork already survived the original creator stepping back — proof the architecture works.
- **[Notesnook](https://notesnook.com)** — Open source. E2EE with XChaCha20-Poly1305. Self-hostable sync server.
- **[Standard Notes](https://standardnotes.com)** — Open source. E2EE, self-hostable. Explicitly designed to "last 100 years."
- **[SilverBullet](https://silverbullet.md)** — Open source. Plain Markdown files, self-hosted PWA with IndexedDB offline cache.

### Productivity & Project Management

- **[Huly](https://huly.io)** — Open source (EPL-2.0). All-in-one PM platform (Linear + Slack + Notion alternative). Yjs for collaboration, self-hostable via Docker.
- **[Actual Budget](https://actualbudget.org)** — Open source. Local SQLite with custom CRDTs and Merkle tree sync. Community already took it over when the original creator (James Long) stopped. A textbook case of surviving the company.

### Creative Tools

- **[Excalidraw](https://excalidraw.com)** — Open source (MIT). Data in localStorage, P2P WebRTC collaboration. Exports to open formats. The paid Excalidraw+ layer is optional.

### Humanitarian & Field Apps

- **[Kolibri](https://learningequality.org/kolibri/)** — Open source (Learning Equality). A single device becomes a classroom server over local Wi-Fi. 220+ countries, 3M+ learners. No internet needed at all.
- **[Community Health Toolkit](https://medic.org)** — Open source (Medic). Offline-first Android apps with SMS fallback. 165k+ health workers in 18 countries.
- **[farmOS Field Kit](https://farmos.org)** — Open source (GPL). Offline PWA for farm data collection. Self-hosted, USDA-supported.
- **[KoboToolbox](https://www.kobotoolbox.org)** — Open source (Harvard Humanitarian Initiative). Offline data collection for crisis zones.
- **[Trail Sense](https://github.com/kylecorry31/Trail-Sense)** — Open source. Zero network — uses only device sensors for navigation and weather. No company involved at all.

## The Gray Zone

These have genuine local-first properties but something prevents them from fully passing the test.

- **[Muse](https://museapp.com)** — Built by Ink & Switch alumni (Adam Wiggins) with real CRDTs, data fully on-device. But proprietary. The company wound down in 2023 — existing users still have their data, proving the architecture, but no one new can get the app.
- **[Zed](https://zed.dev)** — Open source code editor with CRDTs for multiplayer. But your code files were always local anyway — the collaboration layer needs their servers. Local-first for the collaboration state, not the core use case.
- **[Spacedrive](https://spacedrive.com)** — Open source, local SQLite with HLC-ordered sync. But still in beta. The file indexing layer is the value, and that's local, but the cross-device story isn't complete yet.
- **[tldraw](https://tldraw.com)** — The SDK is open source, but the sync service (Cloudflare Durable Objects) is proprietary. You could self-host, but it's not a first-class path.

## Not Local-First (Just Fast Cloud Apps)

These use local caching and sync engines for performance. The UI feels instant. But if the company disappears, your data and app are gone. They are **cloud-first apps with a local cache**.

- **[Linear](https://linear.app)** — Custom sync engine with IndexedDB for instant UI. But 100% proprietary. Linear shuts down = your issues, projects, and history vanish. The local cache is an implementation detail, not a philosophy.
- **[Superhuman](https://superhuman.com)** — Local caching (WebSQL, CacheStorage) makes email feel instant. But it's a proprietary wrapper around Gmail. No Superhuman servers = no Superhuman.
- **[Figma](https://figma.com)** — CRDT-inspired sync for collaboration performance. But proprietary, server-authoritative. No Figma = no access to your designs in their native format.
- **[Notion](https://notion.so)** — SQLite cache and a CRDT-based offline mode (added 2025). But the server is the source of truth. Notion dies = your workspace dies. Export is available but lossy.
- **[Pitch](https://pitch.com)** — Offline editing with sync on reconnect. Proprietary. Cloud-dependent.
- **[Trello](https://trello.com)** — Offline-first mobile cache. Proprietary. Atlassian controls everything.
- **[Capacities](https://capacities.io)** — Offline-first local DB, but proprietary custom format — not even Markdown files. Company dies = good luck extracting your data.

## The Pattern

The dividing line is usually **open source + open formats**:

- If the code is open source, the community can fork it (see: TriliumNext, Actual Budget)
- If the data is in open formats (Markdown, SQLite, JSON), you can migrate to anything
- If both are proprietary, you're renting — no matter how fast the UI feels

The honest local-first list is much shorter than the marketing suggests. Most of what the industry calls "local-first" is really "offline-capable" or "sync-engine-powered." The [[local-first-software]] essay's seven ideals remain the real benchmark.
