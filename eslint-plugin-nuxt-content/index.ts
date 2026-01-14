import type { ESLint, Rule } from 'eslint'
import requireAsyncData from './rules/require-async-data.ts'

const rules: Record<string, Rule.RuleModule> = {
  'require-async-data': requireAsyncData,
}

const plugin: ESLint.Plugin = {
  meta: {
    name: 'eslint-plugin-nuxt-content',
    version: '1.0.0',
  },
  rules,
}

export default plugin
