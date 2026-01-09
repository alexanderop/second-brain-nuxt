import { useState } from '#imports'
import { siteConfig } from '~~/site.config'

export interface Shortcut {
  keys: readonly string[]
  description: string
  category: 'navigation' | 'actions' | 'general'
}

// Derive shortcuts list from site config
type GeneralShortcut = (typeof siteConfig.shortcuts.general)[number]
type NavigationShortcut = (typeof siteConfig.shortcuts.navigation)[number]
type ActionShortcut = (typeof siteConfig.shortcuts.actions)[number]

export const shortcutsList: Shortcut[] = [
  ...siteConfig.shortcuts.general.map((s: GeneralShortcut) => ({ ...s, category: 'general' as const })),
  ...siteConfig.shortcuts.navigation.map((s: NavigationShortcut) => ({ ...s, category: 'navigation' as const })),
  ...siteConfig.shortcuts.actions.map((s: ActionShortcut) => ({ ...s, category: 'actions' as const })),
]

// Shared modal state
export function useShortcutsModal() {
  return useState('shortcutsModalOpen', () => false)
}
