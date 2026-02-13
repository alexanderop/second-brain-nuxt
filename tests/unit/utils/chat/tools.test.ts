import { describe, expect, it } from 'vitest'
import {
  isSearchNotesInput,
  isGetNoteContentInput,
  isGetNoteDetailsInput,
  isFetchSourceInput,
  MODEL,
  MAX_TOKENS,
  TOOLS,
  SYSTEM_PROMPT,
} from '../../../../server/utils/chat/tools'

describe('isSearchNotesInput', () => {
  it('returns true for valid SearchNotesInput', () => {
    expect(isSearchNotesInput({ query: 'test' })).toBe(true)
    expect(isSearchNotesInput({ query: 'test', type: 'book' })).toBe(true)
    expect(isSearchNotesInput({ query: 'test', limit: 5 })).toBe(true)
  })

  it('returns false for invalid input', () => {
    expect(isSearchNotesInput(null)).toBe(false)
    expect(isSearchNotesInput(undefined)).toBe(false)
    expect(isSearchNotesInput({})).toBe(false)
    expect(isSearchNotesInput({ query: 123 })).toBe(false)
    expect(isSearchNotesInput('test')).toBe(false)
  })
})

describe('isGetNoteContentInput', () => {
  it('returns true for valid GetNoteContentInput', () => {
    expect(isGetNoteContentInput({ slug: 'atomic-habits' })).toBe(true)
  })

  it('returns false for invalid input', () => {
    expect(isGetNoteContentInput(null)).toBe(false)
    expect(isGetNoteContentInput(undefined)).toBe(false)
    expect(isGetNoteContentInput({})).toBe(false)
    expect(isGetNoteContentInput({ slug: 123 })).toBe(false)
    expect(isGetNoteContentInput('test')).toBe(false)
  })
})

describe('isGetNoteDetailsInput', () => {
  it('returns true for valid GetNoteDetailsInput', () => {
    expect(isGetNoteDetailsInput({ slug: 'atomic-habits' })).toBe(true)
    expect(isGetNoteDetailsInput({ slug: 'test', include_related: true })).toBe(true)
  })

  it('returns false for invalid input', () => {
    expect(isGetNoteDetailsInput(null)).toBe(false)
    expect(isGetNoteDetailsInput(undefined)).toBe(false)
    expect(isGetNoteDetailsInput({})).toBe(false)
    expect(isGetNoteDetailsInput({ slug: 123 })).toBe(false)
    expect(isGetNoteDetailsInput('test')).toBe(false)
  })
})

describe('isFetchSourceInput', () => {
  it('returns true for valid FetchSourceInput', () => {
    expect(isFetchSourceInput({ slug: 'atomic-habits' })).toBe(true)
  })

  it('returns false for invalid input', () => {
    expect(isFetchSourceInput(null)).toBe(false)
    expect(isFetchSourceInput(undefined)).toBe(false)
    expect(isFetchSourceInput({})).toBe(false)
    expect(isFetchSourceInput({ slug: 123 })).toBe(false)
    expect(isFetchSourceInput('test')).toBe(false)
  })
})

describe('Constants', () => {
  it('exports MODEL constant', () => {
    expect(typeof MODEL).toBe('string')
    expect(MODEL).toBe('claude-3-5-haiku-20241022')
  })

  it('exports MAX_TOKENS constant', () => {
    expect(typeof MAX_TOKENS).toBe('number')
    expect(MAX_TOKENS).toBe(1024)
  })

  it('exports TOOLS array with 4 tools', () => {
    expect(Array.isArray(TOOLS)).toBe(true)
    expect(TOOLS).toHaveLength(4)
  })

  it('exports search_notes tool definition', () => {
    const searchTool = TOOLS.find(t => t.name === 'search_notes')
    expect(searchTool).toBeDefined()
    expect(searchTool?.description).toContain('Search the knowledge base')
    expect(searchTool?.input_schema.required).toEqual(['query'])
  })

  it('exports get_note_content tool definition', () => {
    const getTool = TOOLS.find(t => t.name === 'get_note_content')
    expect(getTool).toBeDefined()
    expect(getTool?.description).toContain('Get the full content')
    expect(getTool?.input_schema.required).toEqual(['slug'])
  })

  it('exports get_note_details tool definition', () => {
    const detailsTool = TOOLS.find(t => t.name === 'get_note_details')
    expect(detailsTool).toBeDefined()
    expect(detailsTool?.description).toContain('comprehensive note details')
    expect(detailsTool?.input_schema.required).toEqual(['slug'])
  })

  it('exports fetch_source tool definition', () => {
    const fetchTool = TOOLS.find(t => t.name === 'fetch_source')
    expect(fetchTool).toBeDefined()
    expect(fetchTool?.description).toContain('original source material')
    expect(fetchTool?.input_schema.required).toEqual(['slug'])
  })

  it('exports SYSTEM_PROMPT constant', () => {
    expect(typeof SYSTEM_PROMPT).toBe('string')
    expect(SYSTEM_PROMPT).toContain('Second Brain')
    expect(SYSTEM_PROMPT).toContain('search_notes')
  })
})
