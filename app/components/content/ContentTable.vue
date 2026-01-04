<script setup lang="ts">
import { h, resolveComponent, computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { TableColumn } from '@nuxt/ui'
import type { ContentType } from '~~/content.config'
import type { FilterState, SortState, TableAuthor, TableContentItem } from '~/types/table'
import { CONTENT_TYPES } from '~/types/table'

const router = useRouter()

// State interface combines related props
export interface ContentTableState {
  filters: FilterState
  sort: SortState
  availableTags: string[]
  availableAuthors: TableAuthor[]
  hasActiveFilters: boolean
}

const props = defineProps<{
  items: TableContentItem[]
  pending: boolean
  state: ContentTableState
}>()

const emit = defineEmits<{
  (e: 'set-type-filter', types: ContentType[]): void
  (e: 'set-tags-filter', tags: string[]): void
  (e: 'set-authors-filter', authors: string[]): void
  (e: 'set-date-consumed-range', range: [string, string] | null): void
  (e: 'set-rating-range', range: [number, number] | null): void
  (e: 'set-sort', column: SortState['column'], direction: SortState['direction']): void
  (e: 'clear-filters'): void
}>()

// Shorthand accessors
const filters = computed(() => props.state.filters)
const sort = computed(() => props.state.sort)
const availableTags = computed(() => props.state.availableTags)
const availableAuthors = computed(() => props.state.availableAuthors)
const hasActiveFilters = computed(() => props.state.hasActiveFilters)

// Resolve components for render functions
const UBadge = resolveComponent('UBadge')
const UButton = resolveComponent('UButton')
const UAvatar = resolveComponent('UAvatar')

// Icon map for content types
const iconMap: Record<ContentType, string> = {
  youtube: 'i-lucide-play',
  podcast: 'i-lucide-mic',
  article: 'i-lucide-file-text',
  book: 'i-lucide-book-open',
  manga: 'i-lucide-book-image',
  movie: 'i-lucide-clapperboard',
  tv: 'i-lucide-tv',
  tweet: 'i-lucide-message-circle',
  quote: 'i-lucide-quote',
  course: 'i-lucide-graduation-cap',
  note: 'i-lucide-pencil',
  evergreen: 'i-lucide-leaf',
  map: 'i-lucide-hexagon',
  reddit: 'i-lucide-message-square',
  github: 'i-lucide-github',
  newsletter: 'i-lucide-newspaper',
}

// Format date for display
function formatDate(date?: string): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// Column pinning for sticky title on mobile
const columnPinning = ref({
  left: ['title'],
})

// Rating range for slider
const ratingRange = ref<[number, number]>(filters.value.ratingRange ?? [1, 7])

// Selected authors for USelectMenu
const selectedAuthors = computed({
  get: () => filters.value.authors ?? [],
  set: (v: string[]) => emit('set-authors-filter', v),
})

// Transform authors for USelectMenu items format
const authorSelectItems = computed(() =>
  availableAuthors.value.map(a => ({
    label: a.name,
    value: a.slug,
    avatar: a.avatar ? { src: a.avatar } : undefined,
  })),
)

// Type filter items for dropdown
const typeFilterItems = computed(() => [
  [
    { type: 'label' as const, label: 'Sort' },
    {
      label: 'Ascending',
      icon: 'i-lucide-arrow-up',
      type: 'checkbox' as const,
      checked: sort.value.column === 'type' && sort.value.direction === 'asc',
      onSelect: () => emit('set-sort', 'type', 'asc'),
    },
    {
      label: 'Descending',
      icon: 'i-lucide-arrow-down',
      type: 'checkbox' as const,
      checked: sort.value.column === 'type' && sort.value.direction === 'desc',
      onSelect: () => emit('set-sort', 'type', 'desc'),
    },
  ],
  [
    { type: 'label' as const, label: 'Filter by Type' },
    ...CONTENT_TYPES.map(t => ({
      type: 'checkbox' as const,
      label: t,
      icon: iconMap[t],
      checked: filters.value.type?.includes(t) ?? false,
      onUpdateChecked: (checked: boolean) => {
        const current = filters.value.type ?? []
        const next = checked
          ? [...current, t]
          : current.filter(x => x !== t)
        emit('set-type-filter', next)
      },
    })),
  ],
  [
    {
      label: 'Clear filter',
      icon: 'i-lucide-x',
      disabled: !filters.value.type?.length,
      onSelect: () => emit('set-type-filter', []),
    },
  ],
])

// Tags filter items
const tagsFilterItems = computed(() => [
  [
    { type: 'label' as const, label: 'Filter by Tags' },
    ...availableTags.value.slice(0, 15).map(t => ({
      type: 'checkbox' as const,
      label: t,
      checked: filters.value.tags?.includes(t) ?? false,
      onUpdateChecked: (checked: boolean) => {
        const current = filters.value.tags ?? []
        const next = checked
          ? [...current, t]
          : current.filter(x => x !== t)
        emit('set-tags-filter', next)
      },
    })),
  ],
  [
    {
      label: 'Clear filter',
      icon: 'i-lucide-x',
      disabled: !filters.value.tags?.length,
      onSelect: () => emit('set-tags-filter', []),
    },
  ],
])

// Date consumed filter items
const dateConsumedFilterItems = computed(() => [
  [
    { type: 'label' as const, label: 'Sort' },
    {
      label: 'Newest first',
      icon: 'i-lucide-arrow-down',
      type: 'checkbox' as const,
      checked: sort.value.column === 'dateConsumed' && sort.value.direction === 'desc',
      onSelect: () => emit('set-sort', 'dateConsumed', 'desc'),
    },
    {
      label: 'Oldest first',
      icon: 'i-lucide-arrow-up',
      type: 'checkbox' as const,
      checked: sort.value.column === 'dateConsumed' && sort.value.direction === 'asc',
      onSelect: () => emit('set-sort', 'dateConsumed', 'asc'),
    },
  ],
])

// Rating filter items
const ratingFilterItems = computed(() => [
  [
    { type: 'label' as const, label: 'Sort' },
    {
      label: 'Highest first',
      icon: 'i-lucide-arrow-down',
      type: 'checkbox' as const,
      checked: sort.value.column === 'rating' && sort.value.direction === 'desc',
      onSelect: () => emit('set-sort', 'rating', 'desc'),
    },
    {
      label: 'Lowest first',
      icon: 'i-lucide-arrow-up',
      type: 'checkbox' as const,
      checked: sort.value.column === 'rating' && sort.value.direction === 'asc',
      onSelect: () => emit('set-sort', 'rating', 'asc'),
    },
  ],
])

// Title sort items
const titleSortItems = computed(() => [
  [
    { type: 'label' as const, label: 'Sort' },
    {
      label: 'A to Z',
      icon: 'i-lucide-arrow-up',
      type: 'checkbox' as const,
      checked: sort.value.column === 'title' && sort.value.direction === 'asc',
      onSelect: () => emit('set-sort', 'title', 'asc'),
    },
    {
      label: 'Z to A',
      icon: 'i-lucide-arrow-down',
      type: 'checkbox' as const,
      checked: sort.value.column === 'title' && sort.value.direction === 'desc',
      onSelect: () => emit('set-sort', 'title', 'desc'),
    },
  ],
])

// Type guard for ContentType
function isContentType(value: unknown): value is ContentType {
  return typeof value === 'string' && value in iconMap
}

// Type guard for TableAuthor array
function isTableAuthorArray(value: unknown): value is TableAuthor[] {
  return Array.isArray(value) && value.every(
    item => typeof item === 'object' && item !== null && 'slug' in item && 'name' in item,
  )
}

// Type guard for string array
function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string')
}

