<script setup lang="ts">
import { usePageTitle } from '~/composables/usePageTitle'
import { UButton } from '#components'

usePageTitle('Offline')

function reload() {
  window.location.reload()
}
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-[60vh] text-center">
    <div class="i-lucide-wifi-off w-16 h-16 text-[var(--ui-text-muted)] mb-6" aria-hidden="true" />

    <h1 class="text-2xl font-semibold tracking-tight mb-2">
      You're offline
    </h1>

    <p class="text-[var(--ui-text-muted)] max-w-md mb-8">
      This page hasn't been cached yet. Connect to the internet to view it,
      or try a page you've visited before.
    </p>

    <div class="flex gap-3">
      <UButton
        variant="soft"
        icon="i-lucide-refresh-cw"
        @click="reload"
      >
        Try again
      </UButton>

      <UButton
        to="/"
        variant="ghost"
        icon="i-lucide-home"
      >
        Go home
      </UButton>
    </div>
  </div>
</template>
