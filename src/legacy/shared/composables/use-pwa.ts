/**
 * PWA Composable
 *
 * Manages Progressive Web App state including service worker registration,
 * offline readiness, and update prompts.
 *
 * Uses vite-plugin-pwa's virtual module for service worker registration.
 */

import { useRegisterSW } from 'virtual:pwa-register/vue'

import type { Ref } from 'vue'

// =============================================================================
// Types
// =============================================================================

export interface UsePwa {
  /** Whether a new version is available and waiting to be installed */
  needsUpdate: Ref<boolean>
  /** Whether the app is ready to work offline */
  offlineReady: Ref<boolean>
  /** Trigger the service worker update to install new version */
  updateServiceWorker: () => Promise<void>
  /** Dismiss the update prompt without updating */
  dismissUpdate: () => void
}

// =============================================================================
// Composable
// =============================================================================

/**
 * PWA composable for managing service worker state
 *
 * @example
 * ```ts
 * const { needsUpdate, offlineReady, updateServiceWorker, dismissUpdate } = usePwa()
 *
 * // Show update prompt when needsUpdate is true
 * // Call updateServiceWorker() when user clicks "Update"
 * // Call dismissUpdate() when user clicks "Later"
 * ```
 */
export function usePwa(): UsePwa {
  const {
    needRefresh: needsUpdate,
    offlineReady,
    updateServiceWorker: updateSW
  } = useRegisterSW({
    // Called when new content is available
    onNeedRefresh() {
      // The needRefresh ref is automatically set to true
      // The UI will react to this change
    },
    // Called when content has been cached for offline use
    onOfflineReady() {
      // The offlineReady ref is automatically set to true
      // Could show a toast here if desired
    },
    // Called when registration error occurs
    onRegisterError(error: unknown) {
      console.error('Service worker registration failed:', error)
    }
  })

  async function updateServiceWorker(): Promise<void> {
    await updateSW(true)
  }

  function dismissUpdate(): void {
    needsUpdate.value = false
  }

  return {
    needsUpdate,
    offlineReady,
    updateServiceWorker,
    dismissUpdate
  }
}
