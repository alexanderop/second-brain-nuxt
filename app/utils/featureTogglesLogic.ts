/**
 * Pure functions for feature toggle logic.
 * No Vue imports, no side effects - easily testable.
 */

import type {
  FeatureRuleContext,
  FeatureRule,
  FeatureDefinition,
} from '~~/features.config'

/**
 * Create a feature rule context for evaluation.
 */
export function createRuleContext(isDev: boolean): FeatureRuleContext {
  return {
    isDev,
    now: new Date(),
  }
}

/**
 * Evaluate a feature rule with the given context.
 */
export function evaluateRule(
  rule: FeatureRule,
  ctx: FeatureRuleContext,
): boolean {
  return typeof rule === 'function' ? rule(ctx) : rule
}

/**
 * Check if a feature is enabled.
 */
export function isFeatureEnabled(
  definition: FeatureDefinition,
  ctx: FeatureRuleContext,
): boolean {
  return evaluateRule(definition.enabled, ctx)
}

/**
 * Check if a specific variant of a feature is enabled.
 * Returns false if variant doesn't exist.
 */
export function isVariantEnabled(
  definition: FeatureDefinition,
  variantName: string,
  ctx: FeatureRuleContext,
): boolean {
  const rule = definition.variants?.[variantName]
  return rule !== undefined ? evaluateRule(rule, ctx) : false
}

/**
 * Get all enabled variants for a feature.
 */
export function getEnabledVariants(
  definition: FeatureDefinition,
  ctx: FeatureRuleContext,
): string[] {
  const variants = definition.variants
  if (!variants) return []

  return Object.entries(variants)
    .filter(([_, rule]) => evaluateRule(rule, ctx))
    .map(([name]) => name)
}
