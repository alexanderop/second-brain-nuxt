import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import {
  normalizeSlug,
  transformWikiLinks,
  wikiLinkRegex,
} from '../../../server/utils/wikilinks'

describe('normalizeSlug (property-based)', () => {
  it('property: normalizeSlug is idempotent', () => {
    fc.assert(
      fc.property(fc.string(), (s) => {
        expect(normalizeSlug(normalizeSlug(s))).toBe(normalizeSlug(s))
      }),
    )
  })

  it('property: output contains no uppercase letters', () => {
    fc.assert(
      fc.property(fc.string(), (s) => {
        const result = normalizeSlug(s)
        expect(result).toBe(result.toLowerCase())
      }),
    )
  })

  it('property: output contains no leading/trailing whitespace', () => {
    fc.assert(
      fc.property(fc.string(), (s) => {
        const result = normalizeSlug(s)
        expect(result).toBe(result.trim())
      }),
    )
  })
})

describe('transformWikiLinks (property-based)', () => {
  it('property: output produces valid markdown (no unmatched brackets from wiki-links)', () => {
    // Generate strings that contain wiki-links using stringMatching to avoid forbidden chars
    const slugArb = fc.stringMatching(/^[a-z0-9 -]+$/, { minLength: 1 })
    const headingArb = fc.stringMatching(/^[a-z0-9 -]+$/, { minLength: 1 })
    const displayArb = fc.stringMatching(/^[a-z0-9 -]+$/, { minLength: 1 })

    const wikiLinkArb = fc.record({
      slug: slugArb,
      heading: fc.option(headingArb),
      display: fc.option(displayArb),
    }).map(({ slug, heading, display }) => {
      let link = `[[${slug}`
      if (heading) link += `#${heading}`
      if (display) link += `|${display}`
      link += ']]'
      return link
    })

    fc.assert(
      fc.property(wikiLinkArb, (input) => {
        const result = transformWikiLinks(input)
        // The result should not contain [[ since the wiki-link should be consumed
        expect(result).not.toContain('[[')
      }),
    )
  })

  it('property: is a no-op when input has no wiki-links', () => {
    // Generate strings that definitely don't contain wiki-links
    const noWikiLinkArb = fc.string().filter((s) => {
      wikiLinkRegex.lastIndex = 0
      return !wikiLinkRegex.test(s)
    })

    fc.assert(
      fc.property(noWikiLinkArb, (input) => {
        expect(transformWikiLinks(input)).toBe(input)
      }),
    )
  })

  it('property: output never contains [[ (all wiki-links consumed)', () => {
    fc.assert(
      fc.property(fc.string(), (input) => {
        const result = transformWikiLinks(input)
        // After transformation, no valid wiki-links should remain
        wikiLinkRegex.lastIndex = 0
        expect(wikiLinkRegex.test(result)).toBe(false)
      }),
    )
  })
})
