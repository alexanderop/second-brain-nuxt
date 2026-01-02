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
    navigateTo('/')
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
    <!-- Full viewport, no container constraints -->
    <div class="h-screen overflow-hidden bg-[var(--ui-bg)]">
      <slot />
    </div>
    <AppSearchModal v-model:open="searchOpen" />
    <AppShortcutsModal v-model:open="shortcutsOpen" />
  </UApp>
</template>
