/**
 * Mock for #components used in BDD tests
 *
 * Re-exports Nuxt UI components and provides stubs for Nuxt-specific components.
 */
/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { defineComponent, h } from 'vue'

// ============================================
// Nuxt UI Components
// ============================================

// Try to import from @nuxt/ui - these may need adjustment based on actual exports
// For now, create stub components that render their slots

/** UApp - Main app wrapper (wraps all children in single root for Suspense compatibility) */
export const UApp = defineComponent({
  name: 'UApp',
  setup(_, { slots }) {
    return () => h('div', { class: 'u-app', 'data-testid': 'app' }, [
      h('div', { class: 'u-app-content' }, slots.default?.()),
    ])
  },
})

/** UContainer - Content container (wraps all children in single root) */
export const UContainer = defineComponent({
  name: 'UContainer',
  setup(_, { slots }) {
    return () => h('div', { class: 'u-container' }, [
      h('div', { class: 'u-container-content' }, slots.default?.()),
    ])
  },
})

/** UModal - Modal dialog */
export const UModal = defineComponent({
  name: 'UModal',
  props: {
    open: { type: Boolean, default: false },
  },
  emits: ['update:open'],
  setup(props, { slots }) {
    return () => {
      if (!props.open) return null
      return h('div', {
        class: 'u-modal',
        'data-testid': 'modal',
      }, [
        slots.content?.() ?? slots.default?.(),
      ])
    }
  },
})

/** UCommandPalette - Search command palette */
export const UCommandPalette = defineComponent({
  name: 'UCommandPalette',
  props: {
    groups: { type: Array, default: () => [] },
    modelValue: { type: String, default: '' },
    placeholder: { type: String, default: 'Search...' },
    fuse: { type: Object, default: () => ({}) },
    close: { type: Object, default: undefined },
  },
  emits: ['update:modelValue', 'update:open'],
  setup(props, { slots, emit }) {
    return () => h('div', {
      class: 'u-command-palette',
      'data-testid': 'command-palette',
    }, [
      h('input', {
        type: 'search',
        value: props.modelValue,
        placeholder: props.placeholder,
        'data-testid': 'search-input',
        onInput: (e: Event) => emit('update:modelValue', (e.target as HTMLInputElement).value),
      }),
      h('div', { class: 'results' }, [
        (props.groups as Array<{ id: string, label: string, items: Array<{ id: string, label: string, to?: string }> }>).map(group =>
          h('div', { key: group.id, class: 'group', 'data-group': group.id }, [
            h('div', { class: 'group-label' }, group.label),
            ...group.items.map(item =>
              h('div', {
                key: item.id,
                class: 'item',
                'data-testid': 'search-result',
                'data-item-id': item.id,
                onClick: () => emit('update:modelValue', item),
              }, item.label),
            ),
          ]),
        ),
        slots.empty?.(),
      ]),
    ])
  },
})

/** UAvatar - User avatar */
export const UAvatar = defineComponent({
  name: 'UAvatar',
  props: {
    src: { type: String, default: '' },
    alt: { type: String, default: '' },
    size: { type: String, default: 'md' },
  },
  setup(props) {
    return () => h('img', {
      class: 'u-avatar',
      src: props.src,
      alt: props.alt,
      'data-size': props.size,
    })
  },
})

/** UButton - Button component */
export const UButton = defineComponent({
  name: 'UButton',
  props: {
    label: { type: String, default: '' },
    icon: { type: String, default: '' },
    color: { type: String, default: 'primary' },
    variant: { type: String, default: 'solid' },
    disabled: { type: Boolean, default: false },
    to: { type: [String, Object], default: undefined },
    block: { type: Boolean, default: false },
  },
  emits: ['click'],
  setup(props, { slots, emit }) {
    return () => {
      const tag = props.to ? 'a' : 'button'
      return h(tag, {
        class: 'u-button',
        disabled: props.disabled,
        href: props.to ? (typeof props.to === 'string' ? props.to : (props.to as { path?: string }).path) : undefined,
        onClick: (e: Event) => emit('click', e),
      }, slots.default?.() ?? props.label)
    }
  },
})

/** UKbd - Keyboard shortcut display */
export const UKbd = defineComponent({
  name: 'UKbd',
  setup(_, { slots }) {
    return () => h('kbd', { class: 'u-kbd' }, slots.default?.())
  },
})

/** USlideover - Slide-over panel */
export const USlideover = defineComponent({
  name: 'USlideover',
  props: {
    open: { type: Boolean, default: false },
    side: { type: String, default: 'right' },
    title: { type: String, default: '' },
  },
  emits: ['update:open'],
  setup(props, { slots }) {
    return () => {
      if (!props.open) return null
      return h('div', {
        class: 'u-slideover',
        'data-side': props.side,
        'data-testid': 'slideover',
      }, [
        props.title && h('div', { class: 'slideover-title' }, props.title),
        slots.body?.(),
        slots.default?.(),
      ])
    }
  },
})

/** UContentToc - Table of contents */
export const UContentToc = defineComponent({
  name: 'UContentToc',
  props: {
    links: { type: Array, default: () => [] },
  },
  setup(props) {
    return () => h('nav', { class: 'u-content-toc' }, [
      h('ul', {},
        (props.links as Array<{ id: string, text: string }>).map(link =>
          h('li', { key: link.id }, h('a', { href: `#${link.id}` }, link.text)),
        ),
      ),
    ])
  },
})

// ============================================
// Nuxt Content Components
// ============================================

/** ContentRenderer - Renders markdown content */
export const ContentRenderer = defineComponent({
  name: 'ContentRenderer',
  props: {
    value: { type: Object, default: null },
  },
  setup(props, { slots }) {
    return () => h('div', {
      class: 'content-renderer',
      'data-testid': 'content-renderer',
    }, slots.default?.())
  },
})

// ============================================
// Nuxt Core Components
// ============================================

/** NuxtLink - Navigation link */
export const NuxtLink = defineComponent({
  name: 'NuxtLink',
  props: {
    to: { type: [String, Object], required: true },
    custom: { type: Boolean, default: false },
  },
  setup(props, { slots }) {
    const href = typeof props.to === 'string' ? props.to : (props.to as { path?: string }).path
    const navigate = () => {
      // In tests, navigation is a no-op
    }

    return () => {
      // When custom is true, pass slot props instead of rendering <a>
      if (props.custom) {
        return slots.default?.({ navigate, href, isActive: false, isExactActive: false })
      }
      return h('a', {
        href,
        class: 'nuxt-link',
      }, slots.default?.())
    }
  },
})
