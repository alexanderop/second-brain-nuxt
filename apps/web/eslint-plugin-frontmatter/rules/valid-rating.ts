import type { Rule } from 'eslint'
import { parseFrontmatter } from '../utils/parse-frontmatter.ts'
import type { YamlNode } from '../utils/types.ts'

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Validate rating is within 1-10 range',
      recommended: true,
    },
    messages: {
      outOfRange: 'Rating {{value}} is out of range (must be {{min}}-{{max}})',
      notNumber: 'Rating must be a number, got {{type}}',
    },
    schema: [{
      type: 'object',
      properties: {
        min: { type: 'number', default: 1 },
        max: { type: 'number', default: 10 },
      },
      additionalProperties: false,
    }],
  },

  create(context) {
    const options = {
      min: 1,
      max: 10,
      ...context.options[0],
    }

    return {
      yaml(node: YamlNode) {
        const frontmatter = parseFrontmatter(node)
        if (!frontmatter) {
          return
        }

        if (frontmatter.rating === undefined) {
          return
        }

        const rating = frontmatter.rating

        if (typeof rating !== 'number') {
          context.report({
            loc: node.position,
            messageId: 'notNumber',
            data: { type: typeof rating },
          })
          return
        }

        if (rating < options.min || rating > options.max) {
          context.report({
            loc: node.position,
            messageId: 'outOfRange',
            data: {
              value: String(rating),
              min: String(options.min),
              max: String(options.max),
            },
          })
        }
      },
    }
  },
}

export default rule
