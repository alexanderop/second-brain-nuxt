<script setup lang="ts">
const links = [
  { label: 'Home', to: '/' },
  { label: 'Graph', to: '/graph' },
  { label: 'Tags', to: '/tags' },
]

const searchOpen = defineModel<boolean>('searchOpen', { default: false })

defineShortcuts({
  meta_k: () => {
    searchOpen.value = true
  },
})
</script>

<template>
  <header class="py-4 border-b border-[var(--ui-border)]">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-8">
        <NuxtLink to="/" class="text-xl font-semibold">
          Second Brain
        </NuxtLink>
        <nav class="hidden md:flex items-center gap-1">
          <UButton
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            variant="ghost"
            color="neutral"
          >
            {{ link.label }}
          </UButton>
        </nav>
      </div>
      <div class="flex items-center gap-2">
        <UButton
          variant="ghost"
          color="neutral"
          icon="i-lucide-search"
          @click="searchOpen = true"
        >
          <span class="hidden sm:inline">Search</span>
          <UKbd class="ml-2 hidden sm:inline-flex">
            <span class="text-xs">⌘K</span>
          </UKbd>
        </UButton>
        <UButton
          class="md:hidden"
          variant="ghost"
          color="neutral"
          icon="i-lucide-menu"
          aria-label="Menu"
        />
      </div>
    </div>
  </header>
</template>
