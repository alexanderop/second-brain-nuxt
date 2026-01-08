import type { Rule } from 'eslint'
import { parseFrontmatter } from '../utils/parse-frontmatter.ts'
import type { YamlNode } from '../utils/types.ts'

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow future dates in frontmatter',
      recommended: true,
    },
    messages: {
      futureDate: 'Date "{{date}}" is in the future (today is {{today}})',
      invalidDate: 'Date "{{date}}" is not a valid date format',
    },
    schema: [],
  },

  create(context) {
    return {
      yaml(node: YamlNode) {
        const frontmatter = parseFrontmatter(node)
        if (!frontmatter?.date) {
          return
        }

        const dateValue = frontmatter.date
        if (typeof dateValue !== 'string') {
          return
        }

        const parsed = new Date(dateValue)
        if (Number.isNaN(parsed.getTime())) {
          context.report({
            loc: node.position,
            messageId: 'invalidDate',
            data: { date: dateValue },
          })
          return
        }

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        if (parsed > today) {
          context.report({
            loc: node.position,
            messageId: 'futureDate',
            data: {
              date: dateValue,
              today: today.toISOString().split('T')[0],
            },
          })
        }
      },
    }
  },
}

export default rule
