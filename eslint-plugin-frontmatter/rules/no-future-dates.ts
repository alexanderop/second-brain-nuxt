import type { Rule } from 'eslint'
import { parseFrontmatter } from '../utils/parse-frontmatter.ts'
import type { YamlNode } from '../utils/types.ts'

const DATE_FORMAT_REGEX = /^\d{4}-\d{2}-\d{2}$/

/** Format a Date as YYYY-MM-DD string for comparison. */
function formatDateAsIso(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

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

        if (!DATE_FORMAT_REGEX.test(dateValue)) {
          context.report({
            loc: node.position,
            messageId: 'invalidDate',
            data: { date: dateValue },
          })
          return
        }

        // Compare as strings to avoid timezone issues
        // Both are YYYY-MM-DD format, so string comparison works correctly
        const todayStr = formatDateAsIso(new Date())

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
