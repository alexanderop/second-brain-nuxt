/**
 * Feature Toggle Configuration
 *
 * Features can be:
 * - boolean: Static on/off
 * - function: Dynamic evaluation based on context (isDev, now)
 */

export interface FeatureRuleContext {
  isDev: boolean
  now: Date
}

export type FeatureRule = boolean | ((ctx: FeatureRuleContext) => boolean)

export interface FeatureDefinition {
  enabled: FeatureRule
  variants?: Record<string, FeatureRule>
  description?: string
}

export const featuresConfig = {
  chat: {
    enabled: (ctx: FeatureRuleContext) => ctx.isDev,
    description: 'AI-powered chat for querying knowledge base',
  },
} as const satisfies Record<string, FeatureDefinition>

export type FeatureName = keyof typeof featuresConfig

export type FeatureVariantName<T extends FeatureName> =
  (typeof featuresConfig)[T] extends { variants: infer V }
    ? keyof V
    : never
