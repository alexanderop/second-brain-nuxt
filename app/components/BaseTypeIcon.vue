<script setup lang="ts">
import type { ContentType } from '~~/content.config'

defineProps<{
  type: ContentType
  size?: 'sm' | 'md' | 'lg'
}>()

const iconMap: Record<ContentType, string> = {
  youtube: 'i-lucide-play',
  podcast: 'i-lucide-mic',
  article: 'i-lucide-file-text',
  book: 'i-lucide-book-open',
  movie: 'i-lucide-clapperboard',
  tv: 'i-lucide-tv',
  tweet: 'i-lucide-message-circle',
  quote: 'i-lucide-quote',
  course: 'i-lucide-graduation-cap',
  note: 'i-lucide-pencil',
  evergreen: 'i-lucide-leaf',
}

const sizeClasses = {
  sm: 'size-4',
  md: 'size-5',
  lg: 'size-6',
}
</script>

<template>
  <UIcon
    :name="iconMap[type]"
    :class="sizeClasses[size ?? 'md']"
  />
</template>
