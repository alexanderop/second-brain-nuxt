---
title: "CRDTs: The Hard Parts"
type: talk
url: "https://www.youtube.com/watch?v=x7drE24geUw"
conference: "Hydra 2020"
tags:
  - crdt
  - distributed-systems
  - local-first
  - sync-engines
  - collaborative-editing
authors:
  - martin-kleppmann
summary: "Martin Kleppmann goes beyond CRDT basics to explore the hard problems: interleaving anomalies in text editors, moving elements in lists and trees, and reducing metadata overhead — showing that CRDTs are easy to implement badly."
date: 2026-03-01
---

## Overview

Martin Kleppmann moves past introductory CRDT material to address the real-world challenges that make CRDTs difficult to get right. While the basic principles of [[a-gentle-introduction-to-crdts|CRDTs]] are well established — replicas update independently and merge automatically — many published algorithms have subtle anomalies that cause strange behavior in practice.

The talk was given at the Hydra distributed computing conference (July 2020) and draws on years of research building [[local-first-software|local-first]] collaboration tools like Automerge.

## Core Message

CRDTs are deceptively easy to implement but hard to get right — convergence alone guarantees replicas reach the same state, not that the merged state matches user expectations. Recent advances in interleaving fixes, atomic move operations, and columnar binary encoding are closing the gap between research prototypes and production-quality collaborative software.

## Key Insights

1. **Convergence Alone Is Insufficient** (9:01) - A CRDT guaranteeing all replicas reach the same state says nothing about whether that merged state is correct or desirable. The hard problem is defining what the merged outcome should be — a matter of human expectation, not mathematics.

2. **OT Requires a Central Server** (6:36) - Operational Transformation, used by Google Docs, fundamentally requires all communication to route through a single server. Even if two collaborating users sit in the same room, OT forbids direct peer-to-peer communication because bypassing the server breaks the algorithm's sequencing assumptions.

3. **Stable Character Identities Replace Indexes** (10:55) - Instead of mutable integer indexes that require transformation on concurrent edits, CRDTs assign every character a globally unique, permanent identifier. This ID never changes regardless of insertions or deletions elsewhere, eliminating the need to transform positions.

4. **Fractional Indexing Causes Interleaving** (15:10) - CRDTs that assign positions as numbers between 0 and 1 can produce catastrophically interleaved text when two users insert concurrently at the same location. Kleppmann identified this bug in real algorithms including LSEQ and Logoot, concluding they are unsuitable for text editing.

5. **Performance Optimization Introduced LSEQ's Bug** (18:26) - LSEQ was designed to be more efficient than TreeDoc by reducing identifier size, but that optimization introduced the interleaving anomaly. The two algorithms without interleaving (TreeDoc and Woot) are also the least space-efficient — a direct tradeoff.

6. **RGA's Interleaving Is Topology-Dependent** (19:25) - RGA has a weaker interleaving problem: entire concurrently typed sequences can be split apart, but character-by-character interleaving only occurs in the pathological case where a user types strictly back-to-front, which almost never happens in practice.

7. **Move-as-Delete-Then-Insert Causes Duplication** (26:05) - Implementing "move" by deleting from the old position and inserting at the new position fails under concurrency. If two replicas both move the same item to different positions, both inserts succeed, producing duplicates — violating user expectations on any drag-and-drop interface.

8. **Three Composed CRDTs Enable Atomic Move** (31:52) - A correct single-item move for ordered lists combines three existing CRDTs: a list CRDT for stable position identifiers, an Add-Wins Set for items, and a Last-Writer-Wins Register for each item's current position. Because each component is a CRDT, their composition is also a CRDT.

9. **Range Moves Remain Unsolved** (34:14) - Moving a range of characters (like reordering a bullet point) is an open problem. If one user moves "milk\n" while another concurrently edits it to "soy milk", the move relocates the original characters but strands the edit at the old position. Kleppmann explicitly states he does not know how to solve this.

10. **Concurrent Tree Moves Create Cycles** (39:29) - In a tree CRDT, two users can each perform a valid move that, when merged, creates a cycle — node A under B while B moves under A. Google Drive, tested by Kleppmann, responds to this exact scenario with a permanent "unknown internal error."

