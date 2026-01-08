---
title: "Building Flexible Compound Components in Vue 3"
status: draft
tags:
  - vue
  - design-patterns
  - components
  - typescript
  - design-systems
core_idea: "Compound components solve the 'change one thing, edit 30 files' problem by creating shared sub-components with sensible defaults and override escape hatches via cn()."
target_audience: "Vue developers building design systems or maintaining component libraries"
created: 2026-01-05
updated: 2026-01-05
---

## Core Idea

When design requests a consistent change across many instances (like footer margins in 30 modals), compound components let you change one file instead of thirty. Each sub-component holds default styles, but consumers can override with classes or skip components entirely for custom layouts.

## Outline

### 1. The Hook (Problem)
- Real story: design requested footer margin change across 30+ modals
- Each modal had its own footer implementation with inconsistent styles
- No single source of truth

### 2. What We Had: Single-Slot Modal
- Show the simple Modal with one default slot
- Show 3 consumer examples with different footer styles
- Highlight the inconsistency problem

### 3. The Compound Component Solution
- Shared context via provide/inject
- Individual pieces: ModalRoot, ModalOverlay, ModalContent, ModalHeader, ModalTitle, ModalClose, ModalBody, ModalFooter
- Using `cn()` from @sglara/cn for class merging

### 4. The Payoff
- Same modals rewritten with compound components
- One-line change updates all 30 modals

### 5. Flexibility Escape Hatches
- Override with class prop (cn merges intelligently)
- Skip component entirely for custom layout
- Move components around (ModalClose in footer)

### 6. Why cn()?
- Combines clsx + tailwind-merge
- Later classes win on Tailwind conflicts
- Makes override pattern work

### 7. Convenience Wrapper
- SimpleModal for teams that don't need flexibility
- Choose: SimpleModal for quick stuff, primitives for control

### 8. When Compound Components Make Sense
- Good: shared defaults with escape hatches, layout flexibility, unpredictable variations
- Overkill: fixed layout, dynamic data, mandatory consistency

## Source Notes

- [[composition-is-all-you-need]] - Fernando Rojo's React talk presenting the same philosophy. Your article is the Vue implementation of his approach: compound components over boolean prop sprawl.
- [[building-type-safe-compound-components]] - TkDodo's counterpoint: when NOT to use compound components (fixed layouts, dynamic data). Your article shows when TO use them (flexible layouts with shared defaults).
- [[6-levels-of-reusability]] - Michael Thiessen's reusability framework. This article operates at Level 5 (Extension via multiple slots/components) and Level 6 (Nesting with composable primitives).

## Similar Posts (Landscape)

