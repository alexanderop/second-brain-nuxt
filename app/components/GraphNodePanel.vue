<script setup lang="ts">
import type { ContentType } from '~~/content.config'

interface GraphNode {
  id: string
  title: string
  type: ContentType
  tags: Array<string>
  summary?: string
}

defineProps<{
  node: GraphNode
  outgoingLinks: Array<GraphNode>
  backlinks: Array<GraphNode>
}>()

const emit = defineEmits<{
  close: []
  selectNode: [node: GraphNode]
}>()
</script>

<template>
  <aside class="w-80 border-l border-[var(--ui-border)] bg-[var(--ui-bg)] overflow-y-auto">
    <div class="p-4">
      <!-- Header -->
      <div class="flex items-start justify-between gap-2 mb-4">
        <div class="flex items-start gap-2 min-w-0">
          <TypeIcon :type="node.type" size="md" class="mt-1 text-[var(--ui-text-muted)]" />
          <h2 class="font-semibold text-lg leading-tight">
            {{ node.title }}
          </h2>
        </div>
        <button
          class="p-1 rounded hover:bg-[var(--ui-bg-muted)] text-[var(--ui-text-muted)]"
          @click="emit('close')"
        >
          <UIcon name="i-lucide-x" class="size-5" />
        </button>
      </div>

      <!-- Summary -->
      <p v-if="node.summary" class="text-sm text-[var(--ui-text-muted)] mb-4">
        {{ node.summary }}
      </p>

      <!-- Tags -->
      <div v-if="node.tags.length" class="flex flex-wrap gap-1.5 mb-4">
        <TagPill v-for="tag in node.tags" :key="tag" :tag="tag" />
      </div>

      <!-- View Page button -->
      <NuxtLink
        :to="`/${node.id}`"
        class="block w-full text-center py-2 px-4 rounded-lg bg-[var(--ui-bg-muted)] hover:bg-[var(--ui-bg-elevated)] text-sm font-medium mb-6"
      >
        View Page
      </NuxtLink>

      <!-- Outgoing Links -->
      <div v-if="outgoingLinks.length" class="mb-6">
        <h3 class="text-xs font-semibold text-[var(--ui-text-muted)] uppercase tracking-wide mb-2">
          Links to ({{ outgoingLinks.length }})
        </h3>
        <div class="space-y-1">
          <button
            v-for="link in outgoingLinks"
            :key="link.id"
            class="w-full flex items-center gap-2 p-2 rounded hover:bg-[var(--ui-bg-muted)] text-left"
            @click="emit('selectNode', link)"
          >
            <TypeIcon :type="link.type" size="sm" class="text-[var(--ui-text-muted)]" />
            <span class="text-sm truncate">{{ link.title }}</span>
          </button>
        </div>
      </div>

      <!-- Backlinks -->
      <div v-if="backlinks.length">
        <h3 class="text-xs font-semibold text-[var(--ui-text-muted)] uppercase tracking-wide mb-2">
          Linked from ({{ backlinks.length }})
        </h3>
        <div class="space-y-1">
          <button
            v-for="link in backlinks"
            :key="link.id"
            class="w-full flex items-center gap-2 p-2 rounded hover:bg-[var(--ui-bg-muted)] text-left"
            @click="emit('selectNode', link)"
          >
            <TypeIcon :type="link.type" size="sm" class="text-[var(--ui-text-muted)]" />
            <span class="text-sm truncate">{{ link.title }}</span>
          </button>
        </div>
      </div>

      <!-- No links message -->
      <p
        v-if="!outgoingLinks.length && !backlinks.length"
        class="text-sm text-[var(--ui-text-muted)] text-center py-4"
      >
        No connections found
      </p>
    </div>
  </aside>
</template>
