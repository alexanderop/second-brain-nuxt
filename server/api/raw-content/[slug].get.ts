import { readFileSync, existsSync, realpathSync } from 'fs'
import { resolve } from 'path'
import { createError, defineEventHandler, getRouterParam } from 'h3'

const SLUG_PATTERN = /^[a-zA-Z0-9_-]+$/

export default defineEventHandler((event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({ statusCode: 400, message: 'Slug is required' })
  }

  if (!SLUG_PATTERN.test(slug)) {
    throw createError({ statusCode: 400, message: 'Invalid slug format' })
  }

  const contentDir = resolve(process.cwd(), 'content')
  const filePath = resolve(contentDir, `${slug}.md`)

  // Verify the resolved path stays within the content directory
  if (!filePath.startsWith(contentDir + '/')) {
    throw createError({ statusCode: 400, message: 'Invalid slug' })
  }

  if (!existsSync(filePath)) {
    throw createError({ statusCode: 404, message: 'Content not found' })
  }

  // Also verify the real path (after resolving symlinks) stays within content directory
  const realPath = realpathSync(filePath)
  const realContentDir = realpathSync(contentDir)
  if (!realPath.startsWith(realContentDir + '/')) {
    throw createError({ statusCode: 400, message: 'Invalid slug' })
  }

  const content = readFileSync(filePath, 'utf-8')
  return { raw: content }
})
