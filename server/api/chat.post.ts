import { defineEventHandler, readBody, createEventStream, setResponseHeader, createError } from 'h3'
import { queryCollection } from '@nuxt/content/server'
import { useRuntimeConfig } from '#imports'
import { consola } from 'consola'
import Anthropic from '@anthropic-ai/sdk'
import { tryCatch, tryAsync, tryCatchAsync } from '#shared/utils/tryCatch'
import {
  MODEL,
  MAX_TOKENS,
  SYSTEM_PROMPT,
  TOOLS,
  isSearchNotesInput,
  isGetNoteContentInput,
  isGetNoteDetailsInput,
  isFetchSourceInput,
} from '../utils/chat/tools'
import type { ChatRequest, NoteContext } from '../utils/chat/tools'
import {
  formatNoteContent,
  hybridSearch,
  keywordSearch,
} from '../utils/chat/search'
import type { RawNote } from '../utils/chat/search'
import { semanticSearch, findSimilarNotes } from '../utils/chat/semanticSearch'
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
    .select('title', 'summary', 'path', 'stem', 'tags', 'type', 'notes', 'url', 'rawbody')
    .where('stem', '=', slug)
    .first()

  if (!note) return null

  // Cast rawbody to string since Nuxt Content types it as unknown
  return {
    ...note,
    rawbody: typeof note.rawbody === 'string' ? note.rawbody : undefined,
  }
}

// Tool execution (bridges shell and core)
async function executeSearchNotes(
  httpEvent: HttpEvent,
  query: string,
  type?: string,
  limit = 5,
  mode: 'keyword' | 'semantic' | 'hybrid' = 'hybrid',
  requestId = '',
): Promise<NoteContext[]> {
  log.info(`[${requestId}] Tool: search_notes`, { query, type, limit, mode })

  const allNotes = await fetchAllNotes(httpEvent)

  const notes = await executeSearchByMode(query, allNotes, { limit, type }, mode)
  log.info(`[${requestId}] ${mode} search found ${notes.length} results:`, notes.map(n => n.title))
  return notes
}

