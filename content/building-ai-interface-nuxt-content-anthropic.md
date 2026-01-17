---
title: "Building an AI Interface for Your Second Brain"
type: article
tags:
  - nuxt
  - ai
  - anthropic
  - tutorial
  - nuxt-content
  - llm
  - ai-agents
authors:
  - alexander-opalic
summary: "Learn how to build a conversational AI that queries your personal knowledge base using Nuxt, Nuxt Content, and the Anthropic SDK."
date: 2026-01-17
---

You've built a Second Brain - a personal knowledge base filled with notes from podcasts, articles, books, and your own insights. There's just one problem: finding anything requires remembering exactly what you wrote or where you put it. What if you could just *ask* your notes a question?

In this tutorial, we'll build a conversational AI interface that lets you chat with your Second Brain. You'll learn how to create an agentic system where Claude decides which notes to fetch, reads their content, and synthesizes answers - all grounded in *your* knowledge, not general information.

## What We're Building

We'll create a chat interface where you can ask questions like:

- "What did I learn about atomic habits?"
- "Find my notes on Vue composables"
- "What connections are there between local-first software and CRDTs?"

The AI will search your notes, read relevant content, and respond with information from your knowledge base - never making things up or using outside knowledge.

## The Tech Stack

Our stack is intentionally simple:

- **Nuxt 4** - Vue's meta-framework with server routes for our API
- **@nuxt/content v3** - Manages our Markdown files with SQLite queries
- **Anthropic SDK** - Powers our chat with Claude 3.5 Haiku

The architecture follows a clean separation: Markdown files in `content/`, a server API endpoint in `server/api/`, and a Vue component for the UI.

## Project Structure

Here's what the relevant parts of our project look like:

```text
├── content/
│   ├── atomic-habits.md
│   ├── vue-reactivity-patterns.md
│   └── ... (your notes)
├── content.config.ts          # Content schema definition
├── server/
│   ├── api/
│   │   └── chat.post.ts       # Main chat endpoint
│   └── utils/
│       └── chat/
│           ├── tools.ts       # Tool definitions
│           └── search.ts      # Search logic
└── app/
    └── components/
        └── ChatInterface.vue  # Chat UI
```

Each note is a Markdown file with frontmatter defining its type, tags, and summary:

```markdown
---
title: "Atomic Habits"
type: book
tags: [habits, productivity, self-improvement]
authors: [james-clear]
summary: "Small changes compound into remarkable results."
---

The 1% rule: getting 1% better every day compounds to being 37x better over a year...
```

The content schema in `content.config.ts` validates this structure:

```typescript
// content.config.ts
import { defineCollection, defineContentConfig, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    content: defineCollection({
      type: 'page',
      source: { include: '**/*.md' },
      schema: z.object({
        title: z.string(),
        type: z.enum(['article', 'book', 'podcast', 'note', 'youtube']),
        tags: z.array(z.string()).default([]),
        authors: z.array(z.string()).default([]),
        summary: z.string().optional(),
        notes: z.string().optional(),
      }),
    }),
  },
})
```

---

## Part 1: A Simple Chat Endpoint

Let's start with the simplest possible chat endpoint - no tools, no streaming, just a direct conversation with Claude.

### Basic API Endpoint

Create `server/api/chat.post.ts`:

```typescript
// server/api/chat.post.ts
import { defineEventHandler, readBody, createError } from 'h3'
import Anthropic from '@anthropic-ai/sdk'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)

  if (!config.anthropicApiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'ANTHROPIC_API_KEY not configured',
    })
  }

  const { message } = await readBody(event)

  if (!message?.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Message is required',
    })
  }

  const anthropic = new Anthropic({ apiKey: config.anthropicApiKey })

  const response = await anthropic.messages.create({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 1024,
    messages: [{ role: 'user', content: message }],
  })

  // Extract text from the response
  const textBlock = response.content.find(block => block.type === 'text')

  return {
    content: textBlock?.text ?? '',
  }
})
```

Add your API key to `.env`:

```bash
ANTHROPIC_API_KEY=sk-ant-...
```

