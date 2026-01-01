import { describe, expect, it } from 'vitest'
import { $fetch } from '@nuxt/test-utils/e2e'

describe('/api/mentions', () => {
  it('returns empty array when no slug provided', async () => {
    const result = await $fetch('/api/mentions')
    expect(result).toEqual([])
  })

  it('returns empty array when no title provided', async () => {
    const result = await $fetch('/api/mentions?slug=test')
    expect(result).toEqual([])
  })

  it('returns empty array for very short title', async () => {
    const result = await $fetch('/api/mentions?slug=test&title=ab')
    expect(result).toEqual([])
  })

  it('returns array for valid query', async () => {
    const result = await $fetch('/api/mentions?slug=test-slug&title=Test Title')

    expect(Array.isArray(result)).toBe(true)
  })

  it('mention items have required properties when found', async () => {
    // Use a title that might exist in the content
    const result = await $fetch('/api/mentions?slug=some-slug&title=Atomic Habits')

    if (result.length > 0) {
      const item = result[0]
      expect(item).toHaveProperty('slug')
      expect(item).toHaveProperty('title')
      expect(item).toHaveProperty('type')
      expect(item).toHaveProperty('snippet')
      expect(item).toHaveProperty('highlightedSnippet')
      expect(typeof item?.slug).toBe('string')
      expect(typeof item?.title).toBe('string')
      expect(typeof item?.type).toBe('string')
      expect(typeof item?.snippet).toBe('string')
      expect(typeof item?.highlightedSnippet).toBe('string')
    }
  })

  it('highlighted snippet contains mark tags when there are matches', async () => {
    const result = await $fetch('/api/mentions?slug=some-slug&title=Atomic Habits')

    if (result.length > 0) {
      const item = result[0]
      expect(item?.highlightedSnippet).toContain('<mark')
    }
  })
})