async function executeSearchByMode(
  query: string,
  allNotes: RawNote[],
  options: { limit: number; type?: string },
  mode: 'keyword' | 'semantic' | 'hybrid',
): Promise<NoteContext[]> {
  const { limit, type } = options

  if (mode === 'keyword') {
    return keywordSearch(query, allNotes, { limit, type })
  }

  if (mode === 'semantic') {
    const semanticResults = await semanticSearch(query, limit * 2)
    const filtered = type
      ? semanticResults.filter(r => r.type === type)
      : semanticResults
    return filtered.slice(0, limit).map(r => ({
      title: r.title,
      summary: allNotes.find(n => n.stem === r.slug)?.summary ?? null,
      path: `/${r.slug}`,
    }))
  }

  // Default: hybrid search
  return hybridSearch(query, allNotes, { limit, type })
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

// Wiki-link pattern to extract forward links from note content
const WIKI_LINK_PATTERN = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g

/**
 * Parse wiki-links from note content to find forward links.
 */
function parseWikiLinks(content: string | null | undefined): string[] {
  if (!content) return []
  const links: string[] = []
  let match
  while ((match = WIKI_LINK_PATTERN.exec(content)) !== null) {
    if (match[1]) {
      links.push(match[1])
    }
  }
  return [...new Set(links)] // Deduplicate
}

/**
 * Find all notes that link to the given slug (backlinks).
 */
async function findBacklinks(httpEvent: HttpEvent, slug: string): Promise<Array<{ title: string; path: string }>> {
  // Query all notes and check their content for wiki-links to this slug
  const allNotes = await queryCollection(httpEvent, 'content')
    .select('title', 'path', 'stem', 'notes')
    .limit(500)
    .all()

  const backlinks: Array<{ title: string; path: string }> = []

  for (const note of allNotes) {
    if (note.stem === slug) continue // Skip self
    const links = parseWikiLinks(note.notes)
    if (links.includes(slug)) {
      backlinks.push({
        title: note.title ?? note.stem ?? 'Untitled',
        path: note.path ?? `/${note.stem}`,
      })
    }
  }

  return backlinks
}

interface NoteDetails {
  title: string
  summary: string | null
  notes: string | null
  tags: string[]
  type: string
  path: string
  url: string | null
  backlinks: Array<{ title: string; path: string }>
  forwardLinks: string[]
  related: Array<{ title: string; path: string; score: number }>
}

interface RelatedNote {
  title: string
  slug: string
  score: number
}

function buildNoteDetails(
  note: RawNote,
  backlinks: Array<{ title: string; path: string }>,
  forwardLinks: string[],
  related: RelatedNote[],
): NoteDetails {
  return {
    title: note.title ?? note.stem ?? 'Untitled',
    summary: note.summary ?? null,
    notes: note.notes ?? null,
    tags: note.tags ?? [],
    type: note.type ?? 'note',
    path: note.path ?? `/${note.stem}`,
    url: note.url ?? null,
    backlinks,
    forwardLinks,
    related: related.map(r => ({ title: r.title, path: `/${r.slug}`, score: r.score })),
  }
}

async function executeGetNoteDetails(
  httpEvent: HttpEvent,
  slug: string,
  includeRelated = true,
  requestId = '',
): Promise<NoteDetails | null> {
  log.info(`[${requestId}] Tool: get_note_details`, { slug, includeRelated })

  const note = await fetchNoteBySlug(httpEvent, slug)
  if (!note) {
    log.warn(`[${requestId}] get_note_details: note not found for slug "${slug}"`)
    return null
  }

  const [backlinks, related] = await Promise.all([
    findBacklinks(httpEvent, slug),
    includeRelated ? findSimilarNotes(slug, 5) : Promise.resolve([]),
  ])

  const forwardLinks = parseWikiLinks(note.notes)
  const result = buildNoteDetails(note, backlinks, forwardLinks, related)

  log.info(`[${requestId}] get_note_details found:`, {
    title: result.title,
    backlinks: backlinks.length,
    forwardLinks: forwardLinks.length,
    related: related.length,
  })

  return result
}

interface FetchSourceResult {
  url: string
  content: string
  error?: string
}

async function executeFetchSource(
  httpEvent: HttpEvent,
  slug: string,
  requestId = '',
): Promise<FetchSourceResult> {
  log.info(`[${requestId}] Tool: fetch_source`, { slug })

  const note = await fetchNoteBySlug(httpEvent, slug)

  if (!note) {
    log.warn(`[${requestId}] fetch_source: note not found for slug "${slug}"`)
    return { url: '', content: '', error: 'Note not found' }
  }

  if (!note.url) {
    log.warn(`[${requestId}] fetch_source: note "${slug}" has no source URL`)
    return { url: '', content: '', error: 'Note has no source URL' }
  }

  const noteUrl = note.url

  // Fetch the URL content
  const [fetchError, response] = await tryCatchAsync(async () => {
    const res = await fetch(noteUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SecondBrain/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    })
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`)
    }
    return res.text()
  })

  if (fetchError) {
    log.error(`[${requestId}] fetch_source: failed to fetch URL`, { url: note.url, error: fetchError.message })
    return { url: note.url, content: '', error: `Failed to fetch: ${fetchError.message}` }
  }

  // Convert HTML to simple text (basic extraction)
  // Remove scripts, styles, and HTML tags
  const textContent = response
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 10000) // Limit content length

  log.info(`[${requestId}] fetch_source: fetched ${textContent.length} chars from ${note.url}`)

  return {
    url: note.url,
    content: textContent,
  }
}

// Tool result type
interface ToolResult {
  result: string
  notes: NoteContext[]
}

// Individual tool handlers
async function handleSearchNotes(
  httpEvent: HttpEvent,
  input: { query: string; type?: string; limit?: number; mode?: 'keyword' | 'semantic' | 'hybrid' },
  requestId: string,
): Promise<ToolResult> {
  const notes = await executeSearchNotes(httpEvent, input.query, input.type, input.limit, input.mode, requestId)

  if (notes.length === 0) {
    return {
      result: JSON.stringify({
        results: [],
        found: false,
        message: `No notes found about "${input.query}". You MUST tell the user: "I couldn't find anything about ${input.query} in your Second Brain." Do NOT provide information from general knowledge.`,
      }),
      notes: [],
    }
  }

  return { result: JSON.stringify({ results: notes, found: true }), notes }
}

async function handleGetNoteContent(httpEvent: HttpEvent, slug: string, requestId: string): Promise<ToolResult> {
  const content = await executeGetNoteContent(httpEvent, slug, requestId)
  if (!content) {
    return { result: JSON.stringify({ error: 'Note not found' }), notes: [] }
  }
  return {
    result: JSON.stringify(content),
    notes: [{ title: content.title, summary: content.summary, path: content.path }],
  }
}

async function handleGetNoteDetails(
  httpEvent: HttpEvent,
  slug: string,
  includeRelated: boolean,
  requestId: string,
): Promise<ToolResult> {
  const details = await executeGetNoteDetails(httpEvent, slug, includeRelated, requestId)
  if (!details) {
    return { result: JSON.stringify({ error: 'Note not found' }), notes: [] }
  }
  return {
    result: JSON.stringify(details),
    notes: [{ title: details.title, summary: details.summary, path: details.path }],
  }
}

async function handleFetchSource(httpEvent: HttpEvent, slug: string, requestId: string): Promise<ToolResult> {
  const sourceResult = await executeFetchSource(httpEvent, slug, requestId)
  return { result: JSON.stringify(sourceResult), notes: [] }
}

// Tool dispatcher
async function executeTool(
  httpEvent: HttpEvent,
  toolName: string,
  toolInput: unknown,
  requestId: string,
): Promise<ToolResult> {
  if (toolName === 'search_notes' && isSearchNotesInput(toolInput)) {
    return handleSearchNotes(httpEvent, toolInput, requestId)
  }
  if (toolName === 'get_note_content' && isGetNoteContentInput(toolInput)) {
    return handleGetNoteContent(httpEvent, toolInput.slug, requestId)
  }
  if (toolName === 'get_note_details' && isGetNoteDetailsInput(toolInput)) {
    return handleGetNoteDetails(httpEvent, toolInput.slug, toolInput.include_related ?? true, requestId)
  }
  if (toolName === 'fetch_source' && isFetchSourceInput(toolInput)) {
    return handleFetchSource(httpEvent, toolInput.slug, requestId)
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