And configure it in `nuxt.config.ts`:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  },
})
```

This works, but has a problem: the response takes several seconds and the user sees nothing until it's complete.

### Adding Streaming with Server-Sent Events

For a better user experience, we want to stream tokens as they're generated. Nuxt provides `createEventStream` for this:

```typescript
// server/api/chat.post.ts - with streaming
import {
  defineEventHandler,
  readBody,
  createEventStream,
  setResponseHeader,
  createError,
} from 'h3'
import Anthropic from '@anthropic-ai/sdk'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const { message } = await readBody(event)

  // Set up SSE headers
  setResponseHeader(event, 'Content-Type', 'text/event-stream')
  setResponseHeader(event, 'Cache-Control', 'no-cache')
  setResponseHeader(event, 'Connection', 'keep-alive')

  const eventStream = createEventStream(event)
  const anthropic = new Anthropic({ apiKey: config.anthropicApiKey })

  // Stream the response
  const stream = anthropic.messages.stream({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 1024,
    messages: [{ role: 'user', content: message }],
  })

  stream.on('text', async (text) => {
    await eventStream.push(JSON.stringify({ type: 'text', content: text }))
  })

  stream.on('end', async () => {
    await eventStream.push(JSON.stringify({ type: 'done' }))
    await eventStream.close()
  })

  return eventStream.send()
})
```

### A Simple Chat UI

Here's a minimal Vue component to consume our streaming API:

```vue
<!-- app/components/ChatInterface.vue -->
<script setup lang="ts">
const message = ref('')
const response = ref('')
const isLoading = ref(false)

async function sendMessage() {
  if (!message.value.trim() || isLoading.value) return

  isLoading.value = true
  response.value = ''

  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: message.value }),
  })

  const reader = res.body?.getReader()
  const decoder = new TextDecoder()

  while (reader) {
    const { done, value } = await reader.read()
    if (done) break

    const chunk = decoder.decode(value)
    const lines = chunk.split('\n').filter(Boolean)

    for (const line of lines) {
      const data = JSON.parse(line)
      if (data.type === 'text') {
        response.value += data.content
      }
    }
  }

  isLoading.value = false
}
</script>

<template>
  <div class="chat-interface">
    <div class="response">{{ response }}</div>
    <form @submit.prevent="sendMessage">
      <input v-model="message" placeholder="Ask your Second Brain..." />
      <button type="submit" :disabled="isLoading">Send</button>
    </form>
  </div>
</template>
```

This gives us a working chat, but Claude doesn't know anything about our notes. It's just a general assistant. That's where tools come in.

---

## Part 2: Adding Tools - The Key Insight

The naive approach would be to stuff all our notes into the prompt. But that doesn't scale - you might have hundreds of notes, and context windows cost tokens.

The insight is this: **let Claude decide what to fetch**. We give it tools to search and read notes, and it uses them as needed.

### How Tool Use Works

When you provide tools to Claude, it can respond with a `tool_use` block instead of (or alongside) text. Your code then executes the tool, sends the results back, and Claude continues.

The flow looks like this:

1. User asks: "What did I learn about habits?"
2. Claude responds with: `tool_use: search_notes({ query: "habits" })`
3. We execute the search, find relevant notes
4. We send the results back to Claude
5. Claude responds with text summarizing the findings

This creates an **agentic loop** - Claude keeps using tools until it has enough information to answer.

### Defining Tools

Tools are defined with a name, description, and JSON Schema for inputs:

```typescript
// server/utils/chat/tools.ts
import type Anthropic from '@anthropic-ai/sdk'

export const MODEL = 'claude-3-5-haiku-20241022'
export const MAX_TOKENS = 1024

