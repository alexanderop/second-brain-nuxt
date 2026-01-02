<script setup lang="ts">
import { UIcon } from '#components'

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
  <div class="stat-card group p-4 rounded-lg border border-[var(--ui-border)] bg-[var(--ui-bg)] relative overflow-hidden transition-all duration-200 ease-out hover:scale-[1.02] hover:shadow-lg hover:shadow-[var(--ui-bg)]/50 hover:border-[var(--ui-border-accented)]">
    <!-- Subtle gradient overlay -->
    <div class="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />

    <div class="relative">
      <div class="flex items-center gap-2 text-[var(--ui-text-muted)]">
        <UIcon v-if="icon" :name="icon" class="size-4 transition-transform duration-200 group-hover:scale-110" />
        <span class="text-sm font-medium tracking-wide uppercase">{{ label }}</span>
      </div>
      <div class="mt-2 text-4xl font-semibold tracking-tight font-mono tabular-nums">
        {{ value }}
      </div>
      <div v-if="trend" class="mt-1 text-xs font-mono" :class="trend.value >= 0 ? 'text-emerald-500' : 'text-red-500'">
        {{ trend.value >= 0 ? '+' : '' }}{{ trend.value }} {{ trend.label }}
      </div>
    </div>
  </div>
</template>
