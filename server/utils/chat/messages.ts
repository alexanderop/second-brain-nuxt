import type Anthropic from '@anthropic-ai/sdk'

type MessageParam = Anthropic.MessageParam
type ContentBlock = Anthropic.ContentBlock
type ToolResultBlockParam = Anthropic.ToolResultBlockParam

export interface HistoryMessage {
  role: 'user' | 'assistant'
  content: string
}

/**
 * Build the initial message array from history and new user message.
 * Pure function - creates a new array without mutation.
 */
export function buildInitialMessages(
  history: HistoryMessage[],
  message: string,
): MessageParam[] {
  return [
    ...history.map((h): MessageParam => ({ role: h.role, content: h.content })),
    { role: 'user', content: message },
  ]
}

/**
 * Append an assistant message with content blocks to the conversation.
 * Pure function - returns new array.
 */
export function appendAssistantMessage(
  messages: MessageParam[],
  content: ContentBlock[],
): MessageParam[] {
  return [
    ...messages,
    { role: 'assistant', content },
  ]
}

/**
 * Append tool results as a user message to the conversation.
 * Pure function - returns new array.
 */
export function appendToolResults(
  messages: MessageParam[],
  toolResults: ToolResultBlockParam[],
): MessageParam[] {
  return [
    ...messages,
    { role: 'user', content: toolResults },
  ]
}
