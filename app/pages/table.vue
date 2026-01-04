<script setup lang="ts">
import { nextTick, onMounted, ref, watch, computed } from 'vue'
import { useScroll, watchThrottled } from '@vueuse/core'
import { usePageTitle } from '~/composables/usePageTitle'
import { useContentTable } from '~/composables/useContentTable'
import ContentTable from '~/components/content/ContentTable.vue'
import type { ContentTableState } from '~/components/content/ContentTable.vue'

usePageTitle('Table')

const {
  items,
  pending,
  totalItems,
  totalPages,
  filters,
  hasActiveFilters,
  availableTags,
  availableAuthors,
  availableTypes,
  sort,
  page,
  pageSize,
  setTypeFilter,
  setTagsFilter,
  setAuthorsFilter,
  setDateConsumedRange,
  setRatingRange,
  setSort,
  clearFilters,
  scrollPosition,
} = useContentTable()

// Combine state for ContentTable component
const tableState = computed<ContentTableState>(() => ({
  filters: filters.value,
  sort: sort.value,
  availableTags: availableTags.value,
  availableAuthors: availableAuthors.value,
  availableTypes: availableTypes.value,
  hasActiveFilters: hasActiveFilters.value,
}))

// Scroll restoration
const tableContainerRef = ref<HTMLElement>()
const { y } = useScroll(tableContainerRef)

// Save scroll position (throttled)
watchThrottled(y, (pos) => {
  scrollPosition.value = pos
}, { throttle: 100 })

// Restore on mount
onMounted(() => {
  if (scrollPosition.value > 0) {
    nextTick(() => {
      tableContainerRef.value?.scrollTo(0, scrollPosition.value)
    })
  }
})

// Reset scroll when filters change
watch(filters, () => {
  scrollPosition.value = 0
}, { deep: true })
</script>

<template>
  <div>
    <div class="flex items-center gap-3 mb-6">
      <UIcon name="i-lucide-table-2" class="size-6" />
      <h1 class="text-2xl font-semibold">
        Table
      </h1>
      <span class="text-[var(--ui-text-muted)]">
        ({{ totalItems }})
      </span>
    </div>

    <div ref="tableContainerRef" class="overflow-x-auto">
      <ContentTable
        :items="items"
        :pending="pending"
        :state="tableState"
        @set-type-filter="setTypeFilter"
        @set-tags-filter="setTagsFilter"
        @set-authors-filter="setAuthorsFilter"
        @set-date-consumed-range="setDateConsumedRange"
        @set-rating-range="setRatingRange"
        @set-sort="setSort"
        @clear-filters="clearFilters"
      />
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex items-center justify-between mt-4 pt-4 border-t border-[var(--ui-border)]">
      <div class="text-sm text-[var(--ui-text-muted)]">
        Showing {{ (page - 1) * pageSize + 1 }}-{{ Math.min(page * pageSize, totalItems) }} of {{ totalItems }} items
      </div>
      <UPagination
        v-model:page="page"
        :items-per-page="pageSize"
        :total="totalItems"
        :sibling-count="1"
        show-edges
      >
        <template #prev>
          <UButton
            data-testid="pagination-prev"
            variant="outline"
            color="neutral"
            size="sm"
            icon="i-lucide-chevron-left"
          />
        </template>
        <template #next>
          <UButton
            data-testid="pagination-next"
            variant="outline"
            color="neutral"
            size="sm"
            icon="i-lucide-chevron-right"
          />
        </template>
      </UPagination>
    </div>
  </div>
</template>
