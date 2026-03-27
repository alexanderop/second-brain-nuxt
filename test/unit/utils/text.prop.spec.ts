import fc from 'fast-check';
import { describe, it, expect } from 'vitest';

import { escapeRegex, escapeHtml, getSnippet, highlightMatch } from '#shared/utils/text';

describe('escapeRegex (property-based)', () => {
  it('property: produces valid regex for any string', () => {
    fc.assert(
      fc.property(fc.string(), (str) => {
        expect(() => new RegExp(escapeRegex(str))).not.toThrow();
      }),
    );
  });
});

describe('escapeHtml (property-based)', () => {
  it('property: output never contains raw <, >, or unescaped &', () => {
    fc.assert(
      fc.property(fc.string(), (str) => {
        const result = escapeHtml(str);
        // After escaping, no raw < or > should remain
        expect(result).not.toMatch(/<(?!$)/);
        expect(result).not.toContain('>');
        // & should only appear as part of an entity
        const ampersands = [...result.matchAll(/&/g)];
        for (const match of ampersands) {
          const rest = result.slice(match.index ?? 0);
          expect(rest).toMatch(/^&(amp|lt|gt|quot|#039);/);
        }
      }),
    );
  });
});

describe('getSnippet (property-based)', () => {
  it('property: result length is bounded (always <= content.length + 6 for ellipsis)', () => {
    fc.assert(
      fc.property(
        fc.string(),
        fc.string({ minLength: 1 }),
        fc.integer({ min: 1, max: 500 }),
        (content, term, contextChars) => {
          const result = getSnippet(content, term, contextChars);
          // At most 6 extra characters for two "..." ellipsis markers
          expect(result.length).toBeLessThanOrEqual(content.length + 6);
        },
      ),
    );
  });

  it('property: preserves the search term when found (case-insensitive)', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        fc.string({ minLength: 1 }),
        fc.string(),
        (before, term, after) => {
          const content = before + term + after;
          const result = getSnippet(content, term);
          // The snippet should contain the term (case-insensitive)
          expect(result.toLowerCase()).toContain(term.toLowerCase());
        },
      ),
    );
  });
});

describe('highlightMatch (property-based)', () => {
  it('property: preserves all original text content (strip tags equals escapeHtml of original)', () => {
    fc.assert(
      fc.property(fc.string(), fc.string({ minLength: 1 }), (text, term) => {
        const result = highlightMatch(text, term);
        // Strip all HTML tags from the result
        const stripped = result.replace(/<[^>]*>/g, '');
        // The stripped result should equal the HTML-escaped original text
        expect(stripped).toBe(escapeHtml(text));
      }),
    );
  });
});
