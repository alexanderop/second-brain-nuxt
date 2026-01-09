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
  <UModal v-model:open="open">
    <template #content>
      <div class="p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-semibold">
            Keyboard Shortcuts
          </h2>
          <UButton
            icon="i-lucide-x"
            variant="ghost"
            color="neutral"
            size="sm"
            @click="open = false"
          />
        </div>

        <div class="space-y-6">
          <div>
            <h3 class="text-sm font-medium text-[var(--ui-text-muted)] mb-3">
              General
            </h3>
            <div class="space-y-2">
              <div
                v-for="shortcut in groupedShortcuts.general"
                :key="shortcut.description"
                class="flex items-center justify-between py-1"
              >
                <span class="text-sm">{{ shortcut.description }}</span>
                <div class="flex items-center gap-1">
                  <template v-for="(key, idx) in shortcut.keys" :key="key">
                    <span v-if="idx > 0" class="text-[var(--ui-text-muted)] text-xs">+</span>
                    <UKbd>{{ key }}</UKbd>
                  </template>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 class="text-sm font-medium text-[var(--ui-text-muted)] mb-3">
              Navigation
            </h3>
            <div class="space-y-2">
              <div
                v-for="shortcut in groupedShortcuts.navigation"
                :key="shortcut.description"
                class="flex items-center justify-between py-1"
              >
                <span class="text-sm">{{ shortcut.description }}</span>
                <div class="flex items-center gap-1">
                  <template v-for="(key, idx) in shortcut.keys" :key="key">
                    <span v-if="idx > 0" class="text-[var(--ui-text-muted)] text-xs mx-0.5">then</span>
                    <UKbd>{{ key }}</UKbd>
                  </template>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 class="text-sm font-medium text-[var(--ui-text-muted)] mb-3">
              Actions
            </h3>
            <div class="space-y-2">
              <div
                v-for="shortcut in groupedShortcuts.actions"
                :key="shortcut.description"
                class="flex items-center justify-between py-1"
              >
                <span class="text-sm">{{ shortcut.description }}</span>
                <div class="flex items-center gap-1">
                  <UKbd v-for="key in shortcut.keys" :key="key">{{ key }}</UKbd>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>
