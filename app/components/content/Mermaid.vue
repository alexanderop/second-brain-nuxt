<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useColorMode } from '#imports'
import type { Mermaid } from 'mermaid'

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
  if (!mermaidContainer.value || !mermaidDefinition)
    return

  try {
    const mermaid = await loadMermaid()
    mermaidContainer.value.removeAttribute('data-processed')
    mermaidContainer.value.textContent = mermaidDefinition
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
