import type { Rule } from 'eslint'

const HELP_MESSAGE = `
Wrap queryCollection() with useAsyncData() in composables to enable caching.

Without caching, every call triggers a fresh database query - causing slow/broken
behavior on first visit (before PWA service worker caches responses).

WRONG:
  export function useRandomNote() {
    async function navigateToRandomNote() {
      const items = await queryCollection('content').all() // Called every time!
    }
  }

CORRECT:
  export function useRandomNote() {
    const { data } = useAsyncData('key', () => queryCollection('content').all())
    // data.value is cached and available instantly
  }
`.trim()

/**
 * Check if a node is inside a useAsyncData callback
 */
function isInsideUseAsyncData(node: any, ancestors: any[]): boolean {
  for (let i = ancestors.length - 1; i >= 0; i--) {
    const ancestor = ancestors[i]

    // Check if this is a CallExpression with callee 'useAsyncData'
    if (ancestor.type === 'CallExpression') {
      const callee = ancestor.callee
      if (callee.type === 'Identifier' && callee.name === 'useAsyncData') {
        // Check if our node is in the callback (2nd argument)
        const callback = ancestor.arguments[1]
        if (callback && isNodeDescendant(node, callback)) {
          return true
        }
      }
    }
  }
  return false
}

/**
 * Check if targetNode is a descendant of containerNode
 */
function isNodeDescendant(targetNode: any, containerNode: any): boolean {
  // Simple check: if they share the same range/location, target is inside container
  if (!targetNode.range || !containerNode.range) {
    // Fallback: assume true if we can't determine
    return true
  }

  return targetNode.range[0] >= containerNode.range[0] && targetNode.range[1] <= containerNode.range[1]
}

/**
 * Check if this is a client-side queryCollection call (not server-side with event)
 */
function isClientSideQueryCollection(node: any): boolean {
  // Server-side: queryCollection(event, 'collection')
  // Client-side: queryCollection('collection')
  // If first arg is a string literal, it's client-side
  const firstArg = node.arguments[0]
  return firstArg?.type === 'Literal' && typeof firstArg.value === 'string'
}

/**
 * Check if a node is inside a helper function in a Vue component
 * Helper functions might be called from useAsyncData, so we skip them
 * In Vue SFCs, script setup is at Program level, not inside a function
 */
function isInsideHelperFunction(ancestors: any[]): boolean {
  for (const ancestor of ancestors) {
    // Named function declarations are helper functions
    if (ancestor.type === 'FunctionDeclaration') {
      return true
    }
    // Named function expressions (const foo = function() {})
    if (ancestor.type === 'FunctionExpression') {
      return true
    }
  }
  return false
}

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Require queryCollection in composables to be wrapped with useAsyncData',
      recommended: true,
    },
    messages: {
      requireAsyncData: `queryCollection() in composables must be wrapped with useAsyncData() for caching. ${HELP_MESSAGE}`,
    },
    schema: [],
  },

  create(context) {
    const filename = context.filename

    // Apply to composables and Vue components (client-side code)
    const isComposable = filename.includes('/composables/')
    const isVueComponent = filename.endsWith('.vue')

    if (!isComposable && !isVueComponent) {
      return {}
    }

    return {
      CallExpression(node) {
        // Check if this is a queryCollection call
        const callee = node.callee
        if (callee.type !== 'Identifier' || callee.name !== 'queryCollection') {
          return
        }

        // Skip server-side queryCollection (with event parameter)
        if (!isClientSideQueryCollection(node)) {
          return
        }

        const sourceCode = context.sourceCode
        const ancestors = sourceCode.getAncestors(node)

        // For Vue components, skip helper functions
        // They might be called from within useAsyncData which is fine
        if (isVueComponent && isInsideHelperFunction(ancestors)) {
          return
        }

        // Check if it's inside useAsyncData
        if (!isInsideUseAsyncData(node, ancestors)) {
          context.report({
            node,
            messageId: 'requireAsyncData',
          })
        }
      },
    }
  },
}

export default rule
