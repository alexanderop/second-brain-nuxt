<script setup lang="ts">
const searchTerm = ref('')
const debouncedSearch = refDebounced(searchTerm, 300)

const { data: allContent } = await useAsyncData('all-content', () => {
  return queryCollection('content').order('date', 'DESC').all()
})

const results = computed(() => {
  if (!debouncedSearch.value || !allContent.value)
    return allContent.value?.slice(0, 10) ?? []
  const term = debouncedSearch.value.toLowerCase()
  return allContent.value.filter((item) => {
    const title = item.title?.toLowerCase() ?? ''
    const summary = item.summary?.toLowerCase() ?? ''
    const tags = (item.tags ?? []).join(' ').toLowerCase()
    return title.includes(term) || summary.includes(term) || tags.includes(term)
  })
})

useSeoMeta({
  title: 'Search - Second Brain',
})
</script>

<template>
  <div class="max-w-2xl">
    <h1 class="text-2xl font-semibold mb-6">
      Search
    </h1>

    <UInput
      v-model="searchTerm"
      placeholder="Search content..."
      icon="i-lucide-search"
      size="lg"
      class="mb-8"
      autofocus
    />

    <div v-if="results?.length">
      <p class="text-sm text-[var(--ui-text-muted)] mb-4">
        {{ results.length }} result{{ results.length === 1 ? '' : 's' }}
      </p>
      <div class="space-y-4">
        <NuxtLink
          v-for="result in results"
          :key="result.id"
          :to="`/${result.stem}`"
          class="block p-4 rounded-lg border border-[var(--ui-border)] hover:bg-[var(--ui-bg-muted)]"
        >
          <h3 class="font-medium">
            {{ result.title }}
          </h3>
          <p v-if="result.summary" class="mt-1 text-sm text-[var(--ui-text-muted)] line-clamp-2">
            {{ result.summary }}
          </p>
        </NuxtLink>
      </div>
    </div>

    <div v-else-if="searchTerm" class="text-center py-8 text-[var(--ui-text-muted)]">
      No results found for "{{ searchTerm }}"
    </div>

    <div v-else class="text-center py-8 text-[var(--ui-text-muted)]">
      <p>Start typing to search your knowledge base</p>
      <p class="text-sm mt-2">
        Use <UKbd>⌘K</UKbd> anywhere to open quick search
      </p>
    </div>
  </div>
</template>
