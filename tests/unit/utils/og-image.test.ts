/**
 * Unit tests for OG image markup generation utilities
 *
 * Tests pure functions that create Satori-compatible markup.
 * These functions are extracted from the API handler for testability.
 */
import { describe, it, expect } from 'vitest'
import {
  createOgImageMarkup,
  truncateDescription,
  getTypeIcon,
  TYPE_ICONS,
} from '../../../server/utils/og-image'

describe('og-image utilities', () => {
  describe('truncateDescription', () => {
    it('returns original string if under max length', () => {
      const short = 'A short description'
      expect(truncateDescription(short)).toBe(short)
    })

    it('truncates and adds ellipsis if over max length', () => {
      const long = 'A'.repeat(150)
      const result = truncateDescription(long)
      expect(result).toHaveLength(123) // 120 + '...'
      expect(result.endsWith('...')).toBe(true)
    })

    it('uses custom max length when provided', () => {
      const text = 'This is a test string'
      const result = truncateDescription(text, 10)
      expect(result).toBe('This is a ...')
    })

    it('handles empty string', () => {
      expect(truncateDescription('')).toBe('')
    })

    it('handles exact max length', () => {
      const exact = 'A'.repeat(120)
      expect(truncateDescription(exact)).toBe(exact)
    })
  })

  describe('getTypeIcon', () => {
    it('returns correct icon for known types', () => {
      expect(getTypeIcon('book')).toBe('📚')
      expect(getTypeIcon('podcast')).toBe('🎙️')
      expect(getTypeIcon('newsletter')).toBe('📰')
      expect(getTypeIcon('article')).toBe('📄')
      expect(getTypeIcon('note')).toBe('📝')
      expect(getTypeIcon('til')).toBe('💡')
      expect(getTypeIcon('moc')).toBe('🗺️')
      expect(getTypeIcon('tweet')).toBe('🐦')
      expect(getTypeIcon('video')).toBe('🎬')
    })

    it('returns note icon for unknown types', () => {
      expect(getTypeIcon('unknown')).toBe('📝')
      expect(getTypeIcon('')).toBe('📝')
      expect(getTypeIcon('random-type')).toBe('📝')
    })
  })

  describe('TYPE_ICONS', () => {
    it('exports all expected content types', () => {
      const expectedTypes = ['book', 'podcast', 'newsletter', 'article', 'note', 'til', 'moc', 'tweet', 'video']
      for (const type of expectedTypes) {
        expect(TYPE_ICONS[type]).toBeDefined()
      }
    })
  })

  describe('createOgImageMarkup', () => {
    it('creates valid Satori element structure', () => {
      const result = createOgImageMarkup('Test Title', 'Test description', 'book', 'Second Brain')

      expect(result.type).toBe('div')
      expect(result.props).toBeDefined()
      expect(result.props.style).toBeDefined()
      expect(result.props.children).toBeDefined()
    })

    it('includes title in markup', () => {
      const result = createOgImageMarkup('My Test Title', '', 'note', 'Site')

      const markup = JSON.stringify(result)
      expect(markup).toContain('My Test Title')
    })

    it('includes type in markup', () => {
      const result = createOgImageMarkup('Title', '', 'podcast', 'Site')

      const markup = JSON.stringify(result)
      expect(markup).toContain('podcast')
    })

    it('includes site name in markup', () => {
      const result = createOgImageMarkup('Title', '', 'note', 'My Custom Site')

      const markup = JSON.stringify(result)
      expect(markup).toContain('My Custom Site')
    })

    it('includes description when provided', () => {
      const result = createOgImageMarkup('Title', 'A helpful description', 'note', 'Site')

      const markup = JSON.stringify(result)
      expect(markup).toContain('A helpful description')
    })

    it('truncates long descriptions', () => {
      const longDesc = 'A'.repeat(200)
      const result = createOgImageMarkup('Title', longDesc, 'note', 'Site')

      const markup = JSON.stringify(result)
      expect(markup).toContain('...')
      expect(markup).not.toContain('A'.repeat(200))
    })

    it('uses correct icon for content type', () => {
      const result = createOgImageMarkup('Title', '', 'book', 'Site')

      const markup = JSON.stringify(result)
      expect(markup).toContain('📚')
    })

    it('uses fallback icon for unknown type', () => {
      const result = createOgImageMarkup('Title', '', 'unknown-type', 'Site')

      const markup = JSON.stringify(result)
      expect(markup).toContain('📝')
    })

    it('has correct root element styles', () => {
      const result = createOgImageMarkup('Title', '', 'note', 'Site')

      expect(result.props.style).toMatchObject({
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
      })
    })

    it('includes gradient background', () => {
      const result = createOgImageMarkup('Title', '', 'note', 'Site')

      expect(result.props.style?.background).toContain('linear-gradient')
      expect(result.props.style?.background).toContain('#1a1a2e')
    })

    it('includes brand domain in footer', () => {
      const result = createOgImageMarkup('Title', '', 'note', 'Site')

      const markup = JSON.stringify(result)
      expect(markup).toContain('second-brain.dev')
    })

    it('includes brain emoji in branding', () => {
      const result = createOgImageMarkup('Title', '', 'note', 'Site')

      const markup = JSON.stringify(result)
      expect(markup).toContain('🧠')
    })
  })
})
