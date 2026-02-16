<script setup lang="ts">
import { VitePwaManifest, NuxtRouteAnnouncer, NuxtLayout, NuxtPage } from '#components'
</script>

<template>
  <a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-[var(--ui-bg)] focus:text-[var(--ui-text)]">
    Skip to main content
  </a>
  <VitePwaManifest />
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
