import { describe, it, expect } from "vite-plus/test";
import fc from "fast-check";
import { extractSlugFromSectionId, findUnlinkedMentions } from "../../../server/utils/mentions";
import type { ContentItem } from "../../../server/utils/graph";

describe("extractSlugFromSectionId (property-based)", () => {
  it("property: never returns a string starting with /", () => {
    fc.assert(
      fc.property(fc.string(), (sectionId) => {
        const result = extractSlugFromSectionId(sectionId);
        expect(result.startsWith("/")).toBe(false);
      }),
    );
  });

  it("property: never contains #", () => {
    fc.assert(
      fc.property(fc.string(), (sectionId) => {
        const result = extractSlugFromSectionId(sectionId);
        expect(result).not.toContain("#");
      }),
    );
  });
});

describe("findUnlinkedMentions (property-based)", () => {
  it("property: returns empty array for targetTitle shorter than 3 chars", () => {
    const shortTitleArb = fc.string({ minLength: 0, maxLength: 2 });

    fc.assert(
      fc.property(shortTitleArb, (shortTitle) => {
        const allContent: ContentItem[] = [];
        const searchSections: { id: string; content?: string }[] = [];
        const result = findUnlinkedMentions(allContent, searchSections, "some-slug", shortTitle);
        expect(result).toEqual([]);
      }),
    );
  });

  it("property: returns empty array for empty targetSlug", () => {
    fc.assert(
      fc.property(fc.string({ minLength: 3 }), (title) => {
        const allContent: ContentItem[] = [];
        const searchSections: { id: string; content?: string }[] = [];
        const result = findUnlinkedMentions(allContent, searchSections, "", title);
        expect(result).toEqual([]);
      }),
    );
  });
});
