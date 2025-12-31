<script setup lang="ts">
const { data: allContent } = await useAsyncData('all-content-tags', () => {
  return queryCollection('content').all()
})

const tagCounts = computed(() => {
  const counts: Record<string, number> = {}
  for (const item of allContent.value ?? []) {
    for (const tag of (item.tags ?? [])) {
      counts[tag] = (counts[tag] ?? 0) + 1
    }
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([tag, count]) => ({ tag, count }))
})

useSeoMeta({
  title: 'Tags - Second Brain',
})
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold mb-6">
      Tags
    </h1>

    <div v-if="tagCounts.length" class="flex flex-wrap gap-3">
      <NuxtLink
        v-for="{ tag, count } in tagCounts"
        :key="tag"
        :to="`/tags/${tag}`"
        class="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--ui-border)] hover:bg-[var(--ui-bg-muted)] transition-colors"
      >
        <span>{{ tag }}</span>
        <span class="text-xs text-[var(--ui-text-muted)] bg-[var(--ui-bg-muted)] px-1.5 py-0.5 rounded">
          {{ count }}
        </span>
      </NuxtLink>
    </div>

    <div v-else class="text-center py-8 text-[var(--ui-text-muted)]">
      No tags found.
    </div>
  </div>
</template>
