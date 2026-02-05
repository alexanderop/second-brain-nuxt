---
title: "The CRDT Dictionary: A Field Guide to Conflict-Free Replicated Data Types"
type: article
url: "https://iankduncan.com/engineering/2025-11-27-crdt-dictionary/"
tags:
  - crdt
  - distributed-systems
  - local-first
authors:
  - ian-duncan
summary: "Every CRDT solves the same puzzle—deterministic merge without coordination—but each trades off metadata overhead, conflict resolution semantics, and garbage collection complexity differently."
date: 2025-11-27
---

## Summary

A comprehensive field guide to CRDTs, walking through the full taxonomy from counters to sequences to trees. Duncan frames the core problem through a concrete scenario: Alice and Bob both edit a shared counter on a flaky network. Consensus (Paxos/Raft) blocks writes during partitions. Last-write-wins silently discards data. CRDTs make merging deterministic by designing the data structure itself to converge.

## Key Concepts

- **G-Counter** — Each replica maintains its own counter. The value is the sum across all replicas, and merging takes the max per replica. Simple but grow-only: it tracks page views and like counts, not balances.

- **PN-Counter** — Two G-Counters: one for increments, one for decrements. This composability insight—building complex CRDTs from simpler ones—recurs throughout the taxonomy.

- **LWW-Register** — Stores a single value; concurrent writes resolve by timestamp, and the higher timestamp wins. Fast and simple, but lossy: one value gets silently erased.

- **MV-Register** — Preserves all causally concurrent values instead of picking a winner. Shifts conflict resolution to the application layer, where domain logic can make informed decisions.

- **OR-Set (Observed-Remove Set)** — Tags each element with a unique identifier per add operation. Removal only deletes tags the removing replica has observed, so concurrent adds survive. This is add-wins semantics.

- **Sequence CRDTs (WOOT, RGA)** — WOOT (WithOut Operational Transformation) and RGA (Replicated Growable Array) solve collaborative text editing. Every deleted character becomes a tombstone retained indefinitely.

- **Delta CRDTs** — Ship only the changed portion of state instead of the full object. Most production systems (Riak, Automerge) use delta-state internally to keep network overhead manageable.

- **Tree CRDTs** — Extending CRDTs to hierarchical structures remains an open challenge. Approaches include OR-Tree (OR-Set with parent pointers), CRDT-Tree (causal ordering), and log-based trees.

- **Garbage collection** — The fundamental tension: CRDTs converge by monotonically accumulating metadata, but production systems cannot grow unbounded. An "empty" OR-Set todo list with 10,000 completed tasks still carries 10,000 tags of metadata.

## Visual Model

::mermaid
<pre>
graph TD
    subgraph Counters
        GC[G-Counter<br/>grow-only]
        PNC[PN-Counter<br/>increment + decrement]
    end
    subgraph Registers
        LWW[LWW-Register<br/>last-write-wins]
        MV[MV-Register<br/>preserves conflicts]
    end
    subgraph Sets
        ORS[OR-Set<br/>add-wins semantics]
    end
    subgraph Sequences
        WOOT[WOOT<br/>tombstone-based]
        RGA[RGA<br/>timestamped list]
    end
    subgraph Trees
        ORT[OR-Tree / CRDT-Tree<br/>open challenge]
    end
    GC -->|"two G-Counters"| PNC
    LWW -->|"preserve all values"| MV
    ORS -->|"ordered elements"| WOOT
    ORS -->|"ordered elements"| RGA
    ORS -->|"add parent pointers"| ORT
</pre>
::

## Connections

- [[a-gentle-introduction-to-crdts]] — Covers the same fundamentals (grow-only sets, LWW, logical clocks) at an introductory level; Duncan's dictionary extends into the full taxonomy with production tradeoffs like garbage collection and delta CRDTs
- [[local-first-software]] — The foundational essay that motivates CRDTs as enabling technology for local-first apps; Duncan provides the practical reference for choosing which CRDT to reach for
- [[implementing-fractional-indexing]] — Fractional indexing solves the same ordering problem that sequence CRDTs (WOOT, RGA) address, using a different approach that avoids tombstone overhead
