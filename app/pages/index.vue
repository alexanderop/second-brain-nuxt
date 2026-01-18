<script setup lang="ts">
import { computed } from 'vue'
import { useAsyncData, queryCollection } from '#imports'
import ContentList from '~/components/ContentList.vue'
import { useListNavigation } from '~/composables/useListNavigation'
import { getOrderedGroups } from '~/utils/timeGroups'

const { data: items } = await useAsyncData('recent-content', () => {
  return queryCollection('content')
    .order('date', 'DESC')
    .all()
})

const { selectedIndex } = useListNavigation(items)

const orderedGroups = computed(() => getOrderedGroups(items.value ?? []))

function getGroupSelectedIndex(groupStartIndex: number, groupLength: number): number {
  const idx = selectedIndex.value
  if (idx < groupStartIndex || idx >= groupStartIndex + groupLength) {
    return -1
  }
  return idx - groupStartIndex
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold mb-6">
      Recent Additions
    </h1>

    <template v-for="(group, groupIndex) in orderedGroups" :key="group.key">
      <section class="mb-8">
        <h2 class="text-lg font-medium text-[var(--ui-text-muted)] mb-4">
          {{ group.label }}
        </h2>
        <ContentList
          :items="group.items"
          :selected-index="getGroupSelectedIndex(
            orderedGroups.slice(0, groupIndex).reduce((sum, g) => sum + g.items.length, 0),
            group.items.length
          )"
        />
      </section>
    </template>

    <div v-if="(items?.length ?? 0) === 0" class="py-8 text-center text-[var(--ui-text-muted)]">
      No content found.
    </div>
  </div>
</template>
