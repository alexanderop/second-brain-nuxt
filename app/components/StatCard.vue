<script setup lang="ts">
defineProps<{
  label: string
  value: string | number
  icon?: string
  trend?: {
    value: number
    label: string
  }
}>()
</script>

<template>
  <div class="p-4 rounded-lg border border-[var(--ui-border)] bg-[var(--ui-bg)]">
    <div class="flex items-center gap-2 text-[var(--ui-text-muted)]">
      <UIcon v-if="icon" :name="icon" class="size-4" />
      <span class="text-sm">{{ label }}</span>
    </div>
    <div class="mt-2 text-3xl font-bold tracking-tight">
      {{ value }}
    </div>
    <div v-if="trend" class="mt-1 text-xs" :class="trend.value >= 0 ? 'text-emerald-500' : 'text-red-500'">
      {{ trend.value >= 0 ? '+' : '' }}{{ trend.value }} {{ trend.label }}
    </div>
  </div>
</template>
