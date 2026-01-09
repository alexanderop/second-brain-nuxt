import { defineEventHandler, getQuery } from 'h3'
import { queryCollection, queryCollectionSearchSections } from '@nuxt/content/server'
import { findUnlinkedMentions, type MentionItem } from '../utils/mentions'

export default defineEventHandler(async (event): Promise<MentionItem[]> => {
  const query = getQuery(event)
  const targetSlug = String(query.slug || '')
  const targetTitle = String(query.title || '')

  if (!targetSlug || !targetTitle || targetTitle.length < 3) {
    return []
  }

  try {
    const allContent = await queryCollection(event, 'content').all()
    const searchSections = await queryCollectionSearchSections(event, 'content')

    return findUnlinkedMentions(allContent, searchSections, targetSlug, targetTitle)
  }
  catch (error) {
    console.error('Error finding unlinked mentions:', error)
    return []
  }
})
