# AI Chat Feature Spec

## Overview

Add an AI-powered chat interface that lets users ask questions about their notes. The assistant uses tool-based RAG to dynamically search the knowledge base, retrieve relevant content, and answer using Claude with citations back to source notes.

**Access**: Public - no authentication required. Anyone can use the chat feature.

## User Experience

### Interaction Flow

1. User presses `Cmd+I` or clicks floating chat button (bottom-right)
2. Slideover panel opens from the right
3. User types a question
4. Claude dynamically searches notes using tools (search_notes, get_note_content)
5. Tool calls are displayed in the UI showing search progress
6. Claude streams a response, speaking as the user's "second brain"
7. Response includes clickable links to source notes
8. Chat history persists in localStorage

### UI Components

```text
┌─────────────────────────────────────────┐
│ ✕  Ask your Second Brain          [🗑️] │  <- Header with close + clear
├─────────────────────────────────────────┤
│                                         │
│  [User message bubble - right aligned]  │
│                                         │
│  ┌─ 🔍 Searching notes... ───────────┐  │  <- Tool call indicator
│  │  Query: "productivity books"      │  │
│  └───────────────────────────────────┘  │
│                                         │
│  [Assistant message - left aligned]     │
│  I remember you noted in [[Book Name]]  │
│  that...                                │
│                                         │
│  Sources:                               │
│  • Book Name                            │
│  • Podcast Episode                      │
│                                         │
├─────────────────────────────────────────┤
│ [Type your question...        ] [Send]  │  <- Input + submit
└─────────────────────────────────────────┘
```

### Empty State

When no messages exist, show example questions:
- "What books have I read about productivity?"
- "Summarize my notes on Vue.js"
- "What did I learn from recent podcasts?"

### Persona

The AI speaks as the user's Second Brain:
- "I remember you noted..."
- "Based on what you captured from..."
- "You highlighted in [Book Name] that..."

## Technical Architecture

### Components

```text
app/
├── components/
│   ├── ChatPanel.vue          # Main chat UI (Slideover + messages)
│   ├── ChatMessage.vue        # Individual message rendering
│   └── ToolCallItem.vue       # Tool call status display
├── composables/
│   └── useChatHistory.ts      # LocalStorage persistence
└── layouts/
    └── default.vue            # Mount ChatPanel + keyboard shortcut

server/
├── api/
│   └── chat.post.ts           # Streaming endpoint with tool loop
└── utils/
    └── chat/
        ├── errors.ts          # Error mapping and handling
        ├── messages.ts        # Message building utilities
        ├── search.ts          # Note search and scoring
        └── tools.ts           # Tool definitions and execution
```

### Data Flow

```text
┌──────────────┐     POST /api/chat      ┌─────────────────────┐
│  ChatPanel   │ ──────────────────────► │  chat.post.ts       │
│  (Vue)       │                         │                     │
│              │ ◄─────── SSE ────────── │  Tool Loop:         │
│  - text      │                         │  1. Claude response │
│  - tool_use  │                         │  2. Execute tools   │
│  - tool_result│                        │  3. Return results  │
│  - done      │                         │  4. Repeat or finish│
└──────────────┘                         └─────────────────────┘
```

## Implementation Details

### 1. Server Endpoint (`server/api/chat.post.ts`)

**Request:**
```typescript
interface ChatRequest {
  message: string
  history: Array<{ role: 'user' | 'assistant'; content: string }>
}
```

**Validation:**
```typescript
const MAX_MESSAGE_LENGTH = 4000
const MAX_HISTORY_MESSAGES = 20

// Validate message length
if (message.length > MAX_MESSAGE_LENGTH) {
  throw createError({
    statusCode: 400,
    statusMessage: 'Message too long',
    data: { message: `Maximum ${MAX_MESSAGE_LENGTH} characters.` },
  })
}

// Truncate history to prevent token overflow
const truncatedHistory = history.slice(-MAX_HISTORY_MESSAGES)
```

**Response:** Server-Sent Events stream with event types:
- `text` - Streamed response text
- `tool_use` - Tool being called (name, input)
- `tool_result` - Tool execution result
- `sources` - Referenced notes
- `error` - Error occurred
- `done` - Stream complete

