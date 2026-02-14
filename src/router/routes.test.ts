/**
 * Tests for route paths utilities
 */

import { describe, expect, it } from 'vitest'

import {
  buildRoute,
  getEquivalentRoute,
  LEGACY_ROUTES,
  ROUTE_VERSION_MAP,
  ROUTES
} from './routes'

describe('Route Constants', () => {
  it('has correct new UI routes', () => {
    expect(ROUTES.HOME).toBe('/')
    expect(ROUTES.KANJI_LIST).toBe('/kanji')
    expect(ROUTES.KANJI_DETAIL).toBe('/kanji/:id')
    expect(ROUTES.COMING_SOON).toBe('/coming-soon')
  })

  it('has correct legacy UI routes', () => {
    expect(LEGACY_ROUTES.HOME).toBe('/legacy')
    expect(LEGACY_ROUTES.KANJI_LIST).toBe('/legacy/kanji')
    expect(LEGACY_ROUTES.KANJI_DETAIL).toBe('/legacy/kanji/:id')
  })

  it('has version mapping for kanji list', () => {
    expect(ROUTE_VERSION_MAP[LEGACY_ROUTES.KANJI_LIST]).toBe(ROUTES.KANJI_LIST)
  })

  it('has version mapping for kanji detail', () => {
    expect(ROUTE_VERSION_MAP[LEGACY_ROUTES.KANJI_DETAIL]).toBe(
      ROUTES.KANJI_DETAIL
    )
  })

  it('has version mapping for component list', () => {
    expect(ROUTE_VERSION_MAP[LEGACY_ROUTES.COMPONENT_LIST]).toBe(
      ROUTES.COMPONENT_LIST
    )
  })

  it('has version mapping for component detail', () => {
    expect(ROUTE_VERSION_MAP[LEGACY_ROUTES.COMPONENT_DETAIL]).toBe(
      ROUTES.COMPONENT_DETAIL
    )
  })
})

describe('buildRoute', () => {
  it('builds route with single parameter', () => {
    const result = buildRoute(ROUTES.KANJI_DETAIL, { id: '123' })
    expect(result).toBe('/kanji/123')
  })

  it('builds route with multiple parameters', () => {
    const path = '/users/:userId/posts/:postId'
    const result = buildRoute(path, { postId: '456', userId: '123' })
    expect(result).toBe('/users/123/posts/456')
  })

  it('builds route with number parameters', () => {
    const result = buildRoute(ROUTES.KANJI_DETAIL, { id: 123 })
    expect(result).toBe('/kanji/123')
  })

  it('returns unchanged path when no parameters', () => {
    const result = buildRoute(ROUTES.KANJI_LIST, {})
    expect(result).toBe('/kanji')
  })

  it('builds legacy route with parameters', () => {
    const result = buildRoute(LEGACY_ROUTES.COMPONENT_DETAIL, { id: 'abc' })
    expect(result).toBe('/legacy/components/abc')
  })
})

describe('getEquivalentRoute', () => {
  describe('legacy to new', () => {
    it('maps static kanji list route', () => {
      const result = getEquivalentRoute('/legacy/kanji')
      expect(result).toBe('/kanji')
    })

    it('maps dynamic kanji detail route', () => {
      const result = getEquivalentRoute('/legacy/kanji/123')
      expect(result).toBe('/kanji/123')
    })

    it('returns coming-soon for unmapped routes', () => {
      const result = getEquivalentRoute('/legacy/component-types')
      expect(result).toBe('/coming-soon')
    })
  })

  describe('new to legacy', () => {
    it('maps static kanji list route', () => {
      const result = getEquivalentRoute('/kanji')
      expect(result).toBe('/legacy/kanji')
    })

    it('maps dynamic kanji detail route', () => {
      const result = getEquivalentRoute('/kanji/456')
      expect(result).toBe('/legacy/kanji/456')
    })

    it('returns fallback for unmapped routes', () => {
      const result = getEquivalentRoute('/component-types')
      expect(result).toBe('/legacy/kanji')
    })
  })

  describe('component routes', () => {
    it('maps legacy component list to new', () => {
      const result = getEquivalentRoute('/legacy/components')
      expect(result).toBe('/components')
    })

    it('maps legacy component detail to new', () => {
      const result = getEquivalentRoute('/legacy/components/789')
      expect(result).toBe('/components/789')
    })

    it('maps new component list to legacy', () => {
      const result = getEquivalentRoute('/components')
      expect(result).toBe('/legacy/components')
    })

    it('maps new component detail to legacy', () => {
      const result = getEquivalentRoute('/components/789')
      expect(result).toBe('/legacy/components/789')
    })
  })
})