11. **Undo-Redo Log Resolves Tree Conflicts** (43:47) - Kleppmann's solution maintains a timestamped operation log. When a new operation arrives with an earlier timestamp, the system undoes recent operations, applies the new one, then redoes the undone operations — skipping any move that would create a cycle.

12. **Tree CRDT Sustains 600 Ops/Sec Across Continents** (47:04) - Performance experiments ran three replicas across three continents with over 100ms round-trip latency. The system sustained 600+ move operations per second — far beyond what any single user would generate in a file-system collaboration scenario.

13. **JSON Encoding Costs 500 Bytes Per Keystroke** (56:10) - Automerge's legacy JSON format, benchmarked against a real LaTeX paper's 300,000+ keystrokes producing 100 KB of text, consumed 150 MB — approximately 500 bytes per keystroke.

14. **Columnar Binary Format Achieves 200x Compression** (57:05) - Automerge's binary format encodes the operation table column-by-column, exploiting monotonically increasing counter sequences via delta encoding, run-length encoding, and variable-length integers. The same history compresses from 150 MB to 700 KB — under 1 byte per recorded operation.

## Talk Structure

1. **Introduction and Motivation** (0:00) - Frames collaboration software as the domain, introduces CRDTs versus Operational Transformation, and argues convergence alone is insufficient
2. **Interleaving in Text CRDTs** (10:27) - Demonstrates how concurrent insertions cause character interleaving in LSEQ and Logoot, examines RGA as a less severe case, identifies safe algorithms
3. **Moving Items in Lists** (24:38) - Shows naive move-as-delete-plus-insert duplicates items, constructs a correct move primitive from composed CRDTs, identifies the open problem of range moves
4. **Moving Subtrees in Trees** (35:40) - Works through concurrent tree moves causing cycles, demonstrates Google Drive failing this case, presents undo/redo solution with Lamport timestamps
5. **CRDT Metadata Efficiency** (53:17) - Benchmarks Automerge against a real editing history, shows columnar binary format achieves 200x reduction over JSON, proves tombstones add only ~48% overhead
6. **Conclusion and References** (1:08:25) - Summarizes that CRDTs are easy to implement badly but recent progress on interleaving, move operations, and storage efficiency makes them viable for production

## Notable Quotes

> "CRDTs are easy to implement badly. A simple version is very easy to implement, but actually getting it right in a way that satisfies user expectations is difficult."

> "Convergence by itself is not really enough, because convergence doesn't say anything about what that final state is — whether the merged state is actually the state that we wanted."

> "If people tell you that with CRDTs you have to worry about tombstone collection because tombstones waste space — the tombstones actually cost us only 48 percent overhead, whereas the difference between a naive JSON format and an optimized binary format made a factor of 200 difference."

## Who Should Watch

This talk is for software engineers building or evaluating real-time collaboration tools, local-first applications, or distributed systems where multiple users edit shared state and sync later. You should already have a passing familiarity with what CRDTs are and why they exist — Kleppmann provides only a brief refresher before diving deep.

Engineers who have already adopted a CRDT library such as Automerge or Yjs and hit edge cases in production will get the most value. Kleppmann names specific algorithms (LSEQ, Logoot, RGA, TreeDoc) and explains precisely which suffer from interleaving bugs, which handle move operations incorrectly, and why — giving practitioners the vocabulary to evaluate whether their chosen library is safe for their use case.

## Action Items

- [ ] Audit your CRDT text-editing library against the interleaving anomaly — check whether it uses LSEQ or Logoot, which Kleppmann identifies as fundamentally broken for concurrent insertions
- [ ] Implement list move as a last-writer-wins register holding a stable position identifier rather than delete-then-insert, which silently duplicates items on concurrent moves
- [ ] For tree move semantics, implement the undo/redo log approach from Kleppmann's 2021 paper that prevents cycles by skipping operations violating the tree invariant
- [ ] Replace JSON-based CRDT encoding with a columnar binary format using delta and run-length encoding — the talk demonstrates 200x reduction in storage
- [ ] Read the cited papers: "Interleaving Anomalies in Collaborative Text Editors" (2019) and the Automerge binary format work

