<script setup lang="ts">
import type { ContentType } from '~~/content.config'

interface ContentItem {
  stem: string
  title: string
  type: ContentType
  tags?: Array<string>
  authors?: Array<string>
  date?: Date | string
  summary?: string
}

defineProps<{
  items: Array<ContentItem>
  selectedIndex?: number
}>()
</script>

<template>
  <div v-if="items.length > 0">
    <ContentCard
      v-for="(item, index) in items"
      :key="item.stem"
      :slug="item.stem"
      :title="item.title"
      :type="item.type"
      :tags="item.tags"
      :authors="item.authors"
      :date="item.date"
      :summary="item.summary"
      :selected="index === selectedIndex"
    />
  </div>
  <div v-else class="py-8 text-center text-[var(--ui-text-muted)]">
    No content found.
  </div>
</template>
