import type { ESLint, Rule } from 'eslint'
import noDuplicateTags from './rules/no-duplicate-tags.ts'
import noFutureDates from './rules/no-future-dates.ts'
import noPlaceholderUrls from './rules/no-placeholder-urls.ts'
import requiredFields from './rules/required-fields.ts'
import validAuthorRefs from './rules/valid-author-refs.ts'
import validRating from './rules/valid-rating.ts'
import validTagFormat from './rules/valid-tag-format.ts'
import validUrl from './rules/valid-url.ts'
import validWikiLinks from './rules/valid-wiki-links.ts'

const rules: Record<string, Rule.RuleModule> = {
  'valid-url': validUrl,
  'valid-author-refs': validAuthorRefs,
  'valid-wiki-links': validWikiLinks,
  'valid-tag-format': validTagFormat,
  'required-fields': requiredFields,
  'no-duplicate-tags': noDuplicateTags,
  'no-future-dates': noFutureDates,
  'valid-rating': validRating,
  'no-placeholder-urls': noPlaceholderUrls,
}

const plugin: ESLint.Plugin = {
  meta: {
    name: 'eslint-plugin-frontmatter',
    version: '1.0.0',
  },
  rules,
}

export default plugin

// Re-export utilities for testing
export { getSlugCache, invalidateCache } from './utils/slug-cache.ts'
export { parseFrontmatter } from './utils/parse-frontmatter.ts'