---

## Problem 1: Interleaving Anomalies in Text CRDTs

Most text-editing CRDTs assign each character a unique position on a number line between 0 and 1. The document is a set of (character, position) tuples sorted by position. Inserting a character means picking a number between its neighbors. This scheme avoids the index-transformation problem of OT — but it introduces interleaving.

When two users concurrently insert text at the same position, both pick numbers within the same interval. Because many algorithms randomize positions to avoid collisions, the characters from each user scatter across the interval. The result: character-by-character interleaving. Two users inserting "Alice" and "Charlie" after "Hello" produce an unreadable jumble like "CAhlaircliee" instead of "HelloAliceCharlie" or "HelloCharlieAlice." This gets catastrophically worse with paragraph-length concurrent insertions — the merged text is unusable and must be deleted entirely.

**Which algorithms are affected:**

- **Logoot and LSEQ** suffer from deep, unfixable interleaving. The bug is inherent in how they assign positions. Kleppmann considers them unsuitable for text editing.
- **LSEQ's bug came from a performance optimization.** LSEQ was designed to reduce identifier size compared to TreeDoc, but that optimization introduced the anomaly — a direct tradeoff between space efficiency and correctness.
- **TreeDoc and Woot** do not exhibit interleaving, but they are the least space-efficient algorithms.
- **RGA** has a weaker form of the problem. RGA builds a tree where each character's parent is its predecessor at insertion time. Concurrent insertions create sibling subtrees visited in timestamp order. Entire sequences (not individual characters) can be split apart — "dear reader" might have "Alice" inserted between the two words. Character-by-character interleaving in RGA only happens if a user types an entire document back-to-front, which essentially never occurs. Kleppmann published a fix for RGA's weaker interleaving in 2019 ("Interleaving Anomalies in Collaborative Text Editors").
- The **strong list specification** by Attiya et al. (2016) also permitted interleaving as valid behavior. Kleppmann's paper proposes a corrected specification that rules it out.

## Problem 2: Moving Items in Lists

All text/list CRDTs support insert and delete operations but none natively support move. The obvious workaround — delete from the old position, insert at the new position — breaks under concurrency.

**The duplication bug:** If two replicas both move the same item (e.g., "Phone Joe" in a to-do list) to different positions, each replica deletes the item and inserts it at its chosen destination. Both deletions succeed (the item disappears from position 3) and both insertions succeed (creating two copies at positions 1 and 2). The user sees duplicate items from a simple drag-and-drop reorder.

**Kleppmann's solution — composing three CRDTs:** The desired behavior is last-writer-wins: one of the two concurrent positions wins deterministically, the other is discarded. This maps directly to existing CRDT primitives:

1. **A list CRDT** (any of TreeDoc, RGA, etc.) generates stable position identifiers
2. **An Add-Wins Set** holds all list items
3. **A Last-Writer-Wins Register** per item holds its current position identifier

Each item's position is a register value. Moving means generating a new position ID from the list CRDT and writing it to the register. Concurrent moves write different values to the same register — the register's LWW semantics pick one winner. Because each component is a CRDT, the composition is also a CRDT.

**The unsolved problem — range moves:** Moving a single item works, but moving a range of characters (like reordering a bullet-point line in a text document) remains an open problem. If replica B moves the characters "milk\n" to a new position while replica A concurrently edits "milk" to "soy milk," the move relocates the original characters but strands the edit ("soy M") at the old position with no surrounding context. Kleppmann explicitly states he does not know how to solve this.

## Problem 3: Moving Subtrees in Trees

Tree CRDTs (modeling file systems, nested documents, or hierarchical task lists) face two unique hazards when nodes are moved concurrently.

**Hazard 1 — Duplication or DAG formation:** If two replicas move the same node to different parents, a naive approach either duplicates the entire subtree (unacceptable) or creates a DAG where one node has two parents (no longer a tree). The correct behavior is last-writer-wins: one move wins, the other is discarded.

