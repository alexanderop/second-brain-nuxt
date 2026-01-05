<script setup lang="ts">
import { ref } from 'vue'
import { defineShortcuts, navigateTo, useColorMode } from '#imports'
import { UApp, UContainer } from '#components'
import AppHeader from '~/components/AppHeader.vue'
import AppSearchModal from '~/components/AppSearchModal.vue'
import AppShortcutsModal from '~/components/AppShortcutsModal.vue'
import { useShortcutsModal } from '~/composables/useShortcuts'
import { useFocusMode } from '~/composables/useFocusMode'

const searchOpen = ref(false)
const shortcutsOpen = useShortcutsModal()
const colorMode = useColorMode()
const { isFocusMode, toggle: toggleFocusMode } = useFocusMode()

defineShortcuts({
  'shift_/': () => {
    shortcutsOpen.value = true
  },
  'meta_k': () => {
    searchOpen.value = true
  },
  '/': () => {
    searchOpen.value = true
  },
  'meta_alt_t': () => {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
  },
  'meta_shift_\\': () => {
    toggleFocusMode()
  },
  'g-h': () => {
    navigateTo('/')
  },
  'g-b': () => {
    navigateTo('/books')
  },
  'g-g': () => {
    navigateTo('/graph')
  },
  'g-t': () => {
    navigateTo('/tags')
  },
  'g-a': () => {
    navigateTo('/authors')
  },
})
</script>

<template>
  <UApp>
    <UContainer>
      <div class="max-w-6xl mx-auto">
        <AppHeader v-if="!isFocusMode" v-model:search-open="searchOpen" v-model:shortcuts-open="shortcutsOpen" />
        <main class="py-8">
          <slot />
        </main>
      </div>
    </UContainer>
    <AppSearchModal v-model:open="searchOpen" />
    <AppShortcutsModal v-model:open="shortcutsOpen" />
  </UApp>
</template>
