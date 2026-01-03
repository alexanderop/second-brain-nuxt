---
title: "Composition Is All You Need"
type: youtube
url: "https://www.youtube.com/watch?v=4KvbVq3Eg5w"
tags:
  - design-patterns
  - architecture
  - best-practices
  - developer-experience
authors:
  - fernando-rojo
summary: "Replace boolean prop sprawl with compound components. Lift state to context providers and compose distinct component trees instead of branching with conditionals."
date: 2026-01-03
---

## The Problem

Every React codebase has that component with 30 boolean props: `isEditMode`, `isThread`, `isDMThread`, `isForwarding`. Each condition spreads across the tree, creating code nobody wants to touch.

Fernando demonstrates this with a Slack composer clone. Channels, threads, DM threads, edit message, forward message—each variant needs subtle UI and state differences. The typical approach piles on conditionals until the component becomes unmaintainable.

## The Solution: Compound Components

Build features like Radix components. Instead of passing booleans to a monolith, compose distinct trees from shared primitives:

```jsx
// Instead of <Composer isThread isDM onCancel={...} hideActions={...} />
<ComposerProvider>
  <DropZone />
  <Frame>
    <Header />
    <Input />
    <Footer>
      <CommonActions />
      <SubmitButton />
    </Footer>
  </Frame>
</ComposerProvider>
```

Each variant renders exactly what it needs. No boolean checks, no conditional trees. Edit message doesn't support attachments? Don't render `<DropZone />`. Thread needs "Also send to channel"? Add that component.

## Lifting State

The key insight: pull the provider up and compose children within it. Components outside the visual composer can still access its state:

```jsx
<ComposerProvider>
  <ForwardMessageComposer />
  <MessagePreview />
  <ActionRow>
    <ForwardButton /> {/* Uses context, not inside composer frame */}
  </ActionRow>
</ComposerProvider>
```

The forward button lives below the composer visually but accesses the same context. No prop drilling, no `onFormStateChange` callbacks, no imperative refs.

## State Implementation Flexibility

The provider defines the interface; implementation varies per use case:

- **Forward message**: ephemeral `useState` (discarded on modal close)
- **Channel composer**: synced across devices via custom hook
- **Edit message**: different submit logic

Swap state management at the provider level without touching children.

## Key Takeaways

- If a boolean prop determines which subtree renders, you've found a composition opportunity
- JSX beats abstracted action arrays—escape to custom implementations when needed
- Lift state higher in the tree to share across visually separate components
- Decoupled interfaces make code readable for both humans and AI agents

## Connections

This pattern parallels Vue's approach in [[6-levels-of-reusability]] and [[12-design-patterns-in-vue]], where slots and scoped slots provide similar composition benefits over prop-heavy components.
