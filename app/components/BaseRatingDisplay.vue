<script setup lang="ts">
defineProps<{
  rating: number
}>()
</script>

<template>
  <span class="inline-flex gap-0.5" role="img" :aria-label="`Rating: ${rating} out of 10`" :title="`Rating: ${rating}/10`">
    <UIcon
      v-for="i in 10"
      :key="i"
      name="i-lucide-star"
      class="size-3.5"
      aria-hidden="true"
      :class="i <= rating ? 'text-yellow-500' : 'text-[var(--ui-border)]'"
    />
  </span>
</template>
