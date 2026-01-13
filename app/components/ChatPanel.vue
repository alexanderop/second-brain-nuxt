<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import { USlideover, UButton, UTextarea, UIcon } from '#components'
import { useChatHistory, type ChatMessage, type ToolCall } from '~/composables/useChatHistory'
import ChatMessageComponent from '~/components/ChatMessage.vue'
import ToolCallItem from '~/components/ToolCallItem.vue'
import { tryCatch, tryAsync, tryCatchAsync } from '../../shared/utils/tryCatch'

type ChatStatus = 'ready' | 'streaming' | 'error'

type ChatItem =
  | { type: 'message'; id: string; role: 'user' | 'assistant'; content: string; sources?: ChatMessage['sources'] }
  | { type: 'tool_call'; id: string; tool: string; input: unknown; result?: unknown }

const open = defineModel<boolean>('open', { default: false })

const { messages, addMessage, updateLastMessage, addToolCallToLastMessage, clearHistory } = useChatHistory()
const input = ref('')
const status = ref<ChatStatus>('ready')
const messagesContainer = ref<HTMLElement | null>(null)
const pendingToolCalls = ref<Map<string, ToolCall>>(new Map())

// Convert messages to a flattened chat flow with tool calls inline
const chatItems = computed((): ChatItem[] => {
  return messages.value.flatMap((msg): ChatItem[] => {
    if (msg.role === 'user') {
      return [{ type: 'message', id: msg.id, role: 'user', content: msg.content }]
    }
    // For assistant messages, render tool calls BEFORE the message content
    const toolCallItems: ChatItem[] = (msg.toolCalls ?? []).map(tc => ({
      type: 'tool_call' as const,
      id: tc.id,
      tool: tc.tool,
      input: tc.input,
      result: tc.result,
    }))
    return [
      ...toolCallItems,
      { type: 'message', id: msg.id, role: 'assistant', content: msg.content, sources: msg.sources },
    ]
  })
})

// Auto-scroll to bottom when new messages arrive
function scrollToBottom(): void {
  nextTick(() => {
    messagesContainer.value?.scrollTo({ top: messagesContainer.value.scrollHeight })
  })
}

watch(() => messages.value.length, scrollToBottom)
watch(() => messages.value[messages.value.length - 1]?.content, scrollToBottom)
watch(() => chatItems.value.length, scrollToBottom)

interface SSEData {
  type: 'text' | 'tool_call' | 'tool_result' | 'done' | 'error'
  id?: string
  content?: string
  tool?: string
  input?: unknown
  result?: unknown
  sources?: ChatMessage['sources']
  message?: string
  retryAfter?: number
  requestId?: string
}


const SSE_EVENT_TYPES: readonly string[] = ['text', 'tool_call', 'tool_result', 'done', 'error']

function isSSEData(data: unknown): data is SSEData {
  if (typeof data !== 'object' || data === null) return false
  if (!('type' in data)) return false
  const { type } = data
  return typeof type === 'string' && SSE_EVENT_TYPES.includes(type)
}

function parseSSELine(line: string): SSEData | null {
  const dataMatch = /^data:\s*(.+)$/.exec(line)
  if (!dataMatch?.[1]) return null

  const jsonStr = dataMatch[1]
  const [error, parsed] = tryCatch((): unknown => JSON.parse(jsonStr))
  if (error) return null
  return isSSEData(parsed) ? parsed : null
}

function buildErrorMessage(data: SSEData): string {
  let errorMessage = data.message || 'An error occurred'
  if (data.retryAfter) errorMessage += ` Try again in ${data.retryAfter} seconds.`
  if (data.requestId) errorMessage += ` (Request ID: ${data.requestId})`
  return errorMessage
}

function handleToolCall(data: SSEData, assistantContent: string): { content: string } {
  if (!data.id) return { content: assistantContent }

  const toolCall = {
    id: data.id,
    tool: data.tool || 'unknown',
    input: data.input,
  }
  pendingToolCalls.value.set(data.id, toolCall)
  // Add tool call immediately so it appears in UI right away
  addToolCallToLastMessage(toolCall)
  return { content: assistantContent }
}

function handleToolResult(data: SSEData, assistantContent: string): { content: string } {
  if (!data.id) return { content: assistantContent }

  const toolCall = pendingToolCalls.value.get(data.id)
  if (toolCall) {
    toolCall.result = data.result
    // Update the existing tool call with the result
    addToolCallToLastMessage(toolCall)
  }
  return { content: assistantContent }
}

function processSSEData(
  data: SSEData,
  assistantContent: string,
): { content: string; sources?: ChatMessage['sources']; error?: string } {
  if (data.type === 'tool_call') return handleToolCall(data, assistantContent)
  if (data.type === 'tool_result') return handleToolResult(data, assistantContent)

  if (data.type === 'text') return { content: assistantContent + (data.content || '') }
  if (data.type === 'done') return { content: assistantContent, sources: data.sources || [] }
  if (data.type === 'error') return { content: assistantContent, error: buildErrorMessage(data) }
  return { content: assistantContent }
}

async function streamResponse(response: Response): Promise<void> {
  if (!response.body) {
    throw new Error('No response body')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let assistantContent = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const chunk = decoder.decode(value)
    const lines = chunk.split('\n').filter(line => line.trim())

    for (const line of lines) {
      const data = parseSSELine(line)
      if (!data) continue

      const result = processSSEData(data, assistantContent)
      assistantContent = result.content

      if (result.error) {
        throw new Error(result.error)
      }

      updateLastMessage(assistantContent, result.sources)
    }
  }
}