export const TOOLS: Anthropic.Tool[] = [
  {
    name: 'search_notes',
    description: 'Search the knowledge base for notes. Returns titles and summaries of matching notes.',
    input_schema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query - can be keywords or natural language',
        },
        type: {
          type: 'string',
          enum: ['article', 'book', 'podcast', 'note', 'youtube'],
          description: 'Optional: filter by content type',
        },
        limit: {
          type: 'number',
          description: 'Max results (default 5, max 10)',
        },
      },
      required: ['query'],
    },
  },
]
```

The description is crucial - it tells Claude when and how to use the tool.

### The System Prompt

The system prompt constrains Claude to *only* use information from tools:

```typescript
// server/utils/chat/tools.ts
export const SYSTEM_PROMPT = `You are the user's Second Brain - a personal knowledge assistant.

You have tools to search and read their notes:
- search_notes: Find notes by topic

When answering questions:
- Speak as if you ARE their memory ("I found in your notes...", "Based on what you captured...")
- Reference specific notes by name when relevant

**CRITICAL - NO GENERAL KNOWLEDGE:**
- You are ONLY their personal knowledge base, not a general assistant
- If search_notes returns empty results, you MUST respond:
  "I couldn't find anything about [topic] in your Second Brain."
- NEVER provide information you weren't given by the tools
- NEVER say "I know that..." or "Generally speaking..."
- If asked about something not in their notes, suggest they add it

Always end your response with a "Sources:" section listing the notes you referenced.`
```

This is essential for a Second Brain assistant. Without it, Claude would happily answer questions using its training data, defeating the purpose.

### Implementing the Agentic Loop

Here's the core pattern - keep calling Claude until it stops requesting tools:

```typescript
// server/api/chat.post.ts - agentic loop
async function streamChatResponse(
  anthropic: Anthropic,
  initialMessages: Anthropic.MessageParam[],
  eventStream: ReturnType<typeof createEventStream>,
) {
  let messages = [...initialMessages]
  let continueLoop = true

  while (continueLoop) {
    const stream = anthropic.messages.stream({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: SYSTEM_PROMPT,
      tools: TOOLS,
      messages,
    })

    // Stream text to the client as it arrives
    stream.on('text', async (text) => {
      await eventStream.push(JSON.stringify({ type: 'text', content: text }))
    })

    const response = await stream.finalMessage()

    // Check if Claude wants to use tools
    if (response.stop_reason === 'tool_use') {
      const toolUseBlocks = response.content.filter(
        (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use'
      )

      // Add Claude's response to the conversation
      messages.push({ role: 'assistant', content: response.content })

      // Execute each tool and collect results
      const toolResults: Anthropic.ToolResultBlockParam[] = []

      for (const toolUse of toolUseBlocks) {
        const result = await executeTool(toolUse.name, toolUse.input)

        toolResults.push({
          type: 'tool_result',
          tool_use_id: toolUse.id,
          content: JSON.stringify(result),
        })
      }

      // Add tool results to the conversation
      messages.push({ role: 'user', content: toolResults })

      // Loop continues - Claude will process the results
      continue
    }

    // No more tool calls - we're done
    continueLoop = false
  }

  await eventStream.push(JSON.stringify({ type: 'done' }))
  await eventStream.close()
}
```

The key insight: Claude's conversation includes both its tool calls AND our results. This maintains context across multiple tool uses.

### Implementing search_notes

Now let's implement the actual search. We use Nuxt Content's `queryCollection` to search our notes:

```typescript
// server/utils/chat/search.ts
import { queryCollection } from '@nuxt/content/server'

export interface NoteContext {
  title: string
  summary: string | null
  path: string
}

// Common stop words to filter out
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
  'what', 'which', 'who', 'this', 'that', 'how', 'about',
])

export function extractKeywords(message: string): string[] {
  return message
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !STOP_WORDS.has(word))
    .slice(0, 8)
}

export function scoreNote(note: RawNote, keywords: string[]): number {
  const titleLower = (note.title ?? '').toLowerCase()
  const summaryLower = (note.summary ?? '').toLowerCase()
  const tagsLower = (note.tags ?? []).map(t => t.toLowerCase())

  return keywords.reduce((score, keyword) => {
    let keywordScore = 0
    if (titleLower.includes(keyword)) keywordScore += 2
    if (summaryLower.includes(keyword)) keywordScore += 1
    if (tagsLower.some(tag => tag.includes(keyword))) keywordScore += 3
    return score + keywordScore
  }, 0)
}

