import type { Ref } from 'vue'
import { ref, watch, readonly } from 'vue'
import { defineShortcuts, navigateTo } from '#imports'

interface NavigableItem {
  stem?: string
  path?: string
  id?: string
}

export function useListNavigation<T extends NavigableItem>(items: Ref<T[] | null | undefined>) {
  const selectedIndex = ref(-1)

  function getPath(item: T): string {
    if (item.path) return item.path
    if (item.stem) return `/${item.stem}`
    if (item.id) return item.id
    return '/'
  }

  defineShortcuts({
    'j': () => {
      const length = items.value?.length ?? 0
      if (length === 0) return
      selectedIndex.value = Math.min(selectedIndex.value + 1, length - 1)
    },
    'k': () => {
      if ((items.value?.length ?? 0) === 0) return
      selectedIndex.value = Math.max(selectedIndex.value - 1, 0)
    },
    'enter': () => {
      const item = items.value?.[selectedIndex.value]
      if (item) {
        navigateTo(getPath(item))
      }
    },
  })

  // Reset selection when items change
  watch(items, () => {
    selectedIndex.value = -1
  })

  return {
    selectedIndex: readonly(selectedIndex),
  }
}
