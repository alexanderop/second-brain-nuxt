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
  url: string | null
  content: string | null // Truncated markdown body
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
  mode?: 'keyword' | 'semantic' | 'hybrid'
}

export interface GetNoteContentInput {
  slug: string
}

export interface GetNoteDetailsInput {
  slug: string
  include_related?: boolean
}

export interface FetchSourceInput {
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

export function isGetNoteDetailsInput(input: unknown): input is GetNoteDetailsInput {
  if (typeof input !== 'object' || input === null) return false
  if (!('slug' in input)) return false
  return typeof input.slug === 'string'
}

export function isFetchSourceInput(input: unknown): input is FetchSourceInput {
  if (typeof input !== 'object' || input === null) return false
  if (!('slug' in input)) return false
  return typeof input.slug === 'string'
}

// System prompt for the chat assistant
export const SYSTEM_PROMPT = `You are the user's Second Brain - a personal knowledge assistant.

You have tools to search and read their notes:
- search_notes: Find notes by topic (uses hybrid keyword + semantic search)
- get_note_content: Read a note's full content including markdown body
- get_note_details: Get connections (backlinks, forward links, related notes)
- fetch_source: Fetch original source from a note's URL

**Tool usage strategy:**
1. Start with search_notes to find relevant notes
2. Use get_note_content to read the actual content
3. For external content (articles, youtube, github, podcasts) with sparse content:
   - Check if the note has a URL field
   - Use fetch_source to get the original material
4. Use get_note_details when exploring how notes connect

**Important:** External content types (article, youtube, github, podcast, etc.) often have
their main content at the source URL. If get_note_content returns sparse results for these
types, use fetch_source to retrieve the original content.

When answering questions:
- Speak as if you ARE their memory ("I found in your notes...", "Based on what you captured...")
- Reference specific notes by name when relevant

**CRITICAL - NO GENERAL KNOWLEDGE:**
- You are ONLY their personal knowledge base, not a general assistant
- If search_notes returns empty results or { found: false }, you MUST respond:
  "I couldn't find anything about [topic] in your Second Brain."
- NEVER provide information you weren't given by the tools
- NEVER say "I know that..." or "Generally speaking..." or provide facts not in the notes
- If asked about something not in their notes, suggest they add it

Always end your response with a "Sources:" section listing the notes you referenced, formatted as:
Sources:
- [Note Title](/path/to/note)`

// Tool definitions for Claude
export const TOOLS: Anthropic.Tool[] = [
  {
    name: 'search_notes',
    description: 'Search the knowledge base for notes. Uses hybrid search by default, which combines keyword matching with semantic similarity to find conceptually related content (e.g., searching "productivity" can find notes about "atomic habits"). Use when the user asks about topics, concepts, or wants to find content.',
    input_schema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: 'Search query - can be keywords or natural language' },
        type: {
          type: 'string',
          enum: ['article', 'book', 'podcast', 'note', 'youtube', 'tweet', 'course', 'reddit', 'github', 'newsletter', 'talk', 'movie', 'tv', 'manga', 'quote', 'evergreen', 'map'],
          description: 'Optional: filter by content type',
        },
        limit: { type: 'number', description: 'Max results (default 5, max 10)' },
        mode: {
          type: 'string',
          enum: ['keyword', 'semantic', 'hybrid'],
          description: 'Search mode: keyword (exact matches), semantic (conceptual similarity), or hybrid (both, default)',
        },
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
  {
    name: 'get_note_details',
    description: 'Get comprehensive note details including backlinks (notes that link to this one), forward links (notes this one links to), and semantically related notes. Use when you need to understand a note\'s connections or explore related content.',
    input_schema: {
      type: 'object' as const,
      properties: {
        slug: { type: 'string', description: 'The note slug (e.g., \'atomic-habits\')' },
        include_related: {
          type: 'boolean',
          description: 'Whether to include semantically similar notes (default: true)',
        },
      },
      required: ['slug'],
    },
  },
  {
    name: 'fetch_source',
    description: 'Fetch the original source material from a note\'s URL. Use when the user asks about the original content, wants to verify information, or needs details not captured in the notes. Returns the source content converted to markdown.',
    input_schema: {
      type: 'object' as const,
      properties: {
        slug: { type: 'string', description: 'The note slug to fetch the source for' },
      },
      required: ['slug'],
    },
  },
]
