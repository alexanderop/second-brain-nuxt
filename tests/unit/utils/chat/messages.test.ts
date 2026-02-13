import { describe, expect, it } from 'vitest'
import type Anthropic from '@anthropic-ai/sdk'
import {
  buildInitialMessages,
  appendAssistantMessage,
  appendToolResults,
  type HistoryMessage,
} from '../../../../server/utils/chat/messages'

describe('buildInitialMessages', () => {
  it('builds message array from empty history and new message', () => {
    const result = buildInitialMessages([], 'Hello')

    expect(result).toEqual([
      { role: 'user', content: 'Hello' },
    ])
  })

  it('builds message array from history and new message', () => {
    const history: HistoryMessage[] = [
      { role: 'user', content: 'First message' },
      { role: 'assistant', content: 'First response' },
    ]

    const result = buildInitialMessages(history, 'Second message')

    expect(result).toEqual([
      { role: 'user', content: 'First message' },
      { role: 'assistant', content: 'First response' },
      { role: 'user', content: 'Second message' },
    ])
  })

  it('does not mutate original history array', () => {
    const history: HistoryMessage[] = [
      { role: 'user', content: 'Test' },
    ]
    const originalLength = history.length

    buildInitialMessages(history, 'New message')

    expect(history.length).toBe(originalLength)
  })
})

describe('appendAssistantMessage', () => {
  it('appends assistant message with content blocks', () => {
    const messages: Anthropic.MessageParam[] = [
      { role: 'user', content: 'Hello' },
    ]
    const content: Anthropic.ContentBlock[] = [
      { type: 'text', text: 'Response' },
    ]

    const result = appendAssistantMessage(messages, content)

    expect(result).toEqual([
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content },
    ])
  })

  it('does not mutate original messages array', () => {
    const messages: Anthropic.MessageParam[] = [
      { role: 'user', content: 'Hello' },
    ]
    const originalLength = messages.length

    appendAssistantMessage(messages, [{ type: 'text', text: 'Response' }])

    expect(messages.length).toBe(originalLength)
  })
})

describe('appendToolResults', () => {
  it('appends tool results as user message', () => {
    const messages: Anthropic.MessageParam[] = [
      { role: 'user', content: 'Search for something' },
      { role: 'assistant', content: [{ type: 'text', text: 'Searching...' }] },
    ]
    const toolResults: Anthropic.ToolResultBlockParam[] = [
      {
        type: 'tool_result',
        tool_use_id: 'tool_123',
        content: 'Search results...',
      },
    ]

    const result = appendToolResults(messages, toolResults)

    expect(result).toEqual([
      { role: 'user', content: 'Search for something' },
      { role: 'assistant', content: [{ type: 'text', text: 'Searching...' }] },
      { role: 'user', content: toolResults },
    ])
  })

  it('does not mutate original messages array', () => {
    const messages: Anthropic.MessageParam[] = [
      { role: 'user', content: 'Test' },
    ]
    const originalLength = messages.length

    appendToolResults(messages, [
      {
        type: 'tool_result',
        tool_use_id: 'tool_123',
        content: 'Result',
      },
    ])

    expect(messages.length).toBe(originalLength)
  })
})
