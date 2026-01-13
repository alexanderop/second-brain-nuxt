import type { Rule } from 'eslint'
import { extractUrlFields, parseFrontmatter } from '../utils/parse-frontmatter.ts'
import type { YamlNode } from '../utils/types.ts'

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Validate URL fields in frontmatter',
      recommended: true,
    },
    messages: {
      invalidUrl: 'Invalid URL "{{url}}" in field "{{field}}"',
      missingProtocol: 'URL "{{url}}" is missing protocol (http:// or https://) in field "{{field}}"',
    },
    schema: [{
      type: 'object',
      properties: {
        fields: {
          type: 'array',
          items: { type: 'string' },
          default: ['url', 'cover', 'website', 'tweetUrl', 'feed', 'artwork'],
        },
        requireProtocol: {
          type: 'boolean',
          default: true,
        },
      },
      additionalProperties: false,
    }],
  },

  create(context) {
    const options = {
      fields: ['url', 'cover', 'website', 'tweetUrl', 'feed', 'artwork'],
      requireProtocol: true,
      ...context.options[0],
    }

    return {
      yaml(node: YamlNode) {
        const frontmatter = parseFrontmatter(node)
        if (!frontmatter) {
          return
        }

        const urlFields = extractUrlFields(frontmatter, options.fields)

        for (const { field, value } of urlFields) {
          // Check for protocol requirement
          if (options.requireProtocol && !value.match(/^https?:\/\//)) {
            context.report({
              loc: node.position,
              messageId: 'missingProtocol',
              data: { url: value, field },
            })
            continue
          }

          // Validate URL structure
          if (!URL.canParse(value)) {
            context.report({
              loc: node.position,
              messageId: 'invalidUrl',
              data: { url: value, field },
            })
          }
        }
      },
    }
  },
}

export default rule
