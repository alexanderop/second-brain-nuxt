<script setup lang="ts">
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
})
</script>

<template>
  <UApp>
    <UContainer>
      <div class="max-w-3xl mx-auto">
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