export async function searchNotes(
  event: H3Event,
  query: string,
  options: { type?: string; limit?: number } = {},
): Promise<NoteContext[]> {
  const { type, limit = 5 } = options
  const keywords = extractKeywords(query)

  // Fetch all notes (Nuxt Content caches this)
  let queryBuilder = queryCollection(event, 'content')
    .select('title', 'summary', 'path', 'stem', 'tags', 'type')
    .limit(100)

  if (type) {
    queryBuilder = queryBuilder.where('type', '=', type)
  }

  const allNotes = await queryBuilder.all()

  // Score and filter
  return allNotes
    .map(note => ({ note, score: scoreNote(note, keywords) }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.min(limit, 10))
    .map(item => ({
      title: item.note.title ?? 'Untitled',
      summary: item.note.summary ?? null,
      path: item.note.path ?? `/${item.note.stem}`,
    }))
}
```

The tool executor ties it together:

```typescript
// server/api/chat.post.ts
async function executeTool(
  event: H3Event,
  toolName: string,
  toolInput: unknown,
): Promise<unknown> {
  if (toolName === 'search_notes') {
    const { query, type, limit } = toolInput as SearchNotesInput
    const notes = await searchNotes(event, query, { type, limit })

    if (notes.length === 0) {
      return {
        results: [],
        found: false,
        message: `No notes found about "${query}".`,
      }
    }

    return { results: notes, found: true }
  }

  return { error: `Unknown tool: ${toolName}` }
}
```

Now when you ask "What do I know about habits?", Claude searches your notes, finds relevant ones, and summarizes them.

---

## Part 3: More Tools

Search gives us titles and summaries, but sometimes Claude needs the full content. Let's add tools to read notes in detail.

### get_note_content

This tool fetches a note's complete content:

```typescript
// Add to server/utils/chat/tools.ts
{
  name: 'get_note_content',
  description: 'Get the full content of a specific note by its slug. Use after searching to read the complete note.',
  input_schema: {
    type: 'object',
    properties: {
      slug: {
        type: 'string',
        description: "The note slug (e.g., 'atomic-habits')",
      },
    },
    required: ['slug'],
  },
}
```

Implementation:

```typescript
// server/utils/chat/search.ts
export async function getNoteContent(
  event: H3Event,
  slug: string,
): Promise<NoteContent | null> {
  const note = await queryCollection(event, 'content')
    .select('title', 'summary', 'path', 'stem', 'tags', 'type', 'notes', 'rawbody')
    .where('stem', '=', slug)
    .first()

  if (!note) return null

  return {
    title: note.title ?? 'Untitled',
    summary: note.summary ?? null,
    notes: note.notes ?? null,
    tags: note.tags ?? [],
    type: note.type ?? 'note',
    path: note.path ?? `/${slug}`,
    // Truncate body for token efficiency
    content: note.rawbody?.slice(0, 3000) ?? null,
  }
}
```

### get_note_details

For exploring connections between notes, we add a tool that reveals backlinks and forward links:

```typescript
// Add to server/utils/chat/tools.ts
{
  name: 'get_note_details',
  description: "Get a note's connections: backlinks (notes that link to it), forward links (notes it links to), and related notes.",
  input_schema: {
    type: 'object',
    properties: {
      slug: {
        type: 'string',
        description: "The note slug (e.g., 'atomic-habits')",
      },
      include_related: {
        type: 'boolean',
        description: 'Include semantically similar notes (default: true)',
      },
    },
    required: ['slug'],
  },
}
```

Implementation requires parsing wiki-links from note content:

```typescript
// server/api/chat.post.ts
const WIKI_LINK_PATTERN = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g

function parseWikiLinks(content: string | null): string[] {
  if (!content) return []
  const links: string[] = []
  let match
  while ((match = WIKI_LINK_PATTERN.exec(content)) !== null) {
    if (match[1]) links.push(match[1])
  }
  return [...new Set(links)]
}

async function findBacklinks(
  event: H3Event,
  slug: string,
): Promise<Array<{ title: string; path: string }>> {
  const allNotes = await queryCollection(event, 'content')
    .select('title', 'path', 'stem', 'notes')
    .limit(500)
    .all()

  const backlinks: Array<{ title: string; path: string }> = []

  for (const note of allNotes) {
    if (note.stem === slug) continue
    const links = parseWikiLinks(note.notes)
    if (links.includes(slug)) {
      backlinks.push({
        title: note.title ?? 'Untitled',
        path: note.path ?? `/${note.stem}`,
      })
    }
  }

  return backlinks
}
```

Now Claude can explore how notes connect - essential for a Zettelkasten-style Second Brain.

---

## Part 4: Semantic Search

Keyword search works well when you remember the exact words you used. But what if you search for "productivity" when your notes say "getting things done"? That's where semantic search comes in.

### The Vocabulary Mismatch Problem

Consider these searches:

- "productivity tips" → notes about "atomic habits", "deep work"
- "how to focus" → notes about "flow state", "attention management"
- "building habits" → notes about "habit stacking", "cue-routine-reward"

Keyword matching misses these connections. Semantic search finds them by comparing meaning, not words.

### Embeddings with Transformers.js

We use embeddings - numerical representations of text meaning. Similar meanings produce similar vectors.

Create `scripts/generate-embeddings.ts`:

```typescript
// scripts/generate-embeddings.ts
import { pipeline } from '@huggingface/transformers'
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const MODEL_NAME = 'Xenova/bge-small-en-v1.5'
const VECTOR_SIZE = 384

interface EmbeddingEntry {
  vector: number[]
  title: string
  type: string
}

interface EmbeddingsOutput {
  version: string
  model: string
  embeddings: Record<string, EmbeddingEntry>
}

async function main() {
  console.log('Loading embedding model...')
  const extractor = await pipeline('feature-extraction', MODEL_NAME, {
    dtype: 'fp32',
  })

  // Find all markdown files
  const files = await findMarkdownFiles('./content')
  console.log(`Found ${files.length} files`)

  const embeddings: Record<string, EmbeddingEntry> = {}

  for (const file of files) {
    const content = await readFile(file, 'utf-8')
    const { title, type } = parseFrontmatter(content)
    const body = extractBody(content)

    // Create embedding text from title + summary + body
    const text = `${title} ${body.slice(0, 1500)}`

    // Generate embedding
    const output = await extractor(text, { pooling: 'mean', normalize: true })
    const vector = Array.from(output.data as Float32Array)
      .map(v => Math.round(v * 100000) / 100000) // Reduce precision

    const slug = file.replace('./content/', '').replace('.md', '')
    embeddings[slug] = { vector, title, type }

    console.log(`[generated] ${slug}`)
  }

  const output: EmbeddingsOutput = {
    version: '1.0.0',
    model: MODEL_NAME,
    embeddings,
  }

  await writeFile('./public/embeddings.json', JSON.stringify(output))
  console.log('Done!')
}

main()
```

Run with `npx tsx scripts/generate-embeddings.ts`. This generates `public/embeddings.json` with vectors for all notes.

### Cosine Similarity

To find similar notes, we compare vectors using cosine similarity:

```typescript
// app/utils/cosineSimilarity.ts
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  const magnitude = Math.sqrt(normA) * Math.sqrt(normB)
  return magnitude === 0 ? 0 : dotProduct / magnitude
}
```

### Hybrid Search: Best of Both Worlds

Pure semantic search can miss exact matches. The solution: combine both approaches.

```typescript
// server/utils/chat/search.ts
const KEYWORD_WEIGHT = 0.4
const SEMANTIC_WEIGHT = 0.6

