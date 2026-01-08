import { describe, expect, it } from 'vitest'
import {
  parseArrayParam,
  buildDateRange,
  buildRatingRange,
  nonEmptyArray,
  buildFilterState,
  applyFiltersExcept,
  isNullish,
  compareNumbers,
  compareValues,
  getSortValue,
} from '~/composables/useContentTable'
import type { FilterState, TableContentItem } from '~/types/table'

describe('useContentTable', () => {
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

    it('parses single value string', () => {
      expect(parseArrayParam('book')).toEqual(['book'])
    })

    it('parses comma-separated string', () => {
      expect(parseArrayParam('book,podcast,article')).toEqual(['book', 'podcast', 'article'])
    })

    it('filters empty values from comma-separated string', () => {
      expect(parseArrayParam('book,,podcast')).toEqual(['book', 'podcast'])
    })

    it('returns array as-is when passed array', () => {
      expect(parseArrayParam(['book', 'podcast'])).toEqual(['book', 'podcast'])
    })

    it('filters empty values from array', () => {
      expect(parseArrayParam(['book', '', 'podcast'])).toEqual(['book', 'podcast'])
    })
  })

  describe('buildDateRange', () => {
    it('returns undefined when from is missing', () => {
      expect(buildDateRange(undefined, '2024-01-01')).toBeUndefined()
    })

    it('returns undefined when to is missing', () => {
      expect(buildDateRange('2024-01-01', undefined)).toBeUndefined()
    })

    it('returns undefined when both are missing', () => {
      expect(buildDateRange(undefined, undefined)).toBeUndefined()
    })

    it('returns tuple when both values present', () => {
      expect(buildDateRange('2024-01-01', '2024-12-31')).toEqual(['2024-01-01', '2024-12-31'])
    })

    it('returns undefined for empty strings', () => {
      expect(buildDateRange('', '2024-01-01')).toBeUndefined()
      expect(buildDateRange('2024-01-01', '')).toBeUndefined()
    })
  })

  describe('buildRatingRange', () => {
    it('returns undefined when min is missing', () => {
      expect(buildRatingRange(undefined, 7)).toBeUndefined()
    })

    it('returns undefined when max is missing', () => {
      expect(buildRatingRange(1, undefined)).toBeUndefined()
    })

    it('returns undefined when both are missing', () => {
      expect(buildRatingRange(undefined, undefined)).toBeUndefined()
    })

    it('returns tuple when both values present', () => {
      expect(buildRatingRange(1, 7)).toEqual([1, 7])
    })

    it('handles zero as valid value', () => {
      expect(buildRatingRange(0, 5)).toEqual([0, 5])
    })
  })

  describe('nonEmptyArray', () => {
    it('returns undefined for undefined input', () => {
      expect(nonEmptyArray(undefined)).toBeUndefined()
    })

    it('returns undefined for empty array', () => {
      expect(nonEmptyArray([])).toBeUndefined()
    })

    it('returns array when non-empty', () => {
      expect(nonEmptyArray(['a', 'b'])).toEqual(['a', 'b'])
    })

    it('returns single-item array', () => {
      expect(nonEmptyArray(['a'])).toEqual(['a'])
    })
  })

  describe('buildFilterState', () => {
    it('builds complete filter state from all params', () => {
      const result = buildFilterState({
        type: ['book', 'podcast'],
        tags: ['tech', 'ai'],
        authors: ['author-1'],
        dateConsumedFrom: '2024-01-01',
        dateConsumedTo: '2024-12-31',
        ratingMin: 3,
        ratingMax: 7,
      })

      expect(result).toEqual({
        type: ['book', 'podcast'],
        tags: ['tech', 'ai'],
        authors: ['author-1'],
        dateConsumedRange: ['2024-01-01', '2024-12-31'],
        ratingRange: [3, 7],
      })
    })

    it('handles partial params', () => {
      const result = buildFilterState({
        type: ['book'],
        tags: [],
      })

      expect(result).toEqual({
        type: ['book'],
        tags: undefined,
        authors: undefined,
        dateConsumedRange: undefined,
        ratingRange: undefined,
      })
    })

    it('handles empty params', () => {
      const result = buildFilterState({})

      expect(result).toEqual({
        type: undefined,
        tags: undefined,
        authors: undefined,
        dateConsumedRange: undefined,
        ratingRange: undefined,
      })
    })

    it('ignores incomplete date ranges', () => {
      const result = buildFilterState({
        dateConsumedFrom: '2024-01-01',
        // dateConsumedTo is missing
      })

      expect(result.dateConsumedRange).toBeUndefined()
    })
  })

  describe('applyFiltersExcept', () => {
    const items = [
      { type: 'book' as const, tags: ['tech', 'ai'], authors: [{ slug: 'a1', name: 'Author 1' }] },
      { type: 'podcast' as const, tags: ['tech'], authors: [{ slug: 'a2', name: 'Author 2' }] },
      { type: 'article' as const, tags: ['business'], authors: [{ slug: 'a1', name: 'Author 1' }] },
      { type: 'book' as const, tags: undefined, authors: [] },
    ]

    it('applies type filter when not excluded', () => {
      const filters: FilterState = { type: ['book'] }
      const result = applyFiltersExcept(items, filters, 'tags')

      expect(result).toHaveLength(2)
      expect(result.every(i => i.type === 'book')).toBe(true)
    })

    it('excludes type filter when specified', () => {
      const filters: FilterState = { type: ['book'] }
      const result = applyFiltersExcept(items, filters, 'type')

      expect(result).toHaveLength(4) // All items returned
    })

    it('applies tags filter with OR logic', () => {
      const filters: FilterState = { tags: ['tech', 'business'] }
      const result = applyFiltersExcept(items, filters, 'type')

      expect(result).toHaveLength(3) // Items with tech OR business tags
    })

    it('excludes items without tags when filter active', () => {
      const filters: FilterState = { tags: ['tech'] }
      const result = applyFiltersExcept(items, filters, 'type')

      // Item with undefined tags should be excluded
      expect(result.every(i => i.tags && i.tags.length > 0)).toBe(true)
    })

    it('applies authors filter with OR logic', () => {
      const filters: FilterState = { authors: ['a1'] }
      const result = applyFiltersExcept(items, filters, 'type')

      expect(result).toHaveLength(2) // Items by author a1
    })

    it('excludes items without authors when filter active', () => {
      const filters: FilterState = { authors: ['a1'] }
      const result = applyFiltersExcept(items, filters, 'type')

      // Item with empty authors should be excluded
      expect(result.every(i => i.authors && i.authors.length > 0)).toBe(true)
    })

    it('combines multiple filters', () => {
      const filters: FilterState = { type: ['book'], tags: ['tech'] }
      const result = applyFiltersExcept(items, filters, 'authors')

      expect(result).toHaveLength(1) // Only book with tech tag
    })
  })

  describe('isNullish', () => {
    it('returns true for null', () => {
      expect(isNullish(null)).toBe(true)
    })

    it('returns true for undefined', () => {
      expect(isNullish(undefined)).toBe(true)
    })

    it('returns false for empty string', () => {
      expect(isNullish('')).toBe(false)
    })

    it('returns false for zero', () => {
      expect(isNullish(0)).toBe(false)
    })

    it('returns false for false', () => {
      expect(isNullish(false)).toBe(false)
    })

    it('returns false for objects', () => {
      expect(isNullish({})).toBe(false)
    })
  })

  describe('compareNumbers', () => {
    it('returns -1 when a < b', () => {
      expect(compareNumbers(1, 5)).toBe(-1)
    })

    it('returns 1 when a > b', () => {
      expect(compareNumbers(5, 1)).toBe(1)
    })

    it('returns 0 when a === b', () => {
      expect(compareNumbers(3, 3)).toBe(0)
    })

    it('handles negative numbers', () => {
      expect(compareNumbers(-5, -1)).toBe(-1)
      expect(compareNumbers(-1, -5)).toBe(1)
    })

    it('handles decimals', () => {
      expect(compareNumbers(1.5, 2.5)).toBe(-1)
    })
  })

  describe('compareValues', () => {
    it('pushes null to end (returns 1)', () => {
      expect(compareValues(null, 'a')).toBe(1)
      expect(compareValues(undefined, 'a')).toBe(1)
    })

    it('pushes null to end when comparing with non-null', () => {
      expect(compareValues('a', null)).toBe(-1)
      expect(compareValues('a', undefined)).toBe(-1)
    })

    it('returns 0 when both are null', () => {
      expect(compareValues(null, null)).toBe(0)
      expect(compareValues(undefined, undefined)).toBe(0)
      expect(compareValues(null, undefined)).toBe(0)
    })

    it('compares strings with localeCompare', () => {
      expect(compareValues('apple', 'banana')).toBeLessThan(0)
      expect(compareValues('banana', 'apple')).toBeGreaterThan(0)
      expect(compareValues('apple', 'apple')).toBe(0)
    })

    it('compares numbers correctly', () => {
      expect(compareValues(1, 5)).toBe(-1)
      expect(compareValues(5, 1)).toBe(1)
      expect(compareValues(3, 3)).toBe(0)
    })

    it('returns 0 for mixed types', () => {
      expect(compareValues('a', 1)).toBe(0)
      expect(compareValues(1, 'a')).toBe(0)
    })
  })

  describe('getSortValue', () => {
    const item: TableContentItem = {
      slug: 'test-item',
      title: 'Test Title',
      type: 'book',
      authors: [],
      tags: [],
      date: '2024-06-15',
      rating: 5,
    }

    it('returns date for dateConsumed column', () => {
      expect(getSortValue(item, 'dateConsumed')).toBe('2024-06-15')
    })

    it('returns title for title column', () => {
      expect(getSortValue(item, 'title')).toBe('Test Title')
    })

    it('returns type for type column', () => {
      expect(getSortValue(item, 'type')).toBe('book')
    })

    it('returns rating for rating column', () => {
      expect(getSortValue(item, 'rating')).toBe(5)
    })

    it('returns undefined for missing values', () => {
      const itemWithoutDate: TableContentItem = {
        slug: 'test',
        title: 'Test',
        type: 'article',
        authors: [],
        tags: [],
      }
      expect(getSortValue(itemWithoutDate, 'dateConsumed')).toBeUndefined()
      expect(getSortValue(itemWithoutDate, 'rating')).toBeUndefined()
    })

    it('returns undefined for unknown column', () => {
      // Test the fallback case for unknown columns (runtime safety check)
      const unknownColumn = 'unknownColumn'
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- Testing runtime fallback for invalid column type
      expect(getSortValue(item, unknownColumn as Parameters<typeof getSortValue>[1])).toBeUndefined()
    })
  })
})
