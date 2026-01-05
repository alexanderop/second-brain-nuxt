import { describe, expect, it } from 'vitest'
import { getAuthorAction, getAuthorUrl } from '../../../app/composables/useAuthorShortcut'

describe('getAuthorUrl', () => {
  it('returns correct URL for simple slug', () => {
    expect(getAuthorUrl('james-clear')).toBe('/authors/james-clear')
  })

  it('encodes slugs with spaces', () => {
    expect(getAuthorUrl('Simon Sinek')).toBe('/authors/Simon%20Sinek')
  })

  it('encodes special characters', () => {
    expect(getAuthorUrl('author&name')).toBe('/authors/author%26name')
  })

  it('handles empty string', () => {
    expect(getAuthorUrl('')).toBe('/authors/')
  })
})

describe('getAuthorAction', () => {
  it('returns none when authors is undefined', () => {
    expect(getAuthorAction(undefined)).toEqual({ type: 'none' })
  })

  it('returns none when authors is empty array', () => {
    expect(getAuthorAction([])).toEqual({ type: 'none' })
  })

  it('returns single with URL when one author', () => {
    const result = getAuthorAction(['james-clear'])
    expect(result).toEqual({
      type: 'single',
      url: '/authors/james-clear',
      slug: 'james-clear',
    })
  })

  it('returns single with encoded URL for author with spaces', () => {
    const result = getAuthorAction(['Simon Sinek'])
    expect(result).toEqual({
      type: 'single',
      url: '/authors/Simon%20Sinek',
      slug: 'Simon Sinek',
    })
  })

  it('returns multiple when more than one author', () => {
    const result = getAuthorAction(['james-clear', 'cal-newport'])
    expect(result).toEqual({
      type: 'multiple',
      authors: ['james-clear', 'cal-newport'],
    })
  })

  it('returns multiple when three authors', () => {
    const result = getAuthorAction(['author1', 'author2', 'author3'])
    expect(result).toEqual({
      type: 'multiple',
      authors: ['author1', 'author2', 'author3'],
    })
  })
})
