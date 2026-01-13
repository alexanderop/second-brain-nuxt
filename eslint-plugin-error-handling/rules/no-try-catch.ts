import type { Rule } from 'eslint'

const HELP_MESSAGE = `
Use tryCatch helper functions instead of try-catch blocks for Go/Rust-style error handling.

IMPORTS:
  import { tryCatch, tryCatchAsync, tryAsync } from '~/shared/utils/tryCatch'
  // or relative: '../../shared/utils/tryCatch'

USAGE:
  // Sync operations (JSON.parse, etc.):
  const [error, result] = tryCatch(() => JSON.parse(jsonString))
  if (error) return handleError(error)

  // Async functions:
  const [error, data] = await tryCatchAsync(() => fetchData())
  if (error) return handleError(error)

  // Promises directly:
  const [error, users] = await tryAsync(db.query('SELECT * FROM users'))
  if (error) return handleError(error)

WHY:
  - Forces explicit error handling at call site
  - Type-safe: error is typed, result is null when error exists
  - No hidden control flow jumps
  - Follows Go/Rust error handling patterns
`.trim()

const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce using tryCatch helper instead of try-catch blocks',
      recommended: true,
    },
    messages: {
      noTryCatch: `Avoid try-catch blocks. ${HELP_MESSAGE}`,
    },
    schema: [],
  },

  create(context) {
    return {
      TryStatement(node) {
        context.report({
          node,
          messageId: 'noTryCatch',
        })
      },
    }
  },
}

export default rule
