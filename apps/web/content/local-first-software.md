---
title: "Local-First Software: You Own Your Data, in Spite of the Cloud"
type: article
url: "https://www.inkandswitch.com/essay/local-first/"
tags: [local-first, crdt, data-ownership, offline-first, collaboration]
authors:
  - martin-kleppmann
  - adam-wiggins
  - peter-van-hardenberg
  - mark-mcgranaghan
summary: "A foundational essay proposing that data ownership and real-time collaboration are not mutually exclusive, introducing CRDTs as the enabling technology for local-first software."
date: 2026-01-01
rating: 7
---

## Core Message

Cloud apps force a false choice: collaboration or ownership. CRDTs dissolve this tradeoff by letting data live on user devices while merging edits automatically—no central server required to resolve conflicts.

## Key Insights

1. **We Became Borrowers** - Cloud apps transformed users from owners into renters of their own data. All access routes through vendor servers, and when the service dies, both software and data vanish.

2. **The Seven Ideals Framework** - Local-first software scores high on seven dimensions: instant response, multi-device sync, offline capability, real-time collaboration, long-term preservation, privacy by default, and user control.

3. **CRDTs as Foundational Technology** - Conflict-free Replicated Data Types merge concurrent edits automatically, like Git for data. They work with any network topology—peer-to-peer, local networks, or cloud relays.

4. **Conflicts Are Overblown** - Prototype testing revealed a surprise: users naturally avoid editing the same content simultaneously. CRDTs handle remaining conflicts seamlessly without intervention.

5. **Servers as Supporting Cast** - Local-first does not mean serverless. Cloud infrastructure can provide backup, discovery, and bridging—the key shift is from authoritative source to supporting role.

6. **The Preservation Crisis** - The Internet Archive cannot snapshot Google Docs. Cloud-dependent software creates a digital dark age where creative work becomes permanently inaccessible.

7. **Developer Experience Improves** - Pairing CRDTs with reactive frameworks like React eliminates tedious change-tracking code. The data structure handles multi-user state automatically.

8. **Security Through Decentralization** - Local storage avoids the honeypot problem of centralized databases. End-to-end encryption becomes straightforward when servers never see plaintext.

9. **The Firebase for CRDTs Opportunity** - The authors call for infrastructure that makes building local-first apps as frictionless as Firebase made building cloud apps.

10. **Packet Switching for Collaboration** - Just as packet switching enabled the internet and capacitive touchscreens enabled smartphones, CRDTs may enable software that combines collaboration with true ownership.

## Notable Quotes

> "We became borrowers of our own data."

> "Data ownership and real-time collaboration are not at odds with each other."

> "In local-first software, the availability of another computer should never prevent you from working."

## Who Should Read This

Software engineers questioning cloud-first orthodoxy will find the seven ideals framework invaluable for architectural decisions. Product managers weighing collaboration features against user trust should read this before their next roadmap session. The essay assumes basic familiarity with distributed systems concepts but remains accessible to anyone who has used Git. Developers already convinced by offline-first approaches will discover local-first extends those principles into collaboration, preservation, and ownership—the complete vision rather than a partial solution.

---

## Core Thesis

Cloud apps provide collaboration but sacrifice ownership; traditional desktop software offers control but not collaboration. The authors argue we can have both through **local-first software** - where data lives primarily on the user's device, with servers playing a supporting role.

## The Seven Ideals

1. **Speed** - Instant responsiveness without server latency
2. **Multi-device access** - Data flows across all user devices
3. **Offline capability** - Work proceeds regardless of connectivity
4. **Seamless collaboration** - Real-time co-editing without conflicts
5. **Longevity** - Data remains accessible indefinitely
6. **Privacy & security** - End-to-end encryption, no centralized data collection
7. **User control** - Full ownership and agency over personal data

## Key Technology: CRDTs

Conflict-free Replicated Data Types (CRDTs) enable automatic merging of concurrent changes across devices without requiring a central server to resolve conflicts.

## Prototypes

The team built three working prototypes demonstrating feasibility:
- **Trellis** - Kanban board
- **Pixelpusher** - Collaborative drawing
- **PushPin** - Digital corkboard

## Reality Check

The technology is promising but not yet production-ready. Significant challenges remain in performance, networking, and UI design. The authors call for investment in making local-first infrastructure as accessible as Firebase.

## Connections

This essay is the foundational work that defines the local-first paradigm. See [[what-is-local-first-web-development]] for practical implementation approaches.
