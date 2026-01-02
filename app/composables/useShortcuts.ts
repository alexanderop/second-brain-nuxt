export interface Shortcut {
  keys: string[]
  description: string
  category: 'navigation' | 'actions' | 'general'
}

// Shortcuts data for help modal display
export const shortcutsList: Shortcut[] = [
  { keys: ['?'], description: 'Show keyboard shortcuts', category: 'general' },
  { keys: ['meta', 'K'], description: 'Open search', category: 'general' },
  { keys: ['G', 'H'], description: 'Go to home', category: 'navigation' },
  { keys: ['G', 'B'], description: 'Go to books', category: 'navigation' },
  { keys: ['G', 'G'], description: 'Go to graph', category: 'navigation' },
  { keys: ['G', 'T'], description: 'Go to tags', category: 'navigation' },
  { keys: ['G', 'A'], description: 'Go to authors', category: 'navigation' },
  { keys: ['J'], description: 'Next item', category: 'actions' },
  { keys: ['K'], description: 'Previous item', category: 'actions' },
  { keys: ['Enter'], description: 'Open selected', category: 'actions' },
  { keys: ['Esc'], description: 'Close modal / go back', category: 'general' },
]

// Shared modal state
export function useShortcutsModal() {
  return useState('shortcutsModalOpen', () => false)
}
