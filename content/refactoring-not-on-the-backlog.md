---
title: "Refactoring — Not on the Backlog!"
type: article
url: "https://ronjeffries.com/xprog/articles/refactoring-not-on-the-backlog/"
tags:
  - refactoring
  - software-design
  - best-practices
  - agile
authors:
  - ron-jeffries
summary: "Refactoring should happen continuously during feature work, not as separate backlog items. Deferring code cleanup creates a vicious cycle that slows velocity and rarely gets approved."
date: 2014-07-30
---

[[ron-jeffries]] argues against a common anti-pattern: treating refactoring as separate backlog items. Teams request dedicated cleanup time, which rarely gets approved. When it does, the results disappoint because improvements aren't connected to immediate feature needs.

## The Problem with Deferred Refactoring

Poor code accumulates like weeds. Each shortcut makes the next change harder. Teams slow down, then ask for refactoring sprints. Product owners, seeing no direct feature value, push back. The codebase decays further.

This creates a vicious cycle. The worse the code gets, the more time cleanup requires, and the less likely it gets approved.

## The Alternative: Continuous Cleanup

Clean code incrementally while implementing features. When you touch a module, leave it better than you found it. Take time to "clear a path through" the obstacles blocking your current work.

The key insight: improvements tied to feature work often accelerate subsequent features. The effort stays modest compared to massive delayed cleanups. Development velocity increases as the codebase improves.

## The Core Practice

"With each new feature, we clean the code needed by that feature." This prevents technical debt accumulation while maintaining productivity. No special sprints. No backlog items. Just professional craftsmanship as part of normal work.

## Connections

- [[refactoring-improving-the-design-of-existing-code]] - Fowler's foundational catalog of refactoring techniques that Jeffries advocates applying continuously
- [[tidy-first]] - Kent Beck (XP co-founder with Jeffries) explores the same question: when to clean code, answering with nuanced economics
