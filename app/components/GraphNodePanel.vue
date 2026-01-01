<script setup lang="ts">
import type { ContentType } from '~~/content.config'

interface GraphNode {
  id: string
  title: string
  type: ContentType
  tags: Array<string>
  authors: Array<string>
  summary?: string
  connections?: number
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
