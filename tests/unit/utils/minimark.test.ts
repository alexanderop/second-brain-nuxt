import { describe, expect, it } from 'vitest'
import { extractLinksFromMinimark, extractLinksFromBody } from '../../../server/utils/minimark'

describe('extractLinksFromMinimark', () => {
  it('extracts internal link from anchor tag', () => {
    const node = ['a', { href: '/atomic-habits' }, 'Atomic Habits']
    expect(extractLinksFromMinimark(node)).toEqual(['atomic-habits'])
  })

  it('ignores external links', () => {
    const node = ['a', { href: 'https://example.com' }, 'External']
    expect(extractLinksFromMinimark(node)).toEqual([])
  })

  it('ignores protocol-relative links', () => {
    const node = ['a', { href: '//example.com' }, 'Protocol Relative']
    expect(extractLinksFromMinimark(node)).toEqual([])
  })

  it('extracts nested links from children', () => {
    const node = ['p', {},
      'See ',
      ['a', { href: '/book-one' }, 'Book One'],
      ' and ',
      ['a', { href: '/book-two' }, 'Book Two'],
    ]
    expect(extractLinksFromMinimark(node)).toEqual(['book-one', 'book-two'])
  })

  it('strips hash from href', () => {
    const node = ['a', { href: '/my-note#section' }, 'Note']
    expect(extractLinksFromMinimark(node)).toEqual(['my-note'])
  })

  it('strips query params from href', () => {
    const node = ['a', { href: '/my-note?ref=1' }, 'Note']
    expect(extractLinksFromMinimark(node)).toEqual(['my-note'])
  })

  it('strips both hash and query from href', () => {
    const node = ['a', { href: '/my-note#section?ref=1' }, 'Note']
    expect(extractLinksFromMinimark(node)).toEqual(['my-note'])
  })

  it('returns empty array for null input', () => {
    expect(extractLinksFromMinimark(null)).toEqual([])
  })

  it('returns empty array for undefined input', () => {
    expect(extractLinksFromMinimark(undefined)).toEqual([])
  })

  it('returns empty array for non-array input', () => {
    expect(extractLinksFromMinimark('string')).toEqual([])
    expect(extractLinksFromMinimark(123)).toEqual([])
    expect(extractLinksFromMinimark({})).toEqual([])
  })

  it('handles deeply nested structure', () => {
    const node = ['div', {},
      ['section', {},
        ['p', {},
          ['strong', {},
            ['a', { href: '/deep-link' }, 'Deep'],
          ],
        ],
      ],
    ]
    expect(extractLinksFromMinimark(node)).toEqual(['deep-link'])
  })

  it('handles anchor without href', () => {
    const node = ['a', {}, 'No href']
    expect(extractLinksFromMinimark(node)).toEqual([])
  })

  it('handles anchor with non-string href', () => {
    const node = ['a', { href: 123 }, 'Number href']
    expect(extractLinksFromMinimark(node)).toEqual([])
  })
})

describe('extractLinksFromBody', () => {
  it('extracts links from minimark body format', () => {
    const body = {
      type: 'minimark',
      value: [
        ['p', {}, ['a', { href: '/test-link' }, 'Test']],
      ],
    }
    expect(extractLinksFromBody(body)).toEqual(['test-link'])
  })

  it('extracts multiple links from body', () => {
    const body = {
      type: 'minimark',
      value: [
        ['p', {}, ['a', { href: '/link-one' }, 'One']],
        ['p', {}, ['a', { href: '/link-two' }, 'Two']],
      ],
    }
    expect(extractLinksFromBody(body)).toEqual(['link-one', 'link-two'])
  })

  it('returns empty for non-minimark body', () => {
    const body = { type: 'html', value: '<p>test</p>' }
    expect(extractLinksFromBody(body)).toEqual([])
  })

  it('returns empty for null body', () => {
    expect(extractLinksFromBody(null)).toEqual([])
  })

  it('returns empty for undefined body', () => {
    expect(extractLinksFromBody(undefined)).toEqual([])
  })

  it('returns empty for non-object body', () => {
    expect(extractLinksFromBody('string')).toEqual([])
    expect(extractLinksFromBody(123)).toEqual([])
  })

  it('returns empty for minimark body without value array', () => {
    const body = { type: 'minimark', value: 'not-array' }
    expect(extractLinksFromBody(body)).toEqual([])
  })

  // Nuxt Content v3 format tests (uses 'children' instead of 'value')
  it('extracts links from Nuxt Content v3 body format with children', () => {
    const body = {
      type: 'root',
      children: [
        ['p', {}, ['a', { href: '/test-link' }, 'Test']],
      ],
    }
    expect(extractLinksFromBody(body)).toEqual(['test-link'])
  })

  it('extracts multiple links from Nuxt Content v3 body', () => {
    const body = {
      type: 'root',
      children: [
        ['p', {}, ['a', { href: '/link-one' }, 'One']],
        ['p', {}, ['a', { href: '/link-two' }, 'Two']],
      ],
    }
    expect(extractLinksFromBody(body)).toEqual(['link-one', 'link-two'])
  })

  it('prioritizes children over value when both exist', () => {
    const body = {
      type: 'root',
      children: [['p', {}, ['a', { href: '/from-children' }, 'Children']]],
      value: [['p', {}, ['a', { href: '/from-value' }, 'Value']]],
    }
    expect(extractLinksFromBody(body)).toEqual(['from-children'])
  })
})
