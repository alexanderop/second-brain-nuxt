<script setup lang="ts">
import type { ContentType } from '~/constants/contentTypes'
import type { FilterState, TableAuthor } from '~/types/table'

const props = defineProps<{
  filters: FilterState
  availableAuthors: TableAuthor[]
}>()

const emit = defineEmits<{
  (e: 'remove-type', type: ContentType): void
  (e: 'remove-tag', tag: string): void
  (e: 'remove-author', authorSlug: string): void
  (e: 'remove-rating-range'): void
  (e: 'clear-all'): void
}>()

function getAuthorName(slug: string): string {
  return props.availableAuthors.find(a => a.slug === slug)?.name ?? slug
}
</script>

<template>
  <div class="flex flex-wrap gap-2 mb-4">
    <!-- Type chips -->
    <UBadge
      v-for="type in filters.type"
      :key="type"
      variant="soft"
      color="neutral"
      class="cursor-pointer"
      @click="emit('remove-type', type)"
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
      @click="emit('remove-tag', tag)"
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
      @click="emit('remove-author', authorSlug)"
    >
      {{ getAuthorName(authorSlug) }}
      <UIcon name="i-lucide-x" class="ml-1 size-3" />
    </UBadge>

    <!-- Rating range chip -->
    <UBadge
      v-if="filters.ratingRange"
      variant="soft"
      color="warning"
      class="cursor-pointer"
      @click="emit('remove-rating-range')"
    >
      Rating: {{ filters.ratingRange[0] }}-{{ filters.ratingRange[1] }}
      <UIcon name="i-lucide-x" class="ml-1 size-3" />
    </UBadge>

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
