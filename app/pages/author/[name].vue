<script setup lang="ts">
const route = useRoute()
const author = computed(() => decodeURIComponent(route.params.name as string))

const { data: items } = await useAsyncData(`author-${author.value}`, () => {
  return queryCollection('content')
    .where('authors', 'LIKE', `%${author.value}%`)
    .order('date', 'DESC')
    .all()
})

useSeoMeta({
  title: () => `${author.value} - Second Brain`,
})
</script>

<template>
  <div>
    <div class="flex items-center gap-3 mb-6">
      <UIcon name="i-lucide-user" class="size-6" />
      <h1 class="text-2xl font-semibold">
        {{ author }}
      </h1>
      <span class="text-[var(--ui-text-muted)]">
        ({{ items?.length ?? 0 }})
      </span>
    </div>
    <ContentList :items="items ?? []" />
  </div>
</template>
