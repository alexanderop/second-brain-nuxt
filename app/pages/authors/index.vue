<script setup lang="ts">
import { computed } from 'vue'
import { useAsyncData, useSeoMeta, queryCollection } from '#imports'
import { NuxtLink, UIcon } from '#components'

const { data: allContent } = await useAsyncData('all-content-authors', () => {
  return queryCollection('content').all()
})

const authorCounts = computed(() => {
  const counts: Record<string, number> = {}
  for (const item of allContent.value ?? []) {
    for (const author of (item.authors ?? [])) {
      counts[author] = (counts[author] ?? 0) + 1
    }
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([author, count]) => ({ author, count }))
})

useSeoMeta({
  title: 'Authors - Second Brain',
})
</script>

<template>
  <div>
    <div class="flex items-center gap-3 mb-6">
      <UIcon name="i-lucide-users" class="size-6" />
      <h1 class="text-2xl font-semibold">
        Authors
      </h1>
    </div>

    <div v-if="authorCounts.length" class="flex flex-wrap gap-3">
      <NuxtLink
        v-for="{ author, count } in authorCounts"
        :key="author"
        :to="`/authors/${encodeURIComponent(author)}`"
        class="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--ui-border)] hover:bg-[var(--ui-bg-muted)] transition-colors"
      >
        <UIcon name="i-lucide-user" class="size-4 text-[var(--ui-text-muted)]" />
        <span>{{ author }}</span>
        <span class="text-xs text-[var(--ui-text-muted)] bg-[var(--ui-bg-muted)] px-1.5 py-0.5 rounded">
          {{ count }}
        </span>
      </NuxtLink>
    </div>

    <div v-else class="text-center py-8 text-[var(--ui-text-muted)]">
      No authors found.
    </div>
  </div>
</template>
