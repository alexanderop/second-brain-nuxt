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
  filterByType,
  filterByTags,
  filterByAuthors,
  filterByDateRange,
  filterByRatingRange,
  applyAllFilters,
  sortItems,
  paginateItems,
  calculateTotalPages,
  isValidColumn,
  isValidDirection,
  toStringArray,
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

  describe('filterByType', () => {
    const items: Array<{ type: 'book' | 'podcast' | 'article' }> = [
      { type: 'book' },
      { type: 'podcast' },
      { type: 'article' },
      { type: 'book' },
    ]

    it('returns all items when types is undefined', () => {
      expect(filterByType(items, undefined)).toEqual(items)
    })

    it('returns all items when types is empty array', () => {
      expect(filterByType(items, [])).toEqual(items)
    })

    it('filters by single type', () => {
      const result = filterByType(items, ['book'])
      expect(result).toHaveLength(2)
      expect(result.every(i => i.type === 'book')).toBe(true)
    })

    it('filters by multiple types with OR logic', () => {
      const result = filterByType(items, ['book', 'podcast'])
      expect(result).toHaveLength(3)
      expect(result.every(i => i.type === 'book' || i.type === 'podcast')).toBe(true)
    })

    it('returns empty array when no items match', () => {
      const result = filterByType(items, ['talk'])
      expect(result).toEqual([])
    })
  })

  describe('filterByTags', () => {
    const items = [
      { tags: ['tech', 'ai'] },
      { tags: ['business'] },
      { tags: ['tech', 'web'] },
      { tags: undefined },
      { tags: [] },
    ]

    it('returns all items when tags is undefined', () => {
      expect(filterByTags(items, undefined)).toEqual(items)
    })

    it('returns all items when tags is empty array', () => {
      expect(filterByTags(items, [])).toEqual(items)
    })

    it('filters by single tag', () => {
      const result = filterByTags(items, ['tech'])
      expect(result).toHaveLength(2)
      expect(result.every(i => i.tags?.includes('tech'))).toBe(true)
    })

    it('filters by multiple tags with OR logic', () => {
      const result = filterByTags(items, ['tech', 'business'])
      expect(result).toHaveLength(3)
    })

    it('excludes items without tags when filter is active', () => {
      const result = filterByTags(items, ['tech'])
      expect(result.every(i => i.tags && i.tags.length > 0)).toBe(true)
    })

    it('excludes items with empty tags array when filter is active', () => {
      const result = filterByTags(items, ['business'])
      expect(result).toHaveLength(1)
      expect(result[0]?.tags).toEqual(['business'])
    })

    it('returns empty array when no items have matching tags', () => {
      const result = filterByTags(items, ['nonexistent'])
      expect(result).toEqual([])
    })
  })

  describe('filterByAuthors', () => {
    const items = [
      { authors: [{ slug: 'a1', name: 'Author 1' }, { slug: 'a2', name: 'Author 2' }] },
      { authors: [{ slug: 'a2', name: 'Author 2' }] },
      { authors: [{ slug: 'a3', name: 'Author 3' }] },
      { authors: undefined },
      { authors: [] },
    ]

    it('returns all items when authorSlugs is undefined', () => {
      expect(filterByAuthors(items, undefined)).toEqual(items)
    })

    it('returns all items when authorSlugs is empty array', () => {
      expect(filterByAuthors(items, [])).toEqual(items)
    })

    it('filters by single author', () => {
      const result = filterByAuthors(items, ['a1'])
      expect(result).toHaveLength(1)
      expect(result[0]?.authors?.some(a => a.slug === 'a1')).toBe(true)
    })

    it('filters by multiple authors with OR logic', () => {
      const result = filterByAuthors(items, ['a1', 'a3'])
      expect(result).toHaveLength(2)
    })

    it('excludes items without authors when filter is active', () => {
      const result = filterByAuthors(items, ['a2'])
      expect(result.every(i => i.authors && i.authors.length > 0)).toBe(true)
    })

    it('excludes items with empty authors array when filter is active', () => {
      const result = filterByAuthors(items, ['a2'])
      expect(result).toHaveLength(2)
    })

    it('returns empty array when no items have matching authors', () => {
      const result = filterByAuthors(items, ['nonexistent'])
      expect(result).toEqual([])
    })
  })

  describe('filterByDateRange', () => {
    const items = [
      { date: '2024-01-15' },
      { date: '2024-06-15' },
      { date: '2024-12-15' },
      { date: undefined },
    ]

    it('returns all items when range is undefined', () => {
      expect(filterByDateRange(items, undefined)).toEqual(items)
    })

    it('filters items within date range (inclusive)', () => {
      const result = filterByDateRange(items, ['2024-01-01', '2024-06-30'])
      expect(result).toHaveLength(2)
      expect(result.map(i => i.date)).toEqual(['2024-01-15', '2024-06-15'])
    })

    it('includes items on boundary dates', () => {
      const result = filterByDateRange(items, ['2024-01-15', '2024-01-15'])
      expect(result).toHaveLength(1)
      expect(result[0]?.date).toBe('2024-01-15')
    })

    it('excludes items without date when filter is active', () => {
      const result = filterByDateRange(items, ['2024-01-01', '2024-12-31'])
      expect(result.every(i => i.date !== undefined)).toBe(true)
    })

    it('returns empty array when no items in range', () => {
      const result = filterByDateRange(items, ['2023-01-01', '2023-12-31'])
      expect(result).toEqual([])
    })

    it('handles range that excludes all dated items', () => {
      const result = filterByDateRange(items, ['2025-01-01', '2025-12-31'])
      expect(result).toEqual([])
    })
  })

  describe('filterByRatingRange', () => {
    const items = [
      { rating: 1 },
      { rating: 5 },
      { rating: 10 },
      { rating: undefined },
    ]

    it('returns all items when range is undefined', () => {
      expect(filterByRatingRange(items, undefined)).toEqual(items)
    })

    it('filters items within rating range (inclusive)', () => {
      const result = filterByRatingRange(items, [1, 5])
      expect(result).toHaveLength(2)
      expect(result.map(i => i.rating)).toEqual([1, 5])
    })

    it('includes items on boundary ratings', () => {
      const result = filterByRatingRange(items, [5, 5])
      expect(result).toHaveLength(1)
      expect(result[0]?.rating).toBe(5)
    })

    it('excludes items without rating when filter is active', () => {
      const result = filterByRatingRange(items, [1, 10])
      expect(result.every(i => i.rating !== undefined)).toBe(true)
    })

    it('returns empty array when no items in range', () => {
      const result = filterByRatingRange(items, [2, 4])
      expect(result).toEqual([])
    })

    it('handles minimum boundary', () => {
      const result = filterByRatingRange(items, [1, 1])
      expect(result).toHaveLength(1)
      expect(result[0]?.rating).toBe(1)
    })

    it('handles maximum boundary', () => {
      const result = filterByRatingRange(items, [10, 10])
      expect(result).toHaveLength(1)
      expect(result[0]?.rating).toBe(10)
    })
  })

  describe('applyAllFilters', () => {
    const items: TableContentItem[] = [
      {
        slug: 'item-1',
        title: 'Book A',
        type: 'book',
        authors: [{ slug: 'a1', name: 'Author 1' }],
        tags: ['tech', 'ai'],
        date: '2024-06-15',
        rating: 8,
      },
      {
        slug: 'item-2',
        title: 'Podcast B',
        type: 'podcast',
        authors: [{ slug: 'a2', name: 'Author 2' }],
        tags: ['business'],
        date: '2024-03-15',
        rating: 6,
      },
      {
        slug: 'item-3',
        title: 'Article C',
        type: 'article',
        authors: [{ slug: 'a1', name: 'Author 1' }],
        tags: ['tech'],
        date: '2024-09-15',
        rating: 9,
      },
      {
        slug: 'item-4',
        title: 'Book D',
        type: 'book',
        authors: [],
        tags: [],
        date: undefined,
        rating: undefined,
      },
    ]

    it('returns all items when no filters applied', () => {
      const result = applyAllFilters(items, {})
      expect(result).toEqual(items)
    })

    it('applies single type filter', () => {
      const result = applyAllFilters(items, { type: ['book'] })
      expect(result).toHaveLength(2)
      expect(result.every(i => i.type === 'book')).toBe(true)
    })

    it('applies single tags filter', () => {
      const result = applyAllFilters(items, { tags: ['tech'] })
      expect(result).toHaveLength(2)
    })

    it('applies single authors filter', () => {
      const result = applyAllFilters(items, { authors: ['a1'] })
      expect(result).toHaveLength(2)
    })

    it('applies single date range filter', () => {
      const result = applyAllFilters(items, { dateConsumedRange: ['2024-01-01', '2024-06-30'] })
      expect(result).toHaveLength(2)
    })

    it('applies single rating range filter', () => {
      const result = applyAllFilters(items, { ratingRange: [7, 10] })
      expect(result).toHaveLength(2)
    })

    it('combines multiple filters (AND logic between filter types)', () => {
      const result = applyAllFilters(items, {
        type: ['book', 'article'],
        tags: ['tech'],
      })
      expect(result).toHaveLength(2)
      expect(result.map(i => i.slug)).toEqual(['item-1', 'item-3'])
    })

    it('combines all filter types', () => {
      const result = applyAllFilters(items, {
        type: ['book', 'article'],
        tags: ['tech'],
        authors: ['a1'],
        dateConsumedRange: ['2024-01-01', '2024-12-31'],
        ratingRange: [8, 10],
      })
      expect(result).toHaveLength(2)
      expect(result.map(i => i.slug)).toEqual(['item-1', 'item-3'])
    })

    it('returns empty array when filters exclude all items', () => {
      const result = applyAllFilters(items, {
        type: ['book'],
        tags: ['business'], // No book has business tag
      })
      expect(result).toEqual([])
    })
  })

  describe('sortItems', () => {
    const items: TableContentItem[] = [
      {
        slug: 'item-1',
        title: 'Zebra Book',
        type: 'book',
        authors: [],
        tags: [],
        date: '2024-06-15',
        rating: 5,
      },
      {
        slug: 'item-2',
        title: 'Apple Podcast',
        type: 'podcast',
        authors: [],
        tags: [],
        date: '2024-01-10',
        rating: 8,
      },
      {
        slug: 'item-3',
        title: 'Banana Article',
        type: 'article',
        authors: [],
        tags: [],
        date: '2024-09-20',
        rating: 3,
      },
      {
        slug: 'item-4',
        title: 'Cherry Talk',
        type: 'talk',
        authors: [],
        tags: [],
        date: undefined,
        rating: undefined,
      },
    ]

    describe('sorting by title column', () => {
      it('sorts by title ascending', () => {
        const result = sortItems(items, 'title', 'asc')
        expect(result.map(i => i.title)).toEqual([
          'Apple Podcast',
          'Banana Article',
          'Cherry Talk',
          'Zebra Book',
        ])
      })

      it('sorts by title descending', () => {
        const result = sortItems(items, 'title', 'desc')
        expect(result.map(i => i.title)).toEqual([
          'Zebra Book',
          'Cherry Talk',
          'Banana Article',
          'Apple Podcast',
        ])
      })
    })

    describe('sorting by type column', () => {
      it('sorts by type ascending', () => {
        const result = sortItems(items, 'type', 'asc')
        expect(result.map(i => i.type)).toEqual([
          'article',
          'book',
          'podcast',
          'talk',
        ])
      })

      it('sorts by type descending', () => {
        const result = sortItems(items, 'type', 'desc')
        expect(result.map(i => i.type)).toEqual([
          'talk',
          'podcast',
          'book',
          'article',
        ])
      })
    })

    describe('sorting by dateConsumed column', () => {
      it('sorts by dateConsumed ascending with nulls at end', () => {
        const result = sortItems(items, 'dateConsumed', 'asc')
        expect(result.map(i => i.date)).toEqual([
          '2024-01-10',
          '2024-06-15',
          '2024-09-20',
          undefined,
        ])
      })

      it('sorts by dateConsumed descending with nulls at start', () => {
        const result = sortItems(items, 'dateConsumed', 'desc')
        expect(result.map(i => i.date)).toEqual([
          undefined,
          '2024-09-20',
          '2024-06-15',
          '2024-01-10',
        ])
      })
    })

    describe('sorting by rating column', () => {
      it('sorts by rating ascending with nulls at end', () => {
        const result = sortItems(items, 'rating', 'asc')
        expect(result.map(i => i.rating)).toEqual([3, 5, 8, undefined])
      })

      it('sorts by rating descending with nulls at start', () => {
        const result = sortItems(items, 'rating', 'desc')
        expect(result.map(i => i.rating)).toEqual([undefined, 8, 5, 3])
      })
    })

    describe('null value handling', () => {
      it('pushes null values to end in ascending order', () => {
        const itemsWithNulls: TableContentItem[] = [
          { slug: 'a', title: 'A', type: 'book', authors: [], tags: [], date: undefined, rating: undefined },
          { slug: 'b', title: 'B', type: 'book', authors: [], tags: [], date: '2024-01-01', rating: 5 },
          { slug: 'c', title: 'C', type: 'book', authors: [], tags: [], date: undefined, rating: undefined },
        ]
        const result = sortItems(itemsWithNulls, 'dateConsumed', 'asc')
        expect(result.map(i => i.slug)).toEqual(['b', 'a', 'c'])
      })

      it('pushes null values to start in descending order', () => {
        const itemsWithNulls: TableContentItem[] = [
          { slug: 'a', title: 'A', type: 'book', authors: [], tags: [], date: undefined, rating: undefined },
          { slug: 'b', title: 'B', type: 'book', authors: [], tags: [], date: '2024-01-01', rating: 5 },
          { slug: 'c', title: 'C', type: 'book', authors: [], tags: [], date: undefined, rating: undefined },
        ]
        const result = sortItems(itemsWithNulls, 'dateConsumed', 'desc')
        expect(result.map(i => i.slug)).toEqual(['a', 'c', 'b'])
      })

      it('maintains order when all values are null', () => {
        const itemsAllNull: TableContentItem[] = [
          { slug: 'a', title: 'A', type: 'book', authors: [], tags: [], rating: undefined },
          { slug: 'b', title: 'B', type: 'book', authors: [], tags: [], rating: undefined },
        ]
        const result = sortItems(itemsAllNull, 'rating', 'asc')
        expect(result.map(i => i.slug)).toEqual(['a', 'b'])
      })
    })

    describe('immutability', () => {
      it('does not mutate original array', () => {
        const original = [...items]
        sortItems(items, 'title', 'asc')
        expect(items).toEqual(original)
      })

      it('returns a new array reference', () => {
        const result = sortItems(items, 'title', 'asc')
        expect(result).not.toBe(items)
      })
    })

    describe('edge cases', () => {
      it('handles empty array', () => {
        const result = sortItems([], 'title', 'asc')
        expect(result).toEqual([])
      })

      it('handles single item array', () => {
        const singleItem: TableContentItem[] = [
          { slug: 'a', title: 'A', type: 'book', authors: [], tags: [] },
        ]
        const result = sortItems(singleItem, 'title', 'asc')
        expect(result).toEqual(singleItem)
      })
    })
  })

  describe('paginateItems', () => {
    const items = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']

    describe('first page', () => {
      it('returns first page of items', () => {
        const result = paginateItems(items, 1, 3)
        expect(result).toEqual(['a', 'b', 'c'])
      })

      it('returns all items when page size exceeds total', () => {
        const result = paginateItems(items, 1, 20)
        expect(result).toEqual(items)
      })
    })

    describe('middle page', () => {
      it('returns correct slice for middle page', () => {
        const result = paginateItems(items, 2, 3)
        expect(result).toEqual(['d', 'e', 'f'])
      })

      it('returns correct slice for third page', () => {
        const result = paginateItems(items, 3, 3)
        expect(result).toEqual(['g', 'h', 'i'])
      })
    })

    describe('last page', () => {
      it('returns partial last page', () => {
        const result = paginateItems(items, 4, 3)
        expect(result).toEqual(['j'])
      })

      it('returns empty array when page is beyond data', () => {
        const result = paginateItems(items, 5, 3)
        expect(result).toEqual([])
      })
    })

    describe('edge cases', () => {
      it('handles empty array', () => {
        const result = paginateItems([], 1, 10)
        expect(result).toEqual([])
      })

      it('handles page size of 1', () => {
        const result = paginateItems(items, 3, 1)
        expect(result).toEqual(['c'])
      })

      it('handles exact page boundary', () => {
        const result = paginateItems(['a', 'b', 'c', 'd', 'e', 'f'], 2, 3)
        expect(result).toEqual(['d', 'e', 'f'])
      })
    })

    describe('immutability', () => {
      it('does not mutate original array', () => {
        const original = [...items]
        paginateItems(items, 2, 3)
        expect(items).toEqual(original)
      })

      it('returns a new array reference', () => {
        const result = paginateItems(items, 1, 10)
        expect(result).not.toBe(items)
      })
    })
  })

  describe('calculateTotalPages', () => {
    describe('exact division', () => {
      it('returns 1 page for 10 items with page size 10', () => {
        expect(calculateTotalPages(10, 10)).toBe(1)
      })

      it('returns 2 pages for 20 items with page size 10', () => {
        expect(calculateTotalPages(20, 10)).toBe(2)
      })

      it('returns 5 pages for 25 items with page size 5', () => {
        expect(calculateTotalPages(25, 5)).toBe(5)
      })
    })

    describe('partial last page', () => {
      it('rounds up for partial page (11 items, page size 10)', () => {
        expect(calculateTotalPages(11, 10)).toBe(2)
      })

      it('rounds up for partial page (1 item, page size 10)', () => {
        expect(calculateTotalPages(1, 10)).toBe(1)
      })

      it('rounds up for partial page (7 items, page size 3)', () => {
        expect(calculateTotalPages(7, 3)).toBe(3)
      })
    })

    describe('edge cases', () => {
      it('returns 0 pages for 0 items', () => {
        expect(calculateTotalPages(0, 10)).toBe(0)
      })

      it('returns correct pages for page size 1', () => {
        expect(calculateTotalPages(5, 1)).toBe(5)
      })

      it('handles large numbers', () => {
        expect(calculateTotalPages(1000, 25)).toBe(40)
      })
    })
  })

  describe('isValidColumn', () => {
    it('returns true for valid column "title"', () => {
      expect(isValidColumn('title')).toBe(true)
    })

    it('returns true for valid column "type"', () => {
      expect(isValidColumn('type')).toBe(true)
    })

    it('returns true for valid column "dateConsumed"', () => {
      expect(isValidColumn('dateConsumed')).toBe(true)
    })

    it('returns true for valid column "rating"', () => {
      expect(isValidColumn('rating')).toBe(true)
    })

    it('returns false for null', () => {
      expect(isValidColumn(null)).toBe(false)
    })

    it('returns false for invalid column name', () => {
      expect(isValidColumn('invalid')).toBe(false)
    })

    it('returns false for empty string', () => {
      expect(isValidColumn('')).toBe(false)
    })

    it('returns false for similar but incorrect column names', () => {
      expect(isValidColumn('Title')).toBe(false)
      expect(isValidColumn('date')).toBe(false)
      expect(isValidColumn('ratings')).toBe(false)
    })
  })

  describe('isValidDirection', () => {
    it('returns true for "asc"', () => {
      expect(isValidDirection('asc')).toBe(true)
    })

    it('returns true for "desc"', () => {
      expect(isValidDirection('desc')).toBe(true)
    })

    it('returns false for null', () => {
      expect(isValidDirection(null)).toBe(false)
    })

    it('returns false for invalid direction', () => {
      expect(isValidDirection('ascending')).toBe(false)
    })

    it('returns false for empty string', () => {
      expect(isValidDirection('')).toBe(false)
    })

    it('returns false for uppercase variants', () => {
      expect(isValidDirection('ASC')).toBe(false)
      expect(isValidDirection('DESC')).toBe(false)
    })
  })

  describe('toStringArray', () => {
    it('returns empty array for non-array input', () => {
      expect(toStringArray(null)).toEqual([])
      expect(toStringArray(undefined)).toEqual([])
      expect(toStringArray('string')).toEqual([])
      expect(toStringArray(123)).toEqual([])
      expect(toStringArray({})).toEqual([])
    })

    it('returns empty array for empty array', () => {
      expect(toStringArray([])).toEqual([])
    })

    it('returns string array as-is', () => {
      expect(toStringArray(['a', 'b', 'c'])).toEqual(['a', 'b', 'c'])
    })

    it('filters out non-string values from array', () => {
      expect(toStringArray(['a', 1, 'b', null, 'c'])).toEqual(['a', 'b', 'c'])
    })

    it('returns empty array when all values are non-strings', () => {
      expect(toStringArray([1, 2, 3])).toEqual([])
      expect(toStringArray([null, undefined])).toEqual([])
      expect(toStringArray([{}, []])).toEqual([])
    })

    it('handles mixed types correctly', () => {
      expect(toStringArray(['valid', 42, true, 'also-valid', undefined])).toEqual(['valid', 'also-valid'])
    })
  })
})
