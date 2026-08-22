/**
 * Route Paths
 *
 * Centralized route path constants for the application.
 * All route paths should be imported from here to ensure consistency
 * and make path changes easier to manage.
 */

export const ROUTES = {
  HOME: '/',
  KANJI_LIST: '/kanji',
  KANJI_DETAIL: '/kanji/:id',
  COMPONENT_LIST: '/components',
  COMPONENT_DETAIL: '/components/:id',
  VOCABULARY_LIST: '/vocabulary',
  VOCABULARY_DETAIL: '/vocabulary/:id',
  SETTINGS: '/settings'
} as const

/**
 * Helper to build a route with parameters
 * @example buildRoute(ROUTES.KANJI_DETAIL, { id: '123' }) // '/kanji/123'
 */
export function buildRoute(
  path: (typeof ROUTES)[keyof typeof ROUTES],
  params: Record<string, string | number>
): string {
  let result: string = path
  for (const [key, value] of Object.entries(params)) {
    result = result.replace(`:${key}`, String(value))
  }
  return result
}
