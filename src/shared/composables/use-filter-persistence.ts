/**
 * useFilterPersistence Composable
 *
 * Persists and restores URL filter state in localStorage.
 * Used to maintain filter state when navigating away from list pages
 * and returning via back buttons or direct navigation.
 */

import { onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const STORAGE_KEY_PREFIX = 'filter-state:'

export interface UseFilterPersistence {
  /** Restore saved filters from localStorage to URL on mount */
  restoreFilters: () => void
  /** Save current URL filters to localStorage */
  saveFilters: () => void
}

/**
 * Hook to persist and restore filter state across navigation
 *
 * @param key - Unique identifier for the filter state (e.g., 'kanji-list', 'component-list')
 * @returns Filter persistence utilities
 *
 * @example
 * ```ts
 * // In KanjiListRoot.vue
 * const { restoreFilters, saveFilters } = useFilterPersistence('kanji-list')
 *
 * onMounted(() => {
 *   restoreFilters()
 * })
 *
 * onBeforeUnmount(() => {
 *   saveFilters()
 * })
 * ```
 */
export function useFilterPersistence(key: string): UseFilterPersistence {
  const route = useRoute()
  const router = useRouter()
  const storageKey = `${STORAGE_KEY_PREFIX}${key}`

  /**
   * Restore saved filters from localStorage to URL
   * Only restores if current URL has no query params
   */
  function restoreFilters(): void {
    // Only restore if current URL has no query params
    if (Object.keys(route.query).length > 0) {
      return
    }

    const savedState = localStorage.getItem(storageKey)
    if (!savedState) {
      return
    }

    try {
      const query = JSON.parse(savedState) as Record<string, string>
      // Use replace to avoid adding to history
      void router.replace({ query })
    } catch (error) {
      // Invalid JSON, clear it
      console.error('[useFilterPersistence] error parsing saved state:', error)
      localStorage.removeItem(storageKey)
    }
  }

  /**
   * Save current URL query params to localStorage
   */
  function saveFilters(): void {
    const query = route.query

    if (Object.keys(query).length === 0) {
      // No filters, remove saved state
      localStorage.removeItem(storageKey)
      return
    }

    // Convert query to plain object with string values
    const queryObject: Record<string, string> = {}
    for (const [key, value] of Object.entries(query)) {
      if (typeof value === 'string') {
        queryObject[key] = value
      }
    }

    localStorage.setItem(storageKey, JSON.stringify(queryObject))
  }

  // Auto-restore on mount
  onMounted(() => {
    restoreFilters()
  })

  // Watch route.query changes and save immediately when it changes
  // This captures the filters BEFORE the route changes to a different page
  watch(
    () => JSON.stringify(route.query),
    () => {
      // Use a small delay to ensure we capture the final state
      // This helps when URL params are being set by filters
      setTimeout(() => {
        saveFilters()
      }, 0)
    }
  )

  return {
    restoreFilters,
    saveFilters
  }
}
