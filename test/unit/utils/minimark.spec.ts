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

  it('ignores root link with only slash', () => {
    const node = ['a', { href: '/' }, 'Home']
    expect(extractLinksFromMinimark(node)).toEqual([])
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

  it('handles href with empty string after processing', () => {
    const node = ['a', { href: '/#' }, 'Hash only']
    expect(extractLinksFromMinimark(node)).toEqual([])
  })

  it('returns empty for array with length 0', () => {
    const node: unknown[] = []
    expect(extractLinksFromMinimark(node)).toEqual([])
  })

  it('returns empty for array with length 1', () => {
    const node = ['a'] // Only tag, no props
    expect(extractLinksFromMinimark(node)).toEqual([])
  })

  it('extracts from array with exactly length 2', () => {
    const node = ['a', { href: '/valid' }] // tag + props, no children
    expect(extractLinksFromMinimark(node)).toEqual(['valid'])
  })

  it('correctly handles boundary between length 1 and 2', () => {
    // Length 1 - should return empty (no props to check)
    const length1 = ['a']
    expect(extractLinksFromMinimark(length1)).toEqual([])

    // Length 2 - should process (has tag and props)
    const length2 = ['a', { href: '/valid' }]
    expect(extractLinksFromMinimark(length2)).toEqual(['valid'])
  })

  it('ignores non-anchor tags with href-like props', () => {
    const node = ['div', { href: '/fake' }, 'Not an anchor']
    expect(extractLinksFromMinimark(node)).toEqual([])
  })

  it('handles anchor with null props', () => {
    const node = ['a', null, 'Null props']
    expect(extractLinksFromMinimark(node)).toEqual([])
  })

  it('handles anchor with array props (wrong type)', () => {
    const node = ['a', ['/link'], 'Array props']
    expect(extractLinksFromMinimark(node)).toEqual([])
  })

  it('handles anchor with undefined props', () => {
    const node = ['a', undefined, 'Undefined props']
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

  it('returns empty for body with children: null', () => {
    const body = { type: 'root', children: null }
    expect(extractLinksFromBody(body)).toEqual([])
  })

  it('returns empty for body with children as string', () => {
    const body = { type: 'root', children: 'not an array' }
    expect(extractLinksFromBody(body)).toEqual([])
  })

  it('returns empty for body with type minimark but no value', () => {
    const body = { type: 'minimark' }
    expect(extractLinksFromBody(body)).toEqual([])
  })

  it('returns empty for body with value but wrong type', () => {
    const body = { type: 'other', value: [['a', { href: '/test' }, 'Test']] }
    expect(extractLinksFromBody(body)).toEqual([])
  })

  it('returns empty for body with value as non-array', () => {
    const body = { type: 'minimark', value: 'not array' }
    expect(extractLinksFromBody(body)).toEqual([])
  })

  it('returns empty for body without type property', () => {
    const body = { value: [['a', { href: '/test' }, 'Test']] }
    expect(extractLinksFromBody(body)).toEqual([])
  })
})
