import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { addTermToHistory } from "../../../app/utils/preferencesLogic";

describe("addTermToHistory (property-based)", () => {
  const historyArb = fc.array(fc.string(), { maxLength: 20 });
  const maxSizeArb = fc.integer({ min: 1, max: 50 });

  it("property: non-empty trimmed term appears at most once in result", () => {
    const nonEmptyArb = fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0);

    fc.assert(
      fc.property(historyArb, nonEmptyArb, maxSizeArb, (history, term, maxSize) => {
        const result = addTermToHistory(history, term, maxSize);
        const trimmed = term.trim();
        const count = result.filter((t) => t === trimmed).length;
        expect(count).toBeLessThanOrEqual(1);
      }),
    );
  });

  it("property: length bounded by maxSize when term is non-empty", () => {
    const nonEmptyArb = fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0);

    fc.assert(
      fc.property(historyArb, nonEmptyArb, maxSizeArb, (history, term, maxSize) => {
        const result = addTermToHistory(history, term, maxSize);
        expect(result.length).toBeLessThanOrEqual(maxSize);
      }),
    );
  });

  it("property: idempotent — adding the same term twice equals adding it once", () => {
    fc.assert(
      fc.property(historyArb, fc.string(), maxSizeArb, (history, term, maxSize) => {
        const once = addTermToHistory(history, term, maxSize);
        const twice = addTermToHistory(once, term, maxSize);
        expect(twice).toEqual(once);
      }),
    );
  });

  it("property: non-empty trimmed term is always at index 0", () => {
    const nonEmptyTrimmedArb = fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0);

    fc.assert(
      fc.property(historyArb, nonEmptyTrimmedArb, maxSizeArb, (history, term, maxSize) => {
        const result = addTermToHistory(history, term, maxSize);
        expect(result[0]).toBe(term.trim());
      }),
    );
  });

  it("property: all items come from original history or the new term", () => {
    fc.assert(
      fc.property(historyArb, fc.string(), maxSizeArb, (history, term, maxSize) => {
        const result = addTermToHistory(history, term, maxSize);
        const allowed = new Set([...history, term.trim()]);
        for (const item of result) {
          expect(allowed.has(item)).toBe(true);
        }
      }),
    );
  });
});
