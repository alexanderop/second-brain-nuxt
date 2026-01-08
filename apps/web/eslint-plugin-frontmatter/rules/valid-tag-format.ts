import type { Rule } from 'eslint'
import { parseFrontmatter } from '../utils/parse-frontmatter.ts'
import type { YamlNode } from '../utils/types.ts'

// Convert any string to kebab-case
function toKebabCase(str: string): string {
  return str
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/[^a-z0-9-]/g, '') // Remove non-alphanumeric except hyphens
    .replace(/-+/g, '-') // Collapse multiple hyphens
    .replace(/^-|-$/g, '') // Trim leading/trailing hyphens
}

// Check if a string is valid kebab-case
function isKebabCase(str: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(str)
}

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce kebab-case lowercase format for tags',
      recommended: true,
    },
    fixable: 'code',
    messages: {
      invalidFormat: 'Tag "{{tag}}" should be kebab-case: "{{suggestion}}"',
      hasWhitespace: 'Tag "{{tag}}" contains whitespace, use kebab-case: "{{suggestion}}"',
      hasUppercase: 'Tag "{{tag}}" should be lowercase: "{{suggestion}}"',
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

        for (const tag of frontmatter.tags) {
          if (typeof tag !== 'string') {
            continue
          }

          const trimmed = tag.trim()
          if (!trimmed) {
            continue
          }

          // Check for whitespace
          if (/\s/.test(trimmed)) {
            context.report({
              loc: node.position,
              messageId: 'hasWhitespace',
              data: { tag: trimmed, suggestion: toKebabCase(trimmed) },
            })
            continue
          }

          // Check for uppercase
          if (/[A-Z]/.test(trimmed)) {
            context.report({
              loc: node.position,
              messageId: 'hasUppercase',
              data: { tag: trimmed, suggestion: toKebabCase(trimmed) },
            })
            continue
          }

          // Check full kebab-case format
          if (!isKebabCase(trimmed)) {
            context.report({
              loc: node.position,
              messageId: 'invalidFormat',
              data: { tag: trimmed, suggestion: toKebabCase(trimmed) },
            })
          }
        }
      },
    }
  },
}

export default rule
