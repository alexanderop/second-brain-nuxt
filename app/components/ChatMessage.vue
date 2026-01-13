<script setup lang="ts">
import { NuxtLink } from '#components'
import type { ChatMessage } from '~/composables/useChatHistory'

interface Props {
  message: Pick<ChatMessage, 'id' | 'role' | 'content' | 'sources'>
  messageClass: string
  sourceLinkClass: string
}

defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

function handleSourceClick(): void {
  emit('close')
}
</script>

<template>
  <div class="flex" :class="message.role === 'user' ? 'justify-end' : 'justify-start'">
    <div class="max-w-[85%] rounded-lg px-4 py-2" :class="messageClass">
      <p class="whitespace-pre-wrap">{{ message.content }}</p>

      <div
        v-if="message.role === 'assistant' && message.sources && message.sources.length > 0"
        class="mt-3 pt-2 border-t border-[var(--ui-border)]"
      >
        <p class="text-xs font-medium mb-1 opacity-70">Sources:</p>
        <ul class="space-y-1">
          <li v-for="source in message.sources" :key="source.path">
            <NuxtLink
              :to="source.path"
              class="text-sm hover:underline"
              :class="sourceLinkClass"
              @click="handleSourceClick"
            >
              {{ source.title }}
            </NuxtLink>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