**Provide/Inject Tutorials** (use trivial examples, not complete systems):
- [Tightly Coupled Components with Provide/Inject](https://vueschool.io/articles/vuejs-tutorials/tightly-coupled-components-vue-components-with-provide-inject/) - Vue School, VTabs example
- [Using provide/inject in Vue.js 3](https://blog.logrocket.com/provide-inject-vue-js-3-composition-api/) - LogRocket, prop drilling focus
- [Provide/Inject Pattern](https://www.patterns.dev/vue/provide-inject/) - Patterns.dev, theme/locale examples

**Compound Component Overviews** (mention pattern but no deep-dive):
- [5 Component Design Patterns](https://vueschool.io/articles/vuejs-tutorials/5-component-design-patterns-to-boost-your-vue-js-applications/) - Vue School
- [12 Design Patterns in Vue](https://michaelnthiessen.com/12-design-patterns-vue/) - Michael Thiessen, short examples

**Modal Tutorials** (single monolithic components, not compound):
- [How To Build a Modal Component](https://www.digitalocean.com/community/tutorials/vuejs-vue-modal-component) - DigitalOcean
- [Reusable Dynamic Modal on Vue 3](https://dev.to/cloudx/reusable-dynamic-modal-on-vue-3-1k56) - DEV, global modal service

**shadcn-vue / Reka UI** (explain what, not how to build):
- [Component Architecture Patterns](https://deepwiki.com/unovue/shadcn-vue/5.1-component-architecture-patterns) - DeepWiki
- [Reka UI Introduction](https://reka-ui.com/docs/overview/introduction) - 40+ primitives

**cn() Articles** (React-focused):
- [Why Does Shadcn use cn()?](https://www.webdong.dev/en/post/tailwind-merge-and-clsx-in-shadcn/) - WebDong, deep dive

### Gap This Post Fills

No existing article combines:
1. Complete modal compound system (8 parts: Root → Footer)
2. `cn()` integration for Vue class overrides
3. "Build shadcn-vue patterns yourself" angle
4. Problem-driven narrative (the 30 modals story)

## Draft Sections

### Full Draft

*Design System, API Design, Vue — 5 min read*

## The Problem That Started It All

I was working on a project with dozens of modals scattered across the codebase. Our Modal component was simple—it had a single default slot where each consumer implemented their own content, including headers and footers.

Then came a design request: "Can we adjust the footer margin across all modals?"

Easy, right? Except every modal had its own footer implementation. Some used `mt-4`, others `mt-6`, some had `gap-2` between buttons, others `gap-4`. There was no single source of truth. I had to hunt through 30+ files to make one design change.

That's when I looked at how [shadcn-vue](https://www.shadcn-vue.com/) handles this. It's built on [Radix Vue](https://www.radix-vue.com/), which provides unstyled, accessible primitives as compound components. The pattern clicked immediately: if we had a shared `ModalFooter` component, I'd change one file instead of thirty. And if a specific modal needed something different, it could still override the styles or skip the default entirely.

Let me show you what I mean.

## What We Had: The Single-Slot Modal

Here's roughly what our Modal looked like:

```vue
<!-- Modal.vue -->
<script setup lang="ts">
defineProps<{
  open: boolean
  title: string
}>()

defineEmits<{
  close: []
}>()
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="modal-backdrop" @click="$emit('close')">
      <div class="modal-content" @click.stop>
        <header class="modal-header">
          <h2>{{ title }}</h2>
          <button @click="$emit('close')">✕</button>
        </header>
        <div class="modal-body">
          <slot />
        </div>
      </div>
    </div>
  </Teleport>
</template>
```

And every consumer looked like this:

```vue
<!-- DeleteConfirmModal.vue -->
<template>
  <Modal :open="isOpen" title="Confirm Delete" @close="isOpen = false">
    <p>Are you sure you want to delete this item?</p>

    <div class="flex justify-end gap-2 mt-4">
      <button @click="isOpen = false">Cancel</button>
      <button @click="handleDelete">Delete</button>
    </div>
  </Modal>
</template>
```

```vue
<!-- SettingsModal.vue -->
<template>
  <Modal :open="isOpen" title="Settings" @close="isOpen = false">
    <form><!-- settings form --></form>

    <div class="flex justify-end gap-4 mt-6 pt-4 border-t">
      <button @click="isOpen = false">Cancel</button>
      <button @click="save">Save</button>
    </div>
  </Modal>
</template>
```

```vue
<!-- UserProfileModal.vue -->
<template>
  <Modal :open="isOpen" title="Edit Profile" @close="isOpen = false">
    <form><!-- profile form --></form>

    <div class="flex justify-between mt-4">
      <button @click="deleteAccount">Delete Account</button>
      <div class="flex gap-2">
        <button @click="isOpen = false">Cancel</button>
        <button @click="save">Save</button>
      </div>
    </div>
  </Modal>
</template>
```

See the problem? Every modal has slightly different footer styles. `mt-4` vs `mt-6`. `gap-2` vs `gap-4`. Some have borders, some don't. When design asked to standardize the spacing, I had to touch every single file.

## The Compound Component Solution

What if we had a `ModalFooter` component that held the default styles? Most modals would just use it and get consistent styling automatically. The few that need something special could either override the styles or skip `ModalFooter` entirely.

Let's build it. First, the shared context:

```ts
// modal/context.ts
import type { InjectionKey } from 'vue'

export interface ModalContext {
  close: () => void
}

export const ModalContextKey: InjectionKey<ModalContext> = Symbol('Modal')
```

Now the pieces. I'm using [`@sglara/cn`](https://github.com/SGLara/cn) which combines `clsx` and `tailwind-merge`—it lets consumers override any default class cleanly:

```vue
<!-- modal/ModalRoot.vue -->
<script setup lang="ts">
import { provide } from 'vue'
import { ModalContextKey } from './context'
import { cn } from '@sglara/cn'

const props = defineProps<{
  open: boolean
  class?: string
}>()

const emit = defineEmits<{
  close: []
}>()

provide(ModalContextKey, {
  close: () => emit('close')
})
</script>

<template>
  <Teleport to="body">
    <div v-if="open" :class="cn('fixed inset-0 z-50', props.class)">
      <slot />
    </div>
  </Teleport>
</template>
```

```vue
<!-- modal/ModalOverlay.vue -->
<script setup lang="ts">
import { inject } from 'vue'
import { ModalContextKey } from './context'
import { cn } from '@sglara/cn'

const props = defineProps<{
  class?: string
}>()

const context = inject(ModalContextKey)
</script>

<template>
  <div
    :class="cn('fixed inset-0 bg-black/50 backdrop-blur-sm', props.class)"
    @click="context?.close()"
  />
</template>
```

```vue
<!-- modal/ModalContent.vue -->
<script setup lang="ts">
import { cn } from '@sglara/cn'

const props = defineProps<{
  class?: string
}>()
</script>

<template>
  <div
    :class="cn(
      'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
      'bg-white rounded-lg shadow-xl w-full max-w-md',
      props.class
    )"
    @click.stop
  >
    <slot />
  </div>
</template>
```

```vue
<!-- modal/ModalHeader.vue -->
<script setup lang="ts">
import { cn } from '@sglara/cn'

const props = defineProps<{
  class?: string
}>()
</script>

<template>
  <header :class="cn('flex items-center justify-between p-4 border-b', props.class)">
    <slot />
  </header>
</template>
```

```vue
<!-- modal/ModalTitle.vue -->
<script setup lang="ts">
import { cn } from '@sglara/cn'

const props = defineProps<{
  class?: string
}>()
</script>

<template>
  <h2 :class="cn('text-lg font-semibold', props.class)">
    <slot />
  </h2>
</template>
```

```vue
<!-- modal/ModalClose.vue -->
<script setup lang="ts">
import { inject } from 'vue'
import { ModalContextKey } from './context'
import { cn } from '@sglara/cn'

const props = defineProps<{
  class?: string
}>()

const context = inject(ModalContextKey)
</script>

<template>
  <button
    :class="cn('rounded-full p-1 hover:bg-gray-100 transition-colors', props.class)"
    @click="context?.close()"
  >
    <slot>✕</slot>
  </button>
</template>
```

```vue
<!-- modal/ModalBody.vue -->
<script setup lang="ts">
import { cn } from '@sglara/cn'

const props = defineProps<{
  class?: string
}>()
</script>

<template>
  <div :class="cn('p-4', props.class)">
    <slot />
  </div>
</template>
```

And here's the star of the show—the footer that would have saved me hours:

```vue
<!-- modal/ModalFooter.vue -->
<script setup lang="ts">
import { cn } from '@sglara/cn'

const props = defineProps<{
  class?: string
}>()
</script>

<template>
  <footer :class="cn('flex items-center justify-end gap-3 p-4 border-t', props.class)">
    <slot />
  </footer>
</template>
```

Export everything:

```ts
// modal/index.ts
export { default as Modal } from './ModalRoot.vue'
export { default as ModalOverlay } from './ModalOverlay.vue'
export { default as ModalContent } from './ModalContent.vue'
export { default as ModalHeader } from './ModalHeader.vue'
export { default as ModalTitle } from './ModalTitle.vue'
export { default as ModalClose } from './ModalClose.vue'
export { default as ModalBody } from './ModalBody.vue'
export { default as ModalFooter } from './ModalFooter.vue'
```

## The Payoff: One File to Change

Now those same modals look like this:

```vue
<!-- DeleteConfirmModal.vue -->
<script setup lang="ts">
import {
  Modal, ModalOverlay, ModalContent,
  ModalHeader, ModalTitle, ModalClose,
  ModalBody, ModalFooter
} from '@/components/modal'
</script>

<template>
  <Modal :open="isOpen" @close="isOpen = false">
    <ModalOverlay />
    <ModalContent>
      <ModalHeader>
        <ModalTitle>Confirm Delete</ModalTitle>
        <ModalClose />
      </ModalHeader>
      <ModalBody>
        <p>Are you sure you want to delete this item?</p>
      </ModalBody>
      <ModalFooter>
        <button @click="isOpen = false">Cancel</button>
        <button @click="handleDelete">Delete</button>
      </ModalFooter>
    </ModalContent>
  </Modal>
</template>
```

```vue
<!-- SettingsModal.vue -->
<template>
  <Modal :open="isOpen" @close="isOpen = false">
    <ModalOverlay />
    <ModalContent>
      <ModalHeader>
        <ModalTitle>Settings</ModalTitle>
        <ModalClose />
      </ModalHeader>
      <ModalBody>
        <form><!-- settings form --></form>
      </ModalBody>
      <ModalFooter>
        <button @click="isOpen = false">Cancel</button>
        <button @click="save">Save</button>
      </ModalFooter>
    </ModalContent>
  </Modal>
</template>
```

When design says "change the footer gap from 12px to 16px", I change `gap-3` to `gap-4` in `ModalFooter.vue`. Done. One file. Thirty modals updated.

## But What About Special Cases?

This is where compound components really shine. You're not locked in.

**Need different spacing for one modal?** Override with a class:

```vue
<ModalFooter class="gap-6 p-6">
  <button>Cancel</button>
  <button>Save</button>
</ModalFooter>
```

The `cn()` function from `@sglara/cn` handles the merge intelligently—`gap-6` replaces the default `gap-3`, `p-6` replaces `p-4`.

**Need a completely custom footer layout?** Skip `ModalFooter` entirely:

```vue
<ModalBody>
  <form><!-- profile form --></form>
</ModalBody>

<!-- Custom footer without using ModalFooter -->
<div class="flex justify-between p-4 border-t bg-gray-50">
  <button @click="deleteAccount" class="text-red-600">
    Delete Account
  </button>
  <div class="flex gap-2">
    <button @click="isOpen = false">Cancel</button>
    <button @click="save">Save</button>
  </div>
</div>
```

**Need the close button in the footer instead of the header?**

```vue
<ModalHeader>
  <ModalTitle>Confirm Action</ModalTitle>
  <!-- No ModalClose here -->
</ModalHeader>
<ModalBody>...</ModalBody>
<ModalFooter>
  <ModalClose class="mr-auto">Cancel</ModalClose>
  <button @click="confirm">Confirm</button>
</ModalFooter>
```

The `ModalClose` component works anywhere because it uses `inject` to get the `close` function from the parent `Modal`—doesn't matter how deeply nested it is.

## Why `cn`?

The [`@sglara/cn`](https://github.com/SGLara/cn) package is small but essential. It combines `clsx` (conditional classes) with `tailwind-merge` (conflict resolution):

```ts
import { cn } from '@sglara/cn'

// Later classes win when there's a Tailwind conflict
cn('p-4', 'p-6') // → "p-6"
cn('gap-3', 'gap-6') // → "gap-6"

// Non-conflicting classes are preserved
cn('p-4 border-t', 'bg-gray-50') // → "p-4 border-t bg-gray-50"

// Conditional classes work too
cn('flex', { 'opacity-50': isDisabled })
```

This is what makes the override pattern work. When someone passes `class="gap-6"` to `ModalFooter`, the default `gap-3` is replaced, not duplicated.

## Sharing State with `provide`/`inject`

The magic that connects these components is Vue's `provide`/`inject`. The parent provides context:

```ts
// In ModalRoot.vue
provide(ModalContextKey, {
  close: () => emit('close')
})
```

Any descendant can inject it:

```ts
// In ModalClose.vue or ModalOverlay.vue
const context = inject(ModalContextKey)
context?.close()
```

This is the same pattern Radix Vue uses. It means `ModalClose` works whether it's in the header, footer, or nested inside some other component—it'll always find its parent `Modal`.

## Convenience Wrapper for Simple Cases

More verbose markup is the tradeoff. For teams that don't need flexibility in most cases, provide a simple wrapper too:

```vue
<!-- SimpleModal.vue -->
<script setup lang="ts">
import {
  Modal, ModalOverlay, ModalContent,
  ModalHeader, ModalTitle, ModalClose,
  ModalBody, ModalFooter
} from './index'

defineProps<{
  open: boolean
  title: string
}>()

defineEmits<{
  close: []
}>()
</script>

<template>
  <Modal :open="open" @close="$emit('close')">
    <ModalOverlay />
    <ModalContent>
      <ModalHeader>
        <ModalTitle>{{ title }}</ModalTitle>
        <ModalClose />
      </ModalHeader>
      <ModalBody>
        <slot />
      </ModalBody>
      <ModalFooter v-if="$slots.footer">
        <slot name="footer" />
      </ModalFooter>
    </ModalContent>
  </Modal>
</template>
```

Now teams can choose: `SimpleModal` for quick stuff, primitives when they need control.

## When Compound Components Make Sense

They're great when:

- **You need shared defaults with escape hatches** — Like my footer margin problem
- **Layout flexibility matters** — Users need to arrange things differently
- **You can't predict every variation** — Props would explode

They're overkill when:

- **Layout is truly fixed** — Nothing ever changes
- **Content is entirely dynamic** — Data from an API that needs mapping
- **Consistency is mandatory** — Users shouldn't customize

## Conclusion

That design request to change footer margins across 30 modals? With compound components, it would have been a one-line change. That's the real value here—not just flexibility for consumers, but maintainability for the design system.

This is exactly how shadcn-vue and Radix Vue work. They give you building blocks with sensible defaults, but you own the code and can change anything. When design requirements shift (and they always do), you're not stuck doing a find-and-replace across your entire codebase.

Vue 3's `provide`/`inject` makes this pattern natural. Combined with `cn()` for style overrides, you get components that are consistent by default and flexible when needed.

## Open Questions

- Should I add accessibility considerations (focus trapping, aria attributes)?
- Include a section on testing compound components?
- Add animation/transition examples?
