/**
 * Accessibility tests for stats.vue page
 *
 * Uses vitest-axe to check for WCAG violations.
 * Note: These tests complement manual accessibility review.
 */
import { describe, it, expect } from 'vitest'
import { registerEndpoint, mountSuspended } from '@nuxt/test-utils/runtime'
import { simpleStats } from '../fixtures'
import { axe } from '../utils/a11y'
import StatsPage from '~/pages/stats.vue'

describe('Stats Page Accessibility', () => {
  it('has no axe violations', async () => {
    registerEndpoint('/api/stats', () => simpleStats)

    const page = await mountSuspended(StatsPage)
    const results = await axe(page.element, {
      rules: {
        // TODO: Fix landmark regions in layout - content should be in <main>
        // This requires changes to the app layout, not just this page
        region: { enabled: false },
      },
    })

    expect(results).toHaveNoViolations()
  })
})
