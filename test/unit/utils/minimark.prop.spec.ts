import fc from 'fast-check';
import { describe, it, expect } from 'vitest';

import { extractLinksFromMinimark, extractLinksFromBody } from '../../../server/utils/minimark';

/** Create an arbitrary for minimark anchor nodes with internal hrefs */
function internalAnchorArb() {
  const hrefArb = fc.string({ minLength: 1 }).map((s) => `/${s.replace(/[#?]/g, '')}`);
  return hrefArb.map((href): unknown => ['a', { href }, 'link text']);
}

describe('extractLinksFromMinimark (property-based)', () => {
  it('property: always returns an array (never throws for any input)', () => {
    fc.assert(
      fc.property(fc.anything(), (input) => {
        const result = extractLinksFromMinimark(input);
        expect(Array.isArray(result)).toBe(true);
      }),
    );
  });

  it('property: result never includes external links (no items starting with http)', () => {
    fc.assert(
      fc.property(internalAnchorArb(), (node) => {
        const result = extractLinksFromMinimark(node);
        for (const link of result) {
          expect(link.startsWith('http')).toBe(false);
        }
      }),
    );
  });

  it('property: result items never start with / (slugs are stripped of leading slash)', () => {
    fc.assert(
      fc.property(internalAnchorArb(), (node) => {
        const result = extractLinksFromMinimark(node);
        for (const link of result) {
          expect(link.startsWith('/')).toBe(false);
        }
      }),
    );
  });
});

describe('extractLinksFromBody (property-based)', () => {
  it('property: returns empty array for non-object input', () => {
    const nonObjectArb = fc.oneof(
      fc.constant(null),
      fc.constant(undefined),
      fc.string(),
      fc.integer(),
      fc.boolean(),
    );

    fc.assert(
      fc.property(nonObjectArb, (input) => {
        const result = extractLinksFromBody(input);
        expect(result).toEqual([]);
      }),
    );
  });
});
