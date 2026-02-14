/**
 * Version Toggle Composable
 *
 * Handles switching between legacy and refactored UI versions.
 * Maps routes bidirectionally and navigates to the appropriate version.
 * Supports dynamic routes with parameters (e.g., /kanji/:id).
 */

import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { getEquivalentRoute } from '@/router/routes'

export function useVersionToggle() {
  const route = useRoute()
  const router = useRouter()

  /**
   * Check if currently on legacy UI
   */
  const isLegacyMode = computed(() => {
    return route.path.startsWith('/legacy')
  })

  /**
   * Get the equivalent route in the other version
   */
  function getToggleRoute(): string {
    return getEquivalentRoute(
      route.path,
      route.params as Record<string, string>
    )
  }

  /**
   * Navigate to the other version
   */
  async function toggleVersion(): Promise<void> {
    const targetRoute = getToggleRoute()
    await router.push(targetRoute)
  }

  return {
    isLegacyMode,
    toggleVersion,
    getToggleRoute
  }
}
