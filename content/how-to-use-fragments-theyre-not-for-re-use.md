---
title: "How To Use Fragments (They're Not for Re-use!)"
type: youtube
url: "https://www.youtube.com/watch?v=gMCh8jRVMiQ"
tags:
  - graphql
  - relay
  - meta
  - frontend
  - best-practices
  - architecture
authors:
  - janette-cheng
summary: "GraphQL fragments describe data requirements for components, not reduce code duplication. Reusing fragments causes overfetching. Use fragment models, collocate GraphQL with code, and write GraphQL that mirrors your component structure."
date: 2026-01-03
---

## Key Insights

1. **Fragments are for composition, not reuse** — Each component should own exactly one fragment describing its data needs
2. **Shared fragments create hidden coupling** — When two components share a fragment, changes for one affect the other
3. **Fragment models catch bugs at compile time** — Unlike type models, they only expose fields you explicitly requested
4. **Collocation enables automatic cleanup** — Delete a component, delete its fragment spread—no orphaned data fetching
5. **Mirror code structure in GraphQL** — Functions become fragments, field access becomes fields, child calls become spreads

## Core Message

The GraphQL spec says fragments "allow for the reuse of common repeated selections of fields." This misses the point. Fragments are for **modular definition of each component's data needs** to prevent over and underfetching.

## Why Reuse Causes Problems

### Overfetching Creep

Two functions use the same fields today, so you create a shared fragment. Tomorrow one function needs a new field. You add it to the shared fragment. Now the other function fetches data it never uses.

What seemed like DRY code created an **implicit dependency** between unrelated functions. At scale with many developers, this compounds into significant overfetching.

```graphql
# ❌ Shared fragment - seems DRY but causes problems
fragment UserFields on User {
  id
  name
  avatar      # Added for ProfileCard
  email       # Added for SettingsPage
  lastLogin   # Added for AdminDashboard
}

# ProfileCard fetches email and lastLogin it never uses
# SettingsPage fetches avatar and lastLogin it never uses
```

### Unused Field Detection

When a fragment maps to one component, detecting unused fields is fast. When a fragment spreads across the codebase, checking if any field can be removed requires scanning everything. This blocks automated unused field linting—a key GraphQL benefit.

## Three Tips from Meta

### 1. Use Fragment Models, Not Type Models

A **fragment model** generates accessors only for fields in the fragment. A **type model** exposes all fields on the schema type.

Fragment models catch underfetching at compile time. If you access a field not in your fragment, you get an error—prompting you to add it and actually fetch the data.

```typescript
// Type model: exposes ALL fields, no safety
const user: UserType = data.user;
user.email; // ✓ Compiles, but crashes if not fetched!

// Fragment model: exposes ONLY fetched fields
const user: ProfileCard_user = data.user;
user.email; // ✗ Compile error - field not in fragment
```

### 2. Collocate GraphQL with Code

Put each component's fragment next to that component. Relay enforces this: even if a parent spreads a child fragment, the parent cannot access the child's fields.

When you delete a component, you delete its fragment spread. No orphaned data fetching.

```tsx
// ProfileCard.tsx
const ProfileCard_user = graphql`
  fragment ProfileCard_user on User {
    name
    avatar
  }
`;

function ProfileCard({ user }: { user: ProfileCard_user }) {
  return <img src={user.avatar} alt={user.name} />;
}
```

### 3. Write GraphQL That Mirrors Your Code

Translate client code directly into GraphQL:
- Each function/component → a fragment
- Field accesses → fields in the fragment
- Child component calls → fragment spreads
- Conditionals → `@skip` / `@include` directives

```tsx
// Component structure
function UserProfile({ user }) {
  if (user.isAdmin) {
    return <AdminBadge user={user} />;
  }
  return <ProfileCard user={user} />;
}

// Mirrors directly to GraphQL
fragment UserProfile_user on User {
  isAdmin              # conditional check
  ...AdminBadge_user   # child component spread
  ...ProfileCard_user  # child component spread
}
```

## Handling Objections

**"Won't queries get larger?"**
- Field collection deduplicates during execution—repeated fields resolve once
- Use persisted documents to avoid sending large queries over the wire
- Optimize duplicates during the persist step if parsing cost matters

**"Fragment models increase binary size"**
- Fragment models matter most at dev time for compile-time checks
- Production builds can merge models into type models via compiler optimization

**"What about generic interfaces?"**
- Sorting functions that work on any list need fields like `createdAt`
- This creates friction with strict collocation—an open problem Meta is solving with [[async-defer-even-more-matt-mahoney-meta|generic fragments]]

## Key Insight

Fragments are not for reuse. They are for **accurate data requirement description and composition**.

## Connections

- [[async-defer-even-more-matt-mahoney-meta]] — Matt Mahoney's talk on generic fragments solves the tension between strict collocation and reusable sorting/filtering logic
- [[fixing-graphqls-biggest-mistake-in-512-bytes]] — Benjie Gillam on GraphQL nullability, another Meta-influenced pattern for schema design
