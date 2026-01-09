<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import type { Mermaid } from 'mermaid'

const props = defineProps({
  code: {
    type: String,
    default: '',
  },
  language: {
    type: String,
    default: null,
  },
  filename: {
    type: String,
    default: null,
  },
  highlights: {
    type: Array,
    default: () => [],
  },
  meta: {
    type: String,
    default: null,
  },
  class: {
    type: String,
    default: null,
  },
})

const isMermaid = computed(() => props.language === 'mermaid')

// Mermaid rendering logic
const colorMode = useColorMode()
const mermaidContainer = ref<HTMLDivElement | null>(null)
const hasRenderedOnce = ref(false)
const mermaidInstance = ref<Mermaid | null>(null)
let observer: IntersectionObserver | null = null

const mermaidTheme = computed(() => {
  return colorMode.value === 'dark' ? 'dark' : 'default'
})

async function loadMermaid(): Promise<Mermaid> {
  if (mermaidInstance.value) return mermaidInstance.value
  const { default: mermaid } = await import('mermaid')
  mermaidInstance.value = mermaid
  return mermaid
}

async function renderMermaid() {
  if (!mermaidContainer.value || !props.code) return

  try {
    const mermaid = await loadMermaid()
    mermaidContainer.value.removeAttribute('data-processed')
    mermaidContainer.value.textContent = props.code
    await nextTick()

    mermaid.initialize({ startOnLoad: false, theme: mermaidTheme.value })
    await mermaid.run({
      nodes: [mermaidContainer.value],
    })
    hasRenderedOnce.value = true
  }
  catch (e) {
    console.error('Error running Mermaid:', e)
    if (mermaidContainer.value) {
      mermaidContainer.value.innerHTML = 'Mermaid Chart Syntax Error'
    }
  }
}

onMounted(() => {
  if (isMermaid.value && mermaidContainer.value) {
    observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !hasRenderedOnce.value) {
          renderMermaid()
          if (observer) {
            observer.disconnect()
          }
        }
      },
      { threshold: 0.1 },
    )
    observer.observe(mermaidContainer.value)
  }
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})

watch(mermaidTheme, () => {
  if (isMermaid.value && hasRenderedOnce.value) {
    renderMermaid()
  }
})
</script>

<template>
  <div v-if="isMermaid" ref="mermaidContainer" class="mermaid">
    {{ code }}
  </div>
  <pre v-else :class="$props.class"><slot /></pre>
</template>

<style>
.mermaid:not([data-processed]) {
  color: transparent;
  min-height: 10px;
}

.mermaid {
  display: flex;
  justify-content: center;
  padding: 1rem;
  background: var(--ui-bg-elevated);
  border-radius: var(--ui-radius);
  margin: 1rem 0;
}
</style>
