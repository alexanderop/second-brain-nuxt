import type { RouterConfig } from '@nuxt/schema'

const routerConfig: RouterConfig = {
  scrollBehavior(to, _from, savedPosition) {
    // Restore position on back/forward navigation
    if (savedPosition) {
      return savedPosition
    }

    // Handle hash anchors (e.g., /note#heading)
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
      }
    }

    // Default: scroll to top instantly (override CSS smooth scroll)
    return { top: 0, left: 0, behavior: 'instant' }
  },
}

export default routerConfig
