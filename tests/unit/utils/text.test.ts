import { describe, expect, it } from 'vitest'
import { escapeRegex, getSnippet, highlightMatch } from '../../../server/utils/text'

describe('escapeRegex', () => {
  it('escapes dots', () => {
    expect(escapeRegex('test.com')).toBe('test\\.com')
  })

  it('escapes asterisks', () => {
    expect(escapeRegex('test*')).toBe('test\\*')
  })

  it('escapes plus signs', () => {
    expect(escapeRegex('test+')).toBe('test\\+')
  })

  it('escapes question marks', () => {
    expect(escapeRegex('test?')).toBe('test\\?')
  })

  it('escapes brackets', () => {
    expect(escapeRegex('[test]')).toBe('\\[test\\]')
  })

  it('escapes parentheses', () => {
    expect(escapeRegex('(test)')).toBe('\\(test\\)')
  })

  it('escapes curly braces', () => {
    expect(escapeRegex('{test}')).toBe('\\{test\\}')
  })

  it('escapes pipes', () => {
    expect(escapeRegex('a|b')).toBe('a\\|b')
  })

  it('escapes backslashes', () => {
    expect(escapeRegex('test\\')).toBe('test\\\\')
  })

  it('escapes caret', () => {
    expect(escapeRegex('^test')).toBe('\\^test')
  })

  it('escapes dollar sign', () => {
    expect(escapeRegex('test$')).toBe('test\\$')
  })

  it('handles multiple special characters', () => {
    expect(escapeRegex('test.*+?')).toBe('test\\.\\*\\+\\?')
  })

  it('returns empty string unchanged', () => {
    expect(escapeRegex('')).toBe('')
  })

  it('returns normal text unchanged', () => {
    expect(escapeRegex('hello world')).toBe('hello world')
  })
})

describe('getSnippet', () => {
  const longContent = 'This is the beginning of a very long piece of content that discusses the Atomic Habits book and how it relates to productivity and personal development in modern life.'

  it('returns snippet around matched term', () => {
    const snippet = getSnippet(longContent, 'Atomic Habits', 20)
    expect(snippet).toContain('Atomic Habits')
  })

  it('adds leading ellipsis when truncating from start', () => {
    const snippet = getSnippet(longContent, 'Atomic Habits', 20)
    expect(snippet.startsWith('...')).toBe(true)
  })

  it('adds trailing ellipsis when truncating at end', () => {
    const snippet = getSnippet(longContent, 'Atomic Habits', 20)
    expect(snippet.endsWith('...')).toBe(true)
  })

  it('does not add leading ellipsis for match at start', () => {
    const content = 'Atomic Habits is a great book about building habits.'
    const snippet = getSnippet(content, 'Atomic Habits', 20)
    expect(snippet.startsWith('...')).toBe(false)
  })

  it('does not add trailing ellipsis for match at end', () => {
    const content = 'Read about Atomic Habits'
    const snippet = getSnippet(content, 'Atomic Habits', 20)
    expect(snippet.endsWith('...')).toBe(false)
  })

  it('returns beginning of content if no match found', () => {
    const snippet = getSnippet(longContent, 'nonexistent', 60)
    expect(snippet).toBe(longContent.slice(0, 150))
  })

  it('is case-insensitive when finding term', () => {
    const snippet = getSnippet(longContent, 'atomic habits', 20)
    expect(snippet.toLowerCase()).toContain('atomic habits')
  })

  it('respects custom context size', () => {
    const snippet = getSnippet(longContent, 'Atomic Habits', 5)
    expect(snippet.length).toBeLessThan(getSnippet(longContent, 'Atomic Habits', 50).length)
  })

  it('uses default context of 60 chars', () => {
    const snippet = getSnippet(longContent, 'Atomic Habits')
    expect(snippet).toContain('Atomic Habits')
  })

  it('handles short content without ellipsis', () => {
    const short = 'Hello world'
    const snippet = getSnippet(short, 'world')
    expect(snippet).toBe('Hello world')
  })
})

describe('highlightMatch', () => {
  it('wraps matched term in mark tag', () => {
    const result = highlightMatch('I read Atomic Habits', 'Atomic Habits')
    expect(result).toContain('<mark')
    expect(result).toContain('Atomic Habits</mark>')
  })

  it('is case-insensitive', () => {
    const result = highlightMatch('I read atomic habits today', 'Atomic Habits')
    expect(result).toContain('<mark')
    expect(result).toContain('atomic habits</mark>')
  })

  it('preserves original case in highlighted text', () => {
    const result = highlightMatch('Read ATOMIC HABITS now', 'atomic habits')
    expect(result).toContain('ATOMIC HABITS</mark>')
  })

  it('returns original text if term is empty', () => {
    const text = 'Some text'
    expect(highlightMatch(text, '')).toBe(text)
  })

  it('handles multiple matches', () => {
    const result = highlightMatch('test and test again', 'test')
    const matches = result.match(/<mark/g)
    expect(matches).toHaveLength(2)
  })

  it('escapes special regex characters in term', () => {
    const result = highlightMatch('Use C++ for coding', 'C++')
    expect(result).toContain('<mark')
    expect(result).toContain('C++</mark>')
  })

  it('returns original text if no match', () => {
    const text = 'Hello world'
    const result = highlightMatch(text, 'xyz')
    expect(result).toBe(text)
  })
})
