import { describe, expect, it } from 'vitest'
import { mapApiError } from '../../../../server/utils/chat/errors'

describe('mapApiError', () => {
  it('handles generic Error', () => {
    const error = new Error('Something went wrong')
    const result = mapApiError(error)
    expect(result.message).toBe('Something went wrong')
    expect(result.retryAfter).toBeUndefined()
    expect(result.requestId).toBeUndefined()
  })

  it('handles non-Error objects', () => {
    const result = mapApiError('string error')
    expect(result.message).toBe('Failed to get response from AI')
  })

  it('handles null', () => {
    const result = mapApiError(null)
    expect(result.message).toBe('Failed to get response from AI')
  })

  it('handles undefined', () => {
    const result = mapApiError(undefined)
    expect(result.message).toBe('Failed to get response from AI')
  })

  it('returns StreamingError shape', () => {
    const error = new Error('Test')
    const result = mapApiError(error)
    expect(result).toHaveProperty('message')
    expect(typeof result.message).toBe('string')
  })
})
