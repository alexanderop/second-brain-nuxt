<script setup lang="ts">
import { computed, ref } from 'vue'
import { UIcon } from '#components'
import { extractYouTubeVideoId, getYouTubeEmbedUrl, getYouTubeThumbnailUrl } from '~/utils/youtube'

const props = defineProps<{
  url: string
}>()

const videoId = computed(() => extractYouTubeVideoId(props.url))
const embedUrl = computed(() => videoId.value ? getYouTubeEmbedUrl(videoId.value) : null)
const thumbnailUrl = computed(() => videoId.value ? getYouTubeThumbnailUrl(videoId.value) : undefined)

// Facade pattern: show thumbnail until user clicks to load iframe
const isActivated = ref(false)

function activate() {
  isActivated.value = true
}
</script>

<template>
  <div
    v-if="videoId"
    class="mb-8 rounded-xl overflow-hidden border border-[var(--ui-border)] bg-black"
  >
    <div class="relative w-full" style="aspect-ratio: 16/9;">
      <!-- Facade: Thumbnail with play button overlay -->
      <button
        v-if="!isActivated"
        type="button"
        class="absolute inset-0 w-full h-full cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        aria-label="Play video"
        @click="activate"
      >
        <!-- Thumbnail image -->
        <img
          :src="thumbnailUrl"
          alt="Video thumbnail"
          class="w-full h-full object-cover"
          loading="lazy"
        >

        <!-- Dark overlay for better play button visibility -->
        <div class="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />

        <!-- Play button -->
        <div class="absolute inset-0 flex items-center justify-center">
          <div
            class="w-16 h-16 sm:w-20 sm:h-20 bg-red-600 rounded-full flex items-center justify-center shadow-lg group-hover:bg-red-500 group-hover:scale-110 transition-all"
          >
            <UIcon
              name="i-lucide-play"
              class="size-8 sm:size-10 text-white ml-1"
            />
          </div>
        </div>
      </button>

      <!-- Actual iframe (loaded after activation) -->
      <iframe
        v-else
        :src="`${embedUrl}?autoplay=1&rel=0`"
        class="absolute inset-0 w-full h-full"
        title="YouTube video player"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
      />
    </div>
  </div>
</template>