**Hazard 2 — Cycle creation:** Two individually valid moves can combine to form a cycle. Replica A moves B under A while replica B moves A under B. Neither move is invalid in isolation, but applying both detaches A and B from the root in an infinite parent loop. Kleppmann tested this exact scenario on Google Drive — the result was a permanent "unknown internal error" that never resolves.

**Kleppmann's solution — undo/redo with Lamport timestamps:**

1. Every move operation carries a globally unique Lamport timestamp
2. Each replica maintains a timestamped operation log
3. When a new operation arrives with an earlier timestamp than already-executed operations, the replica **undoes** operations back to the insertion point, **applies** the new operation, then **redoes** all undone operations
4. Before executing any move, the algorithm checks whether the destination is already a descendant of the node being moved. If so, executing the move would create a cycle — the operation is **skipped silently**
5. The move operation records both the new parent and the old parent, enabling clean undo

**Formal guarantees:** Kleppmann proves two properties: (1) the data structure always remains a valid tree (unique parents, no cycles) for any sequence of operations, and (2) the algorithm converges — any two replicas that have seen the same set of operations reach the same state regardless of operation order.

**Performance:** Three replicas across three continents with 100ms+ round-trip latency sustained 600+ move operations per second. The undo/redo overhead scales with how far back in the log a late-arriving operation must be inserted, but for realistic file-system collaboration this throughput is more than sufficient.

## Problem 4: Metadata Overhead

Every character in a text CRDT carries metadata: a unique identifier (Lamport timestamp = counter + actor ID), a reference to its predecessor, and tombstone markers for deleted characters. For a single English character (1 byte of UTF-8), the metadata can reach 100+ bytes — a 100x overhead.

**The benchmark:** Kleppmann captured every keystroke from writing a real LaTeX paper — 300,000+ operations producing a 100 KB final document. Automerge's legacy JSON encoding consumed **150 MB** for this history, roughly 500 bytes per change.

**The solution — columnar binary encoding:** Instead of encoding each operation as a JSON object (row-oriented), Automerge's new format encodes the operation table column-by-column and applies compression techniques specific to each column's data patterns:

- **Counter column:** Sequential typing produces monotonically increasing counters (1, 2, 3, 4...). Delta encoding reduces this to all 1s. Run-length encoding collapses it further. Variable-length integer encoding packs the result into 2 bytes for the entire column.
- **Actor ID column:** A lookup table replaces 16-byte UUIDs with small integers (0, 1, 2...). Long runs of the same actor (one user typing continuously) compress to 2 bytes via run-length encoding.
- **Character column:** Split into a length column (all 1s for ASCII — compresses trivially) and a raw bytes column (just the concatenated characters).
- **Reference column:** Sequential typing means each character references the previous one — another monotonically increasing sequence that delta-encodes beautifully.

**Results at each level of history retention:**

| What's stored                       | Size    | Notes                                        |
| ----------------------------------- | ------- | -------------------------------------------- |
| Full history, JSON                  | 150 MB  | ~500 bytes/change                            |
| Full history, JSON gzipped          | 6 MB    | Standard compression                         |
| Full history, binary                | 700 KB  | **200x improvement** over JSON               |
| Full history, binary gzipped        | 300 KB  | Under 1 byte per change                      |
| Without cursor movements            | 230 KB  | Saves ~22%                                   |
| Without tombstones                  | ~160 KB | Loses ability to merge with concurrent edits |
| Raw CRDT metadata only (no history) | 50 KB   | **48% overhead** on top of 100 KB raw text   |

The key insight: tombstones add only 48% overhead. The difference between naive JSON and optimized binary encoding accounts for a 200x difference. Optimizing the encoding matters far more than garbage-collecting tombstones.

## Key Takeaway

CRDTs are a powerful primitive for [[the-past-present-and-future-of-local-first|local-first software]], but the gap between a correct-on-paper algorithm and a production-quality implementation is large. Most published CRDT algorithms have edge cases that only surface under specific concurrent editing patterns.
