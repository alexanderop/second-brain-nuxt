import Anthropic from '@anthropic-ai/sdk'
import type { StreamingError } from './tools'

// HTTP status code to user-friendly message mapping
const STATUS_MESSAGES: Record<number, string> = {
  400: 'Invalid request. Please check your message and try again.',
  401: 'Invalid API key. Please check your ANTHROPIC_API_KEY configuration.',
  403: 'API key does not have permission to use this resource.',
  404: 'The requested resource was not found.',
  413: 'Your message is too large. Please try with less content.',
  429: 'Rate limit exceeded. Please try again in a moment.',
  500: 'The AI service encountered an error. Please try again later.',
  503: 'The AI service is temporarily unavailable. Please try again later.',
  529: 'The AI service is overloaded. Please try again in a moment.',
}

/**
 * Map an error to a user-friendly StreamingError.
 * Pure function - extracts relevant info without side effects.
 */
export function mapApiError(error: unknown): StreamingError {
  if (!(error instanceof Anthropic.APIError)) {
    return {
      message: error instanceof Error ? error.message : 'Failed to get response from AI',
    }
  }

  const message = STATUS_MESSAGES[error.status] || error.message || `API error (${error.status})`
  const retryAfterHeader = error.headers?.['retry-after']
  const retryAfter = retryAfterHeader ? Number.parseInt(retryAfterHeader, 10) : undefined
  const requestId = error.headers?.['request-id'] ?? undefined

  return { message, retryAfter, requestId }
}

/**
 * Check if an error is an Anthropic API error.
 * Type guard for error handling.
 */
export function isAnthropicError(error: unknown): error is InstanceType<typeof Anthropic.APIError> {
  return error instanceof Anthropic.APIError
}
