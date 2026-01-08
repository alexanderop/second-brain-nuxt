import { defineEventHandler } from 'h3'
import { queryCollection } from '@nuxt/content/server'
import { buildGraphFromContent, type GraphData } from '../utils/graph'

export default defineEventHandler(async (event): Promise<GraphData> => {
  try {
    const allContent = await queryCollection(event, 'content')
      .select('path', 'stem', 'title', 'type', 'tags', 'authors', 'summary', 'body')
      .all()

    return buildGraphFromContent(allContent)
  }
  catch (error) {
    console.error('Error building graph data:', error)
    return { nodes: [], edges: [] }
  }
})
