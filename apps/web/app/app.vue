<script setup lang="ts">
import { VitePwaManifest, NuxtRouteAnnouncer, NuxtLayout, NuxtPage } from '#components'
</script>

<template>
  <VitePwaManifest />
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
