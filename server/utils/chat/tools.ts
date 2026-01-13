import type Anthropic from '@anthropic-ai/sdk'

// Configuration constants
export const MODEL = 'claude-3-5-haiku-20241022'
export const MAX_TOKENS = 1024

// Request/Response interfaces
export interface ChatRequest {
  message: string
  history: Array<{ role: 'user' | 'assistant'; content: string }>
}

export interface NoteContext {
  title: string
  summary: string | null
  path: string
}

export interface NoteContent {
  title: string
  summary: string | null
  notes: string | null
  tags: string[]
  type: string
  path: string
}

export interface StreamingError {
  message: string
  retryAfter?: number
  requestId?: string
}

// Tool input interfaces
export interface SearchNotesInput {
  query: string
  type?: string
  limit?: number
}

export interface GetNoteContentInput {
  slug: string
}

// Type guards for tool inputs
export function isSearchNotesInput(input: unknown): input is SearchNotesInput {
  if (typeof input !== 'object' || input === null) return false
  if (!('query' in input)) return false
  return typeof input.query === 'string'
}

export function isGetNoteContentInput(input: unknown): input is GetNoteContentInput {
  if (typeof input !== 'object' || input === null) return false
  if (!('slug' in input)) return false
  return typeof input.slug === 'string'
}

// System prompt for the chat assistant
export const SYSTEM_PROMPT = `You are the user's Second Brain - a personal knowledge assistant.

You have tools to search and read their notes. Use them to find relevant information before answering.

When answering questions:
- Use search_notes to find relevant content based on keywords
- Use get_note_content to read full details when you need more information
- Speak as if you ARE their memory ("I found in your notes...", "Based on what you captured...")
- Reference specific notes by name when relevant
- If tools return no results, say so honestly

Always end your response with a "Sources:" section listing the notes you referenced, formatted as:
Sources:
- [Note Title](/path/to/note)`

// Tool definitions for Claude
export const TOOLS: Anthropic.Tool[] = [
  {
    name: 'search_notes',
    description: 'Search the knowledge base for notes matching keywords. Use when the user asks about topics, concepts, or wants to find content. Returns titles, summaries, and paths.',
    input_schema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: 'Search keywords' },
        type: {
          type: 'string',
          enum: ['article', 'book', 'podcast', 'note', 'youtube', 'tweet', 'course', 'reddit', 'github', 'newsletter', 'talk', 'movie', 'tv', 'manga', 'quote', 'evergreen', 'map'],
          description: 'Optional: filter by content type',
        },
        limit: { type: 'number', description: 'Max results (default 5, max 10)' },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_note_content',
    description: 'Get the full content of a specific note by its slug/path. Use after searching to read the complete note with all details.',
    input_schema: {
      type: 'object' as const,
      properties: {
        slug: { type: 'string', description: 'The note slug (e.g., \'vue-reactivity-patterns\')' },
      },
      required: ['slug'],
    },
  },
]