export async function hybridSearch(
  query: string,
  notes: RawNote[],
  options: { limit?: number; type?: string } = {},
): Promise<NoteContext[]> {
  const { limit = 5, type } = options
  const keywords = extractKeywords(query)

  // Run keyword and semantic search in parallel
  const [keywordResults, semanticResults] = await Promise.all([
    keywordSearch(query, notes, { limit: 50, type }),
    semanticSearch(query, 50),
  ])

  // Normalize keyword scores to 0-1 range
  const maxKeywordScore = Math.max(...keywordResults.map(r => r.score), 1)

  // Merge results with hybrid scoring
  const resultMap = new Map<string, HybridSearchResult>()

  for (const kr of keywordResults) {
    const normalizedScore = kr.score / maxKeywordScore
    resultMap.set(kr.slug, {
      ...kr,
      keywordScore: normalizedScore,
      semanticScore: 0,
      hybridScore: normalizedScore * KEYWORD_WEIGHT,
    })
  }

  for (const sr of semanticResults) {
    const existing = resultMap.get(sr.slug)
    if (existing) {
      existing.semanticScore = sr.score
      existing.hybridScore =
        existing.keywordScore * KEYWORD_WEIGHT +
        sr.score * SEMANTIC_WEIGHT
    } else {
      resultMap.set(sr.slug, {
        ...sr,
        keywordScore: 0,
        semanticScore: sr.score,
        hybridScore: sr.score * SEMANTIC_WEIGHT,
      })
    }
  }

  // Sort by hybrid score
  return Array.from(resultMap.values())
    .sort((a, b) => b.hybridScore - a.hybridScore)
    .slice(0, limit)
}
```

This gives us:

- 40% weight to keyword matches (exact hits matter)
- 60% weight to semantic similarity (find conceptual matches)

Update the `search_notes` tool to use hybrid search by default, with an option to use keyword-only for exact matching.

---

## Part 5: Putting It All Together

Here's the complete flow:

1. User sends a message
2. Server creates an event stream for real-time responses
3. Claude receives the message with tool definitions
4. Claude decides which tools to use and calls them
5. Server executes tools (hybrid search, content fetching)
6. Results are added to conversation, Claude continues
7. Claude synthesizes a response grounded in the user's notes
8. Response streams to the client with source citations

The system prompt ensures Claude:
- Only uses information from the tools
- Admits when it can't find something
- Always cites sources
- Speaks as the user's memory, not a general assistant

### Error Handling

Robust error handling improves user experience:

```typescript
// server/utils/chat/errors.ts
export interface StreamingError {
  message: string
  retryAfter?: number
  requestId?: string
}

