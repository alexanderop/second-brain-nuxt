<template>
  <RouterView v-slot="{ Component }">
    <DefaultLayout>
      <Suspense>
        <component :is="Component" />
        <template #fallback>
          <div data-testid="page-loading">Loading...</div>
        </template>
      </Suspense>
    </DefaultLayout>
  </RouterView>
</template>

<script setup lang="ts">
/**
 * Test App Shell
 *
 * Wraps the real app layout with vue-router for BDD tests.
 * Suspense handles async page components (useAsyncData).
 * Note: "Suspense slots expect single root" warning is expected due to layout structure.
 */
import { Suspense } from 'vue'
import DefaultLayout from '~/layouts/default.vue'
</script>
