<script setup lang="ts">
import { computed } from 'vue'
import { UCard, UButton, UIcon, UBadge, USeparator, UAccordion } from '#components'
import BaseTypeIcon from '~/components/BaseTypeIcon.vue'
import type { ContentType } from '~/constants/contentTypes'

interface GraphNode {
  id: string
  title: string
  type: ContentType
  tags: Array<string>
  authors: Array<string>
  summary?: string
  connections?: number
  maps?: Array<string>
  isMap?: boolean
}

const props = defineProps<{
  node: GraphNode
  outgoingLinks: Array<GraphNode>
  backlinks: Array<GraphNode>
}>()

const emit = defineEmits<{
  close: []
  selectNode: [node: GraphNode]
}>()

const accordionItems = computed(() => {
  const items: Array<{ value: string, label: string, icon: string, slot: string }> = []

  if (props.outgoingLinks.length) {
    items.push({
      value: 'links-to',
      label: `Links to (${props.outgoingLinks.length})`,
      icon: 'i-lucide-arrow-right',
      slot: 'links-to',
    })
  }

  if (props.backlinks.length) {
    items.push({
      value: 'linked-from',
      label: `Linked from (${props.backlinks.length})`,
      icon: 'i-lucide-arrow-left',
      slot: 'linked-from',
    })
  }

  return items
})

const defaultAccordionValue = computed(() =>
  accordionItems.value.map(item => item.value),
)

// Count notes that belong to this map (for map nodes)
const mapMemberCount = computed(() => {
  if (!props.node.isMap) return 0
  return props.outgoingLinks.length
})
</script>

<template>
  <aside class="w-80 overflow-y-auto">
    <UCard
      variant="soft"
      :ui="{
        root: 'rounded-none border-0 shadow-none bg-transparent',
        header: 'p-4 pb-0',
        body: 'p-4',
        footer: 'p-4 pt-0',
      }"
    >
      <template #header>
        <div class="flex items-start justify-between gap-2">
          <div class="flex items-start gap-2 min-w-0">
            <BaseTypeIcon :type="node.type" size="md" class="mt-1 text-[var(--ui-text-muted)]" />
            <h2 class="font-semibold text-lg leading-tight">
              {{ node.title }}
            </h2>
          </div>
          <UButton
            icon="i-lucide-x"
            variant="ghost"
            color="neutral"
            size="sm"
            aria-label="Close node details"
            @click="emit('close')"
          />
        </div>
      </template>

      <!-- Summary -->
      <p v-if="node.summary" class="text-sm text-[var(--ui-text-muted)] mb-4">
        {{ node.summary }}
      </p>

      <!-- Authors -->
      <div v-if="node.authors?.length" class="flex items-center gap-2 mb-4 text-sm">
        <UIcon name="i-lucide-user" class="size-4 text-[var(--ui-text-muted)]" />
        <span class="text-[var(--ui-text-muted)]">
          {{ node.authors.join(', ') }}
        </span>
      </div>

      <!-- Tags -->
      <div v-if="node.tags.length" class="flex flex-wrap gap-1.5 mb-4">
        <UBadge
          v-for="tag in node.tags"
          :key="tag"
          :label="tag"
          variant="subtle"
          color="neutral"
          size="sm"
        />
      </div>

      <!-- Map membership (for non-map nodes) -->
      <div v-if="node.maps?.length && !node.isMap" class="mb-4">
        <div class="flex items-center gap-2 mb-2 text-xs font-medium text-[var(--ui-text-muted)] uppercase tracking-wider">
          <UIcon name="i-lucide-hexagon" class="size-3.5" />
          Member of
        </div>
        <div class="flex flex-wrap gap-1.5">
          <UBadge
            v-for="mapId in node.maps"
            :key="mapId"
            :label="mapId"
            variant="soft"
            color="secondary"
            size="sm"
          />
        </div>
      </div>

      <!-- Map member count (for map nodes) -->
      <div v-if="node.isMap && mapMemberCount > 0" class="mb-4">
        <div class="flex items-center gap-2 text-sm text-[var(--ui-text-muted)]">
          <UIcon name="i-lucide-layers" class="size-4" />
          Contains {{ mapMemberCount }} notes
        </div>
      </div>

      <!-- View Page button -->
      <UButton
        :to="`/${node.id}`"
        label="View Page"
        variant="soft"
        color="neutral"
        block
        class="mb-4"
      />

      <USeparator v-if="accordionItems.length" class="mb-4" />

      <!-- Links Accordion -->
      <UAccordion
        v-if="accordionItems.length"
        type="multiple"
        :default-value="defaultAccordionValue"
        :items="accordionItems"
        :ui="{
          trigger: 'text-xs font-semibold uppercase tracking-wide text-[var(--ui-text-muted)]',
        }"
      >
        <template #links-to>
          <div class="space-y-1 pt-2">
            <UButton
              v-for="link in outgoingLinks"
              :key="link.id"
              variant="ghost"
              color="neutral"
              block
              :ui="{ base: 'justify-start' }"
              @click="emit('selectNode', link)"
            >
              <template #leading>
                <BaseTypeIcon :type="link.type" size="sm" class="text-[var(--ui-text-muted)]" />
              </template>
              <span class="truncate">{{ link.title }}</span>
            </UButton>
          </div>
        </template>

        <template #linked-from>
          <div class="space-y-1 pt-2">
            <UButton
              v-for="link in backlinks"
              :key="link.id"
              variant="ghost"
              color="neutral"
              block
              :ui="{ base: 'justify-start' }"
              @click="emit('selectNode', link)"
            >
              <template #leading>
                <BaseTypeIcon :type="link.type" size="sm" class="text-[var(--ui-text-muted)]" />
              </template>
              <span class="truncate">{{ link.title }}</span>
            </UButton>
          </div>
        </template>
      </UAccordion>

      <template v-if="!outgoingLinks.length && !backlinks.length" #footer>
        <p class="text-sm text-[var(--ui-text-muted)] text-center">
          No connections found
        </p>
      </template>
    </UCard>
  </aside>
</template>
