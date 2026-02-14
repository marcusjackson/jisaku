/**
 * Tests for useVersionToggle composable
 *
 * Integration tests are in SharedSwitchNewUi.test.ts
 * These tests verify the route mapping logic in isolation
 */

import { describe, expect, it } from 'vitest'

import { LEGACY_ROUTES, ROUTE_VERSION_MAP, ROUTES } from '@/router/routes'

/**
 * Reverse map: { new: 'legacy' }
 */
const REVERSE_ROUTE_MAP = Object.fromEntries(
  Object.entries(ROUTE_VERSION_MAP).map(([legacy, newPath]) => [
    newPath,
    legacy
  ])
)

describe('Version Toggle Route Mapping', () => {
  it('has correct route map for kanji', () => {
    expect(ROUTE_VERSION_MAP[LEGACY_ROUTES.KANJI_LIST]).toBe(ROUTES.KANJI_LIST)
  })

  it('has correct reverse map for kanji', () => {
    expect(REVERSE_ROUTE_MAP[ROUTES.KANJI_LIST]).toBe(LEGACY_ROUTES.KANJI_LIST)
  })

  it('returns coming-soon for unmapped legacy routes', () => {
    const currentPath = '/legacy/unknown-unmapped-route'
    const isLegacy = currentPath.startsWith('/legacy')
    const newRoute = isLegacy ? ROUTE_VERSION_MAP[currentPath] : undefined

    expect(newRoute ?? ROUTES.COMING_SOON).toBe(ROUTES.COMING_SOON)
  })

  it('returns default legacy route for unmapped new routes', () => {
    const currentPath = ROUTES.COMING_SOON
    const isLegacy = currentPath.startsWith('/legacy')
    const legacyRoute = !isLegacy ? REVERSE_ROUTE_MAP[currentPath] : undefined

    expect(legacyRoute ?? LEGACY_ROUTES.KANJI_LIST).toBe(
      LEGACY_ROUTES.KANJI_LIST
    )
  })

  it('correctly identifies legacy paths', () => {
    expect(LEGACY_ROUTES.KANJI_LIST.startsWith('/legacy')).toBe(true)
    expect(ROUTES.KANJI_LIST.startsWith('/legacy')).toBe(false)
    expect(ROUTES.COMING_SOON.startsWith('/legacy')).toBe(false)
  })
})
