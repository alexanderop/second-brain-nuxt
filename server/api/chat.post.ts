import { defineEventHandler, readBody, createEventStream, setResponseHeader, createError } from 'h3'
import { queryCollection } from '@nuxt/content/server'
import { useRuntimeConfig } from '#imports'
import { consola } from 'consola'
import Anthropic from '@anthropic-ai/sdk'
import { tryCatch, tryAsync, tryCatchAsync } from '../../shared/utils/tryCatch'
import {
  MODEL,
  MAX_TOKENS,
  SYSTEM_PROMPT,
  TOOLS,
  isSearchNotesInput,
  isGetNoteContentInput,
} from '../utils/chat/tools'
import type { ChatRequest, NoteContext } from '../utils/chat/tools'
import {
  extractKeywords,
  filterAndScoreNotes,
  formatNoteContent,
} from '../utils/chat/search'
import type { RawNote } from '../utils/chat/search'
import {
  buildInitialMessages,
  appendAssistantMessage,
  appendToolResults,
} from '../utils/chat/messages'
import { mapApiError } from '../utils/chat/errors'
import { isServerFeatureEnabled } from '../utils/featureToggles'

const log = consola.withTag('chat')

type HttpEvent = Parameters<typeof queryCollection>[0]

// Database queries (imperative shell)
async function fetchAllNotes(httpEvent: HttpEvent, type?: string): Promise<RawNote[]> {
  let queryBuilder = queryCollection(httpEvent, 'content')
    .select('title', 'summary', 'path', 'stem', 'tags', 'type')
    .limit(100)

  if (type) {
    queryBuilder = queryBuilder.where('type', '=', type)
  }

  return queryBuilder.all()
}

async function fetchNoteBySlug(httpEvent: HttpEvent, slug: string): Promise<RawNote | null> {
  const note = await queryCollection(httpEvent, 'content')
    .select('title', 'summary', 'path', 'stem', 'tags', 'type', 'notes')
    .where('stem', '=', slug)
    .first()

  return note ?? null
}

// Tool execution (bridges shell and core)
async function executeSearchNotes(
  httpEvent: HttpEvent,
  query: string,
  type?: string,
  limit = 5,
  requestId = '',
): Promise<NoteContext[]> {
  const keywords = extractKeywords(query)
  log.info(`[${requestId}] Tool: search_notes`, { query, type, limit, keywords })

  const allNotes = await fetchAllNotes(httpEvent, type)
  const notes = filterAndScoreNotes(allNotes, keywords, limit)

  log.info(`[${requestId}] search_notes found ${notes.length} results:`, notes.map(n => n.title))
  return notes
}

async function executeGetNoteContent(
  httpEvent: HttpEvent,
  slug: string,
  requestId = '',
): Promise<{ title: string; summary: string | null; notes: string | null; tags: string[]; type: string; path: string } | null> {
  log.info(`[${requestId}] Tool: get_note_content`, { slug })

  const note = await fetchNoteBySlug(httpEvent, slug)

  if (!note) {
    log.warn(`[${requestId}] get_note_content: note not found for slug "${slug}"`)
    return null
  }

  const result = formatNoteContent(note)
  log.info(`[${requestId}] get_note_content found:`, result.title)
  return result
}

// Tool dispatcher
async function executeTool(
  httpEvent: HttpEvent,
  toolName: string,
  toolInput: unknown,
  requestId: string,
): Promise<{ result: string; notes: NoteContext[] }> {
  if (toolName === 'search_notes' && isSearchNotesInput(toolInput)) {
    const notes = await executeSearchNotes(
      httpEvent,
      toolInput.query,
      toolInput.type,
      toolInput.limit,
      requestId,
    )
    return { result: JSON.stringify(notes), notes }
  }

  if (toolName === 'get_note_content' && isGetNoteContentInput(toolInput)) {
    const content = await executeGetNoteContent(httpEvent, toolInput.slug, requestId)
    if (content) {
      return {
        result: JSON.stringify(content),
        notes: [{ title: content.title, summary: content.summary, path: content.path }],
      }
    }
    return { result: JSON.stringify({ error: 'Note not found' }), notes: [] }
  }

  return { result: JSON.stringify({ error: `Unknown tool: ${toolName}` }), notes: [] }
}

