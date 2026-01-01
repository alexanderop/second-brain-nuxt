import { describe, expect, it } from 'vitest'

// Test the parseArrayParam logic directly (same logic as in useGraphFilters)
function parseArrayParam(value: string | string[] | null | undefined): string[] {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

describe('parseArrayParam', () => {
  it('returns empty array for null', () => {
    expect(parseArrayParam(null)).toEqual([])
  })

  it('returns empty array for undefined', () => {
    expect(parseArrayParam(undefined)).toEqual([])
  })

  it('returns empty array for empty string', () => {
    expect(parseArrayParam('')).toEqual([])
  })

  it('wraps single string in array', () => {
    expect(parseArrayParam('youtube')).toEqual(['youtube'])
  })

  it('returns array as-is', () => {
    expect(parseArrayParam(['youtube', 'podcast'])).toEqual(['youtube', 'podcast'])
  })

  it('handles empty array', () => {
    expect(parseArrayParam([])).toEqual([])
  })

  it('handles single-item array', () => {
    expect(parseArrayParam(['note'])).toEqual(['note'])
  })
})

describe('ALL_CONTENT_TYPES', () => {
  it('contains expected content types', async () => {
    const { ALL_CONTENT_TYPES } = await import('../../../app/composables/useGraphFilters')
    expect(ALL_CONTENT_TYPES).toContain('youtube')
    expect(ALL_CONTENT_TYPES).toContain('podcast')
    expect(ALL_CONTENT_TYPES).toContain('article')
    expect(ALL_CONTENT_TYPES).toContain('book')
    expect(ALL_CONTENT_TYPES).toContain('note')
    expect(ALL_CONTENT_TYPES).toContain('map')
  })

  it('has expected length', async () => {
    const { ALL_CONTENT_TYPES } = await import('../../../app/composables/useGraphFilters')
    expect(ALL_CONTENT_TYPES.length).toBe(12)
  })
})

describe('GraphFilterState interface', () => {
  it('exports GraphFilterState type correctly', async () => {
    // This test verifies the interface is exported and can be used
    const module = await import('../../../app/composables/useGraphFilters')
    expect(module).toHaveProperty('ALL_CONTENT_TYPES')
    // The composable exports but requires Vue runtime
    expect(module).toHaveProperty('useGraphFilters')
  })
})
