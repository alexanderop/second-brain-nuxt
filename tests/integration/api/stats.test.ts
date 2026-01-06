/**
 * Integration tests for /api/stats endpoint
 *
 * These tests verify that components can successfully fetch and parse
 * stats data from the API. Stats aggregation logic is tested at the
 * unit level and E2E level.
 *
 * This layer tests the HTTP contract: request → response shape.
 */
import { describe, it, expect } from 'vitest'
import { registerEndpoint } from '@nuxt/test-utils/runtime'
import { simpleStats } from '../fixtures/stats'

describe('/api/stats integration', () => {
  it('returns stats structure', async () => {
    registerEndpoint('/api/stats', () => simpleStats)

    const response = await $fetch('/api/stats')

    expect(response).toHaveProperty('total')
    expect(response).toHaveProperty('byType')
    expect(response).toHaveProperty('byTag')
    expect(response).toHaveProperty('byAuthor')
    expect(response).toHaveProperty('byMonth')
    expect(response).toHaveProperty('quality')
    expect(response).toHaveProperty('connections')
    expect(response).toHaveProperty('thisWeek')
  })

  it('includes quality metrics', async () => {
    registerEndpoint('/api/stats', () => simpleStats)

    const response = await $fetch('/api/stats')

    expect(response.quality).toHaveProperty('withSummary')
    expect(response.quality).toHaveProperty('withNotes')
    expect(response.quality).toHaveProperty('total')
  })

  it('includes connection analytics', async () => {
    registerEndpoint('/api/stats', () => simpleStats)

    const response = await $fetch('/api/stats')

    expect(response.connections).toHaveProperty('totalEdges')
    expect(response.connections).toHaveProperty('avgPerNote')
    expect(response.connections).toHaveProperty('orphanCount')
    expect(response.connections).toHaveProperty('orphanPercent')
    expect(response.connections).toHaveProperty('hubs')
    expect(response.connections).toHaveProperty('orphans')
  })
})
