<script setup lang="ts">
/**
 * Conditional render component for feature toggles.
 *
 * @example
 * <Feature name="chat">
 *   <ChatPanel />
 * </Feature>
 *
 * @example
 * <Feature name="chat" not>
 *   <p>Chat coming soon!</p>
 * </Feature>
 */

import { computed } from 'vue'
import type { FeatureName } from '~~/features.config'
import { useFeature } from '~/composables/useFeature'

const props = defineProps<{
  name: FeatureName
  variant?: string
  not?: boolean
}>()

const { isEnabled, isVariantActive } = useFeature(props.name)

const shouldRender = computed(() => {
  const result = props.variant
    ? isVariantActive(props.variant)
    : isEnabled.value

  return props.not ? !result : result
})
</script>

<template>
  <template v-if="shouldRender">
    <slot />
  </template>
  <template v-else>
    <slot name="fallback" />
  </template>
</template>
