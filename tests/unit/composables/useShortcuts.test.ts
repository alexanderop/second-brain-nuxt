import { describe, expect, it } from 'vitest'
import { shortcutsList, type Shortcut } from '../../../app/composables/useShortcuts'

describe('shortcutsList', () => {
  it('exports an array of shortcuts', () => {
    expect(Array.isArray(shortcutsList)).toBe(true)
    expect(shortcutsList.length).toBeGreaterThan(0)
  })

  it('has valid structure for each shortcut', () => {
    const validCategories = ['navigation', 'actions', 'general']

    shortcutsList.forEach((shortcut: Shortcut) => {
      // Each shortcut should have keys array
      expect(Array.isArray(shortcut.keys)).toBe(true)
      expect(shortcut.keys.length).toBeGreaterThan(0)

      // Each shortcut should have a description
      expect(typeof shortcut.description).toBe('string')
      expect(shortcut.description.length).toBeGreaterThan(0)

      // Each shortcut should have a valid category
      expect(validCategories).toContain(shortcut.category)
    })
  })

  it('contains expected navigation shortcuts', () => {
    const navShortcuts = shortcutsList.filter(s => s.category === 'navigation')
    expect(navShortcuts.length).toBeGreaterThan(0)

    // Should have go-to-home shortcut
    const homeShortcut = navShortcuts.find(s => s.description.toLowerCase().includes('home'))
    expect(homeShortcut).toBeDefined()

    // Should have go-to-books shortcut
    const booksShortcut = navShortcuts.find(s => s.description.toLowerCase().includes('books'))
    expect(booksShortcut).toBeDefined()
    expect(booksShortcut?.keys).toEqual(['G', 'B'])
  })

  it('contains expected general shortcuts', () => {
    const generalShortcuts = shortcutsList.filter(s => s.category === 'general')
    expect(generalShortcuts.length).toBeGreaterThan(0)

    // Should have search shortcut
    const searchShortcut = generalShortcuts.find(s => s.description.toLowerCase().includes('search'))
    expect(searchShortcut).toBeDefined()

    // Should have keyboard shortcuts help
    const helpShortcut = generalShortcuts.find(s => s.description.toLowerCase().includes('shortcut'))
    expect(helpShortcut).toBeDefined()
  })

  it('contains expected action shortcuts', () => {
    const actionShortcuts = shortcutsList.filter(s => s.category === 'actions')
    expect(actionShortcuts.length).toBeGreaterThan(0)

    // Should have next/previous item shortcuts
    const nextShortcut = actionShortcuts.find(s => s.description.toLowerCase().includes('next'))
    expect(nextShortcut).toBeDefined()

    const prevShortcut = actionShortcuts.find(s => s.description.toLowerCase().includes('previous'))
    expect(prevShortcut).toBeDefined()
  })

  it('has unique key combinations', () => {
    const keyCombos = shortcutsList.map(s => s.keys.join('+'))
    const uniqueCombos = new Set(keyCombos)
    expect(uniqueCombos.size).toBe(keyCombos.length)
  })
})
