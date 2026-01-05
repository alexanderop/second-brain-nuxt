---
title: "Supporting the Transition to Self-Contained Systems Using Architecture Fitness Functions at Scale"
type: article
url: "https://medium.com/swissquote-engineering/supporting-the-transition-to-self-contained-systems-using-architecture-fitness-functions-at-scale-a010f6fc5283"
tags:
  - software-architecture
  - fitness-function
  - self-contained-systems
  - organizational-change
  - metrics
authors:
  - marc-olivier-fleury
summary: "Architecture fitness functions transform vague architectural principles into daily metrics, enabling organizations to track and drive large-scale migration from legacy systems to Self-Contained Systems through measurable, automated governance."
date: 2025-12-10
---

Swissquote's 300+ engineers all know Self-Contained Systems (SCS) principles. Awareness isn't the problem. The problem: transforming existing systems takes years, and without measurement, progress stalls. This article describes how automated fitness functions closed that gap.

## The Core Problem

Four years after introducing SCS architecture, very few systems were successfully extracted from Swissquote's historical "mega-system." Direct database access remained because equivalent APIs didn't exist or weren't performant enough. Discussions and surveys provided partial information with limited confidence.

The missing piece: numbers, automatically collected every day, across all 1000+ applications.

## Why Self-Contained Systems

SCS architecture supports three architecture characteristics:

- **Resilience** — Outages in one system minimally impact others
- **Scalability** — Systems accommodate load increases without significant rework
- **Autonomy** — Developers make changes with minimal cross-team coordination

These overarching goals matter more than strict adherence to principles. When divergence is necessary, teams can still preserve essential qualities.

## Anatomy of a Fitness Function

Each function has a code, short name, definition, purpose, and assessment procedure:

```text
# Name
AC-11 Domain-specific code is not shared

# Definition
The application uses libraries that are either in the same system
as the application itself, are part of the technical libraries pseudo-system,
or are third-party libraries (not developed at Swissquote)

# Purpose
Autonomy - Code that implements system-specific features is likely to need
modification when features evolve; shared code requires synchronizing
multiple teams for deployment.

# How to assess
1. Collect all dependencies
2. Remove all artifacts that are API contracts
3. Remove all artifacts declaring the same system identifier
4. Remove all artifacts from technical-libraries pseudo-system
5. Verify the list is empty
```

Sixteen fitness functions cover areas from database segregation to contained chained requests. Not exhaustive—only aspects where accurate automated implementation is possible.

## Bronze, Silver, Gold

Fitness functions group into levels that build on each other:

**Bronze (Accountability)** — Applications have single maintainer teams, belong to systems, use dedicated database users. General best practices, not SCS-specific.

**Silver (Resilience + Scalability)** — Single system maintainer team, database segregation, contained chained requests. Systems can scale independently and fail in isolation.

**Gold (Autonomy)** — Dedicated APIs for cross-system access, no shared domain code. Teams evolve systems with minimal friction.

A higher level requires all lower-level functions to pass. This framework allows concise, unambiguous objectives: "Increase Silver-level systems by 50% by end of 2026."

## Why Not CI/CD?

Injecting checks into continuous integration would:

- Require changes to all team repositories
- Freeze development until architecture is fully compliant (years)
- Lack access to configuration data outside code (database settings, distributed traces)

Instead: daily automated scans feeding dashboards accessible to engineers and managers. Results aggregate at every organizational level—team, section, department.

## Aggregation Model

- Functions execute on each application/system
- Results are numeric: 0 (failure) to 1 (success)
- Each organizational level averages scores from owned applications
- Daily history enables trend tracking

This enables statements like: "Your part of the landscape went from 50% to 60% on F1 over four weeks."

## Results

Unique database credentials per application: 60% to 90% in one year. Hundreds of engineers reconfiguring hundreds of applications in concert.

Abstract principles became daily metrics. Strategic goals became tracked progress. Mandates became concrete wins.

## Connections

- [[building-evolutionary-architectures]] — Neal Ford's talk that originated the fitness function concept this article applies at enterprise scale
- [[building-evolutionary-architectures-book]] — The foundational book on evolutionary architecture that defines the fitness function framework Swissquote adapted
