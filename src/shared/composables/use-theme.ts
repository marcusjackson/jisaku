/**
 * useTheme
 *
 * Composable for managing app theme (light/dark mode).
 * Uses localStorage to persist user preference, falls back to system preference.
 */

import { ref, watch } from 'vue'

import type { Ref } from 'vue'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'jisaku-theme'

/**
 * Gets the system's preferred color scheme
 */
function getSystemTheme(): Theme {
  return globalThis.window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

/**
 * Gets the initial theme: user's saved preference or system preference
 */
function getInitialTheme(): Theme {
  const storedTheme = localStorage.getItem(STORAGE_KEY) as Theme | null
  if (storedTheme) {
    return storedTheme
  }
  return getSystemTheme()
}

/**
 * Applies the theme to the document
 */
function applyTheme(theme: Theme): void {
  if (theme === 'dark') {
    document.documentElement.dataset['theme'] = 'dark'
  } else {
    delete document.documentElement.dataset['theme']
  }
}

// Shared reactive state (singleton pattern)
const theme = ref<Theme>(getInitialTheme())

// Initialize theme on module load
applyTheme(theme.value)

// Watch for changes and persist
watch(theme, (newTheme) => {
  applyTheme(newTheme)
  localStorage.setItem(STORAGE_KEY, newTheme)
})

/** Return type for useTheme composable */
export interface UseTheme {
  /** Current active theme */
  theme: Ref<Theme>
  /** Toggle between light and dark themes */
  toggleTheme: () => void
  /** Set the theme explicitly */
  setTheme: (newTheme: Theme) => void
}

/**
 * Composable for managing the app theme (light/dark mode).
 *
 * Reads the user’s saved preference from localStorage, falling back to
 * the system preference. Persists changes automatically.
 *
 * @example
 * const { theme, toggleTheme } = useTheme()
 */
export function useTheme(): UseTheme {
  /**
   * Toggles between light and dark themes
   */
  function toggleTheme(): void {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  /**
   * Sets the theme explicitly
   */
  function setTheme(newTheme: Theme): void {
    theme.value = newTheme
  }

  return {
    setTheme,
    theme,
    toggleTheme
  }
}
