<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useColorMode } from '#imports'
import type { Mermaid } from 'mermaid'
import { tryCatchAsync } from '#shared/utils/tryCatch'

const colorMode = useColorMode()
const mermaidContainer = ref<HTMLDivElement | null>(null)
const hasRenderedOnce = ref(false)
const mermaidInstance = ref<Mermaid | null>(null)
let mermaidDefinition = ''
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
  const container = mermaidContainer.value
  if (!container || !mermaidDefinition)
    return

  const [error] = await tryCatchAsync(async () => {
    const mermaid = await loadMermaid()
    container.removeAttribute('data-processed')
    container.textContent = mermaidDefinition
    await nextTick()

    mermaid.initialize({ startOnLoad: false, theme: mermaidTheme.value })
    await mermaid.run({
      nodes: [container],
    })
    hasRenderedOnce.value = true
  })

  if (error) {
    console.error('Error running Mermaid:', error)
    if (mermaidContainer.value) {
      mermaidContainer.value.textContent = 'Mermaid Chart Syntax Error'
    }
  }
}

onMounted(() => {
  if (mermaidContainer.value) {
    mermaidDefinition = mermaidContainer.value.textContent?.trim() ?? ''

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
  if (hasRenderedOnce.value) {
    renderMermaid()
  }
})
</script>

<template>
  <div ref="mermaidContainer" class="mermaid">
    <slot />
  </div>
</template>

<style>
.mermaid:not([data-processed]) {
  color: transparent;
  min-height: 10px;
}
.mermaid {
  display: flex;
  justify-content: center;
}
</style>
