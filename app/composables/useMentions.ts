import { computed } from 'vue'
import { useAsyncData } from '#imports'
import type { ContentType } from '~/constants/contentTypes'

interface MentionItem {
  slug: string
  title: string
  type: ContentType
  snippet: string
  highlightedSnippet: string
}

export function useMentions(slug: string, title: string) {
  const { data: mentions } = useAsyncData<MentionItem[]>(
    `mentions-${slug}`,
    () => $fetch<MentionItem[]>('/api/mentions', {
      params: { slug, title },
    }),
    { default: () => [], server: false, lazy: true },
  )

  return {
    mentions,
    hasMentions: computed(() => mentions.value.length > 0),
  }
}
