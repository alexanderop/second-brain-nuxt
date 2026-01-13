import type { Rule } from 'eslint'
import { parseFrontmatter } from '../utils/parse-frontmatter.ts'
import { findSimilarSlug, getSlugCache } from '../utils/slug-cache.ts'
import type { MdastNode, YamlNode } from '../utils/types.ts'

// Regex for [[slug]] or [[slug|display text]] wiki-links
const WIKI_LINK_REGEX = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g

const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Validate wiki-link references exist in content/',
      recommended: true,
    },
    messages: {
      brokenLink: 'Wiki-link [[{{slug}}]] references non-existent note',
      suggestLink: 'Wiki-link [[{{slug}}]] not found. Did you mean [[{{suggestion}}]]?',
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
    const cache = getSlugCache(options.contentPath)
    const reportedSlugs = new Set<string>()

    function reportBrokenLink(node: MdastNode, slug: string): void {
      const suggestion = findSimilarSlug(slug, cache.notes)
      const messageId = suggestion ? 'suggestLink' : 'brokenLink'
      const data = suggestion ? { slug, suggestion } : { slug }
      context.report({ loc: node.position, messageId, data })
    }

    function checkWikiLinks(text: string, node: MdastNode): void {
      let match
      while ((match = WIKI_LINK_REGEX.exec(text)) !== null) {
        const rawSlug = match[1].trim()
        // Strip anchor (e.g., "atomic-habits#Key Insights" -> "atomic-habits")
        const slug = rawSlug.split('#')[0]
        if (reportedSlugs.has(rawSlug)) continue

        // Check notes first
        if (cache.notes.has(slug)) continue

        // Check authors (handles both "andy-matuschak" and "authors/andy-matuschak")
        const authorSlug = slug.startsWith('authors/') ? slug.slice(8) : slug
        if (cache.authors.has(authorSlug)) continue

        reportedSlugs.add(rawSlug)
        reportBrokenLink(node, rawSlug)
      }
    }

    function traverseNode(node: MdastNode): void {
      if (node.type === 'text' && typeof node.value === 'string') {
        checkWikiLinks(node.value, node)
      }
      if (Array.isArray(node.children)) {
        for (const child of node.children) {
          traverseNode(child)
        }
      }
    }

    return {
      yaml(node: YamlNode) {
        const frontmatter = parseFrontmatter(node)
        if (!frontmatter) return

        const textFields = ['summary', 'notes']
        for (const field of textFields) {
          const value = frontmatter[field]
          if (typeof value === 'string') {
            checkWikiLinks(value, node)
          }
        }
      },

      root(node: MdastNode) {
        if (!Array.isArray(node.children)) return
        for (const child of node.children) {
          if (child.type === 'yaml') continue
          traverseNode(child)
        }
      },
    }
  },
}

export default rule
