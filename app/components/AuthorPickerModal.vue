<script setup lang="ts">
import { ref, watch } from 'vue'
import { UModal, UButton } from '#components'
import { defineShortcuts } from '#imports'
import { getAuthorUrl } from '~/composables/useAuthorShortcut'

const props = defineProps<{
  authors: string[]
}>()

const open = defineModel<boolean>('open', { default: false })
const selectedIndex = ref(0)

function openAuthor(slug: string) {
  window.open(getAuthorUrl(slug), '_blank')
  open.value = false
}

function openSelected() {
  const author = props.authors[selectedIndex.value]
  if (author) {
    openAuthor(author)
  }
}

// Reset selection when modal opens
watch(open, (isOpen) => {
  if (isOpen) {
    selectedIndex.value = 0
  }
})

defineShortcuts({
  'j': {
    handler: () => {
      if (!open.value) return
      selectedIndex.value = Math.min(selectedIndex.value + 1, props.authors.length - 1)
    },
  },
  'k': {
    handler: () => {
      if (!open.value) return
      selectedIndex.value = Math.max(selectedIndex.value - 1, 0)
    },
  },
  'enter': {
    handler: () => {
      if (!open.value) return
      openSelected()
    },
  },
  'escape': {
    handler: () => {
      open.value = false
    },
  },
})
</script>

<template>
  <UModal v-model:open="open">
    <template #content>
      <div class="p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold">
            Select Author
          </h2>
          <UButton
            icon="i-lucide-x"
            variant="ghost"
            color="neutral"
            size="sm"
            @click="open = false"
          />
        </div>

        <p class="text-sm text-[var(--ui-text-muted)] mb-4">
          This note has multiple authors. Select one to open their page.
        </p>

        <div class="space-y-1">
          <button
            v-for="(author, index) in authors"
            :key="author"
            class="w-full text-left px-3 py-2 rounded-lg transition-colors"
            :class="[
              index === selectedIndex
                ? 'bg-[var(--ui-bg-elevated)] text-[var(--ui-text-highlighted)]'
                : 'hover:bg-[var(--ui-bg-elevated)]/50',
            ]"
            @click="openAuthor(author)"
            @mouseenter="selectedIndex = index"
            @focus="selectedIndex = index"
          >
            {{ author }}
          </button>
        </div>

        <div class="mt-4 pt-4 border-t border-[var(--ui-border)] text-xs text-[var(--ui-text-muted)]">
          <span class="mr-4"><kbd class="px-1.5 py-0.5 bg-[var(--ui-bg-elevated)] rounded">j</kbd> / <kbd class="px-1.5 py-0.5 bg-[var(--ui-bg-elevated)] rounded">k</kbd> to navigate</span>
          <span><kbd class="px-1.5 py-0.5 bg-[var(--ui-bg-elevated)] rounded">enter</kbd> to open</span>
        </div>
      </div>
    </template>
  </UModal>
</template>
