# Newsletter System Specification

This spec defines newsletter support for Second Brain, following the established podcast/author patterns.

## Overview

Newsletters (Substack, beehiiv, Ghost, etc.) are a first-class content type with:
- **Newsletter profiles** — Publication metadata in `content/newsletters/`
- **Newsletter articles** — Content items linked to parent newsletters
- **Author integration** — Writers linked via existing authors system

---

## 1. Data Model

### 1.1 Newsletter Profile Collection

**Location:** `content/newsletters/*.md`

**Schema:**
```typescript
newsletters: defineCollection({
  type: 'data',
  source: 'newsletters/**/*.md',
  schema: z.object({
    name: z.string(),                              // "Lenny's Newsletter"
    slug: z.string(),                              // "lennys-newsletter"
    description: z.string().optional(),            // Tagline/about
    logo: z.string().url().optional(),             // Publication logo URL (external)
    website: z.string().url().optional(),          // Homepage URL
    authors: z.array(z.string()).min(1),           // Author slugs (primary writers)
    platform: z.enum([
      'substack', 'beehiiv', 'ghost', 'convertkit',
      'buttondown', 'revue', 'mailchimp', 'other'
    ]).optional(),                                 // Internal - not displayed in UI
    topics: z.array(z.string()).optional(),        // Main topics covered
  }),
})
```

**Example newsletter profile:**
```yaml
# content/newsletters/lennys-newsletter.md
---
name: "Lenny's Newsletter"
slug: "lennys-newsletter"
description: "Advice for building product, driving growth, and accelerating your career"
logo: "https://substackcdn.com/image/fetch/..."
website: "https://www.lennysnewsletter.com"
authors:
  - lenny-rachitsky
platform: substack
topics:
  - product-management
  - growth
  - startup
---
```

### 1.2 Content Schema Updates

**Add to `externalContentTypes`:**
```typescript
const externalContentTypes = [
  // ... existing types
  'newsletter',
] as const
```

**Add newsletter fields to content schema:**
```typescript
// In content collection schema
newsletter: z.string().optional(),           // Slug of parent newsletter
issueNumber: z.number().optional(),          // Issue #123 (optional, only if visible)
guest_author: z.string().optional(),         // For one-off guest contributors
```

**Example newsletter article:**
```yaml
# content/how-to-get-better-at-product-prioritization.md
---
title: "How to get better at product prioritization"
type: newsletter
newsletter: lennys-newsletter
issueNumber: 234
url: "https://www.lennysnewsletter.com/p/how-to-get-better-at-product"
tags:
  - product-management
  - prioritization
authors:
  - lenny-rachitsky
summary: "A deep dive into frameworks for making prioritization decisions..."
date: 2024-03-20
---
```

**Guest post example:**
```yaml
# content/guest-post-on-metrics.md
---
title: "The Metrics That Matter"
type: newsletter
newsletter: lennys-newsletter
url: "https://www.lennysnewsletter.com/p/metrics-that-matter"
authors:
  - lenny-rachitsky
guest_author: casey-winters
tags:
  - metrics
  - analytics
summary: "Guest post by Casey Winters on choosing the right metrics..."
date: 2024-04-10
---
```

---

## 2. URL Detection

### 2.1 Platform Patterns

| Platform | URL Pattern | Example |
|----------|-------------|---------|
| Substack | `*.substack.com/p/*` or custom domain with `/p/` | `lennysnewsletter.substack.com/p/how-to...` |
| beehiiv | `*.beehiiv.com/p/*` | `newsletter.beehiiv.com/p/article` |
| Ghost | `*/subscribe` page + article paths | `blog.example.com/article-title/` |
| ConvertKit | `convertkit.com/` + creator paths | `creator.ck.page/article` |
| Buttondown | `buttondown.email/*` | `buttondown.email/newsletter/article` |

### 2.2 Detection Strategy

**For known platform domains:** Auto-detect as newsletter.

**For custom domains:**
1. Check page source for platform signatures (Substack/beehiiv meta tags, structure)
2. Look for newsletter signals: subscribe button, issue number, "view in browser" link
3. If uncertain, ask user: "This looks like a newsletter article. Is it?"

