import { defineEventHandler } from 'h3'
import { queryCollection } from '@nuxt/content/server'
import { buildBacklinksIndex, type BacklinksIndex } from '../utils/backlinks'

export default defineEventHandler(async (event): Promise<BacklinksIndex> => {
  try {
    const allContent = await queryCollection(event, 'content')
      .select('path', 'stem', 'title', 'type', 'tags', 'summary', 'body')
      .all()

    return buildBacklinksIndex(allContent)
  }
  catch (error) {
    console.error('Error building backlinks index:', error)
    return {}
  }
})
