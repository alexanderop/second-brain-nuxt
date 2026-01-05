import { readonly } from 'vue'
import { useState } from '#imports'

export function useFocusMode() {
  const isFocusMode = useState('focusMode', () => false)

  function toggle() {
    isFocusMode.value = !isFocusMode.value
  }

  return { isFocusMode: readonly(isFocusMode), toggle }
}
