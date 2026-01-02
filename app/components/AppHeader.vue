<script setup lang="ts">
const links = [
  { label: 'Home', to: '/', icon: 'i-lucide-home' },
  { label: 'Books', to: '/books', icon: 'i-lucide-book-open' },
  { label: 'Graph', to: '/graph', icon: 'i-lucide-network' },
  { label: 'Stats', to: '/stats', icon: 'i-lucide-bar-chart-2' },
  { label: 'Tags', to: '/tags', icon: 'i-lucide-tags' },
  { label: 'Authors', to: '/authors', icon: 'i-lucide-users' },
]

const searchOpen = defineModel<boolean>('searchOpen', { default: false })
const shortcutsOpen = defineModel<boolean>('shortcutsOpen', { default: false })
const mobileMenuOpen = ref(false)
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
          variant="ghost"
          color="neutral"
          class="hidden sm:inline-flex"
          @click="shortcutsOpen = true"
        >
          <UKbd>?</UKbd>
        </UButton>
        <UButton
          class="md:hidden"
          variant="ghost"
          color="neutral"
          icon="i-lucide-menu"
          aria-label="Menu"
          @click="mobileMenuOpen = true"
        />

        <USlideover v-model:open="mobileMenuOpen" side="right" title="Navigation">
          <template #body>
            <nav class="flex flex-col gap-1">
              <UButton
                v-for="link in links"
                :key="link.to"
                :to="link.to"
                :icon="link.icon"
                variant="ghost"
                color="neutral"
                class="justify-start"
                block
                @click="mobileMenuOpen = false"
              >
                {{ link.label }}
              </UButton>
            </nav>
          </template>
        </USlideover>
      </div>
    </div>
  </header>
</template>
