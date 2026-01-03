import type { Rule } from 'eslint'
import { extractUrlFields, parseFrontmatter } from '../utils/parse-frontmatter.ts'
import type { YamlNode } from '../utils/types.ts'

const DEFAULT_BLOCKED_PATTERNS = [
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  'example.com',
  'example.org',
  'example.net',
  'test.com',
  'foo.bar',
  'TODO',
  'FIXME',
  'placeholder',
  'your-url-here',
  'change-me',
]

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
            if (lowerValue.includes(pattern.toLowerCase())) {
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
