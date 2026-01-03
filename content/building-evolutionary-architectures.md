---
title: "Building Evolutionary Architectures"
type: youtube
url: "https://www.youtube.com/watch?v=pXHfKOMWYMw"
tags:
  - software-architecture
  - evolutionary-architecture
  - fitness-function
  - microservice
  - governance
authors:
  - neal-ford
summary: "Evolutionary architecture supports guided incremental change through fitness functions—automated tests that validate architecture characteristics like performance, security, and structural integrity."
date: 2026-01-03
---

An evolutionary architecture supports guided incremental change across multiple dimensions. The key insight: you can't design a roller skate that becomes a lorry by adding parts, but you *can* evolve an architecture to support new capabilities over time.

## The Three Parts of Evolutionary Architecture

**Guided** — Fitness functions steer evolution toward desired outcomes, borrowed from genetic algorithms. They provide objective assessment of architecture characteristics.

**Incremental** — Small changes verified continuously. The defining characteristic of software: hundreds of thousands of moving parts, any of which can change at any time.

**Multiple Dimensions** — Not just code, but also data, security, and operational characteristics. Database schemas must evolve alongside code.

## Fitness Functions

A fitness function is any mechanism that provides an objective integrity assessment of architecture characteristics. They're like unit tests, but for capabilities rather than behavior.

Three categories:
- **Metrics and static analysis** — Cyclic dependencies, coupling
- **Runtime monitors** — Performance, scalability, elasticity
- **Chaos engineering** — Availability under stress

The key difference from regular testing: QA validates *behavior* (your domain), while fitness functions validate *characteristics* (scalability, security, maintainability).

## Automated Governance

When developers click "auto-import" in their IDE, they don't notice when it creates cyclic dependencies. One cycle isn't fatal, but thousands make the codebase impossible to maintain. This is "system rot"—tiny cracks that accumulate until the structure collapses.

The solution: wire fitness functions into continuous integration. Architects write the rules once, and the build enforces them forever.

Netflix's Simian Army demonstrates this at scale:
- **Chaos Monkey** — Randomly kills servers
- **Latency Monkey** — Tortures network latency
- **Janitor Monkey** — Removes unused services (cloud burn rate fitness function)
- **Conformity Monkey** — Enforces governance rules
- **Security Monkey** — Checks for vulnerabilities

## The Equifax Lesson

When a zero-day exploit hit the Struts framework in March 2017, Equifax's security team ran around looking for affected projects. They found most of them—but not all. The ones they missed caused the biggest data breach in history.

Imagine if security had a slot in every deployment pipeline. When the exploit drops, they insert a test: check the software bill of goods, fail if using the affected version, notify security. Automated architectural governance at enterprise scale.

## Code Reuse Trade-offs

The promise: consolidate all "customer" concepts into one service. Maximum reuse.

The reality: that service becomes a bottleneck. Every team depends on it. Changes require coordinating across the entire organization. You've traded code duplication for coupling—often a bad trade.

This connects to [[12-factor-agents]] and [[agentic-design-patterns]]—modular architectures that can evolve independently beat monolithic designs optimized for reuse.

## Code Snippets

### Prevent Generic Exceptions

Force developers to subclass exceptions properly instead of throwing generic ones.

```java
noClasses()
    .should()
    .throwGenericExceptions()
```

### Enforce Logging Framework

Prevent accidental use of platform logging when you've chosen a third-party solution.

```java
noClasses()
    .should()
    .accessClassesThat()
    .resideInAPackage("java.util.logging")
```

### Layer Access Control

Ensure services don't call controllers directly, preserving architectural boundaries.

```java
noClasses()
    .that().resideInAPackage("..service..")
    .should()
    .accessClassesThat()
    .resideInAPackage("..controller..")
```

## Key Takeaway

Fitness functions are checklists written by architects for developers. Not because developers are forgetful, but because when you do the same thing repeatedly, details fall through the cracks. Automate the important checks so you never have to worry about them again.
