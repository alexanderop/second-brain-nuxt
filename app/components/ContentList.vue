<script setup lang="ts">
import ContentCard from '~/components/ContentCard.vue'
import type { ContentItem } from '~/types/content'

interface ContentListItem extends Omit<ContentItem, 'slug'> {
  stem: string
}

defineProps<{
  items: Array<ContentListItem>
  selectedIndex?: number
}>()
</script>

<template>
  <div v-if="items.length > 0">
    <ContentCard
      v-for="(item, index) in items"
      :key="item.stem"
      :content="{ slug: item.stem, title: item.title, type: item.type, tags: item.tags, authors: item.authors, date: item.date, summary: item.summary }"
      :selected="index === selectedIndex"
    />
  </div>
  <div v-else class="py-8 text-center text-[var(--ui-text-muted)]">
    No content found.
  </div>
</template>
