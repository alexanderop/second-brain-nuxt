---
title: "Using Drizzle with Durable Objects"
type: article
url: "https://nicholasgriffin.dev/blog/using-drizzle-with-durable-objects"
tags:
  - cloudflare-workers
  - drizzle-orm
  - sqlite
  - database-migrations
  - edge-computing
authors:
  - nicholas-griffin
summary: "Drizzle ORM now supports Cloudflare Durable Objects with SQLite, replacing buggy custom migration code with a clean, automated schema management workflow."
date: 2025-12-31
---

## Summary

Drizzle ORM added support for Cloudflare's Durable Objects with SQLite, enabling developers to use a proper ORM and migration system instead of custom database management code. Griffin integrated this into his SprintJam application, replacing unreliable custom code that made updates difficult.

## Key Concepts

- **Durable Objects**: Cloudflare's solution for stateful edge computing, now with SQLite support
- **Repository Pattern**: A central class initializes Drizzle with `DurableObjectStorage` and handles all database operations
- **Migration Safety**: The `blockConcurrencyWhile()` wrapper ensures migrations complete before handling any requests

## Setup Flow

::mermaid
<pre>
flowchart LR
    A[Install drizzle-orm & drizzle-kit] --> B[Configure drizzle.config.ts]
    B --> C[Update wrangler.json]
    C --> D[Create repository class]
    D --> E[Run drizzle-kit generate]
</pre>
::

## Code Snippets

### Drizzle Configuration

The config specifies SQLite dialect with the Durable Objects driver.

```typescript
// drizzle.config.ts
export default {
  dialect: 'sqlite',
  driver: 'durable-sqlite',
  // ... schema and output paths
}
```

### Repository Initialization

Wrap migration in `blockConcurrencyWhile()` to prevent concurrent requests during schema updates.

```typescript
class Repository {
  private db: DrizzleDatabase

  constructor(storage: DurableObjectStorage) {
    this.db = drizzle(storage)

    storage.blockConcurrencyWhile(async () => {
      await migrate(this.db, migrations)
    })
  }
}
```

## Gotchas

- **Concurrency**: Always wrap migrations with `blockConcurrencyWhile()` to prevent race conditions
- **Deployment**: Include `drizzle-kit generate` in your deployment pipeline
- **SQL Imports**: Use the `?raw` suffix for SQL file imports if you encounter parsing errors

## Connections

- [[livestore]] - Also uses SQLite as a reactive data layer, though for local-first apps rather than edge computing
- [[what-is-local-first-web-development]] - Discusses SQLite via WebAssembly as a storage option for client-side data
