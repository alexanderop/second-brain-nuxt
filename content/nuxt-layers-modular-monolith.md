---
title: "Building a Modular Monolith with Nuxt Layers"
type: article
url: "https://alexop.dev/posts/nuxt-layers-modular-monolith/"
tags:
  - nuxt
  - architecture
  - modular-monolith
  - vue
authors:
  - alexander-opalic
summary: "Nuxt Layers enable modular monolith architecture by enforcing feature boundaries at compile-time—each layer has its own config and components, preventing the coupling and circular dependencies that plague flat folder structures."
date: 2025-11-02
---

## Core Idea

Nuxt Layers let you structure applications into independent, reusable modules. Each layer functions as a mini-application with its own `nuxt.config.ts`, components, composables, pages, and stores. Compose them using the `extends` keyword.

## The Problem

Flat architectures lack boundaries. Components import from anywhere, circular dependencies emerge, and codebases become unmaintainable at scale. Country-specific customizations in an e-commerce project, for example, required painful repository merging strategies before layers existed.

## Architecture Pattern

Three layers form the foundation:

- **Shared Layer:** UI components and utilities—no business logic
- **Feature Layers:** Independent domain modules (products, cart) that never import from each other
- **Project Root:** Orchestrator that coordinates cross-feature interactions

## Enforcing Boundaries

TypeScript provides compile-time checking through generated paths like `#layers/products/...`. But IDE auto-imports can bypass intent. The `eslint-plugin-nuxt-layers` plugin validates that feature layers cannot import from each other or from the app layer at lint time.

## Communication Pattern

Features stay independent. When you need data from multiple domains, the project root queries multiple stores and combines data. No tight coupling between feature modules.

## Code Snippets

### Layer Configuration

Each layer declares its own Nuxt configuration.

```typescript
// layers/products/nuxt.config.ts
export default defineNuxtConfig({
  // Layer-specific configuration
})
```

### Extending Layers

The root project composes all layers together.

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  extends: [
    './layers/shared',
    './layers/products',
    './layers/cart'
  ]
})
```

## Gotchas

- Layer order determines override priority (earlier layers win)
- Same-named files across layers silently overwrite
- Configuration changes require dev server restart
- Route paths need full directory structure—no automatic prefixing

## When to Use

Use layers for applications with distinct feature boundaries, multiple developers, long-term growth expectations (50+ features), or code reuse needs across projects. Skip for small projects under 10 components.

## Connections

- [[how-to-structure-vue-projects]] - Companion piece covering the three scales of project structure; Nuxt layers implement the "modular monolithic" approach from that overview
- [[building-evolutionary-architectures]] - The ESLint boundary enforcement mirrors Neal Ford's fitness functions—automated governance that prevents architectural drift
