<script setup lang="ts">
import { NuxtLink, UBadge } from '#components'

defineProps<{
  tag: string
}>()
</script>

<template>
  <NuxtLink :to="`/tags/${tag}`">
    <UBadge
      variant="subtle"
      color="neutral"
      size="sm"
    >
      {{ tag }}
    </UBadge>
  </NuxtLink>
</template>
