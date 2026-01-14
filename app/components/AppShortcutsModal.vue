<script setup lang="ts">
import { computed } from 'vue'
import { UModal, UButton, UKbd } from '#components'
import { shortcutsList } from '~/composables/useShortcuts'

const open = defineModel<boolean>('open', { default: false })

const groupedShortcuts = computed(() => ({
  general: shortcutsList.filter(s => s.category === 'general'),
  navigation: shortcutsList.filter(s => s.category === 'navigation'),
  actions: shortcutsList.filter(s => s.category === 'actions'),
}))
</script>

<template>
  <UModal v-model:open="open" :ui="{ content: 'w-full max-w-2xl' }">
    <template #content>
      <div class="p-6">
        <header class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-semibold">Keyboard Shortcuts</h2>
          <UButton icon="i-lucide-x" variant="ghost" color="neutral" size="sm" @click="open = false" />
        </header>

        <div class="max-h-[70vh] overflow-y-auto grid md:grid-cols-2 gap-4">
          <!-- Left column -->
          <div class="space-y-4">
            <!-- General section -->
            <section class="bg-[var(--ui-bg-elevated)]/50 rounded-lg p-4 space-y-1.5">
              <h3 class="text-sm font-medium text-[var(--ui-text-muted)] pb-2 border-b border-[var(--ui-border)]">General</h3>
              <div v-for="shortcut in groupedShortcuts.general" :key="shortcut.description" class="flex items-center justify-between py-1">
                <span class="text-sm">{{ shortcut.description }}</span>
                <span class="flex items-center gap-1 shrink-0 ml-2">
                  <template v-for="(key, idx) in shortcut.keys" :key="key">
                    <span v-if="idx > 0" class="text-[var(--ui-text-muted)] text-xs">+</span>
                    <UKbd>{{ key }}</UKbd>
                  </template>
                </span>
              </div>
            </section>

            <!-- Actions section -->
            <section class="bg-[var(--ui-bg-elevated)]/50 rounded-lg p-4 space-y-1.5">
              <h3 class="text-sm font-medium text-[var(--ui-text-muted)] pb-2 border-b border-[var(--ui-border)]">Actions</h3>
              <div v-for="shortcut in groupedShortcuts.actions" :key="shortcut.description" class="flex items-center justify-between py-1">
                <span class="text-sm">{{ shortcut.description }}</span>
                <span class="flex items-center gap-1 shrink-0 ml-2">
                  <UKbd v-for="key in shortcut.keys" :key="key">{{ key }}</UKbd>
                </span>
              </div>
            </section>
          </div>

          <!-- Right column: Navigation -->
          <section class="bg-[var(--ui-bg-elevated)]/50 rounded-lg p-4 space-y-1.5 h-fit">
            <h3 class="text-sm font-medium text-[var(--ui-text-muted)] pb-2 border-b border-[var(--ui-border)]">Navigation</h3>
            <div v-for="shortcut in groupedShortcuts.navigation" :key="shortcut.description" class="flex items-center justify-between py-1">
              <span class="text-sm">{{ shortcut.description }}</span>
              <span class="flex items-center gap-1 shrink-0 ml-2">
                <template v-for="(key, idx) in shortcut.keys" :key="key">
                  <span v-if="idx > 0" class="text-[var(--ui-text-muted)] text-xs mx-0.5">then</span>
                  <UKbd>{{ key }}</UKbd>
                </template>
              </span>
            </div>
          </section>
        </div>
      </div>
    </template>
  </UModal>
</template>
