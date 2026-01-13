/**
 * Go/Rust-style error handling - returns [error, result] tuple
 * Forces callers to explicitly handle the error case
 */

export type Result<T, E = Error> = [E, null] | [null, T]

/**
 * Wraps a synchronous function and returns [error, result] tuple
 *
 * @example
 * const [error, parsed] = tryCatch(() => JSON.parse(jsonString))
 * if (error) return handleError(error)
 * // parsed is now safely typed
 */
export function tryCatch<T, E = Error>(fn: () => T): Result<T, E> {
  try {
    return [null, fn()]
  }
  catch (error) {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- Core error-handling utility requires cast from unknown
    return [error as E, null]
  }
}

/**
 * Wraps an async function and returns [error, result] tuple
 *
 * @example
 * const [error, data] = await tryCatchAsync(() => fetchData())
 * if (error) return handleError(error)
 */
export async function tryCatchAsync<T, E = Error>(
  fn: () => Promise<T>,
): Promise<Result<T, E>> {
  try {
    return [null, await fn()]
  }
  catch (error) {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- Core error-handling utility requires cast from unknown
    return [error as E, null]
  }
}

/**
 * Wraps a promise directly and returns [error, result] tuple
 * Most common use case for async operations
 *
 * @example
 * const [error, users] = await tryAsync(db.query('SELECT * FROM users'))
 * if (error) {
 *   console.error('Query failed:', error)
 *   return []
 * }
 * return users
 */
export async function tryAsync<T, E = Error>(
  promise: Promise<T>,
): Promise<Result<T, E>> {
  try {
    return [null, await promise]
  }
  catch (error) {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- Core error-handling utility requires cast from unknown
    return [error as E, null]
  }
}
