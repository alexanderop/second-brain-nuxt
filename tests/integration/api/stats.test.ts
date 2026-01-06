/**
 * Integration tests for /api/stats endpoint
 *
 * These tests verify that components can fetch stats data
 * by mocking the API response with registerEndpoint.
 */
import { describe, it, expect } from 'vitest'
import { registerEndpoint } from '@nuxt/test-utils/runtime'
import { emptyStats, simpleStats, createStatsResponse } from '../fixtures'

describe('/api/stats integration', () => {
  it('can register empty stats endpoint', async () => {
    registerEndpoint('/api/stats', () => emptyStats)

    const response = await $fetch('/api/stats')
    expect(response.total).toBe(0)
    expect(response.byType).toEqual([])
    expect(response.connections.totalEdges).toBe(0)
  })

  it('can register stats with content', async () => {
    registerEndpoint('/api/stats', () => simpleStats)

    const response = await $fetch('/api/stats')
    expect(response.total).toBe(10)
    expect(response.byType).toHaveLength(3)
  })

  it('includes quality metrics', async () => {
    registerEndpoint('/api/stats', () => simpleStats)

    const response = await $fetch('/api/stats')
    expect(response.quality.withSummary).toBe(8)
    expect(response.quality.withNotes).toBe(5)
    expect(response.quality.total).toBe(10)
  })

  it('includes connection analytics', async () => {
    registerEndpoint('/api/stats', () => simpleStats)

    const response = await $fetch('/api/stats')
    expect(response.connections.totalEdges).toBe(15)
    expect(response.connections.avgPerNote).toBe(1.5)
    expect(response.connections.orphanCount).toBe(2)
    expect(response.connections.orphanPercent).toBe(20)
  })

  it('includes hub and orphan nodes', async () => {
    registerEndpoint('/api/stats', () => simpleStats)

    const response = await $fetch('/api/stats')
    expect(response.connections.hubs).toHaveLength(1)
    expect(response.connections.hubs[0].id).toBe('atomic-habits')
    expect(response.connections.orphans).toHaveLength(1)
  })

  it('includes temporal stats', async () => {
    registerEndpoint('/api/stats', () => simpleStats)

    const response = await $fetch('/api/stats')
    expect(response.byMonth).toHaveLength(2)
    expect(response.thisWeek).toBe(2)
  })

  it('can use factory for custom stats', async () => {
    const customStats = createStatsResponse({ total: 100, thisWeek: 10 })
    registerEndpoint('/api/stats', () => customStats)

    const response = await $fetch('/api/stats')
    expect(response.total).toBe(100)
    expect(response.thisWeek).toBe(10)
  })
})
