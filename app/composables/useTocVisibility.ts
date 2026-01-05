import { readonly } from 'vue'
import { useState } from '#imports'

export function useTocVisibility() {
  const isTocVisible = useState('tocVisible', () => true)

  function toggle() {
    isTocVisible.value = !isTocVisible.value
  }

  return { isTocVisible: readonly(isTocVisible), toggle }
}
