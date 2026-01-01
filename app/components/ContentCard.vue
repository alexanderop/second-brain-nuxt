<script setup lang="ts">
import type { ContentType } from '~~/content.config'

defineProps<{
  slug: string
  title: string
  type: ContentType
  tags?: Array<string>
  authors?: Array<string>
  date?: Date | string
  summary?: string
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
    <NuxtLink :to="`/${slug}`" class="group block">
      <div class="flex items-start gap-3">
        <div class="mt-1 text-[var(--ui-text-muted)]">
          <BaseTypeIcon :type="type" size="md" />
        </div>
        <div class="flex-1 min-w-0">
          <h2 class="font-medium group-hover:underline">
            {{ title }}
          </h2>
          <p v-if="authors?.length" class="text-sm text-[var(--ui-text-muted)]">
            by {{ authors.join(', ') }}
          </p>
          <p v-if="summary" class="mt-1 text-sm text-[var(--ui-text-muted)] line-clamp-2">
            {{ summary }}
          </p>
          <div class="mt-2 flex flex-wrap items-center gap-2">
            <BaseTagPill v-for="tag in (tags ?? [])" :key="tag" :tag="tag" />
            <span v-if="date" class="text-xs text-[var(--ui-text-muted)]">
              {{ formatDate(date) }}
            </span>
          </div>
        </div>
      </div>
    </NuxtLink>
  </article>
</template>
