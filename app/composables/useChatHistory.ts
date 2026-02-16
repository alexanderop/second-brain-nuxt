import type { RemovableRef } from '@vueuse/core'
import { useLocalStorage } from '@vueuse/core'
import { tryCatch } from '#shared/utils/tryCatch'

export interface Source {
  title: string
  path: string
}

export interface ToolCall {
  id: string
  tool: string
  input: unknown
  result?: unknown
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: Source[]
  toolCalls?: ToolCall[]
  timestamp: number
}

interface ChatHistoryReturn {
  messages: RemovableRef<ChatMessage[]>
  addMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void
  updateLastMessage: (content: string, sources?: Source[], toolCalls?: ToolCall[]) => void
  addToolCallToLastMessage: (toolCall: ToolCall) => void
  clearHistory: () => void
}

export function useChatHistory(): ChatHistoryReturn {
  const messages = useLocalStorage<ChatMessage[]>('sb-chat-messages', [], {
    serializer: {
      read(raw: string): ChatMessage[] {
        const [error, parsed] = tryCatch((): unknown => JSON.parse(raw))
        if (error || !Array.isArray(parsed)) return []
        return parsed.filter((entry: unknown): entry is ChatMessage => {
          if (typeof entry !== 'object' || entry === null) return false
          if (!('id' in entry) || !('content' in entry) || !('role' in entry)) return false
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- type guard requires narrowing
          const obj = entry as Record<string, unknown>
          return typeof obj.id === 'string'
            && typeof obj.content === 'string'
            && (obj.role === 'user' || obj.role === 'assistant')
        })
      },
      write(value: ChatMessage[]): string {
        return JSON.stringify(value)
      },
    },
  })

  function addMessage(msg: Omit<ChatMessage, 'id' | 'timestamp'>): void {
    messages.value.push({
      ...msg,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    })
  }

  function updateLastMessage(
    content: string,
    sources?: Source[],
    toolCalls?: ToolCall[],
  ): void {
    const last = messages.value[messages.value.length - 1]
    if (last) {
      last.content = content
      if (sources) last.sources = sources
      if (toolCalls) last.toolCalls = toolCalls
    }
  }

  function addToolCallToLastMessage(toolCall: ToolCall): void {
    const last = messages.value[messages.value.length - 1]
    if (!last) return

    if (!last.toolCalls) last.toolCalls = []
    // Update existing tool call or add new one
    const existing = last.toolCalls.find(tc => tc.id === toolCall.id)
    if (existing) {
      Object.assign(existing, toolCall)
      return
    }
    last.toolCalls.push(toolCall)
  }

  function clearHistory(): void {
    messages.value = []
  }

  return { messages, addMessage, updateLastMessage, addToolCallToLastMessage, clearHistory }
}
