import { describe, expect, it } from 'vitest'
import { tableParamsSchema, CONTENT_TYPES } from '~/types/table'

describe('tableParamsSchema', () => {
  describe('type validation', () => {
    it('parses valid content types', () => {
      const result = tableParamsSchema.parse({
        type: ['book', 'podcast', 'article'],
      })
      expect(result.type).toEqual(['book', 'podcast', 'article'])
    })

    it('rejects invalid content types', () => {
      expect(() => tableParamsSchema.parse({
        type: ['invalid-type'],
      })).toThrow()
    })

    it('allows empty type array', () => {
      const result = tableParamsSchema.parse({ type: [] })
      expect(result.type).toEqual([])
    })

    it('validates all CONTENT_TYPES are accepted', () => {
      const result = tableParamsSchema.parse({
        type: [...CONTENT_TYPES],
      })
      expect(result.type).toEqual([...CONTENT_TYPES])
    })
  })

  describe('rating validation', () => {
    it('coerces rating strings to numbers', () => {
      const result = tableParamsSchema.parse({
        ratingMin: '3',
        ratingMax: '7',
      })
      expect(result.ratingMin).toBe(3)
      expect(result.ratingMax).toBe(7)
    })

    it('validates rating minimum (1)', () => {
      expect(() => tableParamsSchema.parse({
        ratingMin: 0,
      })).toThrow()
    })

    it('validates rating maximum (7)', () => {
      expect(() => tableParamsSchema.parse({
        ratingMax: 8,
      })).toThrow()
    })

    it('accepts ratings in valid range', () => {
      const result = tableParamsSchema.parse({
        ratingMin: 1,
        ratingMax: 7,
      })
      expect(result.ratingMin).toBe(1)
      expect(result.ratingMax).toBe(7)
    })

    it('accepts mid-range ratings', () => {
      const result = tableParamsSchema.parse({
        ratingMin: 4,
        ratingMax: 5,
      })
      expect(result.ratingMin).toBe(4)
      expect(result.ratingMax).toBe(5)
    })
  })

  describe('sort validation', () => {
    it('accepts valid sort columns', () => {
      const validColumns = ['title', 'type', 'dateConsumed', 'rating']
      for (const column of validColumns) {
        const result = tableParamsSchema.parse({ sort: column })
        expect(result.sort).toBe(column)
      }
    })

    it('rejects invalid sort columns', () => {
      expect(() => tableParamsSchema.parse({
        sort: 'invalid-column',
      })).toThrow()
    })

    it('accepts valid directions', () => {
      const result1 = tableParamsSchema.parse({ dir: 'asc' })
      expect(result1.dir).toBe('asc')

      const result2 = tableParamsSchema.parse({ dir: 'desc' })
      expect(result2.dir).toBe('desc')
    })

    it('rejects invalid directions', () => {
      expect(() => tableParamsSchema.parse({
        dir: 'invalid',
      })).toThrow()
    })
  })

  describe('pagination validation', () => {
    it('coerces page string to number', () => {
      const result = tableParamsSchema.parse({ page: '5' })
      expect(result.page).toBe(5)
    })

    it('validates page minimum (1)', () => {
      expect(() => tableParamsSchema.parse({
        page: 0,
      })).toThrow()
    })

    it('accepts valid page numbers', () => {
      const result = tableParamsSchema.parse({ page: 100 })
      expect(result.page).toBe(100)
    })
  })

  describe('string arrays', () => {
    it('accepts tags array', () => {
      const result = tableParamsSchema.parse({
        tags: ['tech', 'ai', 'vue'],
      })
      expect(result.tags).toEqual(['tech', 'ai', 'vue'])
    })

    it('accepts authors array', () => {
      const result = tableParamsSchema.parse({
        authors: ['author-1', 'author-2'],
      })
      expect(result.authors).toEqual(['author-1', 'author-2'])
    })
  })

  describe('date strings', () => {
    it('accepts date consumed range', () => {
      const result = tableParamsSchema.parse({
        dateConsumedFrom: '2024-01-01',
        dateConsumedTo: '2024-12-31',
      })
      expect(result.dateConsumedFrom).toBe('2024-01-01')
      expect(result.dateConsumedTo).toBe('2024-12-31')
    })
  })

  describe('optional fields', () => {
    it('allows all fields to be undefined', () => {
      const result = tableParamsSchema.parse({})
      expect(result.type).toBeUndefined()
      expect(result.tags).toBeUndefined()
      expect(result.authors).toBeUndefined()
      expect(result.sort).toBeUndefined()
      expect(result.dir).toBeUndefined()
      expect(result.page).toBeUndefined()
    })
  })
})
