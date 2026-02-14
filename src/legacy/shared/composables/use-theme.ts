import { ref, watch } from 'vue'

/**
 * Theme options for the app
 */
export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'jisaku-theme'

/**
 * Gets the system's preferred color scheme
 */
function getSystemTheme(): Theme {
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  return 'light'
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

/**
 * Composable for managing app theme (light/dark mode)
 *
 * On first use, checks for saved preference in localStorage.
 * If no saved preference, uses system's preferred color scheme.
 * All subsequent uses share the same reactive state.
 *
 * @example
 * ```vue
 * <script setup>
 * import { useTheme } from '@/legacy/shared/composables/use-theme'
 *
 * const { theme, toggleTheme, setTheme } = useTheme()
 * </script>
 *
 * <template>
 *   <button @click="toggleTheme">
 *     Current: {{ theme }}
 *   </button>
 * </template>
 * ```
 */
export function useTheme() {
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
    theme,
    toggleTheme,
    setTheme
  }
}
