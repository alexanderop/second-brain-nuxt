import type { Rule } from 'eslint'
import { parseFrontmatter } from '../utils/parse-frontmatter.ts'
import type { FrontmatterData, YamlNode } from '../utils/types.ts'

const DEFAULT_EXTERNAL_TYPES = [
  'youtube', 'podcast', 'article', 'book', 'manga',
  'movie', 'tv', 'tweet', 'course', 'reddit', 'github',
]

interface Options {
  externalTypes: string[]
  typeSpecificFields: Record<string, string[]>
}

function checkAuthorsForExternalType(
  frontmatter: FrontmatterData,
  contentType: string,
  context: Rule.RuleContext,
  node: YamlNode,
): void {
  // Tweets use 'author' (singular)
  if (contentType === 'tweet') {
    const hasAuthor = typeof frontmatter.author === 'string' && frontmatter.author.trim()
    if (!hasAuthor) {
      context.report({
        loc: node.position,
        messageId: 'missingField',
        data: { type: contentType, field: 'author' },
      })
    }
    return
  }

  // Others use 'authors' (array)
  const hasAuthors = Array.isArray(frontmatter.authors) && frontmatter.authors.length > 0
  if (!hasAuthors) {
    context.report({
      loc: node.position,
      messageId: 'emptyAuthors',
      data: { type: contentType },
    })
  }
}

function checkTypeSpecificFields(
  frontmatter: FrontmatterData,
  contentType: string,
  options: Options,
  context: Rule.RuleContext,
  node: YamlNode,
): void {
  const requiredFields = options.typeSpecificFields[contentType]
  if (!requiredFields) return

  for (const field of requiredFields) {
    const value = frontmatter[field]
    const isEmpty = value === undefined || value === null || value === ''
    if (!isEmpty) continue

    context.report({
      loc: node.position,
      messageId: 'missingField',
      data: { type: contentType, field },
    })
  }
}

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce required fields based on content type',
      recommended: true,
    },
    messages: {
      missingField: 'Content type "{{type}}" requires field "{{field}}"',
      missingType: 'Missing required field "type"',
      missingTitle: 'Missing required field "title"',
      emptyAuthors: 'Content type "{{type}}" requires at least one author',
    },
    schema: [{
      type: 'object',
      properties: {
        externalTypes: { type: 'array', items: { type: 'string' } },
        typeSpecificFields: { type: 'object', additionalProperties: { type: 'array', items: { type: 'string' } } },
      },
      additionalProperties: false,
    }],
  },

  create(context) {
    const options: Options = {
      externalTypes: DEFAULT_EXTERNAL_TYPES,
      typeSpecificFields: {
        manga: ['volumes', 'status'],
        tweet: ['tweetId', 'tweetUrl', 'tweetText', 'author', 'tweetedAt'],
      },
      ...context.options[0],
    }

    return {
      yaml(node: YamlNode) {
        const frontmatter = parseFrontmatter(node)
        if (!frontmatter) return

        // Check for required title
        const hasTitle = frontmatter.title && typeof frontmatter.title === 'string' && frontmatter.title.trim()
        if (!hasTitle) {
          context.report({ loc: node.position, messageId: 'missingTitle' })
        }

        // Check for required type
        if (!frontmatter.type) {
          context.report({ loc: node.position, messageId: 'missingType' })
          return
        }

        const contentType = frontmatter.type

        // Check authors for external content types
        if (options.externalTypes.includes(contentType)) {
          checkAuthorsForExternalType(frontmatter, contentType, context, node)
        }

        // Check type-specific required fields
        checkTypeSpecificFields(frontmatter, contentType, options, context, node)
      },
    }
  },
}

export default rule
