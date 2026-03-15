import { describe, it, expect } from "vite-plus/test";
import fc from "fast-check";
import {
  extractKeywords,
  scoreNote,
  matchesTag,
  filterAndScoreNotes,
} from "../../../../server/utils/chat/search";
import type { RawNote } from "../../../../server/utils/chat/search";

describe("extractKeywords (property-based)", () => {
  it("property: length bounded to at most 8", () => {
    fc.assert(
      fc.property(fc.string(), (message) => {
        const result = extractKeywords(message);
        expect(result.length).toBeLessThanOrEqual(8);
      }),
    );
  });

  it("property: all keywords are lowercase", () => {
    fc.assert(
      fc.property(fc.string(), (message) => {
        const result = extractKeywords(message);
        for (const keyword of result) {
          expect(keyword).toBe(keyword.toLowerCase());
        }
      }),
    );
  });

  it("property: no short words (length > 2)", () => {
    fc.assert(
      fc.property(fc.string(), (message) => {
        const result = extractKeywords(message);
        for (const keyword of result) {
          expect(keyword.length).toBeGreaterThan(2);
        }
      }),
    );
  });

  it("property: no stop words in result", () => {
    const stopWords = new Set([
      "a",
      "an",
      "the",
      "is",
      "are",
      "was",
      "were",
      "be",
      "been",
      "being",
      "have",
      "has",
      "had",
      "do",
      "does",
      "did",
      "will",
      "would",
      "could",
      "should",
      "what",
      "which",
      "who",
      "whom",
      "this",
      "that",
      "these",
      "those",
      "am",
      "or",
      "and",
      "but",
      "if",
      "for",
      "not",
      "no",
      "can",
      "how",
      "all",
      "each",
      "every",
      "both",
      "few",
      "more",
      "most",
      "other",
      "some",
      "such",
      "only",
      "own",
      "same",
      "so",
      "than",
      "too",
      "very",
      "just",
      "about",
      "into",
      "through",
      "during",
      "before",
      "after",
      "above",
      "below",
      "to",
      "from",
      "up",
      "down",
      "in",
      "out",
      "on",
      "off",
      "over",
      "under",
      "again",
      "further",
      "then",
      "once",
      "here",
      "there",
      "when",
      "where",
      "why",
      "any",
      "of",
      "at",
      "by",
      "with",
    ]);

    fc.assert(
      fc.property(fc.string(), (message) => {
        const result = extractKeywords(message);
        for (const keyword of result) {
          expect(stopWords.has(keyword)).toBe(false);
        }
      }),
    );
  });
});

describe("scoreNote (property-based)", () => {
  const rawNoteArb: fc.Arbitrary<RawNote> = fc.record({
    title: fc.option(fc.string(), { nil: undefined }),
    summary: fc.option(fc.string(), { nil: undefined }),
    tags: fc.option(fc.array(fc.string(), { maxLength: 5 }), { nil: undefined }),
  });

  const keywordsArb = fc.array(fc.string({ minLength: 3 }), { maxLength: 5 });

  it("property: score is non-negative", () => {
    fc.assert(
      fc.property(rawNoteArb, keywordsArb, (note, keywords) => {
        expect(scoreNote(note, keywords)).toBeGreaterThanOrEqual(0);
      }),
    );
  });

  it("property: returns 0 for empty keywords", () => {
    fc.assert(
      fc.property(rawNoteArb, (note) => {
        expect(scoreNote(note, [])).toBe(0);
      }),
    );
  });
});

describe("matchesTag (property-based)", () => {
  it("property: returns false for empty tags array", () => {
    fc.assert(
      fc.property(fc.string(), (keyword) => {
        expect(matchesTag([], keyword)).toBe(false);
      }),
    );
  });
});

describe("filterAndScoreNotes (property-based)", () => {
  const rawNoteArb: fc.Arbitrary<RawNote> = fc.record({
    title: fc.option(fc.string(), { nil: undefined }),
    summary: fc.option(fc.string(), { nil: undefined }),
    tags: fc.option(fc.array(fc.string(), { maxLength: 5 }), { nil: undefined }),
    path: fc.option(fc.string(), { nil: undefined }),
    stem: fc.option(fc.string(), { nil: undefined }),
  });

  const notesArb = fc.array(rawNoteArb, { maxLength: 20 });
  const keywordsArb = fc.array(fc.string({ minLength: 3 }), { maxLength: 5 });
  const limitArb = fc.integer({ min: 1, max: 20 });

  it("property: result length <= min(limit, 10)", () => {
    fc.assert(
      fc.property(notesArb, keywordsArb, limitArb, (notes, keywords, limit) => {
        const result = filterAndScoreNotes(notes, keywords, limit);
        expect(result.length).toBeLessThanOrEqual(Math.min(limit, 10));
      }),
    );
  });
});
