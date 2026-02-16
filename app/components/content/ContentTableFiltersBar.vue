<script setup lang="ts">
import type { ContentType } from '~/constants/contentTypes'
import type { FilterState, TableAuthor } from '~/types/table'

const props = defineProps<{
  filters: FilterState
  availableAuthors: TableAuthor[]
}>()

const emit = defineEmits<{
  'remove-type': [type: ContentType]
  'remove-tag': [tag: string]
  'remove-author': [authorSlug: string]
  'remove-rating-range': []
  'clear-all': []
}>()

function getAuthorName(slug: string): string {
  return props.availableAuthors.find(a => a.slug === slug)?.name ?? slug
}
</script>

<template>
  <div class="flex flex-wrap gap-2 mb-4">
    <!-- Type chips -->
    <button
      v-for="type in filters.type"
      :key="type"
      :aria-label="`Remove ${type} type filter`"
      @click="emit('remove-type', type)"
    >
      <UBadge
        variant="soft"
        color="neutral"
        class="cursor-pointer"
      >
        {{ type }}
        <UIcon name="i-lucide-x" class="ml-1 size-3" />
      </UBadge>
    </button>

    <!-- Tags chips -->
    <button
      v-for="tag in filters.tags"
      :key="tag"
      :aria-label="`Remove ${tag} tag filter`"
      @click="emit('remove-tag', tag)"
    >
      <UBadge
        variant="soft"
        color="primary"
        class="cursor-pointer"
      >
        {{ tag }}
        <UIcon name="i-lucide-x" class="ml-1 size-3" />
      </UBadge>
    </button>

    <!-- Authors chips -->
    <button
      v-for="authorSlug in filters.authors"
      :key="authorSlug"
      :aria-label="`Remove ${getAuthorName(authorSlug)} author filter`"
      @click="emit('remove-author', authorSlug)"
    >
      <UBadge
        variant="soft"
        color="secondary"
        class="cursor-pointer"
      >
        {{ getAuthorName(authorSlug) }}
        <UIcon name="i-lucide-x" class="ml-1 size-3" />
      </UBadge>
    </button>

    <!-- Rating range chip -->
    <button
      v-if="filters.ratingRange"
      aria-label="Remove rating range filter"
      @click="emit('remove-rating-range')"
    >
      <UBadge
        variant="soft"
        color="warning"
        class="cursor-pointer"
      >
        Rating: {{ filters.ratingRange[0] }}-{{ filters.ratingRange[1] }}
        <UIcon name="i-lucide-x" class="ml-1 size-3" />
      </UBadge>
    </button>

    <!-- Clear all button -->
    <UButton
      variant="ghost"
      color="neutral"
      size="xs"
      @click="emit('clear-all')"
    >
      Clear all
    </UButton>
  </div>
</template>
