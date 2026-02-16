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

const isDark = computed(() => colorMode.value === 'dark')

const themeVariables = computed(() =>
  isDark.value
    ? {
        darkMode: true,
        // Primary nodes — deep indigo
        primaryColor: '#3730a3',
        primaryTextColor: '#e0e7ff',
        primaryBorderColor: '#a5b4fc',
        // Secondary (alt paths, decisions) — deep emerald
        secondaryColor: '#064e3b',
        secondaryTextColor: '#a7f3d0',
        secondaryBorderColor: '#6ee7b7',
        // Tertiary (subgraphs, clusters) — deep violet
        tertiaryColor: '#4c1d95',
        tertiaryTextColor: '#ddd6fe',
        tertiaryBorderColor: '#c4b5fd',
        // Notes — warm amber accent
        noteBkgColor: '#78350f',
        noteTextColor: '#fef3c7',
        noteBorderColor: '#fbbf24',
        // General
        lineColor: '#818cf8',
        textColor: '#cbd5e1',
        fontFamily: 'Geist, ui-sans-serif, system-ui, sans-serif',
        fontSize: '14px',
        // Mindmap section colors (cScale0–7)
        cScale0: '#3730a3',
        cScale1: '#065f46',
        cScale2: '#5b21b6',
        cScale3: '#92400e',
        cScale4: '#155e75',
        cScale5: '#9f1239',
        cScale6: '#0c4a6e',
        cScale7: '#3f6212',
        cScaleLabel0: '#e0e7ff',
        cScaleLabel1: '#a7f3d0',
        cScaleLabel2: '#ede9fe',
        cScaleLabel3: '#fef3c7',
        cScaleLabel4: '#cffafe',
        cScaleLabel5: '#fce7f3',
        cScaleLabel6: '#e0f2fe',
        cScaleLabel7: '#ecfccb',
      }
    : {
        darkMode: false,
        // Primary nodes — soft indigo
        primaryColor: '#c7d2fe',
        primaryTextColor: '#1e1b4b',
        primaryBorderColor: '#4f46e5',
        // Secondary (alt paths, decisions) — mint emerald
        secondaryColor: '#a7f3d0',
        secondaryTextColor: '#064e3b',
        secondaryBorderColor: '#059669',
        // Tertiary (subgraphs, clusters) — soft violet
        tertiaryColor: '#ddd6fe',
        tertiaryTextColor: '#2e1065',
        tertiaryBorderColor: '#7c3aed',
        // Notes — warm amber accent
        noteBkgColor: '#fef3c7',
        noteTextColor: '#78350f',
        noteBorderColor: '#f59e0b',
        // General
        lineColor: '#6366f1',
        textColor: '#334155',
        fontFamily: 'Geist, ui-sans-serif, system-ui, sans-serif',
        fontSize: '14px',
        // Mindmap section colors (cScale0–7)
        cScale0: '#c7d2fe',
        cScale1: '#a7f3d0',
        cScale2: '#ddd6fe',
        cScale3: '#fef3c7',
        cScale4: '#cffafe',
        cScale5: '#fce7f3',
        cScale6: '#e0f2fe',
        cScale7: '#ecfccb',
        cScaleLabel0: '#1e1b4b',
        cScaleLabel1: '#064e3b',
        cScaleLabel2: '#2e1065',
        cScaleLabel3: '#78350f',
        cScaleLabel4: '#164e63',
        cScaleLabel5: '#831843',
        cScaleLabel6: '#0c4a6e',
        cScaleLabel7: '#365314',
      },
)

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

    mermaid.initialize({ startOnLoad: false, theme: 'base', themeVariables: themeVariables.value })
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
          void renderMermaid()

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

watch(isDark, () => {
  if (hasRenderedOnce.value) {
    void renderMermaid()
  }
})
</script>

<template>
  <div ref="mermaidContainer" class="mermaid" role="img" aria-label="Diagram">
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
  overflow-x: auto;
}
.mermaid[data-processed] svg {
  max-width: 100%;
  height: auto;
}

/* --- Mindmap-specific styles --- */

/* Break out of prose column for wide mindmaps */
.mermaid:has(.mindmap) {
  margin-inline: -2rem;
  padding: 1.5rem 1rem;
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

/* Node text readability */
.mermaid .mindmap-node text {
  font-weight: 500;
}

/* Root node emphasis */
.mermaid .section-root .label-container {
  stroke-width: 2px;
  stroke: rgba(255, 255, 255, 0.2);
}
.mermaid .section-root text {
  font-weight: 700;
  font-size: 15px;
}

/* Subtle borders on all mindmap nodes for definition */
.mermaid .node-bkg {
  stroke-width: 1px;
  stroke: rgba(255, 255, 255, 0.15);
}

/* Softer edges */
.mermaid .edge {
  opacity: 0.65;
}

/* Light mode overrides */
:root:not(.dark) .mermaid:has(.mindmap) {
  background: rgba(0, 0, 0, 0.02);
  border-color: rgba(0, 0, 0, 0.06);
}
:root:not(.dark) .mermaid .section-root .label-container {
  stroke: rgba(0, 0, 0, 0.15);
}
:root:not(.dark) .mermaid .node-bkg {
  stroke: rgba(0, 0, 0, 0.1);
}
</style>
