import type { Rule } from 'eslint'
import { parseFrontmatter } from '../utils/parse-frontmatter.ts'
import type { YamlNode } from '../utils/types.ts'

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Prevent duplicate tags in frontmatter',
      recommended: true,
    },
    messages: {
      duplicateTag: 'Duplicate tag "{{tag}}" found',
    },
    schema: [],
  },

  create(context) {
    return {
      yaml(node: YamlNode) {
        const frontmatter = parseFrontmatter(node)
        if (!frontmatter) {
          return
        }

        if (!Array.isArray(frontmatter.tags)) {
          return
        }

        const seen = new Set<string>()
        const duplicates = new Set<string>()

        for (const tag of frontmatter.tags) {
          if (typeof tag !== 'string') {
            continue
          }

          const normalized = tag.trim().toLowerCase()
          if (!normalized) {
            continue
          }

          if (seen.has(normalized)) {
            duplicates.add(tag)
          }
          seen.add(normalized)
        }

        for (const tag of duplicates) {
          context.report({
            loc: node.position,
            messageId: 'duplicateTag',
            data: { tag },
          })
        }
      },
    }
  },
}

export default rule
