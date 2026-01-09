/**
 * Query builder mock helpers for integration tests
 *
 * Creates chainable mocks that mimic queryCollection's API
 * for testing pages that use Nuxt Content
 */

import type { ContentFixture } from './content'

interface ChainableQuery<T> {
  order: (field: string, direction?: 'ASC' | 'DESC') => ChainableQuery<T>
  limit: (count: number) => ChainableQuery<T>
  where: (field: string, operator: string, value: unknown) => ChainableQuery<T>
  path: (path: string) => ChainableQuery<T>
  select: (...fields: string[]) => ChainableQuery<T>
  all: () => Promise<T[]>
  first: () => Promise<T | null>
}

/**
 * Creates a chainable mock that mimics queryCollection's API
 *
 * @example
 * queryCollectionMock.mockImplementation(createQueryCollectionMock(multipleLinks))
 * const page = await mountSuspended(IndexPage)
 */
export function createQueryCollectionMock<T = ContentFixture>(data: T[]): () => ChainableQuery<T> {
  return () => {
    const chainable: ChainableQuery<T> = {
      order: () => chainable,
      limit: () => chainable,
      where: () => chainable,
      path: () => chainable,
      select: () => chainable,
      all: () => Promise.resolve(data),
      first: () => Promise.resolve(data[0] ?? null),
    }
    return chainable
  }
}

/**
 * Creates a mock that returns different data based on path
 *
 * @example
 * queryCollectionMock.mockImplementation(
 *   createPathAwareQueryMock({ '/note-a': noteAData, '/note-b': noteBData })
 * )
 */
export function createPathAwareQueryMock<T = ContentFixture>(
  pathToData: Record<string, T | null>,
): () => ChainableQuery<T> {
  return () => {
    let currentPath: string | null = null

    const chainable: ChainableQuery<T> = {
      order: () => chainable,
      limit: () => chainable,
      where: () => chainable,
      path: (path: string) => {
        currentPath = path
        return chainable
      },
      select: () => chainable,
      all: () => {
        const data = currentPath ? pathToData[currentPath] : null
        return Promise.resolve(data ? [data] : [])
      },
      first: () => {
        const data = currentPath ? pathToData[currentPath] : null
        return Promise.resolve(data ?? null)
      },
    }
    return chainable
  }
}

/**
 * Creates an empty query collection mock (returns no data)
 */
export function createEmptyQueryMock<T = ContentFixture>(): () => ChainableQuery<T> {
  return createQueryCollectionMock<T>([])
}

/**
 * Creates a mock that handles multiple collections with different data
 *
 * @example
 * queryCollectionMock.mockImplementation(
 *   createMultiCollectionMock({
 *     content: { path: { '/note-a': noteAData } },
 *     podcasts: { data: [] },
 *     authors: { data: [] },
 *   })
 * )
 */
export function createMultiCollectionMock(
  collections: Record<string, {
    data?: unknown[]
    path?: Record<string, unknown | null>
  }>,
): (collectionName: string) => ChainableQuery<unknown> {
  return (collectionName: string) => {
    const config = collections[collectionName] ?? { data: [] }
    let currentPath: string | null = null

    const chainable: ChainableQuery<unknown> = {
      order: () => chainable,
      limit: () => chainable,
      where: () => chainable,
      path: (path: string) => {
        currentPath = path
        return chainable
      },
      select: () => chainable,
      all: () => {
        if (config.path && currentPath) {
          const item = config.path[currentPath]
          return Promise.resolve(item ? [item] : [])
        }
        return Promise.resolve(config.data ?? [])
      },
      first: () => {
        if (config.path && currentPath) {
          return Promise.resolve(config.path[currentPath] ?? null)
        }
        return Promise.resolve(config.data?.[0] ?? null)
      },
    }
    return chainable
  }
}
