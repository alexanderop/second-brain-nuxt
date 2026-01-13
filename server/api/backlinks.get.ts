import { defineEventHandler } from 'h3'
import { queryCollection } from '@nuxt/content/server'
import { buildBacklinksIndex, type BacklinksIndex } from '../utils/backlinks'
import { tryAsync } from '#shared/utils/tryCatch'

export default defineEventHandler(async (event): Promise<BacklinksIndex> => {
  const [error, allContent] = await tryAsync(
    queryCollection(event, 'content')
      .select('path', 'stem', 'title', 'type', 'tags', 'summary', 'body')
      .all(),
  )

  if (error) {
    console.error('Error building backlinks index:', error)
    return {}
  }

  return buildBacklinksIndex(allContent)
})
