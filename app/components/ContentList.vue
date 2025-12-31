<script setup lang="ts">
import type { ContentType } from '~~/content.config'

interface ContentItem {
  stem: string
  title: string
  type: ContentType
  tags?: Array<string>
  date?: Date | string
  summary?: string
}

defineProps<{
  items: Array<ContentItem>
}>()
</script>

<template>
  <div v-if="items.length > 0">
    <ContentCard
      v-for="item in items"
      :key="item.stem"
      :slug="item.stem"
      :title="item.title"
      :type="item.type"
      :tags="item.tags"
      :date="item.date"
      :summary="item.summary"
    />
  </div>
  <div v-else class="py-8 text-center text-[var(--ui-text-muted)]">
    No content found.
  </div>
</template>
