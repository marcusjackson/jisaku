/**
 * Route Paths
 *
 * Centralized route path constants for the application.
 * All route paths should be imported from here to ensure consistency
 * and make path changes easier to manage.
 */

/**
 * New UI Routes
 */
export const ROUTES = {
  HOME: '/',
  KANJI_LIST: '/kanji',
  KANJI_NEW: '/kanji/new',
  KANJI_DETAIL: '/kanji/:id',
  COMPONENT_LIST: '/components',
  COMPONENT_NEW: '/components/new',
  COMPONENT_DETAIL: '/components/:id',
  VOCABULARY_LIST: '/vocabulary',
  VOCABULARY_DETAIL: '/vocabulary/:id',
  SETTINGS: '/settings',
  COMING_SOON: '/coming-soon'
} as const

/**
 * Legacy UI Routes (prefixed with /legacy)
 */
export const LEGACY_ROUTES = {
  HOME: '/legacy',
  KANJI_LIST: '/legacy/kanji',
  KANJI_NEW: '/legacy/kanji/new',
  KANJI_DETAIL: '/legacy/kanji/:id',
  COMPONENT_LIST: '/legacy/components',
  COMPONENT_NEW: '/legacy/components/new',
  COMPONENT_DETAIL: '/legacy/components/:id',
  VOCABULARY_LIST: '/legacy/vocabulary',
  VOCABULARY_DETAIL: '/legacy/vocabulary/:id',
  SETTINGS: '/legacy/settings'
} as const

/**
 * Helper to build a route with parameters
 * @example buildRoute(ROUTES.KANJI_DETAIL, { id: '123' }) // '/kanji/123'
 */
export function buildRoute(
  path: string,
  params: Record<string, string | number>
): string {
  let result = path
  for (const [key, value] of Object.entries(params)) {
    result = result.replace(`:${key}`, String(value))
  }
  return result
}

/**
 * Route mapping between legacy and new UI
 * Used by version toggle to navigate between versions
 */
export const ROUTE_VERSION_MAP: Record<string, string> = {
  [LEGACY_ROUTES.KANJI_LIST]: ROUTES.KANJI_LIST,
  [LEGACY_ROUTES.KANJI_DETAIL]: ROUTES.KANJI_DETAIL,
  [LEGACY_ROUTES.COMPONENT_LIST]: ROUTES.COMPONENT_LIST,
  [LEGACY_ROUTES.COMPONENT_DETAIL]: ROUTES.COMPONENT_DETAIL,
  [LEGACY_ROUTES.VOCABULARY_LIST]: ROUTES.VOCABULARY_LIST,
  [LEGACY_ROUTES.VOCABULARY_DETAIL]: ROUTES.VOCABULARY_DETAIL,
  [LEGACY_ROUTES.SETTINGS]: ROUTES.SETTINGS
}

/**
 * Get the equivalent route in the other version
 *
 * Handles both static routes (/kanji) and dynamic routes (/kanji/:id).
 * Preserves route parameters when switching between versions.
 *
 * @param currentPath - Current route path (e.g., '/legacy/kanji/123')
 * @param params - Route params from current route (e.g., { id: '123' })
 * @returns The equivalent route in the other version
 */
export function getEquivalentRoute(
  currentPath: string,
  _params: Record<string, string | string[]> = {}
): string {
  const isLegacy = currentPath.startsWith('/legacy')

  if (isLegacy) {
    // Legacy → New: find matching pattern
    for (const [legacyPattern, newPattern] of Object.entries(
      ROUTE_VERSION_MAP
    )) {
      const match = matchRoute(currentPath, legacyPattern)
      if (match) {
        return buildRoute(newPattern, match)
      }
    }
    return ROUTES.COMING_SOON
  } else {
    // New → Legacy: reverse lookup
    for (const [legacyPattern, newPattern] of Object.entries(
      ROUTE_VERSION_MAP
    )) {
      const match = matchRoute(currentPath, newPattern)
      if (match) {
        return buildRoute(legacyPattern, match)
      }
    }
    return '/legacy/kanji'
  }
}

/**
 * Match a path against a pattern and extract params
 *
 * @param path - Actual path (e.g., '/kanji/123')
 * @param pattern - Pattern with params (e.g., '/kanji/:id')
 * @returns Extracted params or null if no match
 */
function matchRoute(
  path: string,
  pattern: string
): Record<string, string> | null {
  const pathParts = path.split('/').filter(Boolean)
  const patternParts = pattern.split('/').filter(Boolean)

  if (pathParts.length !== patternParts.length) return null

  const params: Record<string, string> = {}

  for (let i = 0; i < patternParts.length; i++) {
    const patternPart = patternParts[i]
    const pathPart = pathParts[i]

    // Safety: we've already checked that lengths match and we're within bounds
    if (patternPart === undefined || pathPart === undefined) continue

    if (patternPart.startsWith(':')) {
      params[patternPart.slice(1)] = pathPart
    } else if (patternPart !== pathPart) {
      return null
    }
  }

  return params
}
