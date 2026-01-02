<script setup lang="ts">
import { NuxtLink } from '#components'
import BaseTypeIcon from '~/components/BaseTypeIcon.vue'
import BaseTagPill from '~/components/BaseTagPill.vue'
import type { ContentItem } from '~/types/content'

defineProps<{
  content: ContentItem
  selected?: boolean
}>()

function formatDate(date?: Date | string) {
  if (!date)
    return ''
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>

<template>
  <article
    class="py-4 border-b border-[var(--ui-border)] last:border-b-0 -mx-2 px-2 rounded-lg transition-colors"
    :class="{ 'bg-[var(--ui-bg-muted)]': selected }"
  >
    <NuxtLink :to="`/${content.slug}`" class="group block">
      <div class="flex items-start gap-3">
        <div class="mt-1 text-[var(--ui-text-muted)]">
          <BaseTypeIcon :type="content.type" size="md" />
        </div>
        <div class="flex-1 min-w-0">
          <h2 class="font-medium group-hover:underline">
            {{ content.title }}
          </h2>
          <p v-if="content.authors?.length" class="text-sm text-[var(--ui-text-muted)]">
            by {{ content.authors.join(', ') }}
          </p>
          <p v-if="content.summary" class="mt-1 text-sm text-[var(--ui-text-muted)] line-clamp-2">
            {{ content.summary }}
          </p>
        </div>
      </div>
    </NuxtLink>
    <div v-if="content.tags?.length || content.date" class="mt-2 ml-8 flex flex-wrap items-center gap-2">
      <BaseTagPill v-for="tag in (content.tags ?? [])" :key="tag" :tag="tag" />
      <span v-if="content.date" class="text-xs text-[var(--ui-text-muted)]">
        {{ formatDate(content.date) }}
      </span>
    </div>
  </article>
</template>
