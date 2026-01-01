import type { ContentType } from '~~/content.config'
import { useRouteQuery } from '@vueuse/router'

export interface GraphFilterState {
  types: Array<ContentType>
  tags: Array<string>
  showOrphans: boolean
}

// All available content types from config
export const ALL_CONTENT_TYPES: Array<ContentType> = [
  'youtube',
  'podcast',
  'article',
  'book',
  'movie',
  'tv',
  'tweet',
  'quote',
  'course',
  'note',
]

export function useGraphFilters() {
  // Parse array query param (handles single value or array)
  function parseArrayParam(value: string | Array<string> | null | undefined): Array<string> {
    if (!value)
      return []
    return Array.isArray(value) ? value : [value]
  }

  // URL-synced refs
  const typesParam = useRouteQuery<string | Array<string> | null>('types')
  const tagsParam = useRouteQuery<string | Array<string> | null>('tags')
  const orphansParam = useRouteQuery<string | null>('orphans')

  // Computed getters/setters with proper typing
  const selectedTypes = computed({
    get: () => {
      const parsed = parseArrayParam(typesParam.value)
      // If no types in URL, all are selected (default state)
      if (parsed.length === 0)
        return [...ALL_CONTENT_TYPES]
      return parsed as Array<ContentType>
    },
    set: (v: Array<ContentType>) => {
      // If all types selected, remove from URL (default state)
      if (v.length === ALL_CONTENT_TYPES.length) {
        typesParam.value = null
      }
      else {
        typesParam.value = v.length ? v : null
      }
    },
  })

  const selectedTags = computed({
    get: () => parseArrayParam(tagsParam.value),
    set: (v: Array<string>) => {
      tagsParam.value = v.length ? v : null
    },
  })

  const showOrphans = computed({
    get: () => orphansParam.value !== 'false', // default true
    set: (v: boolean) => {
      orphansParam.value = v ? null : 'false' // only store if false
    },
  })

  // Helper to check if a type is selected
  function isTypeSelected(type: ContentType): boolean {
    return selectedTypes.value.includes(type)
  }

  // Toggle a content type
  function toggleType(type: ContentType) {
    if (isTypeSelected(type)) {
      selectedTypes.value = selectedTypes.value.filter(t => t !== type)
    }
    else {
      selectedTypes.value = [...selectedTypes.value, type]
    }
  }

  // Check if any filters are active
  const hasActiveFilters = computed(() => {
    return (
      selectedTypes.value.length < ALL_CONTENT_TYPES.length
      || selectedTags.value.length > 0
      || !showOrphans.value
    )
  })

  // Clear all filters
  function clearFilters() {
    typesParam.value = null
    tagsParam.value = null
    orphansParam.value = null
  }

  // Combined filter state for convenience
  const filterState = computed<GraphFilterState>(() => ({
    types: selectedTypes.value,
    tags: selectedTags.value,
    showOrphans: showOrphans.value,
  }))

  return {
    // State
    selectedTypes,
    selectedTags,
    showOrphans,
    filterState,
    // Helpers
    isTypeSelected,
    toggleType,
    hasActiveFilters,
    clearFilters,
    // Constants
    allTypes: ALL_CONTENT_TYPES,
  }
}
