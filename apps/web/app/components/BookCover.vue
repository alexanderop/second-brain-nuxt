<script setup lang="ts">
defineProps<{
  cover: string
  title?: string
}>()
</script>

<template>
  <div class="mb-8 flex justify-center">
    <img
      :src="cover"
      :alt="`Cover of ${title ?? 'book'}`"
      class="max-w-xs rounded-lg shadow-lg border border-[var(--ui-border)]"
      loading="lazy"
    >
  </div>
</template>
