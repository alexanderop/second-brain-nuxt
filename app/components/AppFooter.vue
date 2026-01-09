<script setup lang="ts">
import { UButton } from '#components'
import { useSiteConfig } from '~/composables/useSiteConfig'

const { social } = useSiteConfig()
</script>

<template>
  <footer v-if="social.github" class="py-4 border-t border-[var(--ui-border)]">
    <div class="flex justify-center">
      <UButton
        :to="social.github"
        target="_blank"
        variant="ghost"
        color="neutral"
        icon="i-lucide-github"
      >
        Source
      </UButton>
    </div>
  </footer>
</template>
