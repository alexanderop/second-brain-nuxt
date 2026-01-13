import { describe, expect, it } from 'vitest'
import {
  createRuleContext,
  evaluateRule,
  isFeatureEnabled,
  isVariantEnabled,
  getEnabledVariants,
} from '../../../app/utils/featureTogglesLogic'
import type { FeatureDefinition, FeatureRuleContext } from '../../../features.config'

describe('createRuleContext', () => {
  it('creates context with isDev true', () => {
    const ctx = createRuleContext(true)
    expect(ctx.isDev).toBe(true)
    expect(ctx.now).toBeInstanceOf(Date)
  })

  it('creates context with isDev false', () => {
    const ctx = createRuleContext(false)
    expect(ctx.isDev).toBe(false)
  })

  it('creates context with current timestamp', () => {
    const before = new Date()
    const ctx = createRuleContext(true)
    const after = new Date()

    expect(ctx.now.getTime()).toBeGreaterThanOrEqual(before.getTime())
    expect(ctx.now.getTime()).toBeLessThanOrEqual(after.getTime())
  })
})

describe('evaluateRule', () => {
  const devCtx = createRuleContext(true)
  const prodCtx = createRuleContext(false)

  it('evaluates static true rule', () => {
    expect(evaluateRule(true, devCtx)).toBe(true)
    expect(evaluateRule(true, prodCtx)).toBe(true)
  })

  it('evaluates static false rule', () => {
    expect(evaluateRule(false, devCtx)).toBe(false)
    expect(evaluateRule(false, prodCtx)).toBe(false)
  })

  it('evaluates function rule based on context', () => {
    const devOnlyRule = (ctx: FeatureRuleContext) => ctx.isDev
    expect(evaluateRule(devOnlyRule, devCtx)).toBe(true)
    expect(evaluateRule(devOnlyRule, prodCtx)).toBe(false)
  })

  it('evaluates complex function rules', () => {
    const timeBasedRule = (ctx: FeatureRuleContext) => ctx.now.getHours() < 12
    const ctx = createRuleContext(false)
    expect(typeof evaluateRule(timeBasedRule, ctx)).toBe('boolean')
  })
})

describe('isFeatureEnabled', () => {
  const devCtx = createRuleContext(true)
  const prodCtx = createRuleContext(false)

  it('returns true for enabled feature', () => {
    const def: FeatureDefinition = { enabled: true }
    expect(isFeatureEnabled(def, devCtx)).toBe(true)
  })

  it('returns false for disabled feature', () => {
    const def: FeatureDefinition = { enabled: false }
    expect(isFeatureEnabled(def, devCtx)).toBe(false)
  })

  it('evaluates function-based enabled rule', () => {
    const def: FeatureDefinition = { enabled: (ctx: FeatureRuleContext) => ctx.isDev }
    expect(isFeatureEnabled(def, devCtx)).toBe(true)
    expect(isFeatureEnabled(def, prodCtx)).toBe(false)
  })
})

describe('isVariantEnabled', () => {
  const devCtx = createRuleContext(true)
  const prodCtx = createRuleContext(false)

  it('returns false if no variants defined', () => {
    const def: FeatureDefinition = { enabled: true }
    expect(isVariantEnabled(def, 'any', devCtx)).toBe(false)
  })

  it('returns false for non-existent variant', () => {
    const def: FeatureDefinition = {
      enabled: true,
      variants: { existing: true },
    }
    expect(isVariantEnabled(def, 'missing', devCtx)).toBe(false)
  })

  it('evaluates static variant rule', () => {
    const def: FeatureDefinition = {
      enabled: true,
      variants: { beta: true, legacy: false },
    }
    expect(isVariantEnabled(def, 'beta', devCtx)).toBe(true)
    expect(isVariantEnabled(def, 'legacy', devCtx)).toBe(false)
  })

  it('evaluates function-based variant rule', () => {
    const def: FeatureDefinition = {
      enabled: true,
      variants: { devOnly: (ctx: FeatureRuleContext) => ctx.isDev },
    }
    expect(isVariantEnabled(def, 'devOnly', devCtx)).toBe(true)
    expect(isVariantEnabled(def, 'devOnly', prodCtx)).toBe(false)
  })
})

describe('getEnabledVariants', () => {
  const devCtx = createRuleContext(true)
  const prodCtx = createRuleContext(false)

  it('returns empty array if no variants', () => {
    const def: FeatureDefinition = { enabled: true }
    expect(getEnabledVariants(def, devCtx)).toEqual([])
  })

  it('returns all enabled variants', () => {
    const def: FeatureDefinition = {
      enabled: true,
      variants: {
        alpha: true,
        beta: true,
        gamma: false,
      },
    }
    expect(getEnabledVariants(def, devCtx)).toEqual(['alpha', 'beta'])
  })

  it('filters variants based on context', () => {
    const def: FeatureDefinition = {
      enabled: true,
      variants: {
        devFeature: (ctx: FeatureRuleContext) => ctx.isDev,
        prodFeature: (ctx: FeatureRuleContext) => !ctx.isDev,
        always: true,
      },
    }
    expect(getEnabledVariants(def, devCtx)).toEqual(['devFeature', 'always'])
    expect(getEnabledVariants(def, prodCtx)).toEqual(['prodFeature', 'always'])
  })
})
