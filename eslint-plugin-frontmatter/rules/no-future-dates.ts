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

        // Validate date format (YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/
        if (!dateRegex.test(dateValue)) {
          context.report({
            loc: node.position,
            messageId: 'invalidDate',
            data: { date: dateValue },
          })
          return
        }

        // Compare as strings to avoid timezone issues
        // Both are YYYY-MM-DD format, so string comparison works correctly
        const now = new Date()
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

        if (dateValue > todayStr) {
          context.report({
            loc: node.position,
            messageId: 'futureDate',
            data: {
              date: dateValue,
              today: todayStr,
            },
          })
        }
      },
    }
  },
}

export default rule
