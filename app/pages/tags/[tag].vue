<script setup lang="ts">
const route = useRoute()
const tag = computed(() => route.params.tag as string)

const { data: items } = await useAsyncData(`tag-${tag.value}`, () => {
  return queryCollection('content')
    .where('tags', 'LIKE', `%${tag.value}%`)
    .order('date', 'DESC')
    .all()
})

useSeoMeta({
  title: () => `#${tag.value} - Second Brain`,
})
</script>

<template>
  <div>
    <div class="flex items-center gap-3 mb-6">
      <UIcon name="i-lucide-hash" class="size-6" />
      <h1 class="text-2xl font-semibold">
        {{ tag }}
      </h1>
      <span class="text-[var(--ui-text-muted)]">
        ({{ items?.length ?? 0 }})
      </span>
    </div>
    <ContentList :items="items ?? []" />
  </div>
</template>
