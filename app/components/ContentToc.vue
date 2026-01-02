<script setup lang="ts">
import { useTocScrollspy } from '~/composables/useTocScrollspy'

interface TocLink {
  id: string
  text: string
  depth: number
  children?: TocLink[]
}

defineProps<{
  links: TocLink[]
  title?: string
}>()

const { activeId } = useTocScrollspy()

function flattenLinks(links: TocLink[]): string[] {
  const ids: string[] = []
  for (const link of links) {
    ids.push(link.id)
    if (link.children) {
      ids.push(...flattenLinks(link.children))
    }
  }
  return ids
}
</script>

<template>
  <nav class="space-y-3">
    <p v-if="title" class="text-sm font-semibold text-[var(--ui-text-highlighted)]">
      {{ title }}
    </p>

    <ul class="space-y-1 border-l border-[var(--ui-border)]">
      <template v-for="link in links" :key="link.id">
        <li class="relative">
          <a
            :href="`#${link.id}`"
            class="block py-1.5 text-sm transition-colors"
            :class="[
              activeId === link.id
                ? 'text-[var(--ui-primary)] font-medium pl-4 -ml-px border-l-2 border-[var(--ui-primary)]'
                : 'text-[var(--ui-text-muted)] hover:text-[var(--ui-text)] pl-4',
            ]"
          >
            {{ link.text }}
          </a>

          <ul v-if="link.children?.length" class="space-y-1">
            <li v-for="child in link.children" :key="child.id" class="relative">
              <a
                :href="`#${child.id}`"
                class="block py-1 text-sm transition-colors"
                :class="[
                  activeId === child.id
                    ? 'text-[var(--ui-primary)] font-medium pl-8 -ml-px border-l-2 border-[var(--ui-primary)]'
                    : 'text-[var(--ui-text-muted)] hover:text-[var(--ui-text)] pl-8',
                ]"
              >
                {{ child.text }}
              </a>
            </li>
          </ul>
        </li>
      </template>
    </ul>
  </nav>
</template>
