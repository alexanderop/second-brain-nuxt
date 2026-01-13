/**
 * Server-side feature toggle utilities.
 */

import {
  featuresConfig,
  type FeatureName,
} from '~~/features.config'
import {
  createRuleContext,
  isFeatureEnabled,
  isVariantEnabled,
} from '~~/app/utils/featureTogglesLogic'

/**
 * Check if a feature is enabled on the server.
 *
 * @example
 * if (!isServerFeatureEnabled('chat')) {
 *   throw createError({ statusCode: 404 })
 * }
 */
export function isServerFeatureEnabled(featureName: FeatureName): boolean {
  const ctx = createRuleContext(import.meta.dev)
  return isFeatureEnabled(featuresConfig[featureName], ctx)
}

/**
 * Check if a feature variant is enabled on the server.
 */
export function isServerVariantEnabled(
  featureName: FeatureName,
  variant: string,
): boolean {
  const ctx = createRuleContext(import.meta.dev)
  return isVariantEnabled(featuresConfig[featureName], variant, ctx)
}
