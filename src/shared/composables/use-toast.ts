/**
 * Toast Composable
 *
 * Manages global toast notification state.
 * Uses a singleton pattern for app-wide toast management.
 */

import { ref } from 'vue'

import { generateUUID } from '@/shared/utils/uuid-utils'

// =============================================================================
// Constants
// =============================================================================

export const DEFAULT_TOAST_DURATION = 2000 // Central duration constant (in ms)

// =============================================================================
// Types
// =============================================================================

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  type: ToastType
  title: string | undefined
  message: string
  duration: number
}

export interface ToastInput {
  type?: ToastType
  title?: string
  message: string
  duration?: number
}

// =============================================================================
// Singleton State
// =============================================================================

const toasts = ref<Toast[]>([])

// =============================================================================
// Composable
// =============================================================================

export interface UseToast {
  /** Current list of active toasts */
  toasts: typeof toasts
  /** Add a toast notification */
  addToast: (input: ToastInput) => string
  /** Remove a toast by ID */
  removeToast: (id: string) => void
  /** Show a success toast */
  success: (message: string, title?: string) => string
  /** Show an error toast */
  error: (message: string, title?: string) => string
  /** Show an info toast */
  info: (message: string, title?: string) => string
  /** Show a warning toast */
  warning: (message: string, title?: string) => string
}

/**
 * Composable for managing global toast notifications.
 *
 * Uses a singleton pattern so toast state is shared across all callers.
 * Provides typed helpers for success, error, info, and warning toasts.
 *
 * @example
 * const toast = useToast()
 * toast.success('Kanji saved!')
 * toast.error('Failed to save kanji')
 */
export function useToast(): UseToast {
  function addToast(input: ToastInput): string {
    const id = generateUUID()
    const toast: Toast = {
      id,
      type: input.type ?? 'info',
      title: input.title,
      message: input.message,
      duration: input.duration ?? DEFAULT_TOAST_DURATION
    }
    toasts.value.push(toast)
    return id
  }

  function removeToast(id: string): void {
    const index = toasts.value.findIndex((t) => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  function success(message: string, title?: string): string {
    const input: ToastInput = { type: 'success', message }
    if (title) input.title = title
    return addToast(input)
  }

  function error(message: string, title?: string): string {
    const input: ToastInput = { type: 'error', message }
    if (title) input.title = title
    return addToast(input)
  }

  function info(message: string, title?: string): string {
    const input: ToastInput = { type: 'info', message }
    if (title) input.title = title
    return addToast(input)
  }

  function warning(message: string, title?: string): string {
    const input: ToastInput = { type: 'warning', message }
    if (title) input.title = title
    return addToast(input)
  }

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    info,
    warning
  }
}
