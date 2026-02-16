<script setup lang="ts">
import { ref, computed } from 'vue'
import { UIcon } from '#components'

interface Props {
  id: string
  tool: string
  input: unknown
  result?: unknown
}

const props = defineProps<Props>()

const isExpanded = ref(false)

function toggle(): void {
  isExpanded.value = !isExpanded.value
}

// Tool display configuration
const TOOL_DISPLAY: Record<string, { icon: string; label: string }> = {
  search_notes: { icon: 'i-lucide-search', label: 'Search Notes' },
  get_note_content: { icon: 'i-lucide-file-text', label: 'Read Note' },
}

const isPending = computed((): boolean => props.result === undefined)

const toolIcon = computed((): string => TOOL_DISPLAY[props.tool]?.icon ?? 'i-lucide-wrench')

// Status icon: spinner when pending, checkmark when complete
const statusIcon = computed((): string =>
  isPending.value ? 'i-lucide-loader-2' : 'i-lucide-check',
)

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function getString(obj: Record<string, unknown>, key: string): string | undefined {
  const value = obj[key]
  return typeof value === 'string' ? value : undefined
}

// Human-readable description based on tool and input
const description = computed((): string => {
  if (!isRecord(props.input)) return TOOL_DISPLAY[props.tool]?.label ?? props.tool

  switch (props.tool) {
    case 'search_notes': {
      const query = getString(props.input, 'query')
      return query ? `Searching for "${query}"` : 'Searching notes...'
    }
    case 'get_note_content': {
      const slug = getString(props.input, 'slug')
      return slug ? `Reading "${slug}"` : 'Reading note...'
    }
    default:
      return TOOL_DISPLAY[props.tool]?.label ?? props.tool
  }
})

function formatJson(obj: unknown): string {
  const result = JSON.stringify(obj, null, 2)
  return result ?? String(obj)
}
</script>

<template>
  <div class="flex justify-start">
    <div
      class="max-w-[85%] border border-[var(--ui-border)] rounded-lg overflow-hidden bg-[var(--ui-bg)]"
      :class="{ 'opacity-75': isPending }"
    >
      <button
        class="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[var(--ui-bg-elevated)] transition-colors"
        :aria-expanded="isExpanded"
        @click="toggle"
      >
        <UIcon :name="toolIcon" class="text-[var(--ui-primary)] shrink-0" aria-hidden="true" />
        <span class="flex-1 text-[var(--ui-text-muted)]">{{ description }}</span>
        <UIcon
          :name="statusIcon"
          class="shrink-0"
          aria-hidden="true"
          :class="[
            isPending ? 'animate-spin text-[var(--ui-text-muted)]' : 'text-green-500',
          ]"
        />
        <UIcon
          name="i-lucide-chevron-down"
          class="transition-transform shrink-0 text-[var(--ui-text-muted)]"
          aria-hidden="true"
          :class="{ 'rotate-180': isExpanded }"
        />
      </button>
      <div v-if="isExpanded" class="px-3 py-2 border-t border-[var(--ui-border)] text-sm">
        <div class="mb-2">
          <p class="text-xs font-medium text-[var(--ui-text-muted)] mb-1">Input:</p>
          <pre class="text-xs bg-[var(--ui-bg-muted)] p-2 rounded overflow-x-auto">{{ formatJson(input) }}</pre>
        </div>
        <div v-if="result">
          <p class="text-xs font-medium text-[var(--ui-text-muted)] mb-1">Result:</p>
          <pre class="text-xs bg-[var(--ui-bg-muted)] p-2 rounded overflow-x-auto max-h-48 overflow-y-auto">{{ formatJson(result) }}</pre>
        </div>
        <div v-else class="text-xs text-[var(--ui-text-muted)] italic">
          Waiting for result...
        </div>
      </div>
    </div>
  </div>
</template>
