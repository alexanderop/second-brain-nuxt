<script setup lang="ts">
import { computed } from 'vue'
import { USelectMenu, UIcon } from '#components'
import { useGraphFilters } from '~/composables/useGraphFilters'
import type { ContentType } from '~~/content.config'

const props = defineProps<{
  availableTags: Array<string>
  availableTypes: Array<ContentType>
  availableAuthors: Array<string>
  availableMaps: Array<{ id: string, title: string }>
}>()

const {
  selectedTags,
  selectedAuthors,
  selectedMaps,
  showOrphans,
  isTypeSelected,
  toggleType,
  hasActiveFilters,
  clearFilters,
} = useGraphFilters()

// Filter to only show types that exist in content
const visibleTypes = computed(() =>
  props.availableTypes.filter(type =>
    ['book', 'manga', 'podcast', 'article', 'note', 'youtube', 'course', 'quote', 'movie', 'tv', 'tweet', 'evergreen', 'map', 'reddit'].includes(type),
  ),
)

// Type display names
const typeLabels: Record<ContentType, string> = {
  book: 'Books',
  manga: 'Manga',
  podcast: 'Podcasts',
  article: 'Articles',
  note: 'Notes',
  youtube: 'YouTube',
  course: 'Courses',
  quote: 'Quotes',
  movie: 'Movies',
  tv: 'TV Shows',
  tweet: 'Tweets',
  evergreen: 'Evergreen',
  map: 'Maps',
  reddit: 'Reddit',
}

// Build checkbox items for UCheckboxGroup
const typeItems = computed(() =>
  visibleTypes.value.map(type => ({
    label: typeLabels[type] || type,
    value: type,
  })),
)

// Type-specific colors matching the graph nodes (softer pastels)
const typeColors: Record<string, string> = {
  book: '#fcd34d',
  manga: '#fb7185',
  podcast: '#c4b5fd',
  article: '#67e8f9',
  note: '#6ee7b7',
  youtube: '#fca5a5',
  course: '#f9a8d4',
  quote: '#fdba74',
  movie: '#a5b4fc',
  tv: '#d8b4fe',
  tweet: '#7dd3fc',
  evergreen: '#86efac',
  map: '#f472b6',
  reddit: '#ff6b35',
}

// Build map items for USelectMenu
const mapItems = computed(() =>
  props.availableMaps.map(m => ({
    label: m.title,
    value: m.id,
  })),
)

function getTypeColor(type: string): string {
  return typeColors[type] || '#64748b'
}
</script>

<template>
  <div
    data-testid="graph-filters"
    class="flex flex-wrap items-center gap-6"
  >
    <!-- Content Types as pill toggles -->
    <div class="flex items-center gap-3">
      <span class="text-xs font-medium text-[var(--ui-text-muted)] uppercase tracking-wider">
        Types
      </span>
      <div class="flex items-center gap-1.5">
        <button
          v-for="item in typeItems"
          :key="item.value"
          type="button"
          class="type-pill"
          :class="{ active: isTypeSelected(item.value as ContentType) }"
          :style="{ '--pill-color': getTypeColor(item.value) }"
          @click="toggleType(item.value as ContentType)"
        >
          <span
            class="type-dot"
            :style="{ backgroundColor: getTypeColor(item.value) }"
          />
          {{ item.label }}
        </button>
      </div>
    </div>

    <!-- Tags Filter -->
    <div class="flex items-center gap-2">
      <span class="text-xs font-medium text-[var(--ui-text-muted)] uppercase tracking-wider">
        Tags
      </span>
      <USelectMenu
        v-model="selectedTags"
        :items="availableTags"
        multiple
        placeholder="Filter by tags..."
        size="sm"
        class="w-44"
        aria-label="Tags"
      />
    </div>

    <!-- Authors Filter -->
    <div class="flex items-center gap-2">
      <span class="text-xs font-medium text-[var(--ui-text-muted)] uppercase tracking-wider">
        Authors
      </span>
      <USelectMenu
        v-model="selectedAuthors"
        :items="availableAuthors"
        multiple
        placeholder="Filter by authors..."
        size="sm"
        class="w-48"
        aria-label="Authors"
      />
    </div>

    <!-- Maps Filter -->
    <div v-if="mapItems.length" class="flex items-center gap-2">
      <span class="text-xs font-medium text-[var(--ui-text-muted)] uppercase tracking-wider">
        Maps
      </span>
      <USelectMenu
        v-model="selectedMaps"
        :items="mapItems"
        value-key="value"
        multiple
        placeholder="Focus on map..."
        size="sm"
        class="w-48"
        aria-label="Maps"
      />
    </div>

    <!-- Orphan Nodes Toggle -->
    <button
      type="button"
      class="orphan-toggle"
      :class="{ active: showOrphans }"
      @click="showOrphans = !showOrphans"
    >
      <UIcon
        :name="showOrphans ? 'i-lucide-eye' : 'i-lucide-eye-off'"
        class="size-3.5"
      />
      Orphans
    </button>

    <!-- Clear button -->
    <button
      v-if="hasActiveFilters"
      type="button"
      class="clear-btn"
      @click="clearFilters"
    >
      <UIcon name="i-lucide-x" class="size-3" />
      Clear
    </button>
  </div>
</template>

<style scoped>
.type-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.625rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--ui-text-muted);
  background: transparent;
  border: 1px solid var(--ui-border);
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.type-pill:hover {
  border-color: var(--pill-color);
  color: var(--ui-text);
}

.type-pill.active {
  background: color-mix(in srgb, var(--pill-color) 15%, transparent);
  border-color: var(--pill-color);
  color: var(--ui-text);
}

.type-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  opacity: 0.6;
  transition: opacity 0.15s ease;
}

.type-pill.active .type-dot {
  opacity: 1;
  box-shadow: 0 0 6px currentColor;
}

.orphan-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.625rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--ui-text-muted);
  background: transparent;
  border: 1px solid var(--ui-border);
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.orphan-toggle:hover {
  border-color: var(--ui-text-muted);
  color: var(--ui-text);
}

.orphan-toggle.active {
  background: color-mix(in srgb, var(--ui-text-muted) 15%, transparent);
  border-color: var(--ui-text-muted);
  color: var(--ui-text);
}

.clear-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--ui-text-muted);
  background: transparent;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.clear-btn:hover {
  color: var(--ui-text);
  background: var(--ui-bg-elevated);
}
</style>
