<script setup lang="ts">
import { ref } from 'vue'
import { defineShortcuts, navigateTo, useColorMode } from '#imports'
import AppHeader from '~/components/AppHeader.vue'
import AppFooter from '~/components/AppFooter.vue'
import AppSearchModal from '~/components/AppSearchModal.vue'
import AppShortcutsModal from '~/components/AppShortcutsModal.vue'
import ChatPanel from '~/components/ChatPanel.vue'
import { useShortcutsModal } from '~/composables/useShortcuts'
import { useFocusMode } from '~/composables/useFocusMode'
import { useRandomNote } from '~/composables/useRandomNote'
import { useFeature } from '~/composables/useFeature'

// Chat feature toggle
const { isEnabled: chatEnabled } = useFeature('chat')

const searchOpen = ref(false)
const chatOpen = ref(false)
const shortcutsOpen = useShortcutsModal()
const colorMode = useColorMode()
const { isFocusMode, toggle: toggleFocusMode } = useFocusMode()
const { navigateToRandomNote } = useRandomNote()

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
  'r': () => {
    navigateToRandomNote()
  },
  'meta_i': () => {
    if (chatEnabled.value) {
      chatOpen.value = !chatOpen.value
    }
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
        <AppFooter v-if="!isFocusMode" />
      </div>
    </UContainer>
    <AppSearchModal v-model:open="searchOpen" />
    <AppShortcutsModal v-model:open="shortcutsOpen" />
    <ChatPanel v-if="chatEnabled" v-model:open="chatOpen" />
  </UApp>
</template>
