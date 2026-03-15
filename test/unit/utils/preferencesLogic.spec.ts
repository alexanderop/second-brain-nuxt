import { describe, expect, it } from 'vitest'
import {
  addTermToHistory,
  DEFAULT_GRAPH_SETTINGS,
  type GraphSettings,
} from '../../../app/utils/preferencesLogic'

describe('addTermToHistory', () => {
  it('adds term to front of empty history', () => {
    expect(addTermToHistory([], 'vue')).toEqual(['vue'])
  })

  it('adds term to front of existing history', () => {
    expect(addTermToHistory(['react', 'angular'], 'vue')).toEqual(['vue', 'react', 'angular'])
  })

  it('removes duplicate and moves to front', () => {
    expect(addTermToHistory(['vue', 'react', 'angular'], 'react')).toEqual(['react', 'vue', 'angular'])
  })

  it('handles duplicate at front (no change in order)', () => {
    expect(addTermToHistory(['vue', 'react'], 'vue')).toEqual(['vue', 'react'])
  })

  it('trims whitespace from term', () => {
    expect(addTermToHistory([], '  vue  ')).toEqual(['vue'])
  })

  it('ignores empty term', () => {
    expect(addTermToHistory(['vue'], '')).toEqual(['vue'])
  })

  it('ignores whitespace-only term', () => {
    expect(addTermToHistory(['vue'], '   ')).toEqual(['vue'])
  })

  it('limits history to default max size of 10', () => {
    const longHistory = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']
    const result = addTermToHistory(longHistory, 'new')

    expect(result).toHaveLength(10)
    expect(result[0]).toBe('new')
    expect(result).not.toContain('j') // oldest removed
  })

  it('accepts custom max size', () => {
    const result = addTermToHistory(['a', 'b', 'c'], 'new', 2)
    expect(result).toEqual(['new', 'a'])
  })

  it('handles max size of 1', () => {
    const result = addTermToHistory(['old'], 'new', 1)
    expect(result).toEqual(['new'])
  })

  it('does not mutate original array', () => {
    const original = ['vue', 'react']
    const frozen = Object.freeze([...original])
    addTermToHistory(frozen, 'angular')
    // Object.freeze would throw if mutation attempted
    expect(original).toEqual(['vue', 'react'])
  })

  it('returns copy when term is empty (no mutation)', () => {
    const original = ['vue']
    const result = addTermToHistory(original, '')

    expect(result).not.toBe(original)
    expect(result).toEqual(original)
  })

  it('handles special characters in terms', () => {
    expect(addTermToHistory([], 'C++')).toEqual(['C++'])
    expect(addTermToHistory(['C++'], 'C#')).toEqual(['C#', 'C++'])
  })
})

describe('DEFAULT_GRAPH_SETTINGS', () => {
  it('has expected defaults', () => {
    expect(DEFAULT_GRAPH_SETTINGS).toEqual({
      showLabels: true,
      chargeStrength: -300,
    })
  })

  it('satisfies GraphSettings type', () => {
    const settings: GraphSettings = DEFAULT_GRAPH_SETTINGS
    expect(settings.showLabels).toBe(true)
    expect(settings.chargeStrength).toBe(-300)
  })
})
