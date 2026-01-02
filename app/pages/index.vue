<script setup lang="ts">
import { useAsyncData, queryCollection } from '#imports'
import ContentList from '~/components/ContentList.vue'
import { useListNavigation } from '~/composables/useListNavigation'

const { data: items } = await useAsyncData('recent-content', () => {
  return queryCollection('content')
    .order('date', 'DESC')
    .limit(30)
    .all()
})

const { selectedIndex } = useListNavigation(items)
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold mb-6">
      Recent Additions
    </h1>
    <ContentList :items="items ?? []" :selected-index="selectedIndex" />
  </div>
</template>
