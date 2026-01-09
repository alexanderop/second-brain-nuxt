import type { Ref } from 'vue'

export type AuthorAction =
  | { type: 'none' }
  | { type: 'single', url: string, slug: string }
  | { type: 'multiple', authors: string[] }

export function getAuthorUrl(slug: string): string {
  return `/authors/${encodeURIComponent(slug)}`
}

export function getAuthorAction(authors: string[] | undefined): AuthorAction {
  if (!authors || authors.length === 0) {
    return { type: 'none' }
  }
  if (authors.length === 1) {
    const slug = authors[0]
    if (slug) {
      return { type: 'single', url: getAuthorUrl(slug), slug }
    }
  }
  return { type: 'multiple', authors }
}

interface UseAuthorShortcutReturn {
  handleShortcut: () => AuthorAction
  openAuthor: (slug: string) => void
  getAuthorAction: typeof getAuthorAction
}

export function useAuthorShortcut(authors: Ref<string[] | undefined>): UseAuthorShortcutReturn {
  function openAuthor(slug: string): void {
    window.open(getAuthorUrl(slug), '_blank')
  }

  function handleShortcut(): AuthorAction {
    const action = getAuthorAction(authors.value)
    if (action.type === 'single') {
      openAuthor(action.slug)
    }
    return action
  }

  return { handleShortcut, openAuthor, getAuthorAction }
}