**Tool Loop Logic:**
1. Build messages with system prompt + history + user message
2. Call Claude with available tools
3. If Claude requests tool use:
   - Execute tool (search_notes or get_note_content)
   - Send tool_use and tool_result events to client
   - Continue loop with tool results
4. If Claude returns text: stream to client
5. Repeat until Claude stops requesting tools
6. Send sources and done events

**Safety Limits:**
```typescript
const MAX_TOOL_ITERATIONS = 10

let iterations = 0
while (continueLoop) {
  iterations++
  if (iterations > MAX_TOOL_ITERATIONS) {
    await eventStream.push(JSON.stringify({
      type: 'error',
      message: 'Response took too long. Try a simpler question.',
    }))
    break
  }
  // ... tool loop
}
```

### 2. Tools (`server/utils/chat/tools.ts`)

**search_notes**
- Input: `{ query: string, type?: string }`
- Extracts keywords, scores notes by title/summary/tag matches
- Returns top 5 results with title, path, summary, type

**get_note_content**
- Input: `{ path: string }`
- Returns full note content (truncated to 5000 chars if needed)
- Includes title, summary, notes, tags

### 3. Search Algorithm (`server/utils/chat/search.ts`)

```typescript
// Keyword scoring
if (titleLower.includes(keyword)) score += 2
if (summaryLower.includes(keyword)) score += 1
if (matchesTag(tagsLower, keyword)) score += 3

// Results limited to top 5
```

**Future improvements:**
- Add stemming for better matching
- Add fuzzy matching for typos
- Add phrase matching

### 4. Chat Panel (`app/components/ChatPanel.vue`)

**Dependencies:**
- `USlideover` - Slide-out container
- `UTextarea` - Message input
- `UButton` - Send button
- `ChatMessage` - Message rendering
- `ToolCallItem` - Tool call display
- `defineShortcuts` - Keyboard shortcut (Cmd+I)

**State:**
```typescript
const open = ref(false)
const input = ref('')
const status = ref<'ready' | 'streaming' | 'error'>('ready')
const currentAssistantMessage = ref('')
const toolCalls = ref<ToolCall[]>([])
```

**SSE Handling:**
```typescript
// Buffer for handling chunked data
let buffer = ''

while (true) {
  const { done, value } = await reader.read()
  if (done) break

  buffer += decoder.decode(value, { stream: true })
  const lines = buffer.split('\n')
  buffer = lines.pop() || '' // Keep incomplete line

  for (const line of lines) {
    if (!line.trim()) continue
    const data = parseSSELine(line)
    // Handle text, tool_use, tool_result, sources, done
  }
}
```

**Abort Support:**
```typescript
const abortController = ref<AbortController | null>(null)

async function sendMessage() {
  abortController.value = new AbortController()

  const response = await fetch('/api/chat', {
    signal: abortController.value.signal,
    // ...
  })
}

onUnmounted(() => {
  abortController.value?.abort()
})
```

### 5. Chat History (`app/composables/useChatHistory.ts`)

```typescript
interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: Array<{ title: string; path: string }>
  toolCalls?: ToolCall[]
  timestamp: number
}

interface ToolCall {
  id: string
  name: string
  input: unknown
  result?: string
  status: 'pending' | 'complete' | 'error'
}

const MAX_STORED_MESSAGES = 100

export function useChatHistory() {
  const messages = useLocalStorage<ChatMessage[]>('sb-chat-messages', [])

  function addMessage(msg: Omit<ChatMessage, 'id' | 'timestamp'>) {
    try {
      messages.value.push({
        ...msg,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
      })
      // Prune old messages
      if (messages.value.length > MAX_STORED_MESSAGES) {
        messages.value = messages.value.slice(-MAX_STORED_MESSAGES)
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        messages.value = messages.value.slice(-50)
        addMessage(msg)
      }
    }
  }

  function clearHistory() {
    messages.value = []
  }

  return { messages, addMessage, clearHistory }
}
```

### 6. Error Handling (`server/utils/chat/errors.ts`)

