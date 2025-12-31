<script setup lang="ts">
const searchOpen = ref(false)
</script>

<template>
  <UApp>
    <UContainer>
      <AppHeader v-model:search-open="searchOpen" />
      <main class="py-8">
        <slot />
      </main>
    </UContainer>
    <SearchModal v-model:open="searchOpen" />
  </UApp>
</template>
