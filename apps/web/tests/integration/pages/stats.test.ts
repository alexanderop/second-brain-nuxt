/**
 * Integration tests for stats.vue page
 *
 * Tests that the Stats page correctly renders data fetched from /api/stats.
 * Uses registerEndpoint to mock API responses and mountSuspended to render
 * the page with full Nuxt context.
 *
 * Note: All tests share the same mock data because useFetch caches responses
 * within the test environment. To test different scenarios, use separate
 * describe blocks or E2E tests.
 */
import { describe, it, expect } from 'vitest'
import { registerEndpoint, mountSuspended } from '@nuxt/test-utils/runtime'
import { simpleStats } from '../fixtures'
import StatsPage from '~/pages/stats.vue'

describe('Stats Page', () => {
  it('renders the 4 main stat cards with data', async () => {
    registerEndpoint('/api/stats', () => simpleStats)

    const page = await mountSuspended(StatsPage)

    // Verify page title
    expect(page.text()).toContain('Stats')

    // Total Notes: 10
    expect(page.text()).toContain('Total Notes')
    expect(page.text()).toContain('10')

    // Connections: 15
    expect(page.text()).toContain('Connections')
    expect(page.text()).toContain('15')

    // Orphan Notes: 20%
    expect(page.text()).toContain('Orphan Notes')
    expect(page.text()).toContain('20%')

    // This Week: 2
    expect(page.text()).toContain('This Week')
  })

  it('renders hub notes section', async () => {
    registerEndpoint('/api/stats', () => simpleStats)

    const page = await mountSuspended(StatsPage)

    expect(page.text()).toContain('Hub Notes')
    expect(page.text()).toContain('Atomic Habits')
  })

  it('renders orphan notes section', async () => {
    registerEndpoint('/api/stats', () => simpleStats)

    const page = await mountSuspended(StatsPage)

    expect(page.text()).toContain('Orphan Note')
  })

  it('renders quality metrics section', async () => {
    registerEndpoint('/api/stats', () => simpleStats)

    const page = await mountSuspended(StatsPage)

    expect(page.text()).toContain('Quality Metrics')
    expect(page.text()).toContain('Has summary')
    expect(page.text()).toContain('Has personal notes')
  })
})
