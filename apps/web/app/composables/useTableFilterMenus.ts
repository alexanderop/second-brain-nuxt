import type { ComputedRef } from 'vue'
import { computed } from 'vue'
import type { ContentType } from '~/constants/contentTypes'
import type { FilterState, SortState, TableAuthor } from '~/types/table'

// Icon map for content types
export const CONTENT_TYPE_ICONS: Record<ContentType, string> = {
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

interface FilterMenuCallbacks {
  onSetTypeFilter: (types: ContentType[]) => void
  onSetTagsFilter: (tags: string[]) => void
  onSetSort: (column: SortState['column'], direction: SortState['direction']) => void
}

interface UseTableFilterMenusOptions {
  filters: ComputedRef<FilterState>
  sort: ComputedRef<SortState>
  availableTags: ComputedRef<string[]>
  availableAuthors: ComputedRef<TableAuthor[]>
  availableTypes: ComputedRef<ContentType[]>
  callbacks: FilterMenuCallbacks
}

export function useTableFilterMenus(options: UseTableFilterMenusOptions) {
  const { filters, sort, availableTags, availableAuthors, availableTypes, callbacks } = options

  // Type filter items for dropdown
  const typeFilterItems = computed(() => [
    [
      { type: 'label' as const, label: 'Sort' },
      {
        label: 'Ascending',
        icon: 'i-lucide-arrow-up',
        type: 'checkbox' as const,
        checked: sort.value.column === 'type' && sort.value.direction === 'asc',
        onSelect: () => callbacks.onSetSort('type', 'asc'),
      },
      {
        label: 'Descending',
        icon: 'i-lucide-arrow-down',
        type: 'checkbox' as const,
        checked: sort.value.column === 'type' && sort.value.direction === 'desc',
        onSelect: () => callbacks.onSetSort('type', 'desc'),
      },
    ],
    [
      { type: 'label' as const, label: 'Filter by Type' },
      ...availableTypes.value.map(t => ({
        type: 'checkbox' as const,
        label: t,
        icon: CONTENT_TYPE_ICONS[t],
        checked: filters.value.type?.includes(t) ?? false,
        onUpdateChecked: (checked: boolean) => {
          const current = filters.value.type ?? []
          const next = checked
            ? [...current, t]
            : current.filter(x => x !== t)
          callbacks.onSetTypeFilter(next)
        },
      })),
    ],
    [
      {
        label: 'Clear filter',
        icon: 'i-lucide-x',
        disabled: !filters.value.type?.length,
        onSelect: () => callbacks.onSetTypeFilter([]),
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
          callbacks.onSetTagsFilter(next)
        },
      })),
    ],
    [
      {
        label: 'Clear filter',
        icon: 'i-lucide-x',
        disabled: !filters.value.tags?.length,
        onSelect: () => callbacks.onSetTagsFilter([]),
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
        onSelect: () => callbacks.onSetSort('dateConsumed', 'desc'),
      },
      {
        label: 'Oldest first',
        icon: 'i-lucide-arrow-up',
        type: 'checkbox' as const,
        checked: sort.value.column === 'dateConsumed' && sort.value.direction === 'asc',
        onSelect: () => callbacks.onSetSort('dateConsumed', 'asc'),
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
        onSelect: () => callbacks.onSetSort('rating', 'desc'),
      },
      {
        label: 'Lowest first',
        icon: 'i-lucide-arrow-up',
        type: 'checkbox' as const,
        checked: sort.value.column === 'rating' && sort.value.direction === 'asc',
        onSelect: () => callbacks.onSetSort('rating', 'asc'),
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
        onSelect: () => callbacks.onSetSort('title', 'asc'),
      },
      {
        label: 'Z to A',
        icon: 'i-lucide-arrow-down',
        type: 'checkbox' as const,
        checked: sort.value.column === 'title' && sort.value.direction === 'desc',
        onSelect: () => callbacks.onSetSort('title', 'desc'),
      },
    ],
  ])

  // Transform authors for USelectMenu items format
  const authorSelectItems = computed(() =>
    availableAuthors.value.map(a => ({
      label: a.name,
      value: a.slug,
      avatar: a.avatar ? { src: a.avatar } : undefined,
    })),
  )

  return {
    typeFilterItems,
    tagsFilterItems,
    dateConsumedFilterItems,
    ratingFilterItems,
    titleSortItems,
    authorSelectItems,
    iconMap: CONTENT_TYPE_ICONS,
  }
}