async function getErrorMessage(response: Response): Promise<string> {
  const [error, data] = await tryAsync(response.json())
  if (error) return `Request failed (${response.status})`
  // H3 error format includes data.message or statusMessage
  return data?.data?.message || data?.message || data?.statusMessage || `Request failed (${response.status})`
}

async function sendMessage() {
  const messageText = input.value.trim()
  if (!messageText || status.value === 'streaming') return

  input.value = ''
  status.value = 'streaming'
  pendingToolCalls.value.clear()

  // Add user message and placeholder for assistant response
  addMessage({ role: 'user', content: messageText })
  addMessage({ role: 'assistant', content: '' })

  const [error] = await tryCatchAsync(async () => {
    const history = messages.value
      .slice(0, -2)
      .map(m => ({ role: m.role, content: m.content }))

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: messageText, history }),
    })

    if (!response.ok) {
      const errorMessage = await getErrorMessage(response)
      throw new Error(errorMessage)
    }

    await streamResponse(response)
  })

  if (error) {
    console.error('Chat error:', error)
    status.value = 'error'
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
    updateLastMessage(`Error: ${errorMessage}`)
    return
  }

  status.value = 'ready'
}

function handleKeydown(event: KeyboardEvent): void {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}

function handleClearHistory(): void {
  clearHistory()
  status.value = 'ready'
}

const showStreamingIndicator = computed(() => {
  const lastMessage = messages.value[messages.value.length - 1]
  return status.value === 'streaming' && lastMessage?.role === 'assistant' && lastMessage?.content === ''
})

function getMessageClass(role: string): string {
  return role === 'user'
    ? 'bg-[var(--ui-primary)] text-[var(--ui-bg)]'
    : 'bg-[var(--ui-bg-muted)]'
}

function getSourceLinkClass(role: string): string {
  return role === 'user' ? 'text-[var(--ui-bg)]' : 'text-[var(--ui-primary)]'
}
</script>

<template>
  <div>
    <!-- Floating button -->
    <UButton
      v-if="!open"
      icon="i-lucide-brain"
      size="lg"
      color="primary"
      class="fixed bottom-6 right-6 z-50 shadow-lg"
      aria-label="Open chat"
      @click="open = true"
    />

    <!-- Chat slideover -->
    <USlideover v-model:open="open" title="Ask your Second Brain" side="right">
      <template #header>
        <div class="flex items-center justify-between w-full">
          <h2 class="text-lg font-semibold">Ask your Second Brain</h2>
          <UButton
            v-if="messages.length > 0"
            icon="i-lucide-trash-2"
            size="sm"
            color="neutral"
            variant="ghost"
            aria-label="Clear history"
            @click="handleClearHistory"
          />
        </div>
      </template>

      <template #body>
        <div class="flex flex-col h-full">
          <!-- Messages area -->
          <div ref="messagesContainer" class="flex-1 overflow-y-auto space-y-4 pb-4">
            <!-- Empty state -->
            <div v-if="chatItems.length === 0" class="flex flex-col items-center justify-center h-full text-center text-[var(--ui-text-muted)]">
              <span class="i-lucide-brain size-12 mb-4 opacity-50" aria-hidden="true" />
              <p class="text-lg font-medium">Ask me anything</p>
              <p class="text-sm mt-1">I'll search your notes and help you find connections.</p>
            </div>

            <!-- Chat items (messages and tool calls) -->
            <template v-for="item in chatItems" :key="item.id">
              <!-- Tool call item -->
              <ToolCallItem
                v-if="item.type === 'tool_call'"
                :id="item.id"
                :tool="item.tool"
                :input="item.input"
                :result="item.result"
              />

              <!-- Message item -->
              <ChatMessageComponent
                v-else
                :message="{ id: item.id, role: item.role, content: item.content, sources: item.sources }"
                :message-class="getMessageClass(item.role)"
                :source-link-class="getSourceLinkClass(item.role)"
                @close="open = false"
              />
            </template>

            <!-- Streaming indicator -->
            <div v-if="showStreamingIndicator" class="flex justify-start">
              <div class="bg-[var(--ui-bg-muted)] rounded-lg px-4 py-2">
                <span class="flex gap-1">
                  <span class="w-2 h-2 bg-current rounded-full animate-bounce" style="animation-delay: 0ms" />
                  <span class="w-2 h-2 bg-current rounded-full animate-bounce" style="animation-delay: 150ms" />
                  <span class="w-2 h-2 bg-current rounded-full animate-bounce" style="animation-delay: 300ms" />
                </span>
              </div>
            </div>
          </div>

          <!-- Input area -->
          <div class="border-t border-[var(--ui-border)] pt-4">
            <div class="flex gap-2">
              <UTextarea
                v-model="input"
                placeholder="Type your question..."
                :rows="1"
                autoresize
                :maxrows="4"
                class="flex-1"
                :disabled="status === 'streaming'"
                @keydown="handleKeydown"
              />
              <UButton
                icon="i-lucide-send"
                :disabled="!input.trim() || status === 'streaming'"
                :loading="status === 'streaming'"
                aria-label="Send message"
                @click="sendMessage"
              />
            </div>
            <p class="text-xs text-[var(--ui-text-muted)] mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </template>
    </USlideover>
  </div>
</template>
