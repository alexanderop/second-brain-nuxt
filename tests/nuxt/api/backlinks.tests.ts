import { describe, expect, it } from 'vitest'
import { $fetch } from '@nuxt/test-utils/e2e'

describe('/api/backlinks', () => {
  it('returns an object', async () => {
    const result = await $fetch('/api/backlinks')

    expect(result).toBeDefined()
    expect(typeof result).toBe('object')
    expect(result).not.toBeNull()
  })

  it('backlink items have required properties', async () => {
    const result = await $fetch('/api/backlinks')

    // Get first slug that has backlinks
    const slugsWithBacklinks = Object.keys(result)

    if (slugsWithBacklinks.length > 0) {
      const firstSlug = slugsWithBacklinks[0]!
      const backlinks = result[firstSlug]

      if (backlinks) {
        expect(Array.isArray(backlinks)).toBe(true)

        if (backlinks.length > 0) {
          const item = backlinks[0]!
          expect(item).toHaveProperty('slug')
          expect(item).toHaveProperty('title')
          expect(item).toHaveProperty('type')
          expect(typeof item.slug).toBe('string')
          expect(typeof item.title).toBe('string')
          expect(typeof item.type).toBe('string')
        }
      }
    }
  })

  it('backlinks do not include self-references', async () => {
    const result = await $fetch('/api/backlinks')

    for (const [targetSlug, backlinks] of Object.entries(result)) {
      for (const item of backlinks as Array<{ slug: string }>) {
        expect(item.slug).not.toBe(targetSlug)
      }
    }
  })
})
