import { describe, expect, it } from 'vitest'
import {
  normalizeSlug,
  transformWikiLink,
  transformWikiLinks,
  wikiLinkRegex,
} from '../../../server/utils/wikilinks'

describe('wikiLinkRegex', () => {
  it('matches simple wiki-link', () => {
    const match = '[[slug]]'.match(wikiLinkRegex)
    expect(match).toHaveLength(1)
    expect(match?.[0]).toBe('[[slug]]')
  })

  it('matches wiki-link with display text', () => {
    const match = '[[slug|Display Text]]'.match(wikiLinkRegex)
    expect(match).toHaveLength(1)
    expect(match?.[0]).toBe('[[slug|Display Text]]')
  })

  it('matches multiple wiki-links', () => {
    const matches = 'See [[foo]] and [[bar]]'.match(wikiLinkRegex)
    expect(matches).toHaveLength(2)
  })

  it('does not match incomplete brackets', () => {
    expect('[slug]'.match(wikiLinkRegex)).toBeNull()
    expect('[[slug'.match(wikiLinkRegex)).toBeNull()
    expect('slug]]'.match(wikiLinkRegex)).toBeNull()
  })

  it('does not match empty brackets', () => {
    expect('[[]]'.match(wikiLinkRegex)).toBeNull()
  })
})

describe('normalizeSlug', () => {
  it('converts to lowercase', () => {
    expect(normalizeSlug('MyNote')).toBe('mynote')
  })

  it('trims whitespace', () => {
    expect(normalizeSlug('  slug  ')).toBe('slug')
  })

  it('replaces spaces with hyphens', () => {
    expect(normalizeSlug('my note title')).toBe('my-note-title')
  })

  it('replaces multiple spaces with single hyphen', () => {
    expect(normalizeSlug('my   note')).toBe('my-note')
  })

  it('handles combined transformations', () => {
    expect(normalizeSlug('  My Note Title  ')).toBe('my-note-title')
  })

  it('handles already normalized slugs', () => {
    expect(normalizeSlug('already-normalized')).toBe('already-normalized')
  })

  it('handles single word', () => {
    expect(normalizeSlug('Note')).toBe('note')
  })
})

describe('transformWikiLink', () => {
  it('transforms simple slug', () => {
    expect(transformWikiLink('slug')).toBe('[slug](/slug){.wiki-link}')
  })

  it('transforms slug with display text', () => {
    expect(transformWikiLink('slug', 'Display Text')).toBe('[Display Text](/slug){.wiki-link}')
  })

  it('normalizes slug in URL', () => {
    expect(transformWikiLink('My Note')).toBe('[My Note](/my-note){.wiki-link}')
  })

  it('preserves original case in display text', () => {
    expect(transformWikiLink('My Note')).toBe('[My Note](/my-note){.wiki-link}')
  })

  it('trims display text', () => {
    expect(transformWikiLink('slug', '  Spaced  ')).toBe('[Spaced](/slug){.wiki-link}')
  })

  it('handles slug with multiple words and custom display', () => {
    expect(transformWikiLink('Local First Software', 'local-first')).toBe('[local-first](/local-first-software){.wiki-link}')
  })
})

describe('transformWikiLinks', () => {
  it('transforms single wiki-link', () => {
    expect(transformWikiLinks('See [[note]]'))
      .toBe('See [note](/note){.wiki-link}')
  })

  it('transforms wiki-link with display text', () => {
    expect(transformWikiLinks('Read [[my-article|this article]]'))
      .toBe('Read [this article](/my-article){.wiki-link}')
  })

  it('transforms multiple wiki-links', () => {
    expect(transformWikiLinks('See [[foo]] and [[bar]]'))
      .toBe('See [foo](/foo){.wiki-link} and [bar](/bar){.wiki-link}')
  })

  it('handles mixed content', () => {
    const input = `# My Note

This references [[another-note]] and also [[third|Third Note]].

Regular [markdown](http://example.com) links stay intact.`

    const expected = `# My Note

This references [another-note](/another-note){.wiki-link} and also [Third Note](/third){.wiki-link}.

Regular [markdown](http://example.com) links stay intact.`

    expect(transformWikiLinks(input)).toBe(expected)
  })

  it('returns unchanged text with no wiki-links', () => {
    const input = 'Just plain text with [regular](http://link.com) markdown'
    expect(transformWikiLinks(input)).toBe(input)
  })

  it('handles empty string', () => {
    expect(transformWikiLinks('')).toBe('')
  })

  it('handles wiki-links with spaces in slug', () => {
    expect(transformWikiLinks('See [[My Cool Note]]'))
      .toBe('See [My Cool Note](/my-cool-note){.wiki-link}')
  })

  it('handles consecutive wiki-links', () => {
    expect(transformWikiLinks('[[foo]][[bar]]'))
      .toBe('[foo](/foo){.wiki-link}[bar](/bar){.wiki-link}')
  })

  it('handles wiki-link at start of text', () => {
    expect(transformWikiLinks('[[note]] is referenced'))
      .toBe('[note](/note){.wiki-link} is referenced')
  })

  it('handles wiki-link at end of text', () => {
    expect(transformWikiLinks('See [[note]]'))
      .toBe('See [note](/note){.wiki-link}')
  })
})
