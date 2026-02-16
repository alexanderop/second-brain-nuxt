import { computed } from 'vue'
import { useAsyncData } from '#imports'
import type { ContentType } from '~/constants/contentTypes'

interface BacklinkItem {
  slug: string
  title: string
  type: ContentType
}

interface BacklinksIndex {
  [targetSlug: string]: Array<BacklinkItem>
}

export function useBacklinks(slug: string) {
  const { data: backlinksIndex } = useAsyncData<BacklinksIndex>(
    'backlinks-index',
    () => $fetch<BacklinksIndex>('/api/backlinks'),
    { default: () => ({}) },
  )

  const backlinks = computed(() => {
    return backlinksIndex.value?.[slug] ?? []
  })

  return {
    backlinks,
    hasBacklinks: computed(() => backlinks.value.length > 0),
  }
}
