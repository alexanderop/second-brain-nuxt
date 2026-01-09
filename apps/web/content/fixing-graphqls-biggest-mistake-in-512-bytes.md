---
title: "Fixing GraphQL's Biggest Mistake in 512 Bytes"
type: youtube
url: "https://www.youtube.com/watch?v=odwQUAkmW44"
tags:
  - graphql
  - error-handling
  - typescript
  - api-design
authors:
  - benjie-gillam
summary: "GraphQL's error propagation destroys sibling data when non-null fields fail. A 512-byte library called graphql-toe transforms error-nulls into thrown errors, letting schemas express business semantics instead of error boundaries."
date: 2026-01-03
---

## The Problem: Two Types of Null

GraphQL has two types of null that look identical:
- **Data null**: The data genuinely doesn't exist (user has no avatar)
- **Error null**: A failure prevented fetching the data (service down)

When an error occurs in a non-null position, GraphQL "bubbles" the null up to the parent. Facebook internally called this behavior "kills parent on exception." This destroys sibling data and breaks normalized caching.

## The Workaround That Became Best Practice

To prevent catastrophic null bubbling, developers mark most fields nullable—even when the business logic guarantees data exists. This creates error boundaries but forces front-end code to add null checks everywhere.

## The Fix: graphql-toe

`graphql-toe` (throw on error) transforms GraphQL responses so error-nulls throw when accessed. Application code never reads an error null—it either gets data or catches an error.

The entire library fits in 512 bytes. It uses immutable tree manipulation and only impacts paths where errors occurred.

## Semantic Non-Null Directive

For backwards compatibility with legacy clients, use the `@semanticNonNull` directive. Mark nullable fields that are semantically non-null, then generate two schemas:
- Legacy clients: strip the directive (nullable fields act as error boundaries)
- Modern clients: convert to strict non-null

## Key Insight

Move non-null from "constraint on delivered data" to "constraint on the business domain." The schema should describe what your business logic guarantees, not where Murphy's law might strike.

## Connections

Related to [[async-defer-even-more-matt-mahoney-meta]] on GraphQL performance patterns at Meta.
