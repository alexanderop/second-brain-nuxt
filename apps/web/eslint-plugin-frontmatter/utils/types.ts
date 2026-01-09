import type { Rule } from 'eslint'

// ESLint rule context with proper typing
export type RuleContext = Rule.RuleContext

// AST node for YAML frontmatter (from @eslint/markdown)
export interface YamlNode {
  type: 'yaml'
  value: string
  position: {
    start: { line: number, column: number, offset: number }
    end: { line: number, column: number, offset: number }
  }
}

// AST node for text content in markdown
export interface TextNode {
  type: 'text'
  value: string
  position: {
    start: { line: number, column: number, offset: number }
    end: { line: number, column: number, offset: number }
  }
}

// Generic markdown AST node
export interface MdastNode {
  type: string
  value?: string
  children?: MdastNode[]
  position?: {
    start: { line: number, column: number, offset: number }
    end: { line: number, column: number, offset: number }
  }
}

// Parsed frontmatter data
export interface FrontmatterData {
  title?: string
  type?: string
  url?: string
  cover?: string
  tags?: string[]
  authors?: string[]
  author?: string // singular for tweets
  summary?: string
  date?: string
  rating?: number
  volumes?: number
  status?: string
  tweetId?: string
  tweetUrl?: string
  website?: string
  feed?: string
  artwork?: string
  platforms?: Record<string, string>
  urls?: Array<{ platform: string, url: string }>
  hosts?: string[]
  guests?: string[]
  notes?: string
  [key: string]: unknown
}

// Slug cache structure
export interface SlugCache {
  authors: Set<string>
  notes: Set<string>
  all: Set<string>
}