### 2.3 Domain Mismatch Handling

When article URL domain doesn't match newsletter profile's `website`:
- Show warning during article creation
- Do NOT auto-update the newsletter profile
- User can manually update profile if needed

---

## 3. Skill Updates

### 3.1 Adding-Notes URL Routing

Add to SKILL.md URL routing table:

```markdown
| URL Pattern | Type | Reference |
|---|---|---|
| `*.substack.com/p/*` | newsletter | `references/content-types/newsletter.md` |
| `*.beehiiv.com/p/*` | newsletter | `references/content-types/newsletter.md` |
| `buttondown.email/*/archive/*` | newsletter | `references/content-types/newsletter.md` |
| `*.ghost.io/*` (with article signals) | newsletter | `references/content-types/newsletter.md` |
```

### 3.2 Reference File: newsletter.md

**File:** `.claude/skills/adding-notes/references/content-types/newsletter.md`

```markdown
# Newsletter Articles

Newsletter articles link to their parent publication via the `newsletter` field.

## Detection

Content is a newsletter article if:
- URL: *.substack.com/p/*, *.beehiiv.com/p/*, buttondown.email/*/archive/*
- Custom domain with newsletter signals (subscribe button, issue number)
- Meta tags indicating newsletter platform

For custom domains: auto-detect platform signatures, then confirm with user if uncertain.

---

## Workflow

### Phase 1: Check for Existing Profile

```bash
ls content/newsletters/ | grep -i "newsletter-slug"
```

- If found → use existing profile
- If NOT found → auto-create profile (see Phase 2)

### Phase 2: Auto-Create Newsletter Profile (if needed)

Spawn 4 agents in parallel:

**Agent A - Publication Info:**
- WebFetch newsletter homepage
- Extract: name, description/tagline, about page content

**Agent B - Logo/Branding:**
- WebFetch newsletter homepage
- Extract: og:image, publication logo
- Prefer: square logo image (not article thumbnail)

**Agent C - Author Info:**
- WebFetch newsletter homepage /about
- Extract: author name(s), check if author exists
- Create author if needed

**Agent D - Platform Detection:**
- Analyze URL structure and page source
- Detect platform from signatures

Write profile with all detected fields to `content/newsletters/{slug}.md`.

### Phase 3: Extract Article Metadata

**Agent A - Article Metadata:**
- WebFetch article URL
- Extract: title, author, date, issue number (if visible)

**Agent B - Content Extraction:**
- Parse article body
- Extract headings, key sections
- Identify links/resources mentioned

**Agent C - Summary Generation:**
- Auto-generate summary from article content
- 1-2 sentences capturing the core message

---

## Frontmatter

```yaml
---
title: "Article Title"
type: newsletter
newsletter: newsletter-slug
issueNumber: 234                    # Optional - only if clearly visible
url: "https://newsletter.substack.com/p/article-slug"
tags:
  - topic-1
  - topic-2
authors:
  - author-slug
guest_author: guest-author-slug    # Optional - for one-off contributors
summary: "Auto-generated core message"
date: 2024-03-20
---
```

## Body Template

```markdown
## Key Ideas

### [Main Concept 1]

[2-3 sentences explaining the concept with specific details.
Include frameworks, mental models, or actionable advice.]

### [Main Concept 2]

[Explanation with examples from the article.]

## Actionable Takeaways

- **[Takeaway 1]** — [Brief explanation]
- **[Takeaway 2]** — [How to apply]

## Notable Quotes

> "Exact quote from the article"
> — Author Name

## Resources Mentioned

- [Resource Name](url) — context for why it's relevant
- [[wiki-linked-note]] — connection to existing knowledge

## References

Builds on ideas from [[related-concept]] and [[referenced-book]].
```

---

## Validation

| Check | Severity | Message |
|-------|----------|---------|
| `newsletter` field exists | Error | Newsletter articles must reference a newsletter profile |
| Newsletter profile exists | Error | Newsletter `{slug}` not found in `content/newsletters/` |
| Author in newsletter authors | Warning | Author `{author}` not listed in newsletter's authors |
| URL domain mismatch | Warning | Article URL doesn't match newsletter website |

### 3.3 Newsletter Profile Creation Reference

**File:** `.claude/skills/adding-notes/references/newsletter-profile-creation.md`

```markdown
# Newsletter Profile Creation

Auto-created when adding an article to a new newsletter.

## Slug Generation

- Lowercase, kebab-case
- Remove "newsletter", "weekly", "daily" suffixes
- Keep distinctive brand name
- Examples:
  - "Lenny's Newsletter" → `lennys-newsletter`
  - "The Pragmatic Engineer" → `pragmatic-engineer`
  - "Dense Discovery" → `dense-discovery`

## Quality Checklist

Before saving profile:
- [ ] Name matches publication branding
- [ ] Logo is square-ish, not article thumbnail
- [ ] At least one author linked
- [ ] Website URL is newsletter homepage (not article)
- [ ] Platform correctly detected
```

---

## 4. UI Components

### 4.1 NewsletterCard.vue

```vue
<script setup lang="ts">
interface Props {
  newsletter: {
    name: string
    slug: string
    description?: string
    logo?: string
    authors: string[]
  }
  articleCount?: number
}
defineProps<Props>()
</script>

<template>
  <NuxtLink
    :to="`/newsletters/${newsletter.slug}`"
    class="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
  >
    <img
      v-if="newsletter.logo"
      :src="newsletter.logo"
      :alt="newsletter.name"
      class="size-10 rounded-lg object-cover"
    />
    <div v-else class="size-10 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
      <UIcon name="i-heroicons-newspaper" class="size-5 text-gray-500" />
    </div>
    <div class="flex-1 min-w-0">
      <p class="font-medium truncate">{{ newsletter.name }}</p>
      <p v-if="articleCount" class="text-sm text-gray-500">
        {{ articleCount }} {{ articleCount === 1 ? 'article' : 'articles' }}
      </p>
    </div>
  </NuxtLink>
</template>
```

### 4.2 NewsletterHeader.vue

```vue
<script setup lang="ts">
interface Newsletter {
  name: string
  slug: string
  description?: string
  logo?: string
  website?: string
  authors: string[]
}

interface Props {
  newsletter: Newsletter
  authorNames?: Record<string, string>
}
defineProps<Props>()
</script>

<template>
  <div class="flex flex-col sm:flex-row gap-4 items-start">
    <img
      v-if="newsletter.logo"
      :src="newsletter.logo"
      :alt="newsletter.name"
      class="size-20 rounded-xl object-cover"
    />
    <div v-else class="size-20 rounded-xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
      <UIcon name="i-heroicons-newspaper" class="size-10 text-gray-500" />
    </div>

    <div class="flex-1">
      <h1 class="text-2xl font-bold">{{ newsletter.name }}</h1>

      <p v-if="newsletter.description" class="text-gray-600 dark:text-gray-400 mt-1">
        {{ newsletter.description }}
      </p>

      <div class="flex flex-wrap items-center gap-2 mt-3">
        <span class="text-sm text-gray-500">by</span>
        <template v-for="(authorSlug, index) in newsletter.authors" :key="authorSlug">
          <NuxtLink
            :to="`/authors/${authorSlug}`"
            class="text-sm font-medium hover:underline"
          >
            {{ authorNames?.[authorSlug] || authorSlug }}
          </NuxtLink>
          <span v-if="index < newsletter.authors.length - 1" class="text-gray-400">,</span>
        </template>
      </div>

      <div v-if="newsletter.website" class="mt-4">
        <UButton
          :to="newsletter.website"
          external
          variant="ghost"
          size="sm"
        >
          <UIcon name="i-heroicons-arrow-top-right-on-square" class="size-4 mr-1" />
          View Website
        </UButton>
      </div>
    </div>
  </div>
</template>
```

### 4.3 Pages

**`app/pages/newsletters/index.vue`:**
```vue
<script setup lang="ts">
usePageTitle('Newsletters')

const { data: newsletters } = await useAsyncData('newsletters', () =>
  queryCollection('newsletters').all()
)

const { data: articleCounts } = await useAsyncData('newsletter-counts', async () => {
  const content = await queryCollection('content')
    .where('type', '=', 'newsletter')
    .all()

  const counts: Record<string, number> = {}
  for (const item of content) {
    if (item.newsletter) {
      counts[item.newsletter] = (counts[item.newsletter] || 0) + 1
    }
  }
  return counts
})

// Only show newsletters with articles
const activeNewsletters = computed(() => {
  if (!newsletters.value || !articleCounts.value) return []
  return newsletters.value
    .filter(n => articleCounts.value![n.slug] > 0)
    .sort((a, b) => (articleCounts.value![b.slug] || 0) - (articleCounts.value![a.slug] || 0))
})
</script>

<template>
  <UContainer>
    <h1 class="text-2xl font-bold mb-6">Newsletters</h1>

    <div class="grid gap-2">
      <NewsletterCard
        v-for="newsletter in activeNewsletters"
        :key="newsletter.slug"
        :newsletter="newsletter"
        :article-count="articleCounts?.[newsletter.slug]"
      />
    </div>
  </UContainer>
</template>
```

**`app/pages/newsletters/[slug].vue`:**
```vue
<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug as string

const { data: newsletter } = await useAsyncData(`newsletter-${slug}`, () =>
  queryCollection('newsletters').where('slug', '=', slug).first()
)

if (!newsletter.value) {
  throw createError({ statusCode: 404, message: 'Newsletter not found' })
}

usePageTitle(newsletter.value.name)

const { data: articles } = await useAsyncData(`newsletter-articles-${slug}`, () =>
  queryCollection('content')
    .where('type', '=', 'newsletter')
    .where('newsletter', '=', slug)
    .order('date', 'DESC')
    .all()
)

const { data: authors } = await useAsyncData(`newsletter-authors-${slug}`, async () => {
  const authorSlugs = newsletter.value?.authors || []
  const authorData = await queryCollection('authors')
    .where('slug', 'IN', authorSlugs)
    .all()

  const map: Record<string, string> = {}
  for (const a of authorData) {
    map[a.slug] = a.name
  }
  return map
})
</script>

<template>
  <UContainer>
    <NewsletterHeader
      :newsletter="newsletter!"
      :author-names="authors"
    />

    <UDivider class="my-8" />

    <h2 class="text-lg font-semibold mb-4">
      Articles ({{ articles?.length || 0 }})
    </h2>

    <ContentList :items="articles || []" />
  </UContainer>
</template>
```

### 4.4 Article Page Enhancement

Update the article detail page to show newsletter link next to author:

```vue
<!-- In article metadata section -->
<template>
  <span>by</span>
  <NuxtLink :to="`/authors/${author.slug}`">{{ author.name }}</NuxtLink>
  <template v-if="content.type === 'newsletter' && content.newsletter">
    <span>in</span>
    <NuxtLink :to="`/newsletters/${content.newsletter}`">
      {{ newsletterName }}
    </NuxtLink>
  </template>
</template>
```

---

## 5. Navigation & Search

### 5.1 site.config.ts

```typescript
// Add to nav array
{
  label: 'Newsletters',
  to: '/newsletters',
  icon: 'i-heroicons-newspaper',
},
```

### 5.2 Command Palette Search

Add newsletters as a searchable group:

```typescript
const { data: newsletters } = await useAsyncData('search-newsletters', () =>
  queryCollection('newsletters').all()
)

// Add to groups
{
  id: 'newsletters',
  label: 'Newsletters',
  items: newsletters.value?.map(n => ({
    id: n.slug,
    label: n.name,
    to: `/newsletters/${n.slug}`,
    icon: 'i-heroicons-newspaper',
  })) || [],
}
```

### 5.3 Wiki-Link Resolution

Update wiki-link resolver to check newsletters collection:

```typescript
// When resolving [[slug]], also check:
const newsletter = await queryCollection('newsletters')
  .where('slug', '=', linkSlug)
  .first()

if (newsletter) {
  return `/newsletters/${linkSlug}`
}
```

---

## 6. Type Definitions

### 6.1 app/types/content.ts

```typescript
export interface NewsletterItem {
  name: string
  slug: string
  description?: string
  logo?: string
  website?: string
  authors: string[]
  platform?: 'substack' | 'beehiiv' | 'ghost' | 'convertkit' | 'buttondown' | 'revue' | 'mailchimp' | 'other'
  topics?: string[]
}

export interface NewsletterArticle extends ContentItem {
  type: 'newsletter'
  newsletter: string
  issueNumber?: number
  guest_author?: string
}
```

---

## 7. Validation Rules

### 7.1 Newsletter Article Validation

| Check | Severity | Message |
|-------|----------|---------|
| `newsletter` field exists | Error | Newsletter articles must reference a newsletter profile |
| Newsletter profile exists | Error | Newsletter `{slug}` not found in `content/newsletters/` |
| Author in newsletter authors | Warning | Author `{author}` not listed in newsletter's authors |
| URL domain mismatch | Warning | Article URL doesn't match newsletter website |

### 7.2 Newsletter Profile Validation

| Check | Severity | Message |
|-------|----------|---------|
| At least one author | Error | Newsletter must have at least one author |
| Author exists | Error | Author `{slug}` not found in `content/authors/` |
| Website URL valid | Warning | Website URL appears invalid |

---

## 8. Testing

### 8.1 Unit Tests

**Collection queries:**
- Newsletter profiles query correctly
- Newsletter articles query and filter by newsletter slug
- Article counts aggregate properly

**Validation:**
- Invalid newsletter reference fails
- Missing author fails
- Guest author validation

**UI components:**
- NewsletterCard renders with/without logo
- NewsletterCard renders with/without article count
- NewsletterHeader renders author links
- NewsletterHeader renders website button when present
- Newsletter list filters empty profiles

---

## 9. Implementation Checklist

### Phase 1: Data Model
- [ ] Update `content.config.ts` with newsletters collection
- [ ] Add `newsletter` to externalContentTypes
- [ ] Add `newsletter`, `issueNumber`, `guest_author` to content schema
- [ ] Add TypeScript types in `app/types/content.ts`

### Phase 2: UI
- [ ] Create `NewsletterCard.vue`
- [ ] Create `NewsletterHeader.vue`
- [ ] Create `/newsletters/index.vue`
- [ ] Create `/newsletters/[slug].vue`
- [ ] Update article detail page with "in Newsletter" link
- [ ] Update navigation in `site.config.ts`

### Phase 3: Search & Links
- [ ] Add newsletters to command palette search
- [ ] Update wiki-link resolver for newsletter profiles

### Phase 4: Skill Updates
- [ ] Create `references/content-types/newsletter.md`
- [ ] Create `references/newsletter-profile-creation.md`
- [ ] Update SKILL.md with URL routing table
- [ ] Implement auto-profile creation workflow

### Phase 5: Testing
- [ ] Collection query tests
- [ ] Validation tests
- [ ] Component tests

---

## 10. Example Content

### Newsletter Profile
```yaml
# content/newsletters/pragmatic-engineer.md
---
name: "The Pragmatic Engineer"
slug: "pragmatic-engineer"
description: "Big Tech and high-growth startups, from the inside"
logo: "https://substackcdn.com/image/fetch/w_256..."
website: "https://newsletter.pragmaticengineer.com"
authors:
  - gergely-orosz
platform: substack
topics:
  - software-engineering
  - tech-industry
  - career
---
```

### Newsletter Article
```yaml
# content/what-silicon-valley-gets-wrong-about-ai.md
---
title: "What Silicon Valley Gets Wrong About AI"
type: newsletter
newsletter: pragmatic-engineer
issueNumber: 89
url: "https://newsletter.pragmaticengineer.com/p/what-silicon-valley-gets-wrong"
tags:
  - ai
  - tech-industry
  - silicon-valley
authors:
  - gergely-orosz
summary: "A critical look at AI hype vs reality in the tech industry"
date: 2024-02-22
rating: 6
---

## Key Ideas

### The Hype Cycle Problem
...
```
