import { defineEventHandler } from 'h3'
import { queryCollection } from '@nuxt/content/server'
import { buildGraphFromContent, type GraphData } from '../utils/graph'
import { tryAsync } from '#shared/utils/tryCatch'

export default defineEventHandler(async (event): Promise<GraphData> => {
  const [error, allContent] = await tryAsync(
    queryCollection(event, 'content')
      .select('path', 'stem', 'title', 'type', 'tags', 'authors', 'summary', 'body')
      .all(),
  )

  if (error) {
    console.error('Error building graph data:', error)
    return { nodes: [], edges: [] }
  }

  return buildGraphFromContent(allContent)
})