// Helper to get type from row safely
function getRowType(row: { getValue: (key: string) => unknown }): ContentType {
  const value = row.getValue('type')
  if (isContentType(value)) return value
  return 'note' // fallback
}

// Helper to get authors from row safely
function getRowAuthors(row: { getValue: (key: string) => unknown }): TableAuthor[] {
  const value = row.getValue('authors')
  if (isTableAuthorArray(value)) return value
  return []
}

// Helper to get tags from row safely
function getRowTags(row: { getValue: (key: string) => unknown }): string[] {
  const value = row.getValue('tags')
  if (isStringArray(value)) return value
  return []
}

// Helper to get date from row safely
function getRowDate(row: { getValue: (key: string) => unknown }): string | undefined {
  const value = row.getValue('date')
  if (typeof value !== 'string') return undefined
  return value
}

// Helper to get rating from row safely
function getRowRating(row: { getValue: (key: string) => unknown }): number | undefined {
  const value = row.getValue('rating')
  if (typeof value !== 'number') return undefined
  return value
}

// Column definitions
const columns: TableColumn<TableContentItem>[] = [
  {
    accessorKey: 'title',
    header: 'Title',
    size: 250,
  },
  {
    accessorKey: 'type',
    header: 'Type',
    size: 120,
    cell: ({ row }) => {
      const type = getRowType(row)
      return h(UBadge, {
        variant: 'subtle',
        color: 'neutral',
        icon: iconMap[type],
        class: 'capitalize',
      }, () => type)
    },
  },
  {
    accessorKey: 'authors',
    header: 'Authors',
    size: 150,
    cell: ({ row }) => {
      const authors = getRowAuthors(row)
      if (!authors.length) return h('span', { class: 'text-[var(--ui-text-muted)]' }, '—')

      if (authors.length === 1) {
        const author = authors[0]
        if (!author) return h('span', { class: 'text-[var(--ui-text-muted)]' }, '—')
        return h('div', { class: 'flex items-center gap-2' }, [
          h(UAvatar, { src: author.avatar, alt: author.name, size: '2xs' }),
          h('span', { class: 'text-sm truncate' }, author.name),
        ])
      }

      // Multiple authors - show avatars stacked
      return h('div', { class: 'flex -space-x-2' },
        authors.slice(0, 3).map(a =>
          h(UAvatar, {
            key: a.slug,
            src: a.avatar,
            alt: a.name,
            size: '2xs',
            class: 'ring-2 ring-[var(--ui-bg)]',
          }),
        ),
      )
    },
  },
  {
    accessorKey: 'tags',
    header: 'Tags',
    size: 200,
    cell: ({ row }) => {
      const tags = getRowTags(row)
      if (!tags.length) return h('span', { class: 'text-[var(--ui-text-muted)]' }, '—')

      return h('div', { class: 'flex gap-1 overflow-x-auto max-w-[180px]' },
        tags.slice(0, 3).map(t =>
          h(UBadge, {
            key: t,
            variant: 'soft',
            color: 'neutral',
            size: 'xs',
          }, () => t),
        ),
      )
    },
  },
  {
    accessorKey: 'date',
    header: 'Consumed',
    size: 110,
    cell: ({ row }) => {
      const date = getRowDate(row)
      return h('span', { class: date ? '' : 'text-[var(--ui-text-muted)]' }, formatDate(date))
    },
  },
  {
    accessorKey: 'rating',
    header: 'Rating',
    size: 80,
    cell: ({ row }) => {
      const rating = getRowRating(row)
      return h('span', {
        class: rating ? 'font-medium' : 'text-[var(--ui-text-muted)]',
      }, rating ?? '—')
    },
  },
  {
    accessorKey: 'actions',
    header: '',
    size: 50,
    cell: ({ row }) => {
      return h(UButton, {
        icon: 'i-lucide-external-link',
        variant: 'ghost',
        color: 'neutral',
        size: 'xs',
        onClick: (e: Event) => {
          e.stopPropagation()
          window.open(`/${row.original.slug}`, '_blank')
        },
      })
    },
  },
]

