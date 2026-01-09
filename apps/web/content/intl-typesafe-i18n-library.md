---
title: "@ccssmnn/intl - Type-Safe i18n Without Codegen"
type: github
url: "https://github.com/ccssmnn/intl"
stars: 2
language: "TypeScript"
tags:
  - typescript
  - i18n
  - developer-experience
authors:
  - carl-assmann
summary: "A TypeScript internationalization library built on MessageFormat 2.0 that provides full type safety without requiring code generation or message extraction—designed to work seamlessly with AI coding agents."
date: 2026-01-03
---

## Why It Matters

Most i18n libraries require a build step to extract messages and generate types. This library skips that entirely. You define messages inline, and TypeScript infers the parameter types automatically. The approach works especially well with AI coding assistants that can add translations without running additional tooling.

## Key Features

- **No extraction or codegen** — Define messages directly in code, get type safety immediately
- **MessageFormat 2.0** — Pluralization, selection, and markup via the Unicode standard
- **React integration** — Provider, hooks, and components for rendering translated markup
- **Server-side ready** — Works outside React for emails, notifications, and API responses
- **Graceful fallbacks** — Returns fallback messages when translations fail

## Code Snippets

### Core Usage Pattern

Define messages and create a type-safe translation function:

```typescript
const copy = messages({
  greeting: "Hello {$name}!",
  count: "You have {$num :number} items",
})
const t = createIntl(copy, "en")
t("greeting", { name: "World" })
t("count", { num: 42 })
```

### Type-Safe Translations

The `translate()` function enforces consistent message signatures across locales:

```typescript
let base = messages({
  greeting: "Hello {$name}!",
  count: "You have {$num :number} items",
})
let german = translate(base, {
  greeting: "Hallo {$name}!",
  count: "Du hast {$num :number} Elemente",
})
let t = createIntl(german, "de")
t("greeting", { name: "Carl" })
```

### React Integration

Provider setup with `useIntl` hook and `T` component for markup rendering:

```tsx
const copy = messages({
  signIn: "Hey {$name}! {#link}Sign in here{/link}",
})
const { IntlProvider, useIntl, T } = createIntlForReact(copy, "en")

function Toolbar() {
  const t = useIntl()
  return <p>{t("signIn", { name: "Carl" })}</p>
}

function Entry() {
  return (
    <IntlProvider>
      <Toolbar />
      <T k="signIn" params={{ name: "Carl" }}
        components={{ link: ({ children }) => <a href="/login">{children}</a> }}
      />
    </IntlProvider>
  )
}
```

## Related

- [[building-an-ai-agent-with-typescript]] — TypeScript patterns for AI tooling
