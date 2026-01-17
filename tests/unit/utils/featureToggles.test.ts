import { describe, expect, it, vi } from 'vitest'
import { isServerFeatureEnabled, isServerVariantEnabled } from '../../../server/utils/featureToggles'

// Mock the feature config
vi.mock('~~/features.config', () => ({
  featuresConfig: {
    chat: { enabled: true },
    semanticSearch: { enabled: false },
    graph3d: {
      enabled: true,
      variants: {
        experimental: true,
        stable: false,
      },
    },
  },
}))

describe('isServerFeatureEnabled', () => {
  it('returns true for enabled feature', () => {
    expect(isServerFeatureEnabled('chat')).toBe(true)
  })

  it('returns false for disabled feature', () => {
    expect(isServerFeatureEnabled('semanticSearch')).toBe(false)
  })

  it('returns true for feature with variants', () => {
    expect(isServerFeatureEnabled('graph3d')).toBe(true)
  })
})

describe('isServerVariantEnabled', () => {
  it('returns true for enabled variant', () => {
    expect(isServerVariantEnabled('graph3d', 'experimental')).toBe(true)
  })

  it('returns false for disabled variant', () => {
    expect(isServerVariantEnabled('graph3d', 'stable')).toBe(false)
  })
})
