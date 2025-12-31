<script setup lang="ts">
defineProps<{
  tag: string
}>()
</script>

<template>
  <UBadge
    :to="`/tags/${tag}`"
    variant="subtle"
    color="neutral"
    size="sm"
  >
    {{ tag }}
  </UBadge>
</template>