export function mapApiError(error: unknown): StreamingError {
  if (error instanceof Anthropic.RateLimitError) {
    return {
      message: 'Too many requests. Please wait a moment.',
      retryAfter: 60,
    }
  }

  if (error instanceof Anthropic.APIError) {
    return {
      message: 'Service temporarily unavailable.',
      requestId: error.headers?.['x-request-id'],
    }
  }

  return {
    message: 'Something went wrong. Please try again.',
  }
}
```

Send error events to the client so the UI can display appropriate messages:

```typescript
await eventStream.push(JSON.stringify({
  type: 'error',
  message: streamingError.message,
  retryAfter: streamingError.retryAfter,
}))
```

---

## Conclusion

We've built a conversational AI that:

1. **Searches intelligently** - Hybrid search finds notes by keywords AND meaning
2. **Reads deeply** - Can fetch full content when summaries aren't enough
3. **Explores connections** - Understands backlinks and wiki-link relationships
4. **Stays grounded** - Only uses your knowledge, never makes things up

The agentic loop pattern is the key insight: Claude decides what to fetch, executes tools, and continues until it has enough information. This scales to hundreds of notes without stuffing everything into the prompt.

### Ideas for Extension

- **Conversation history** - Store chat history for multi-turn conversations
- **Note creation** - Let Claude help you capture new notes
- **Daily digest** - Summarize recent additions to your Second Brain
- **Spaced repetition** - Surface notes you haven't revisited
- **Voice interface** - Query your notes hands-free

Your Second Brain is only valuable if you can access what's in it. A conversational interface makes that access natural - just ask.

## Connections

For more on agentic patterns, see [[building-effective-agents]] and [[agentic-design-patterns]]. The hybrid search approach builds on concepts from [[ai-powered-search]].
