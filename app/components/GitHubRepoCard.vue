<script setup lang="ts">
import { computed } from 'vue'
import { UIcon } from '#components'

const props = defineProps<{
  url: string
  stars?: number
  language?: string
}>()

// Common language colors from GitHub
const languageColors: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Go: '#00ADD8',
  Rust: '#dea584',
  Vue: '#41b883',
  Ruby: '#701516',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#555555',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  PHP: '#4F5D95',
  Shell: '#89e051',
}

const languageColor = computed(() => {
  if (!props.language) return '#8b949e'
  return languageColors[props.language] ?? '#8b949e'
})

function formatStars(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`
  }
  return count.toString()
}
</script>

<template>
  <div class="mb-8 flex justify-center">
    <a
      :href="url"
      target="_blank"
      rel="noopener noreferrer"
      :aria-label="`View GitHub repository${language ? ` (${language})` : ''}${stars !== undefined ? `, ${formatStars(stars)} stars` : ''}`"
      class="flex items-center gap-4 px-5 py-3 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-bg-elevated)] hover:border-[var(--ui-primary)] transition-colors"
    >
      <UIcon name="i-lucide-github" class="size-6 text-[var(--ui-text-muted)]" />

      <div class="flex items-center gap-4">
        <span
          v-if="language"
          class="flex items-center gap-1.5 text-sm text-[var(--ui-text-muted)]"
        >
          <span
            class="size-3 rounded-full"
            :style="{ backgroundColor: languageColor }"
          />
          {{ language }}
        </span>

        <span
          v-if="stars !== undefined"
          class="flex items-center gap-1 text-sm text-[var(--ui-text-muted)]"
        >
          <UIcon name="i-lucide-star" class="size-4" />
          {{ formatStars(stars) }}
        </span>
      </div>
    </a>
  </div>
</template>
