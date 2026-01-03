import type { Rule } from 'eslint'
import { parseFrontmatter } from '../utils/parse-frontmatter.ts'
import { findSimilarSlug, getSlugCache } from '../utils/slug-cache.ts'
import type { YamlNode } from '../utils/types.ts'

function validateAuthorSlugs(
  slugs: unknown[],
  authors: Set<string>,
  context: Rule.RuleContext,
  node: YamlNode,
): void {
  for (const slug of slugs) {
    if (typeof slug !== 'string') continue
    if (cache.authors.has(slug)) continue

    const suggestion = findSimilarSlug(slug, authors)
    const messageId = suggestion ? 'suggestAuthor' : 'unknownAuthor'
    const data = suggestion ? { slug, suggestion } : { slug }

    context.report({ loc: node.position, messageId, data })
  }
}

let cache: ReturnType<typeof getSlugCache>

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Validate author references exist in content/authors/',
      recommended: true,
    },
    messages: {
      unknownAuthor: 'Author "{{slug}}" not found in content/authors/',
      suggestAuthor: 'Author "{{slug}}" not found. Did you mean "{{suggestion}}"?',
    },
    schema: [{
      type: 'object',
      properties: {
        contentPath: { type: 'string', default: 'content' },
      },
      additionalProperties: false,
    }],
  },

  create(context) {
    const options = { contentPath: 'content', ...context.options[0] }
    cache = getSlugCache(options.contentPath)

    return {
      yaml(node: YamlNode) {
        const frontmatter = parseFrontmatter(node)
        if (!frontmatter) return

        // Check authors array (main content)
        if (Array.isArray(frontmatter.authors)) {
          validateAuthorSlugs(frontmatter.authors, cache.authors, context, node)
        }

        // Check author field (singular, for tweets)
        if (typeof frontmatter.author === 'string') {
          validateAuthorSlugs([frontmatter.author], cache.authors, context, node)
        }

        // Check hosts array (podcasts)
        if (Array.isArray(frontmatter.hosts)) {
          validateAuthorSlugs(frontmatter.hosts, cache.authors, context, node)
        }

        // Check guests array (podcast episodes)
        if (Array.isArray(frontmatter.guests)) {
          validateAuthorSlugs(frontmatter.guests, cache.authors, context, node)
        }
      },
    }
  },
}

export default rule
