---
title: "It's time to change your database"
type: youtube
url: "https://www.youtube.com/watch?v=B6C-MWCFfAg"
tags:
  - databases
  - convex
  - firebase
  - supabase
  - ai-development
authors:
  - theo-browne
summary: "Traditional BaaS platforms like Firebase and Supabase create friction when building with AI—Convex's unified TypeScript backend eliminates the impedance mismatch that slows down AI-assisted development."
date: 2026-01-18
---

## Key Takeaways

- **AI coding tools struggle with traditional databases**: When building with AI assistants, the translation layer between your app code and database queries creates confusion. Firebase's SDK patterns and Supabase's SQL-plus-client approach require context that AI tools often mishandle.

- **Convex unifies backend and database**: Instead of managing separate database connections, ORMs, and API layers, Convex provides TypeScript functions that run server-side with direct database access. The AI writes the same language end-to-end.

- **Migration momentum is real**: Developers building rapidly with AI (like Peter Steinberger, who ships new projects constantly) are switching to Convex because migrations work immediately and the mental model is simpler.

- **The BaaS generation is maturing**: What Firebase pioneered—instant backend for frontend developers—now has competition that addresses its pain points. Supabase offered SQL familiarity; Convex offers TypeScript coherence.

- **Real-time and transactions built in**: Convex handles reactive queries and ACID transactions without extra configuration, eliminating two categories of bugs that plague Firebase and Supabase projects.

## Notable Quotes

> "If you've watched my videos over the last 6 months, you probably know about how much I love Convex."

> "We're here to talk about the state of databases and how we build things with databases, especially if we're using AI to do it."

## Connections

- [[2025-databases-retrospective]] - Andy Pavlo's annual review captures the broader database consolidation trend that makes Convex's bet on a unified platform timely
- [[local-first-software]] - The Ink & Switch essay called for "a Firebase for CRDTs"—Convex addresses some of the same developer experience problems without the local-first architecture
