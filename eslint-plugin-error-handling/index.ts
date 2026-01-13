import type { ESLint, Rule } from 'eslint'
import noTryCatch from './rules/no-try-catch.ts'

const rules: Record<string, Rule.RuleModule> = {
  'no-try-catch': noTryCatch,
}

const plugin: ESLint.Plugin = {
  meta: {
    name: 'eslint-plugin-error-handling',
    version: '1.0.0',
  },
  rules,
}

export default plugin
