import { describe, expect, it } from 'vitest'
import { selectRandomItem, buildNotePath } from '~/composables/useRandomNote'

describe('useRandomNote', () => {
  describe('selectRandomItem', () => {
    it('returns undefined for empty array', () => {
      expect(selectRandomItem([])).toBeUndefined()
    })

    it('returns the only item for single-item array', () => {
      const items = [{ stem: 'only-note' }]
      expect(selectRandomItem(items)).toEqual({ stem: 'only-note' })
    })

    it('returns an item from the array', () => {
      const items = [
        { stem: 'note-1' },
        { stem: 'note-2' },
        { stem: 'note-3' },
      ]
      const result = selectRandomItem(items)
      expect(items).toContainEqual(result)
    })

    it('works with different types', () => {
      const numbers = [1, 2, 3, 4, 5]
      const result = selectRandomItem(numbers)
      expect(numbers).toContain(result)
    })

    it('works with strings', () => {
      const strings = ['a', 'b', 'c']
      const result = selectRandomItem(strings)
      expect(strings).toContain(result)
    })
  })

  describe('buildNotePath', () => {
    it('builds path with leading slash', () => {
      expect(buildNotePath('my-note')).toBe('/my-note')
    })

    it('handles stems with special characters', () => {
      expect(buildNotePath('note-with-dashes')).toBe('/note-with-dashes')
    })

    it('handles nested-looking stems', () => {
      expect(buildNotePath('category/note')).toBe('/category/note')
    })

    it('handles empty stem', () => {
      expect(buildNotePath('')).toBe('/')
    })
  })
})
