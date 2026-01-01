<script setup lang="ts">
const route = useRoute()
const authorSlug = computed(() => decodeURIComponent(route.params.name as string))

const { data: authorData } = await useAsyncData(`author-data-${authorSlug.value}`, () => {
  return queryCollection('authors')
    .where('slug', '=', authorSlug.value)
    .first()
})

const { data: items } = await useAsyncData(`author-${authorSlug.value}`, () => {
  return queryCollection('content')
    .where('authors', 'LIKE', `%${authorSlug.value}%`)
    .order('date', 'DESC')
    .all()
})

const authorName = computed(() => authorData.value?.name ?? authorSlug.value)

useSeoMeta({
  title: () => `${authorName.value} - Second Brain`,
})

const socialLinks = computed(() => {
  if (!authorData.value?.socials) return []
  const socials = authorData.value.socials
  const links = []
  if (socials.twitter) links.push({ icon: 'i-lucide-twitter', url: `https://twitter.com/${socials.twitter}`, label: 'Twitter' })
  if (socials.github) links.push({ icon: 'i-lucide-github', url: `https://github.com/${socials.github}`, label: 'GitHub' })
  if (socials.linkedin) links.push({ icon: 'i-lucide-linkedin', url: `https://linkedin.com/in/${socials.linkedin}`, label: 'LinkedIn' })
  if (socials.youtube) links.push({ icon: 'i-lucide-youtube', url: `https://youtube.com/@${socials.youtube}`, label: 'YouTube' })
  return links
})
</script>

<template>
  <div>
    <div class="mb-6">
      <div class="flex items-center gap-3 mb-4">
        <NuxtLink to="/authors" class="text-[var(--ui-text-muted)] hover:text-[var(--ui-text)]">
          <UIcon name="i-lucide-arrow-left" class="size-5" />
        </NuxtLink>
        <UAvatar
          v-if="authorData?.avatar"
          :src="authorData.avatar"
          :alt="authorName"
          size="lg"
        />
        <UIcon v-else name="i-lucide-user" class="size-6" />
        <h1 class="text-2xl font-semibold">
          {{ authorName }}
        </h1>
        <span class="text-[var(--ui-text-muted)]">
          ({{ items?.length ?? 0 }})
        </span>
      </div>

      <div v-if="authorData?.bio" class="text-[var(--ui-text-muted)] mb-4">
        {{ authorData.bio }}
      </div>

      <div v-if="authorData?.website || socialLinks.length" class="flex items-center gap-3">
        <UButton
          v-if="authorData?.website"
          :to="authorData.website"
          target="_blank"
          variant="ghost"
          size="sm"
          icon="i-lucide-globe"
        >
          Website
        </UButton>
        <UButton
          v-for="link in socialLinks"
          :key="link.label"
          :to="link.url"
          target="_blank"
          variant="ghost"
          size="sm"
          :icon="link.icon"
        >
          {{ link.label }}
        </UButton>
      </div>
    </div>

    <ContentList :items="items ?? []" />
  </div>
</template>
