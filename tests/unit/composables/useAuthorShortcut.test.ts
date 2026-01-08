import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { ref } from 'vue'
import { getAuthorAction, getAuthorUrl, useAuthorShortcut } from '../../../app/composables/useAuthorShortcut'

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

  it('returns multiple when single author is empty string', () => {
    // Edge case: array with single falsy string element
    const result = getAuthorAction([''])
    expect(result).toEqual({
      type: 'multiple',
      authors: [''],
    })
  })
})

describe('useAuthorShortcut', () => {
  const mockWindowOpen = vi.fn(() => null)

  beforeEach(() => {
    // Stub window.open for Node environment
    vi.stubGlobal('window', { open: mockWindowOpen })
  })

  afterEach(() => {
    mockWindowOpen.mockClear()
    vi.unstubAllGlobals()
  })

  describe('openAuthor', () => {
    it('calls window.open with correct URL and _blank target', () => {
      const authors = ref<string[] | undefined>(undefined)
      const { openAuthor } = useAuthorShortcut(authors)

      openAuthor('james-clear')

      expect(mockWindowOpen).toHaveBeenCalledWith('/authors/james-clear', '_blank')
    })

    it('encodes special characters in URL', () => {
      const authors = ref<string[] | undefined>(undefined)
      const { openAuthor } = useAuthorShortcut(authors)

      openAuthor('author&name')

      expect(mockWindowOpen).toHaveBeenCalledWith('/authors/author%26name', '_blank')
    })
  })

  describe('handleShortcut', () => {
    it('returns none action when no authors', () => {
      const authors = ref<string[] | undefined>(undefined)
      const { handleShortcut } = useAuthorShortcut(authors)

      const result = handleShortcut()

      expect(result).toEqual({ type: 'none' })
      expect(mockWindowOpen).not.toHaveBeenCalled()
    })

    it('returns none action when authors is empty array', () => {
      const authors = ref<string[] | undefined>([])
      const { handleShortcut } = useAuthorShortcut(authors)

      const result = handleShortcut()

      expect(result).toEqual({ type: 'none' })
      expect(mockWindowOpen).not.toHaveBeenCalled()
    })

    it('returns single action and opens window for single author', () => {
      const authors = ref<string[] | undefined>(['james-clear'])
      const { handleShortcut } = useAuthorShortcut(authors)

      const result = handleShortcut()

      expect(result).toEqual({
        type: 'single',
        url: '/authors/james-clear',
        slug: 'james-clear',
      })
      expect(mockWindowOpen).toHaveBeenCalledWith('/authors/james-clear', '_blank')
      expect(mockWindowOpen).toHaveBeenCalledTimes(1)
    })

    it('returns multiple action without opening window', () => {
      const authors = ref<string[] | undefined>(['james-clear', 'cal-newport'])
      const { handleShortcut } = useAuthorShortcut(authors)

      const result = handleShortcut()

      expect(result).toEqual({
        type: 'multiple',
        authors: ['james-clear', 'cal-newport'],
      })
      expect(mockWindowOpen).not.toHaveBeenCalled()
    })

    it('reacts to ref value changes', () => {
      const authors = ref<string[] | undefined>(undefined)
      const { handleShortcut } = useAuthorShortcut(authors)

      // Initially no authors
      expect(handleShortcut()).toEqual({ type: 'none' })
      expect(mockWindowOpen).not.toHaveBeenCalled()

      // Update to single author
      authors.value = ['new-author']
      const result = handleShortcut()

      expect(result).toEqual({
        type: 'single',
        url: '/authors/new-author',
        slug: 'new-author',
      })
      expect(mockWindowOpen).toHaveBeenCalledWith('/authors/new-author', '_blank')
    })
  })

  describe('getAuthorAction (returned from composable)', () => {
    it('returns the same getAuthorAction function', () => {
      const authors = ref<string[] | undefined>(undefined)
      const { getAuthorAction: composableGetAuthorAction } = useAuthorShortcut(authors)

      // The composable returns the same function
      expect(composableGetAuthorAction(['test'])).toEqual({
        type: 'single',
        url: '/authors/test',
        slug: 'test',
      })
    })
  })
})