```typescript
export function mapApiError(error: unknown): {
  statusCode: number
  message: string
  retryAfter?: number
} {
  if (error instanceof Anthropic.APIError) {
    switch (error.status) {
      case 400: return { statusCode: 400, message: 'Invalid request' }
      case 401: return { statusCode: 500, message: 'API configuration error' }
      case 429: return {
        statusCode: 429,
        message: 'Rate limited. Please wait.',
        retryAfter: 60
      }
      case 529: return { statusCode: 503, message: 'Service overloaded' }
      default: return { statusCode: 500, message: 'API error' }
    }
  }
  return { statusCode: 500, message: 'Unexpected error' }
}
```

### 7. Runtime Config

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    anthropicApiKey: '' // Set via NUXT_ANTHROPIC_API_KEY (server-only)
  }
})
```

### 8. System Prompt

```text
You are the user's Second Brain - a personal knowledge assistant with access to their notes and highlights.

You have tools to search and retrieve notes. Use them to find relevant information before answering.

When answering questions:
- Speak as if you ARE their memory ("I remember you noted...", "Based on what you captured...")
- Reference specific notes by name when relevant
- If the notes don't contain relevant information, say so honestly
- Keep responses concise but helpful

Always end your response with a "Sources:" section listing the notes you referenced, formatted as:
Sources:
- [Note Title](/path/to/note)
```

## Configuration

| Setting | Value |
|---------|-------|
| Model | `claude-haiku-3-5-20241022` |
| Max tokens | 1024 |
| Max message length | 4000 characters |
| Max history messages | 20 (sent to API) |
| Max stored messages | 100 (localStorage) |
| Max tool iterations | 10 |
| Max note content | 5000 characters |
| Keyboard shortcut | `Cmd+I` |
| History storage | localStorage (`sb-chat-messages`) |

## Security

### Input Validation
- Message length capped at 4000 characters
- History truncated to last 20 messages
- Tool inputs validated before execution

### Rate Limiting
Basic IP-based rate limiting via server middleware:

```typescript
// server/middleware/chat-rate-limit.ts
const RATE_LIMIT = {
  requests: 30,
  windowMs: 60 * 1000, // 1 minute
}
```

### API Key Protection
- Key stored in server-only runtimeConfig
- Never exposed to client

## Error Recovery

### Client-Side
- Retry button shown on error
- Abort controller cancels in-flight requests
- Graceful handling of network disconnection

### Server-Side
- Tool execution timeout (5 seconds)
- Max iterations limit prevents infinite loops
- Comprehensive error mapping with user-friendly messages

## Accessibility

- ARIA live region for streaming messages
- Keyboard navigation (Cmd+I to open, Escape to close)
- Focus management on open/close
- Screen reader announcements for tool calls

## Mobile Support

- Full-width slideover on mobile
- Touch-friendly button sizes
- Keyboard dismissal on send

## File Structure

| File | Description |
|------|-------------|
| `server/api/chat.post.ts` | Streaming endpoint with tool loop |
| `server/utils/chat/errors.ts` | Error mapping utilities |
| `server/utils/chat/messages.ts` | Message building |
| `server/utils/chat/search.ts` | Note search and scoring |
| `server/utils/chat/tools.ts` | Tool definitions and execution |
| `app/components/ChatPanel.vue` | Main chat UI |
| `app/components/ChatMessage.vue` | Message rendering |
| `app/components/ToolCallItem.vue` | Tool call display |
| `app/composables/useChatHistory.ts` | History persistence |
| `app/layouts/default.vue` | Mount point + keyboard shortcut |

## Dependencies

```bash
pnpm add @anthropic-ai/sdk
```

## Environment Variables

```bash
NUXT_ANTHROPIC_API_KEY=sk-ant-...
```

## Testing Requirements

### Unit Tests
- `errors.test.ts` - Error mapping
- `search.test.ts` - Search utilities
- `messages.test.ts` - Message building
- `tools.test.ts` - Tool validation
- `useChatHistory.test.ts` - History composable

### Component Tests
- ChatPanel.vue - User interactions
- ChatMessage.vue - Message rendering
- ToolCallItem.vue - Tool call display

### Integration Tests
- Full chat flow with mocked API
- SSE parsing with chunked data
- Error recovery scenarios

## Out of Scope (Future)

- Multiple conversations/sessions
- Semantic search with embeddings
- Save conversations as notes
- Model selection in UI
- Filter by content type
- Prompt caching optimization
- Search stemming/fuzzy matching
