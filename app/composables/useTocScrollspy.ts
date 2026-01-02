import { ref, onMounted, onBeforeUnmount } from 'vue'

/**
 * Tracks the topmost visible heading for TOC highlighting.
 *
 * Unlike Nuxt UI's built-in scrollspy which highlights all visible headings,
 * this composable returns only the single topmost heading in the viewport.
 *
 * @param selector - CSS selector for heading elements (default: 'h2, h3')
 * @returns Reactive ref with the ID of the topmost visible heading
 */
export function useTocScrollspy(selector = 'h2, h3') {
  const activeId = ref<string | null>(null)
  let observer: IntersectionObserver | null = null
  const visibleHeadings = new Set<string>()

  function updateActiveHeading() {
    if (visibleHeadings.size === 0) {
      return
    }

    // Find the topmost visible heading by comparing positions
    let topmostId: string | null = null
    let topmostTop = Infinity

    for (const id of visibleHeadings) {
      const element = document.getElementById(id)
      if (element) {
        const rect = element.getBoundingClientRect()
        if (rect.top < topmostTop) {
          topmostTop = rect.top
          topmostId = id
        }
      }
    }

    if (topmostId) {
      activeId.value = topmostId
    }
  }

  onMounted(() => {
    // rootMargin: detect headings in top third of viewport
    // -100px top accounts for sticky header, -66% bottom limits to top third
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id
          if (entry.isIntersecting) {
            visibleHeadings.add(id)
            continue
          }
          visibleHeadings.delete(id)
        }
        updateActiveHeading()
      },
      {
        rootMargin: '-100px 0px -66% 0px',
        threshold: 0,
      },
    )

    const headings = document.querySelectorAll(selector)
    headings.forEach(heading => observer?.observe(heading))
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
    visibleHeadings.clear()
  })

  return { activeId }
}
