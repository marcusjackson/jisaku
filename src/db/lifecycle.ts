/**
 * Browser lifecycle event handlers for database persistence
 *
 * Attaches listeners to save the database when the app goes to background
 * or when the page is about to unload. Critical for Android PWA where the
 * WebView may be killed while backgrounded.
 */

import { persistImmediately, persistSync } from './indexeddb'

let lifecycleListenersAttached = false
let persistErrorCallback: ((err: Error) => void) | undefined

/**
 * Handle visibility change - save when app goes to background.
 * Critical for Android PWA where the WebView may be killed while backgrounded.
 */
function handleVisibilityChange(): void {
  if (document.visibilityState === 'hidden') {
    // Use async persist but start it immediately; catch errors and surface via
    // callback so callers can show a user-visible notification if needed.
    persistImmediately().catch((err: unknown) => {
      persistErrorCallback?.(
        err instanceof Error ? err : new Error(String(err))
      )
    })
  }
}

/**
 * Handle page hide - more reliable than beforeunload on mobile.
 */
function handlePageHide(): void {
  // On page hide, use sync persist as async may not complete
  persistSync()
}

/**
 * Handle before unload - last chance to save.
 */
function handleBeforeUnload(): void {
  persistSync()
}

/**
 * Attach lifecycle listeners for persistence.
 * Called once during first database initialization.
 *
 * @param onPersistError - Optional callback invoked if an async persist fails
 *   (e.g. IndexedDB write rejected when the OS kills the tab). The synchronous
 *   persist on pagehide/beforeunload provides a fallback, but surfacing the
 *   error allows the application to show a user-visible notification.
 */
export function attachLifecycleListeners(
  onPersistError?: (err: Error) => void
): void {
  if (lifecycleListenersAttached) return
  persistErrorCallback = onPersistError

  // visibilitychange is the most reliable for mobile PWAs
  document.addEventListener('visibilitychange', handleVisibilityChange)

  // pagehide is more reliable than beforeunload on some browsers
  window.addEventListener('pagehide', handlePageHide)

  // beforeunload as a fallback
  window.addEventListener('beforeunload', handleBeforeUnload)

  lifecycleListenersAttached = true
}

/**
 * Detach lifecycle listeners for persistence.
 * Useful for testing and Vite HMR cleanup.
 */
export function detachLifecycleListeners(): void {
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  window.removeEventListener('pagehide', handlePageHide)
  window.removeEventListener('beforeunload', handleBeforeUnload)
  persistErrorCallback = undefined
  lifecycleListenersAttached = false
}
