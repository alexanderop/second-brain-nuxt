<script setup lang="ts">
import { ref } from 'vue'
import { defineShortcuts, navigateTo } from '#imports'
import { UApp, UContainer } from '#components'
import AppHeader from '~/components/AppHeader.vue'
import AppSearchModal from '~/components/AppSearchModal.vue'
import AppShortcutsModal from '~/components/AppShortcutsModal.vue'
import { useShortcutsModal } from '~/composables/useShortcuts'

const searchOpen = ref(false)
const shortcutsOpen = useShortcutsModal()

defineShortcuts({
  'shift_/': () => {
    shortcutsOpen.value = true
  },
  'meta_k': () => {
    searchOpen.value = true
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
        <AppHeader v-model:search-open="searchOpen" v-model:shortcuts-open="shortcutsOpen" />
        <main class="py-8">
          <slot />
        </main>
      </div>
    </UContainer>
    <AppSearchModal v-model:open="searchOpen" />
    <AppShortcutsModal v-model:open="shortcutsOpen" />
  </UApp>
</template>
