---
title: "The 30-Modal Problem: How Compound Components Saved My Sanity"
status: draft
tags:
  - vue
  - design-patterns
  - components
  - typescript
  - design-systems
  - accessibility
core_idea: "Compound components solve the 'change one thing, edit 30 files' problem by creating shared sub-components with sensible defaults and override escape hatches via cn()."
target_audience: "Vue developers building design systems or maintaining component libraries"
created: 2026-01-05
updated: 2026-01-05
---

## Improved Draft (v2)

# The 30-Modal Problem: How Compound Components Saved My Sanity

*Design Systems, Vue 3, API Design — 8 min read*

## The Problem That Started It All

I was working on a project with dozens of modals scattered across the codebase. Our Modal component was simple—it had a single default slot where each consumer implemented their own content, including headers and footers.

Then came a design request: "Can we adjust the footer margin across all modals?"

Easy, right? Except every modal had its own footer implementation. Some used `mt-4`, others `mt-6`, some had `gap-2` between buttons, others `gap-4`. There was no single source of truth. I had to hunt through 30+ files to make one design change.

That's when I looked at how [shadcn-vue](https://www.shadcn-vue.com/) handles this. It's built on [Reka UI](https://reka-ui.com/), which provides unstyled, accessible primitives as compound components. The pattern clicked immediately.

---

## The Mental Model

Before diving into code, let's understand what compound components actually are.

Think of HTML's native `<select>` and `<option>`:

```html
<select>
  <option value="a">Option A</option>
  <option value="b">Option B</option>
</select>
```

`<option>` only makes sense inside `<select>`. They share state (which option is selected) without you passing props manually. The browser handles the implicit connection.

Compound components recreate this pattern in Vue:

```vue
<Modal>
  <ModalOverlay />
  <ModalContent>
    <ModalHeader>
      <ModalTitle>Delete Item</ModalTitle>
      <ModalClose />
    </ModalHeader>
    <ModalBody>Are you sure?</ModalBody>
    <ModalFooter>
      <Button @click="cancel">Cancel</Button>
      <Button @click="confirm">Delete</Button>
    </ModalFooter>
  </ModalContent>
</Modal>
```

**The key ingredients:**

1. **Shared context** — Parent provides state, children inject it
2. **Composable structure** — Mix and match pieces as needed
3. **Sensible defaults** — Each piece has styling, but it's overridable

This gives you the best of both worlds: consistent defaults that you change in one place, plus escape hatches when you need something different.

---

## The Building Blocks: Two Key Patterns

Before we build, you need to understand two patterns that make this work.

### Pattern 1: `provide`/`inject` for Shared State

Vue's `provide`/`inject` lets a parent component share state with any descendant—no matter how deeply nested:

```ts
// Parent provides
provide(ModalContextKey, {
  close: () => emit('close'),
  titleId: 'modal-title-123'
})

// Any descendant injects
const context = inject(ModalContextKey)
context?.close() // Works from anywhere inside the Modal
```

This is how `ModalClose` can close the modal whether it's in the header, footer, or nested three levels deep.

### Pattern 2: `cn()` for Class Merging

When you want overridable styling, you need intelligent class merging. The `cn()` function (from [@sglara/cn](https://github.com/SGLara/cn)) combines `clsx` with `tailwind-merge`:

```ts
import { cn } from '@sglara/cn'

// Later classes win on Tailwind conflicts
cn('p-4', 'p-6')           // → "p-6"
cn('gap-3', 'gap-6')       // → "gap-6"

// Non-conflicting classes are preserved
cn('p-4 border-t', 'bg-gray-50') // → "p-4 border-t bg-gray-50"

// Conditional classes work too
cn('flex', { 'opacity-50': isDisabled })
```

Every compound component follows this pattern:

```vue
<div :class="cn('default-styles here', props.class)">
  <slot />
</div>
```

The component has sensible defaults. Consumers can override any class by passing their own. No conflicts, no duplication.

---

## What We Had: The Single-Slot Modal

Here's roughly what our Modal looked like:

```vue
<!-- Modal.vue -->
<script setup lang="ts">
defineProps<{ open: boolean; title: string }>()
defineEmits<{ close: [] }>()
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

And every consumer reimplemented the footer:

```vue
<!-- DeleteConfirmModal.vue -->
<Modal :open="isOpen" title="Confirm Delete" @close="isOpen = false">
  <p>Are you sure you want to delete this item?</p>
  <div class="flex justify-end gap-2 mt-4"><!-- gap-2, mt-4 -->
    <button @click="isOpen = false">Cancel</button>
    <button @click="handleDelete">Delete</button>
  </div>
</Modal>

<!-- SettingsModal.vue -->
<Modal :open="isOpen" title="Settings" @close="isOpen = false">
  <form>...</form>
  <div class="flex justify-end gap-4 mt-6 pt-4 border-t"><!-- gap-4, mt-6 -->
    <button @click="isOpen = false">Cancel</button>
    <button @click="save">Save</button>
  </div>
</Modal>
```

See the problem? `gap-2` vs `gap-4`. `mt-4` vs `mt-6`. Some have borders, some don't. When design asked to standardize the spacing, I had to touch every single file.

---

## Building the Compound Modal

Let's build a modal system where changing footer styles means editing one file, not thirty.

### The Context

First, define what state the components share:

```ts
// modal/context.ts
import type { InjectionKey, Ref } from 'vue'

export interface ModalContext {
  open: Ref<boolean>
  close: () => void
  titleId: string
  descriptionId: string
}

export const ModalContextKey: InjectionKey<ModalContext> = Symbol('Modal')
```

We include `titleId` and `descriptionId` for accessibility—more on that later.

### The Root Component

The root sets up context and handles the portal:

```vue
<!-- modal/ModalRoot.vue -->
<script setup lang="ts">
import { provide, toRef, useId } from 'vue'
import { ModalContextKey } from './context'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

const titleId = useId()
const descriptionId = useId()

provide(ModalContextKey, {
  open: toRef(props, 'open'),
  close: () => emit('close'),
  titleId,
  descriptionId
})
</script>

<template>
  <Teleport to="body">
    <slot v-if="open" />
  </Teleport>
</template>
```

### The Overlay

Clicking the backdrop closes the modal:

```vue
<!-- modal/ModalOverlay.vue -->
<script setup lang="ts">
import { inject } from 'vue'
import { ModalContextKey } from './context'
import { cn } from '@sglara/cn'

defineProps<{ class?: string }>()
const context = inject(ModalContextKey)
</script>

<template>
  <Transition
    enter-active-class="duration-200 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="duration-150 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="context?.open"
      :class="cn('fixed inset-0 z-50 bg-black/50 backdrop-blur-sm', $props.class)"
      @click="context?.close()"
    />
  </Transition>
</template>
```

### The Content Panel

This is where accessibility matters most:

```vue
<!-- modal/ModalContent.vue -->
<script setup lang="ts">
import { inject, ref, onMounted, onUnmounted } from 'vue'
import { ModalContextKey } from './context'
import { cn } from '@sglara/cn'

defineProps<{ class?: string }>()
const context = inject(ModalContextKey)
const contentRef = ref<HTMLElement>()

// Close on Escape key
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') context?.close()
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  contentRef.value?.focus()
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Transition
    enter-active-class="duration-200 ease-out"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="duration-150 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div
      v-if="context?.open"
      ref="contentRef"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="context?.titleId"
      :aria-describedby="context?.descriptionId"
      tabindex="-1"
      :class="cn(
        'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
        'w-full max-w-md bg-white rounded-lg shadow-xl',
        'focus:outline-none',
        $props.class
      )"
      @click.stop
    >
      <slot />
    </div>
  </Transition>
</template>
```

**Key accessibility features:**
- `role="dialog"` + `aria-modal="true"` — Screen readers announce it as a modal
- `aria-labelledby` — Links to the title for context
- `tabindex="-1"` — Makes it focusable for keyboard users
- Escape key handler — Standard modal behavior

### The Structural Components

These follow the same simple pattern—defaults + override slot:

```vue
<!-- modal/ModalHeader.vue -->
<script setup lang="ts">
import { cn } from '@sglara/cn'
defineProps<{ class?: string }>()
</script>

<template>
  <header :class="cn('flex items-center justify-between p-4 border-b', $props.class)">
    <slot />
  </header>
</template>
```

```vue
<!-- modal/ModalTitle.vue -->
<script setup lang="ts">
import { inject } from 'vue'
import { ModalContextKey } from './context'
import { cn } from '@sglara/cn'
defineProps<{ class?: string }>()
const context = inject(ModalContextKey)
</script>

<template>
  <h2 :id="context?.titleId" :class="cn('text-lg font-semibold', $props.class)">
    <slot />
  </h2>
</template>
```

```vue
<!-- modal/ModalDescription.vue -->
<script setup lang="ts">
import { inject } from 'vue'
import { ModalContextKey } from './context'
import { cn } from '@sglara/cn'
defineProps<{ class?: string }>()
const context = inject(ModalContextKey)
</script>

<template>
  <p :id="context?.descriptionId" :class="cn('text-sm text-gray-600', $props.class)">
    <slot />
  </p>
</template>
```

```vue
<!-- modal/ModalBody.vue -->
<script setup lang="ts">
import { cn } from '@sglara/cn'
defineProps<{ class?: string }>()
</script>

<template>
  <div :class="cn('p-4', $props.class)">
    <slot />
  </div>
</template>
```

### The Star of the Show: ModalFooter

This is the component that would have saved me hours:

```vue
<!-- modal/ModalFooter.vue -->
<script setup lang="ts">
import { cn } from '@sglara/cn'
defineProps<{ class?: string }>()
</script>

<template>
  <footer :class="cn('flex items-center justify-end gap-3 p-4 border-t', $props.class)">
    <slot />
  </footer>
</template>
```

When design says "change gap from 12px to 16px", I change `gap-3` to `gap-4` here. **One file. Thirty modals updated.**

### The Close Button

Works anywhere inside the modal tree:

```vue
<!-- modal/ModalClose.vue -->
<script setup lang="ts">
import { inject } from 'vue'
import { ModalContextKey } from './context'
import { cn } from '@sglara/cn'

defineProps<{ class?: string }>()
const context = inject(ModalContextKey)
</script>

<template>
  <button
    type="button"
    :class="cn(
      'rounded-full p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100',
      'transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
      $props.class
    )"
    @click="context?.close()"
  >
    <slot>
      <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
      </svg>
    </slot>
  </button>
</template>
```

### Export Everything

```ts
// modal/index.ts
export { default as Modal } from './ModalRoot.vue'
export { default as ModalOverlay } from './ModalOverlay.vue'
export { default as ModalContent } from './ModalContent.vue'
export { default as ModalHeader } from './ModalHeader.vue'
export { default as ModalTitle } from './ModalTitle.vue'
export { default as ModalDescription } from './ModalDescription.vue'
export { default as ModalBody } from './ModalBody.vue'
export { default as ModalFooter } from './ModalFooter.vue'
export { default as ModalClose } from './ModalClose.vue'
```

---

## The Payoff

Now those same modals look like this:

```vue
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

**Consistent by default. Flexible when needed.**

---

## Escape Hatches: When You Need Something Different

Compound components shine because you're never locked in.

### Override with a Class

Need different spacing for one modal?

```vue
<ModalFooter class="gap-6 p-6">
  <button>Cancel</button>
  <button>Save</button>
</ModalFooter>
```

`cn()` handles the merge—`gap-6` replaces `gap-3`, `p-6` replaces `p-4`.

### Skip the Component Entirely

Need a completely custom layout?

```vue
<ModalBody>
  <form>...</form>
</ModalBody>

<!-- Custom footer, no ModalFooter -->
<div class="flex justify-between p-4 border-t bg-gray-50">
  <button class="text-red-600">Delete Account</button>
  <div class="flex gap-2">
    <button>Cancel</button>
    <button>Save</button>
  </div>
</div>
```

### Move Components Around

Need close button in the footer?

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

`ModalClose` works anywhere because it uses `inject`—doesn't matter how deeply nested.

---

## Going Further: Production Patterns

The modal we built is solid, but production design systems often need more. Here are patterns from shadcn-vue worth knowing.

### CVA for Variant Systems

What if you need size variants? [class-variance-authority](https://cva.style/docs) handles this elegantly:

```ts
// modal/variants.ts
import { cva, type VariantProps } from 'class-variance-authority'

export const modalContentVariants = cva(
  // Base styles (always applied)
  'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl',
  {
    variants: {
      size: {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        full: 'max-w-[calc(100vw-2rem)]'
      }
    },
    defaultVariants: {
      size: 'md'
    }
  }
)

export type ModalContentVariants = VariantProps<typeof modalContentVariants>
```

```vue
<!-- modal/ModalContent.vue with variants -->
<script setup lang="ts">
import { modalContentVariants, type ModalContentVariants } from './variants'

interface Props extends ModalContentVariants {
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md'
})
</script>

<template>
  <div :class="cn(modalContentVariants({ size: props.size }), props.class)">
    <slot />
  </div>
</template>
```

```vue
<!-- Usage -->
<ModalContent size="lg">...</ModalContent>
<ModalContent size="sm" class="bg-gray-50">...</ModalContent>
```

**You get:**
- Type-safe variant props with autocomplete
- Centralized variant definitions
- Still overridable via `class` prop

### The `asChild` Pattern

Sometimes you want `ModalClose` to be a link, not a button. The `asChild` pattern (from Reka UI) enables this:

```vue
<!-- modal/ModalClose.vue with asChild -->
<script setup lang="ts">
import { Primitive } from 'reka-ui'
import { inject } from 'vue'
import { ModalContextKey } from './context'
import { cn } from '@sglara/cn'

const props = withDefaults(defineProps<{
  class?: string
  as?: string
  asChild?: boolean
}>(), {
  as: 'button',
  asChild: false
})

const context = inject(ModalContextKey)
</script>

<template>
  <Primitive
    :as="as"
    :as-child="asChild"
    :class="cn('rounded-full p-1.5 hover:bg-gray-100', props.class)"
    @click="context?.close()"
  >
    <slot>✕</slot>
  </Primitive>
</template>
```

```vue
<!-- Usage: render as custom element -->
<ModalClose as-child>
  <RouterLink to="/dashboard" class="text-blue-500 underline">
    Go to Dashboard
  </RouterLink>
</ModalClose>
```

### Focus Trapping

For production, you need to trap focus inside the modal. Use [@vueuse/integrations](https://vueuse.org/integrations/useFocusTrap/):

```vue
<script setup lang="ts">
import { useFocusTrap } from '@vueuse/integrations/useFocusTrap'

const contentRef = ref<HTMLElement>()
const { activate, deactivate } = useFocusTrap(contentRef, {
  immediate: true,
  allowOutsideClick: true
})

onMounted(() => activate())
onUnmounted(() => deactivate())
</script>
```

### Scroll Locking

Prevent background scrolling when modal is open:

```ts
// In ModalRoot.vue
import { useScrollLock } from '@vueuse/core'

const isLocked = useScrollLock(document.body)

watch(() => props.open, (open) => {
  isLocked.value = open
})
```

---

## The Convenience Wrapper

More imports is the tradeoff. For teams that want simplicity most of the time, provide a wrapper:

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

defineEmits<{ close: [] }>()
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

Teams can choose: `SimpleModal` for quick stuff, primitives when they need control.

---

## When Compound Components Make Sense

They're great when:

- **You need shared defaults with escape hatches** — Like my footer margin problem. One source of truth, infinite variations.
- **Layout flexibility matters** — Close button in header or footer? Footer with one button or three? Let consumers decide.
- **You can't predict every variation** — Props would explode. Instead of `hasCloseButton`, `closeButtonPosition`, `closeButtonVariant`... just let people compose.

They're overkill when:

- **Layout is truly fixed** — If Modal MUST always be Header → Body → Footer in that order, slots give you structure enforcement. Compound components invite reordering.

- **Content is entirely dynamic** — Rendering items from an API? Mapping over data to produce `<AccordionItem>` elements creates awkward code:

  ```vue
  <!-- This feels wrong -->
  <Accordion>
    <AccordionItem v-for="item in items" :key="item.id">
      <AccordionTrigger>{{ item.title }}</AccordionTrigger>
      <AccordionContent>{{ item.body }}</AccordionContent>
    </AccordionItem>
  </Accordion>

  <!-- Props-based is cleaner -->
  <Accordion :items="items" />
  ```

  See [TkDodo's analysis](https://tkdodo.eu/blog/building-type-safe-compound-components) for more on this.

- **You want to prevent customization** — Compound components invite variation. If design consistency is paramount and developers shouldn't deviate, a restrictive props-based API is intentionally limiting.

---

## Conclusion

That design request to change footer margins across 30 modals? With compound components, it's a one-line change.

This is exactly how shadcn-vue and Reka UI work. They give you building blocks with sensible defaults, but you own the code and can change anything. When design requirements shift (and they always do), you're not doing find-and-replace across your codebase.

Vue 3's `provide`/`inject` makes this pattern natural. Combined with `cn()` for style overrides and CVA for variants, you get components that are:

- **Consistent by default** — Change one file, update everywhere
- **Flexible when needed** — Override classes, skip components, rearrange layout
- **Accessible out of the box** — ARIA attributes, keyboard support, focus management
- **Type-safe** — Full TypeScript support with inference

The 30-modal problem is solved. Go build something.

---

## Further Reading

- [Reka UI](https://reka-ui.com/) — The accessible primitives shadcn-vue is built on
- [shadcn-vue](https://www.shadcn-vue.com/) — See these patterns in production
- [class-variance-authority](https://cva.style/docs) — Type-safe variant styling
- [TkDodo: Building Type-Safe Compound Components](https://tkdodo.eu/blog/building-type-safe-compound-components) — When NOT to use this pattern
