# Nuxt Component Gotchas

Common pitfalls when building Vue components in Nuxt.

## Nested NuxtLink Hydration Errors

**Problem:** Wrapping a clickable card in `<NuxtLink>` while having inner links creates invalid HTML (`<a>` inside `<a>`), causing hydration mismatches and this warning:

```text
[NuxtLink] You can't nest one <a> inside another <a>. This will cause a hydration error on client-side.
```

**Solution:** Use the `custom` prop to prevent the outer NuxtLink from rendering an `<a>`, then use `v-slot` to access the navigate function:

```vue
<NuxtLink v-slot="{ navigate }" custom :to="cardRoute">
  <div class="cursor-pointer" @click="navigate">
    <h3>{{ title }}</h3>
    <!-- Inner links work normally -->
    <NuxtLink :to="authorRoute" @click.stop>{{ author }}</NuxtLink>
  </div>
</NuxtLink>
```

**Key points:**
- `custom` prevents rendering `<a>`, gives full markup control
- `v-slot="{ navigate }"` exposes the navigation function
- Inner links use `@click.stop` to prevent triggering card navigation
- Add `cursor-pointer` since the wrapper is now a `<div>`

## Feature Toggles with `import.meta.dev`

**Problem:** Need to enable features only in development (e.g., chat, debug panels). Using `runtimeConfig.public` with booleans fails because Nuxt expects strings for environment variable overrides:

```typescript
// ✗ Fails: Type 'boolean' is not assignable to type 'RuntimeValue<string, ...>'
runtimeConfig: {
  public: {
    featureEnabled: import.meta.dev,
  },
}
```

**Solution:** Use `import.meta.dev` directly in components and server code:

```vue
<!-- Client-side (Vue) -->
<script setup>
const featureEnabled = import.meta.dev
</script>

<template>
  <DebugPanel v-if="featureEnabled" />
</template>
```

```typescript
// Server-side (Nitro)
export default defineEventHandler((event) => {
  if (!import.meta.dev) {
    throw createError({ statusCode: 404 })
  }
  // Dev-only logic...
})
```

**Benefits:**
- Build-time constant - dead code eliminated in production
- No environment variables needed
- Works on both client and server
- Tree-shaking removes dev-only code from production bundle
