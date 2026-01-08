---
title: "nitro-graphql"
type: github
url: "https://github.com/productdevbook/nitro-graphql"
stars: 119
language: "TypeScript"
tags:
  - graphql
  - typescript
  - developer-experience
authors:
  - productdevbook
summary: "A Nitro module that adds GraphQL servers with automatic schema discovery, type generation, and zero-config defaults. Supports GraphQL Yoga and Apollo Server."
date: 2026-01-04
---

## Overview

nitro-graphql eliminates the boilerplate of adding GraphQL to Nitro applications. Drop `.graphql` files in a folder, export resolvers, and the module handles schema stitching, type generation, and endpoint creation automatically.

## Key Features

- **Auto-discovery**: Scans `server/graphql/` for schema files and resolvers
- **Type generation**: Creates TypeScript types for server and client automatically
- **Framework choice**: Works with GraphQL Yoga (recommended) or Apollo Server
- **Smart chunking**: GraphQL code splits into separate chunks (~98% size reduction)
- **Apollo Sandbox**: Built-in playground for testing queries
- **Federation support**: Enables Apollo Federation for distributed services

## Code Snippets

### Installation

```bash
# With GraphQL Yoga (recommended)
pnpm add nitro-graphql@beta graphql-yoga graphql graphql-config

# Or with Apollo Server
pnpm add nitro-graphql@beta @apollo/server graphql graphql-config
```

### Nuxt Configuration

```typescript
export default defineNuxtConfig({
  modules: ['nitro-graphql/nuxt'],
  nitro: {
    graphql: {
      framework: 'graphql-yoga'
    }
  }
})
```

### Standalone Nitro

```typescript
import graphql from 'nitro-graphql'
import { defineNitroConfig } from 'nitro/config'

export default defineNitroConfig({
  modules: [graphql({ framework: 'graphql-yoga' })]
})
```

## Technical Details

The module watches for file changes during development and regenerates types on the fly. It supports external GraphQL services through the `externalServices` config, enabling connection to multiple upstream APIs.

Configuration options include custom directories for server code, client utilities, and generated types. The v2.0 beta brings full compatibility with Nitro v3 and H3 v2.

## Connections

Related to [[fixing-graphqls-biggest-mistake-in-512-bytes]] on GraphQL error handling patterns.
