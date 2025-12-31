<script setup lang="ts">
const open = defineModel<boolean>('open', { default: false })
const searchTerm = ref('')
const route = useRoute()

const { data: allContent } = await useAsyncData('search-content', () => {
  return queryCollection('content').order('date', 'DESC').all()
})

// Close modal when route changes (handles all navigation scenarios)
watch(() => route.fullPath, () => {
  open.value = false
})

const groups = computed(() => {
  const items = (allContent.value ?? []).map(item => ({
    id: item.stem,
    label: item.title,
    suffix: item.type,
    icon: getTypeIcon(item.type),
    to: `/${item.stem}`,
  }))

  return [{
    id: 'content',
    label: 'Content',
    items,
  }]
})

function getTypeIcon(type: string) {
  const icons: Record<string, string> = {
    youtube: 'i-lucide-youtube',
    podcast: 'i-lucide-mic',
    article: 'i-lucide-newspaper',
    book: 'i-lucide-book-open',
    movie: 'i-lucide-film',
    tv: 'i-lucide-tv',
    tweet: 'i-lucide-twitter',
    quote: 'i-lucide-quote',
    course: 'i-lucide-graduation-cap',
    note: 'i-lucide-pencil',
  }
  return icons[type] ?? 'i-lucide-file'
}

function onSelect(item: { to?: string }) {
  if (item.to) {
    navigateTo(item.to)
  }
}
</script>

<template>
  <UModal v-model:open="open">
    <template #content>
      <UCommandPalette
        v-model:search-term="searchTerm"
        :groups="groups"
        placeholder="Search content..."
        close
        class="h-96"
        :fuse="{
          fuseOptions: {
            ignoreLocation: true,
            threshold: 0.3,
            keys: ['label', 'suffix'],
          },
          resultLimit: 12,
        }"
        @update:open="open = $event"
        @select="onSelect"
      />
    </template>
  </UModal>
</template>
