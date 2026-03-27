<script setup lang="ts">
import { computed } from 'vue';

import type { NuxtError } from '#app';
import { UButton } from '#components';
import { clearError, useHead } from '#imports';

const props = defineProps<{
  error: NuxtError;
}>();

const status = computed(() => props.error.statusCode || 500);

const statusText = computed(() => {
  if (props.error.statusMessage) return props.error.statusMessage;
  const messages: Record<number, string> = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Page Not Found',
    500: 'Internal Server Error',
    503: 'Service Unavailable',
  };
  return messages[status.value] || 'Something went wrong';
});

function handleError() {
  clearError({ redirect: '/' });
}

useHead({
  title: `${status.value} — ${statusText.value}`,
});
</script>

<template>
  <main class="min-h-screen flex flex-col items-center justify-center px-4 text-center">
    <p
      class="font-mono text-8xl sm:text-9xl font-semibold text-neutral-300 dark:text-neutral-700 mb-4"
    >
      {{ status }}
    </p>

    <h1 class="text-2xl sm:text-3xl font-semibold mb-3">
      {{ statusText }}
    </h1>

    <p
      v-if="error.message && error.message !== statusText"
      class="text-[var(--ui-text-muted)] max-w-md mb-8"
    >
      {{ error.message }}
    </p>

    <UButton
      to="/"
      size="lg"
      @click="handleError"
    >
      Go home
    </UButton>
  </main>
</template>
