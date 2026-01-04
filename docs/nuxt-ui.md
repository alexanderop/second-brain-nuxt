# Nuxt UI Guide

This guide establishes conventions for using Nuxt UI v3 in the Second Brain project. It documents our patterns and provides guidance for building new features.

## Table of Contents

- [Core Principles](#core-principles)
- [Component Usage](#component-usage)
- [Theming & Styling](#theming--styling)
- [Form Patterns](#form-patterns)
- [Layout Patterns](#layout-patterns)
- [Keyboard Navigation](#keyboard-navigation)
- [Common Patterns](#common-patterns)

---

## Core Principles

1. **Minimalist usage** - Use only essential Nuxt UI components; avoid over-abstraction
2. **CSS variables for theming** - All colors use CSS variables for automatic dark mode support
3. **Keyboard-first** - Provide keyboard shortcuts for common actions
4. **Neutral palette** - Default to `color="neutral"` for consistency
5. **Ghost/outline variants** - Prefer subtle button styles over solid fills

---

## Component Usage

### Buttons

Use `UButton` for all interactive actions. Prefer ghost or outline variants for a clean aesthetic.

```vue
<!-- Navigation button -->
<UButton
  to="/books"
  variant="ghost"
  color="neutral"
  icon="i-lucide-book-open"
>
  Books
</UButton>

<!-- Action button -->
<UButton
  variant="outline"
  color="neutral"
  size="sm"
  icon="i-lucide-copy"
  @click="copyLink"
/>

<!-- Icon-only button -->
<UButton
  variant="ghost"
  color="neutral"
  icon="i-lucide-x"
  aria-label="Close"
  @click="close"
/>
```

**Conventions:**
- Use `to` prop for navigation (renders as `<NuxtLink>`)
- Use `@click` for actions
- Always include `aria-label` for icon-only buttons
- Available sizes: `xs`, `sm`, `md`, `lg`, `xl`

### Icons

Use `UIcon` with Lucide icons via the `i-lucide-*` naming convention.

```vue
<UIcon name="i-lucide-search" class="size-5" />
<UIcon name="i-lucide-book-open" class="size-4 text-[var(--ui-text-muted)]" />
```

**Common icons used:**
- Navigation: `home`, `book-open`, `podcast`, `network`, `bar-chart-2`, `tags`, `users`
- Actions: `search`, `copy`, `link`, `external-link`, `x`, `menu`
- Content: `file-text`, `newspaper`, `video`, `pen-line`
- UI: `chevron-right`, `chevron-down`, `arrow-left`, `arrow-right`

### Badges

Use `UBadge` for tags, labels, and status indicators.

```vue
<UBadge variant="subtle" color="neutral" size="sm">
  {{ tag }}
</UBadge>
```

**Conventions:**
- Use `variant="subtle"` for tags
- Use `size="sm"` for inline badges
- Keep color neutral unless semantic meaning requires otherwise

### Avatars

Use `UAvatar` for author images and profile pictures.

```vue
<UAvatar
  :src="author.avatar"
  :alt="author.name"
  size="xl"
/>

<!-- With fallback -->
<UAvatar
  :src="author.avatar"
  :alt="author.name"
  size="sm"
  :ui="{ fallback: 'text-xs' }"
/>
```

**Conventions:**
- Always provide `alt` text
- Available sizes: `3xs`, `2xs`, `xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl`
- Fallback automatically shows initials

### Modals

Use `UModal` for dialogs and overlays.

```vue
<UModal v-model:open="isOpen">
  <template #content>
    <div class="p-4">
      <!-- Modal content -->
    </div>
  </template>
</UModal>
```

**Conventions:**
- Use `v-model:open` for two-way binding
- Close on Escape key (built-in)
- Provide close button within modal content

### Slideover

Use `USlideover` for side panels (mobile navigation, filters).

```vue
<USlideover v-model:open="isMenuOpen" side="left">
  <template #content>
    <nav class="p-4">
      <!-- Navigation items -->
    </nav>
  </template>
</USlideover>
```

### Command Palette

Use `UCommandPalette` for search interfaces with grouped results.

```vue
<UCommandPalette
  v-model:search-term="searchTerm"
  :groups="searchGroups"
  :fuse="{ keys: ['title', 'description'] }"
  placeholder="Search..."
  @update:model-value="handleSelect"
/>
```

**Conventions:**
- Group results by type/category
- Use Fuse.js options for fuzzy search configuration
- Provide meaningful placeholders

### Dropdown Menu

Use `UDropdownMenu` for contextual actions.

```vue
<UDropdownMenu :items="menuItems">
  <UButton variant="ghost" icon="i-lucide-more-horizontal" />
</UDropdownMenu>
```

```ts
const menuItems = [
  [{
    label: 'Copy link',
    icon: 'i-lucide-link',
    onSelect: () => copyLink()
  }],
  [{
    label: 'Open in new tab',
    icon: 'i-lucide-external-link',
    onSelect: () => openExternal()
  }]
]
```

### Select Menu

Use `USelectMenu` for single or multi-select dropdowns.

```vue
<!-- Single select -->
<USelectMenu
  v-model="selectedType"
  :items="typeOptions"
  placeholder="Select type"
/>

<!-- Multi-select -->
<USelectMenu
  v-model="selectedTags"
  :items="tagOptions"
  multiple
  placeholder="Filter by tags"
/>
```

### Input

Use `UInput` for text inputs.

```vue
<UInput
  v-model="searchTerm"
  placeholder="Search..."
  icon="i-lucide-search"
  size="lg"
  autofocus
/>
```

**Conventions:**
- Use `icon` prop for leading icons
- Use `size="lg"` for prominent inputs (search)
- Use `autofocus` judiciously

### Keyboard Hints

Use `UKbd` to display keyboard shortcuts.

```vue
<UKbd>⌘</UKbd><UKbd>K</UKbd>
```

---

## Theming & Styling

### CSS Variables

All colors use Nuxt UI CSS variables for automatic dark mode support. Never hardcode colors.

```vue
<!-- DO: Use CSS variables -->
<div class="text-[var(--ui-text)]">Primary text</div>
<div class="text-[var(--ui-text-muted)]">Secondary text</div>
<div class="border-[var(--ui-border)]">With border</div>

<!-- DON'T: Hardcode colors -->
<div class="text-gray-900 dark:text-gray-100">Avoid this</div>
```

**Available variables:**

| Variable | Usage |
|----------|-------|
| `--ui-text` | Primary text |
| `--ui-text-muted` | Secondary/dimmed text |
| `--ui-text-highlighted` | Emphasized text |
| `--ui-text-dimmed` | Least important text |
| `--ui-bg` | Primary background |
| `--ui-bg-muted` | Secondary background |
| `--ui-bg-elevated` | Elevated surfaces (cards, code blocks) |
| `--ui-border` | Standard borders |
| `--ui-border-accented` | Emphasized borders |
| `--ui-primary` | Primary action color |

### Common Styling Patterns

```vue
<!-- Muted text -->
<span class="text-[var(--ui-text-muted)]">Optional info</span>

<!-- Elevated surface -->
<div class="bg-[var(--ui-bg-elevated)] border border-[var(--ui-border)] rounded-lg p-4">
  Card content
</div>

<!-- Hover states -->
<button class="hover:bg-[var(--ui-bg-muted)] transition-colors">
  Hoverable
</button>

<!-- Selected state -->
<div :class="isSelected && 'bg-[var(--ui-bg-muted)]'">
  Selectable item
</div>
```

### Prose Content

For rendered markdown, use Tailwind's prose classes with dark mode:

```vue
<ContentRenderer
  :value="content"
  class="prose prose-neutral dark:prose-invert max-w-none"
/>
```

### Transitions

Use consistent transition utilities:

```vue
<div class="transition-colors duration-200">Color transitions</div>
<div class="transition-all duration-200">All property transitions</div>
<div class="transition-opacity duration-150">Fade effects</div>
```

---

## Form Patterns

### Search Input

```vue
<template>
  <UInput
    v-model="searchTerm"
    placeholder="Search content..."
    icon="i-lucide-search"
    size="lg"
    autofocus
    class="mb-8"
  />
</template>

<script setup lang="ts">
import { watchDebounced } from '@vueuse/core'

const searchTerm = ref('')
const debouncedTerm = ref('')

watchDebounced(searchTerm, (value) => {
  debouncedTerm.value = value
}, { debounce: 300 })
</script>
```

### Filter Controls

Use toggle buttons for mutually exclusive options:

```vue
<div class="flex gap-2">
  <UButton
    v-for="type in contentTypes"
    :key="type.value"
    :variant="selectedType === type.value ? 'solid' : 'outline'"
    color="neutral"
    size="sm"
    @click="selectedType = type.value"
  >
    {{ type.label }}
  </UButton>
</div>
```

Use `USelectMenu` for multi-select filters:

```vue
<USelectMenu
  v-model="selectedTags"
  :items="availableTags"
  multiple
  placeholder="Filter by tags"
  class="w-48"
/>
```

### Form State Management

Use composables for complex filter state:

```ts
// composables/useFilters.ts
export function useFilters() {
  const selectedTypes = ref<string[]>([])
  const selectedTags = ref<string[]>([])

  const hasActiveFilters = computed(() =>
    selectedTypes.value.length > 0 || selectedTags.value.length > 0
  )

  function clearFilters() {
    selectedTypes.value = []
    selectedTags.value = []
  }

  return {
    selectedTypes,
    selectedTags,
    hasActiveFilters,
    clearFilters
  }
}
```

---

## Layout Patterns

### Page Structure

Standard content page structure:

```vue
<template>
  <div>
    <!-- Header with title and metadata -->
    <ContentHeader :content="page" />

    <!-- Main content with optional sidebar -->
    <div class="flex gap-8">
      <main class="flex-1 min-w-0">
        <ContentRenderer :value="page" class="prose prose-neutral dark:prose-invert" />
      </main>

      <!-- Table of contents sidebar -->
      <aside v-if="page.body?.toc" class="hidden lg:block w-64 shrink-0">
        <UContentToc :toc="page.body.toc" />
      </aside>
    </div>
  </div>
</template>
```

### Collection List Page

```vue
<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">Books</h1>

    <!-- Optional filters -->
    <div class="mb-6">
      <UInput v-model="search" placeholder="Filter..." icon="i-lucide-search" />
    </div>

    <!-- Item list -->
    <ul class="space-y-4">
      <li v-for="item in filteredItems" :key="item.stem">
        <ContentCard :content="item" />
      </li>
    </ul>

    <!-- Empty state -->
    <p v-if="!filteredItems.length" class="text-[var(--ui-text-muted)]">
      No items found.
    </p>
  </div>
</template>
```

### Modal Pattern

```vue
<template>
  <UModal v-model:open="isOpen">
    <template #content>
      <div class="p-4">
        <!-- Header -->
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold">Modal Title</h2>
          <UButton
            variant="ghost"
            color="neutral"
            icon="i-lucide-x"
            aria-label="Close"
            @click="isOpen = false"
          />
        </div>

        <!-- Content -->
        <div>
          <!-- Modal body -->
        </div>
      </div>
    </template>
  </UModal>
</template>
```

### Container Widths

Use consistent max-widths:

```vue
<!-- Default content width -->
<div class="max-w-6xl mx-auto px-4">

<!-- Narrow content (articles, reading) -->
<div class="max-w-3xl mx-auto px-4">

<!-- Full width (graphs, dashboards) -->
<div class="w-full px-4">
```

---

## Keyboard Navigation

### Defining Shortcuts

Use `defineShortcuts` in `app.vue` or page components:

```ts
defineShortcuts({
  // Global search
  meta_k: () => openSearch(),

  // Navigation with G prefix
  'g-h': () => navigateTo('/'),
  'g-b': () => navigateTo('/books'),

  // List navigation
  j: () => selectNext(),
  k: () => selectPrevious(),
  enter: () => openSelected(),

  // Close modals
  escape: () => closeModal()
})
```

### Shortcut Conventions

| Pattern | Usage | Example |
|---------|-------|---------|
| `meta_k` | Global actions | Search |
| `g-{key}` | Go to page | `g-h` = Home |
| `j/k` | List navigation | Move up/down |
| `enter` | Confirm/open | Open selected |
| `escape` | Cancel/close | Close modal |
| `?` | Help | Show shortcuts |

### Displaying Shortcuts

Show keyboard hints for discoverability:

```vue
<UButton variant="ghost" color="neutral">
  Search
  <template #trailing>
    <span class="hidden sm:inline-flex items-center gap-0.5">
      <UKbd>⌘</UKbd><UKbd>K</UKbd>
    </span>
  </template>
</UButton>
```

---

## Common Patterns

### Hover States

```vue
<!-- Interactive list item -->
<li class="p-3 rounded-lg hover:bg-[var(--ui-bg-muted)] transition-colors cursor-pointer">

<!-- Link with underline -->
<NuxtLink class="hover:underline text-[var(--ui-primary)]">
```

### Loading States

```vue
<UButton :loading="isLoading" :disabled="isLoading">
  Save
</UButton>
```

### Empty States

```vue
<div v-if="!items.length" class="text-center py-12">
  <UIcon name="i-lucide-inbox" class="size-12 text-[var(--ui-text-dimmed)] mx-auto mb-4" />
  <p class="text-[var(--ui-text-muted)]">No items found</p>
</div>
```

### Responsive Visibility

```vue
<!-- Hide on mobile -->
<div class="hidden sm:block">Desktop only</div>

<!-- Show on mobile only -->
<div class="sm:hidden">Mobile only</div>

<!-- Different layouts -->
<div class="flex flex-col sm:flex-row gap-4">
```

### Component Customization

Use the `ui` prop for one-off customizations:

```vue
<UButton
  :ui="{ base: 'font-mono' }"
>
  Code
</UButton>

<UAvatar
  :ui="{ fallback: 'text-xs font-bold' }"
/>
```

For global customizations, use `app.config.ts`:

```ts
export default defineAppConfig({
  ui: {
    button: {
      defaultVariants: {
        color: 'neutral'
      }
    },
    contentToc: {
      slots: {
        indicator: 'custom-indicator-class'
      }
    }
  }
})
```

---

## Resources

- [Nuxt UI Documentation](https://ui.nuxt.com)
- [Lucide Icons](https://lucide.dev/icons)
- [Tailwind CSS](https://tailwindcss.com/docs)
