<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useAsyncData, queryCollection } from '#imports'
import { usePageTitle } from '~/composables/usePageTitle'
import { UIcon } from '#components'
import ContentList from '~/components/ContentList.vue'

const route = useRoute()
const tag = computed(() => String(route.params.tag))

const { data: items } = await useAsyncData(`tag-${tag.value}`, () => {
  return queryCollection('content')
    .where('tags', 'LIKE', `%${tag.value}%`)
    .order('date', 'DESC')
    .all()
})

usePageTitle(() => `#${tag.value}`)
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
