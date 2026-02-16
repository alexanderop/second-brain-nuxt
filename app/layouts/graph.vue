<script setup lang="ts">
import { ref } from 'vue'
import { defineShortcuts, navigateTo } from '#imports'
import { UApp } from '#components'
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
    void navigateTo('/')
  },
  'g-g': () => {
    void navigateTo('/graph')
  },
  'g-t': () => {
    void navigateTo('/tags')
  },
  'g-a': () => {
    void navigateTo('/authors')
  },
})
</script>

<template>
  <UApp>
    <!-- Full viewport, no container constraints -->
    <main class="h-screen overflow-hidden bg-[var(--ui-bg)]">
      <slot />
    </main>
    <AppSearchModal v-model:open="searchOpen" />
    <AppShortcutsModal v-model:open="shortcutsOpen" />
  </UApp>
</template>
