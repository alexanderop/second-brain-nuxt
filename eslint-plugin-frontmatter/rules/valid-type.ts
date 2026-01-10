import type { Rule } from 'eslint'
import { parseFrontmatter } from '../utils/parse-frontmatter.ts'
import type { YamlNode } from '../utils/types.ts'

const DEFAULT_VALID_TYPES = [
  // External content types
  'youtube',
  'podcast',
  'article',
  'book',
  'manga',
  'movie',
  'tv',
  'tweet',
  'course',
  'reddit',
  'github',
  'newsletter',
  'talk',
  // Personal content types
  'quote',
  'note',
  'evergreen',
  'map',
]

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Validate content type is one of the allowed values',
      recommended: true,
    },
    messages: {
      invalidType: 'Invalid content type "{{type}}". Must be one of: {{allowed}}',
      notString: 'Content type must be a string, got {{actualType}}',
    },
    schema: [{
      type: 'object',
      properties: {
        validTypes: { type: 'array', items: { type: 'string' } },
      },
      additionalProperties: false,
    }],
  },

  create(context) {
    const options = {
      validTypes: DEFAULT_VALID_TYPES,
      ...context.options[0],
    }

    return {
      yaml(node: YamlNode) {
        const frontmatter = parseFrontmatter(node)
        if (!frontmatter) return

        // Skip if type is missing (required-fields rule handles that)
        if (frontmatter.type === undefined) return

        const contentType = frontmatter.type

        if (typeof contentType !== 'string') {
          context.report({
            loc: node.position,
            messageId: 'notString',
            data: { actualType: typeof contentType },
          })
          return
        }

        if (!options.validTypes.includes(contentType)) {
          context.report({
            loc: node.position,
            messageId: 'invalidType',
            data: {
              type: contentType,
              allowed: options.validTypes.join(', '),
            },
          })
        }
      },
    }
  },
}

export default rule
