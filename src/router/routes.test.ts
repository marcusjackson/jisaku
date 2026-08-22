/**
 * Tests for route paths utilities
 */

import { describe, expect, it } from 'vitest'

import { buildRoute, ROUTES } from './routes'

describe('Route Constants', () => {
  it('has correct routes', () => {
    expect(ROUTES.HOME).toBe('/')
    expect(ROUTES.KANJI_LIST).toBe('/kanji')
    expect(ROUTES.KANJI_DETAIL).toBe('/kanji/:id')
    expect(ROUTES.COMPONENT_LIST).toBe('/components')
    expect(ROUTES.COMPONENT_DETAIL).toBe('/components/:id')
    expect(ROUTES.VOCABULARY_LIST).toBe('/vocabulary')
    expect(ROUTES.VOCABULARY_DETAIL).toBe('/vocabulary/:id')
    expect(ROUTES.SETTINGS).toBe('/settings')
  })
})

describe('buildRoute', () => {
  it('builds route with single parameter', () => {
    const result = buildRoute(ROUTES.KANJI_DETAIL, { id: '123' })
    expect(result).toBe('/kanji/123')
  })

  it('builds route ignoring unused parameters', () => {
    const result = buildRoute(ROUTES.KANJI_DETAIL, { id: '123', ignored: 'x' })
    expect(result).toBe('/kanji/123')
  })

  it('builds route with number parameters', () => {
    const result = buildRoute(ROUTES.KANJI_DETAIL, { id: 123 })
    expect(result).toBe('/kanji/123')
  })

  it('returns unchanged path when no parameters', () => {
    const result = buildRoute(ROUTES.KANJI_LIST, {})
    expect(result).toBe('/kanji')
  })

  it('builds component route with parameters', () => {
    const result = buildRoute(ROUTES.COMPONENT_DETAIL, { id: 'abc' })
    expect(result).toBe('/components/abc')
  })
})
