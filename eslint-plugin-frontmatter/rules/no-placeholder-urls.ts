import type { Rule } from 'eslint'
import { extractUrlFields, parseFrontmatter } from '../utils/parse-frontmatter.ts'
import type { YamlNode } from '../utils/types.ts'

// Patterns that must match as whole words (use word boundary regex)
const WORD_BOUNDARY_PATTERNS = [
  'TODO',
  'FIXME',
  'placeholder',
]

// Patterns that can match as substrings (domains, IPs)
const SUBSTRING_PATTERNS = [
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  'example.com',
  'example.org',
  'example.net',
  'test.com',
  'foo.bar',
  'your-url-here',
  'change-me',
]

const DEFAULT_BLOCKED_PATTERNS = [...WORD_BOUNDARY_PATTERNS, ...SUBSTRING_PATTERNS]

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Detect placeholder URLs in frontmatter',
      recommended: true,
    },
    messages: {
      placeholderUrl: 'URL "{{url}}" in field "{{field}}" appears to be a placeholder (matched: {{pattern}})',
    },
    schema: [{
      type: 'object',
      properties: {
        blockedPatterns: {
          type: 'array',
          items: { type: 'string' },
        },
      },
      additionalProperties: false,
    }],
  },

  create(context) {
    const options = {
      blockedPatterns: DEFAULT_BLOCKED_PATTERNS,
      ...context.options[0],
    }

    return {
      yaml(node: YamlNode) {
        const frontmatter = parseFrontmatter(node)
        if (!frontmatter) {
          return
        }

        const urlFields = extractUrlFields(frontmatter)

        for (const { field, value } of urlFields) {
          const lowerValue = value.toLowerCase()

          for (const pattern of options.blockedPatterns) {
            const lowerPattern = pattern.toLowerCase()
            const isWordBoundaryPattern = WORD_BOUNDARY_PATTERNS
              .map(p => p.toLowerCase())
              .includes(lowerPattern)

            const matched = isWordBoundaryPattern
              ? new RegExp(`\\b${lowerPattern}\\b`, 'i').test(lowerValue)
              : lowerValue.includes(lowerPattern)

            if (matched) {
              context.report({
                loc: node.position,
                messageId: 'placeholderUrl',
                data: { url: value, field, pattern },
              })
              break
            }
          }
        }
      },
    }
  },
}

export default rule
