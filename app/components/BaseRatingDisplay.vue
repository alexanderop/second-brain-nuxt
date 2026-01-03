<script setup lang="ts">
defineProps<{
  rating: number
}>()
</script>

<template>
  <span class="inline-flex gap-0.5" :title="`Rating: ${rating}/7`">
    <UIcon
      v-for="i in 7"
      :key="i"
      name="i-lucide-star"
      class="size-3.5"
      :class="i <= rating ? 'text-yellow-500' : 'text-[var(--ui-border)]'"
    />
  </span>
</template>
