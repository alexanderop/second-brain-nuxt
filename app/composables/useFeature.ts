import { computed, readonly } from 'vue'
import {
  featuresConfig,
  type FeatureName,
} from '~~/features.config'
import {
  createRuleContext,
  isFeatureEnabled,
  isVariantEnabled,
  getEnabledVariants,
} from '~/utils/featureTogglesLogic'

/**
 * Composable for checking feature flags.
 *
 * @example
 * const { isEnabled } = useFeature('chat')
 * if (isEnabled.value) { ... }
 *
 * @example
 * const { isVariantActive } = useFeature('search')
 * if (isVariantActive('ai')) { ... }
 */
export function useFeature(featureName: FeatureName) {
  const definition = featuresConfig[featureName]
  const ctx = createRuleContext(import.meta.dev)

  const isEnabled = computed(() => isFeatureEnabled(definition, ctx))

  function isVariantActive(variant: string): boolean {
    return isVariantEnabled(definition, variant, ctx)
  }

  const enabledVariants = computed(() => getEnabledVariants(definition, ctx))

  return {
    isEnabled: readonly(isEnabled),
    isVariantActive,
    enabledVariants: readonly(enabledVariants),
    description: definition.description ?? '',
  }
}

/**
 * Simple one-shot feature check for use outside Vue reactivity.
 */
export function checkFeature(featureName: FeatureName): boolean {
  const definition = featuresConfig[featureName]
  const ctx = createRuleContext(import.meta.dev)
  return isFeatureEnabled(definition, ctx)
}

/**
 * Simple one-shot variant check.
 */
export function checkVariant(featureName: FeatureName, variant: string): boolean {
  const definition = featuresConfig[featureName]
  const ctx = createRuleContext(import.meta.dev)
  return isVariantEnabled(definition, variant, ctx)
}