// Main streaming function (imperative shell)
async function streamChatResponse(
  httpEvent: HttpEvent,
  anthropic: Anthropic,
  initialMessages: Anthropic.MessageParam[],
  eventStream: ReturnType<typeof createEventStream>,
  requestId: string,
): Promise<void> {
  const startTime = Date.now()
  const allUsedNotes: NoteContext[] = []
  let messages = [...initialMessages]

  log.info(`[${requestId}] Starting chat with tools`, {
    model: MODEL,
    maxTokens: MAX_TOKENS,
    messageCount: messages.length,
    toolCount: TOOLS.length,
  })

  const [error] = await tryCatchAsync(async () => {
    let continueLoop = true

    while (continueLoop) {
      const stream = anthropic.messages.stream({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: SYSTEM_PROMPT,
        tools: TOOLS,
        messages,
      })

      stream.on('text', async (text) => {
        await eventStream.push(JSON.stringify({ type: 'text', content: text }))
      })

      const response = await stream.finalMessage()

      log.info(`[${requestId}] Response received`, {
        stopReason: response.stop_reason,
        contentBlocks: response.content.length,
      })

      if (response.stop_reason === 'tool_use') {
        const toolUseBlocks = response.content.filter(
          (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use',
        )

        messages = appendAssistantMessage(messages, response.content)

        const toolResults: Anthropic.ToolResultBlockParam[] = []

        for (const toolUse of toolUseBlocks) {
          await eventStream.push(JSON.stringify({
            type: 'tool_call',
            id: toolUse.id,
            tool: toolUse.name,
            input: toolUse.input,
          }))

          log.info(`[${requestId}] Executing tool: ${toolUse.name}`, toolUse.input)

          const { result, notes } = await executeTool(httpEvent, toolUse.name, toolUse.input, requestId)

          for (const note of notes) {
            if (!allUsedNotes.some(n => n.path === note.path)) {
              allUsedNotes.push(note)
            }
          }

          const [parseError, parsed] = tryCatch(() => JSON.parse(result))

          await eventStream.push(JSON.stringify({
            type: 'tool_result',
            id: toolUse.id,
            tool: toolUse.name,
            result: parseError ? result : parsed,
          }))

          toolResults.push({
            type: 'tool_result',
            tool_use_id: toolUse.id,
            content: result,
          })
        }

        messages = appendToolResults(messages, toolResults)
        continue
      }

      continueLoop = false
    }

    const duration = Date.now() - startTime

    log.info(`[${requestId}] Chat completed`, {
      durationMs: duration,
      notesUsed: allUsedNotes.length,
    })

    await eventStream.push(JSON.stringify({
      type: 'done',
      sources: allUsedNotes.map(n => ({ title: n.title, path: n.path })),
    }))
  })

  if (error) {
    const duration = Date.now() - startTime
    const streamingError = mapApiError(error)

    log.error(`[${requestId}] Stream error after ${duration}ms`, {
      errorMessage: streamingError.message,
      retryAfter: streamingError.retryAfter,
      anthropicRequestId: streamingError.requestId,
      rawError: error instanceof Error ? error.message : String(error),
    })

    await eventStream.push(JSON.stringify({
      type: 'error',
      message: streamingError.message,
      retryAfter: streamingError.retryAfter,
      requestId: streamingError.requestId,
    }))
  }

  await eventStream.close()
}

// HTTP handler (thin imperative shell)
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const requestId = crypto.randomUUID().slice(0, 8)

  // Feature toggle: chat availability controlled by features.config.ts
  if (!isServerFeatureEnabled('chat')) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
    })
  }

  if (!config.anthropicApiKey) {
    log.error(`[${requestId}] API key not configured`)
    throw createError({
      statusCode: 500,
      statusMessage: 'API key not configured',
      data: { message: 'ANTHROPIC_API_KEY is not configured. Please add it to your environment variables.' },
    })
  }

  const [bodyError, body] = await tryAsync(readBody<ChatRequest>(event))
  if (bodyError) {
    log.warn(`[${requestId}] Failed to parse request body`, bodyError)
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid request body',
      data: { message: 'Failed to parse request body.' },
    })
  }
  const { message, history = [] } = body

  log.info(`[${requestId}] Incoming request`, {
    messageLength: message?.length ?? 0,
    messagePreview: message?.slice(0, 100),
    historyLength: history.length,
  })

  if (!message?.trim()) {
    log.warn(`[${requestId}] Empty message received`)
    throw createError({
      statusCode: 400,
      statusMessage: 'Message is required',
      data: { message: 'Please enter a message to send.' },
    })
  }

  const messages = buildInitialMessages(history, message)

  setResponseHeader(event, 'Content-Type', 'text/event-stream')
  setResponseHeader(event, 'Cache-Control', 'no-cache')
  setResponseHeader(event, 'Connection', 'keep-alive')

  const eventStream = createEventStream(event)
  const anthropic = new Anthropic({ apiKey: config.anthropicApiKey })

  streamChatResponse(event, anthropic, messages, eventStream, requestId)

  return eventStream.send()
})