// Row click handler
function onRowClick(_event: Event, row: { original: TableContentItem }) {
  router.push(`/${row.original.slug}`)
}

// Apply rating filter
function applyRatingFilter() {
  emit('set-rating-range', ratingRange.value)
}

// Clear rating filter
function clearRatingFilter() {
  ratingRange.value = [1, 7]
  emit('set-rating-range', null)
}

// Remove individual filter
function removeTypeFilter(type: ContentType) {
  const current = filters.value.type ?? []
  emit('set-type-filter', current.filter(t => t !== type))
}

function removeTagFilter(tag: string) {
  const current = filters.value.tags ?? []
  emit('set-tags-filter', current.filter(t => t !== tag))
}

function removeAuthorFilter(author: string) {
  const current = filters.value.authors ?? []
  emit('set-authors-filter', current.filter(a => a !== author))
}
</script>

<template>
  <!-- Active Filters Bar -->
  <div v-if="hasActiveFilters" class="flex flex-wrap gap-2 mb-4">
    <!-- Type chips -->
    <UBadge
      v-for="type in filters.type"
      :key="type"
      variant="soft"
      color="neutral"
      class="cursor-pointer"
      @click="removeTypeFilter(type)"
    >
      {{ type }}
      <UIcon name="i-lucide-x" class="ml-1 size-3" />
    </UBadge>

    <!-- Tags chips -->
    <UBadge
      v-for="tag in filters.tags"
      :key="tag"
      variant="soft"
      color="primary"
      class="cursor-pointer"
      @click="removeTagFilter(tag)"
    >
      {{ tag }}
      <UIcon name="i-lucide-x" class="ml-1 size-3" />
    </UBadge>

    <!-- Authors chips -->
    <UBadge
      v-for="authorSlug in filters.authors"
      :key="authorSlug"
      variant="soft"
      color="secondary"
      class="cursor-pointer"
      @click="removeAuthorFilter(authorSlug)"
    >
      {{ availableAuthors.find(a => a.slug === authorSlug)?.name ?? authorSlug }}
      <UIcon name="i-lucide-x" class="ml-1 size-3" />
    </UBadge>

    <!-- Rating range chip -->
    <UBadge
      v-if="filters.ratingRange"
      variant="soft"
      color="warning"
      class="cursor-pointer"
      @click="clearRatingFilter"
    >
      Rating: {{ filters.ratingRange[0] }}-{{ filters.ratingRange[1] }}
      <UIcon name="i-lucide-x" class="ml-1 size-3" />
    </UBadge>

    <!-- Clear all button -->
    <UButton
      variant="ghost"
      color="neutral"
      size="xs"
      @click="emit('clear-filters')"
    >
      Clear all
    </UButton>
  </div>

  <!-- Table -->
  <UTable
    v-model:column-pinning="columnPinning"
    :data="items"
    :columns="columns"
    :loading="pending"
    loading-color="primary"
    class="w-full"
    sticky
    @select="onRowClick"
  >
    <!-- Custom header slots for filters -->
    <template #title-header>
      <UDropdownMenu :items="titleSortItems">
        <UButton
          variant="ghost"
          color="neutral"
          size="xs"
          class="-mx-2"
        >
          Title
          <UIcon
            v-if="sort.column === 'title'"
            :name="sort.direction === 'asc' ? 'i-lucide-arrow-up' : 'i-lucide-arrow-down'"
            class="ml-1 size-3"
          />
        </UButton>
      </UDropdownMenu>
    </template>

    <template #type-header>
      <UDropdownMenu :items="typeFilterItems">
        <UButton
          variant="ghost"
          color="neutral"
          size="xs"
          class="-mx-2"
        >
          Type
          <UIcon
            v-if="filters.type?.length"
            name="i-lucide-filter"
            class="ml-1 size-3 text-[var(--ui-primary)]"
          />
          <UIcon
            v-else-if="sort.column === 'type'"
            :name="sort.direction === 'asc' ? 'i-lucide-arrow-up' : 'i-lucide-arrow-down'"
            class="ml-1 size-3"
          />
        </UButton>
      </UDropdownMenu>
    </template>

    <template #authors-header>
      <UPopover>
        <UButton
          variant="ghost"
          color="neutral"
          size="xs"
          class="-mx-2"
        >
          Authors
          <UIcon
            v-if="filters.authors?.length"
            name="i-lucide-filter"
            class="ml-1 size-3 text-[var(--ui-primary)]"
          />
        </UButton>

        <template #content>
          <div class="p-2 w-64">
            <USelectMenu
              v-model="selectedAuthors"
              :items="authorSelectItems"
              multiple
              searchable
              placeholder="Search authors..."
              value-key="value"
            />
          </div>
        </template>
      </UPopover>
    </template>

    <template #tags-header>
      <UDropdownMenu :items="tagsFilterItems">
        <UButton
          variant="ghost"
          color="neutral"
          size="xs"
          class="-mx-2"
        >
          Tags
          <UIcon
            v-if="filters.tags?.length"
            name="i-lucide-filter"
            class="ml-1 size-3 text-[var(--ui-primary)]"
          />
        </UButton>
      </UDropdownMenu>
    </template>

    <template #date-header>
      <UDropdownMenu :items="dateConsumedFilterItems">
        <UButton
          variant="ghost"
          color="neutral"
          size="xs"
          class="-mx-2"
        >
          Consumed
          <UIcon
            v-if="sort.column === 'dateConsumed'"
            :name="sort.direction === 'asc' ? 'i-lucide-arrow-up' : 'i-lucide-arrow-down'"
            class="ml-1 size-3"
          />
        </UButton>
      </UDropdownMenu>
    </template>

    <template #rating-header>
      <UPopover>
        <UButton
          variant="ghost"
          color="neutral"
          size="xs"
          class="-mx-2"
        >
          Rating
          <UIcon
            v-if="filters.ratingRange"
            name="i-lucide-filter"
            class="ml-1 size-3 text-[var(--ui-primary)]"
          />
          <UIcon
            v-else-if="sort.column === 'rating'"
            :name="sort.direction === 'asc' ? 'i-lucide-arrow-up' : 'i-lucide-arrow-down'"
            class="ml-1 size-3"
          />
        </UButton>

        <template #content>
          <div class="p-4 w-48">
            <div class="text-sm mb-3">
              Rating: {{ ratingRange[0] }} - {{ ratingRange[1] }}
            </div>
            <USlider
              v-model="ratingRange"
              :min="1"
              :max="7"
              :step="1"
            />
            <div class="flex justify-between mt-3 gap-2">
              <UButton
                variant="ghost"
                color="neutral"
                size="xs"
                @click="clearRatingFilter"
              >
                Clear
              </UButton>
              <UButton
                size="xs"
                @click="applyRatingFilter"
              >
                Apply
              </UButton>
            </div>
          </div>
        </template>
      </UPopover>
    </template>

    <!-- Empty state -->
    <template #empty>
      <div class="flex flex-col items-center justify-center py-12 gap-3">
        <UIcon name="i-lucide-inbox" class="size-12 text-[var(--ui-text-dimmed)]" />
        <p class="text-lg font-medium">
          No content matches your filters
        </p>
        <UButton
          v-if="hasActiveFilters"
          variant="outline"
          color="neutral"
          @click="emit('clear-filters')"
        >
          Clear all filters
        </UButton>
      </div>
    </template>
  </UTable>
</template>
