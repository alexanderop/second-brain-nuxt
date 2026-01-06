/**
 * Integration tests for /api/note-graph/[slug] endpoint
 *
 * These tests verify that components can fetch note-specific graph data
 * by mocking the API response with registerEndpoint.
 */
import { describe, it, expect } from 'vitest'
import { registerEndpoint } from '@nuxt/test-utils/runtime'
import { isolatedNoteGraph, simpleNoteGraph, noteGraphWithL2, nullNoteGraph } from '../fixtures'

describe('/api/note-graph/[slug] integration', () => {
  it('can register isolated note graph', async () => {
    registerEndpoint('/api/note-graph/isolated-note', () => isolatedNoteGraph)

    const response = await $fetch('/api/note-graph/isolated-note')
    expect(response.center.id).toBe('isolated-note')
    expect(response.connected).toEqual([])
    expect(response.edges).toEqual([])
  })

  it('can register note graph with L1 connections', async () => {
    registerEndpoint('/api/note-graph/atomic-habits', () => simpleNoteGraph)

    const response = await $fetch('/api/note-graph/atomic-habits')
    expect(response.center.id).toBe('atomic-habits')
    expect(response.center.isCenter).toBe(true)
    expect(response.center.level).toBe(0)
    expect(response.connected).toHaveLength(2)
    expect(response.edges).toHaveLength(2)
  })

  it('can register note graph with L2 connections', async () => {
    registerEndpoint('/api/note-graph/atomic-habits', () => noteGraphWithL2)

    const response = await $fetch('/api/note-graph/atomic-habits')
    const l1Nodes = response.connected.filter((n: { level: number }) => n.level === 1)
    const l2Nodes = response.connected.filter((n: { level: number }) => n.level === 2)
    expect(l1Nodes).toHaveLength(1)
    expect(l2Nodes).toHaveLength(1)
  })

  it('edge levels indicate connection depth', async () => {
    registerEndpoint('/api/note-graph/atomic-habits', () => noteGraphWithL2)

    const response = await $fetch('/api/note-graph/atomic-habits')
    const l1Edges = response.edges.filter((e: { level: number }) => e.level === 1)
    const l2Edges = response.edges.filter((e: { level: number }) => e.level === 2)
    expect(l1Edges).toHaveLength(1)
    expect(l2Edges).toHaveLength(1)
  })

  it('can register null for non-existent note', async () => {
    registerEndpoint('/api/note-graph/non-existent', () => nullNoteGraph)

    const response = await $fetch('/api/note-graph/non-existent')
    // registerEndpoint returning null results in undefined from $fetch
    expect(response).toBeFalsy()
  })
})
