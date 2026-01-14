<script setup lang="ts">
import { ref } from 'vue'
import { NuxtLink, UButton, UColorModeButton, UKbd, USlideover } from '#components'
import { useSiteConfig } from '~/composables/useSiteConfig'
import { useRandomNote } from '~/composables/useRandomNote'

const { name: siteName, nav: links } = useSiteConfig()
const { navigateToRandomNote } = useRandomNote()

const searchOpen = defineModel<boolean>('searchOpen', { default: false })
const shortcutsOpen = defineModel<boolean>('shortcutsOpen', { default: false })
const mobileMenuOpen = ref(false)
</script>

<template>
  <header class="py-4 border-b border-[var(--ui-border)]">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-8">
        <NuxtLink to="/" class="text-xl font-semibold">
          {{ siteName }}
        </NuxtLink>
        <nav aria-label="Main" class="hidden md:flex items-center gap-1">
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
        <UColorModeButton variant="ghost" color="neutral" />
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
          icon="i-lucide-shuffle"
          title="Random note"
          class="hidden sm:inline-flex"
          @click="navigateToRandomNote"
        >
          <UKbd>R</UKbd>
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
            <nav aria-label="Mobile" class="flex flex-col gap-1">
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
