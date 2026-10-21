/**
 * useTheme
 *
 * Composable for managing app theme (light/dark mode).
 * Uses localStorage to persist user preference, falls back to system preference.
 */

import { ref, watch } from 'vue';

import type { Ref } from 'vue';

export type Theme = 'light' | 'dark';

// index.html reads this key too, to apply the theme before first paint
const STORAGE_KEY = 'jisaku-theme';

/**
 * Gets the system's preferred color scheme
 */
function getSystemTheme(): Theme {
  return globalThis.window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Gets the initial theme: user's saved preference or system preference
 */
function getInitialTheme(): Theme {
  try {
    const storedTheme = localStorage.getItem(STORAGE_KEY);
    if (storedTheme === 'light' || storedTheme === 'dark') {
      return storedTheme;
    }
  } catch {
    // Storage unavailable (blocked, private mode): use the system preference
  }
  return getSystemTheme();
}

/**
 * Applies the theme to the document
 */
function applyTheme(theme: Theme): void {
  if (theme === 'dark') {
    document.documentElement.dataset['theme'] = 'dark';
  } else {
    delete document.documentElement.dataset['theme'];
  }
}

// Shared reactive state (singleton pattern)
const theme = ref<Theme>(getInitialTheme());

// Initialize theme on module load
applyTheme(theme.value);

// Watch for changes and persist
watch(theme, (newTheme) => {
  applyTheme(newTheme);
  try {
    localStorage.setItem(STORAGE_KEY, newTheme);
  } catch {
    // Storage unavailable or full: the theme still applies for this session
  }
});

/** Return type for useTheme composable */
export interface UseThemeReturn {
  /** Current active theme */
  theme: Ref<Theme>;
  /** Toggle between light and dark themes */
  toggleTheme: () => void;
  /** Set the theme explicitly */
  setTheme: (newTheme: Theme) => void;
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
export function useTheme(): UseThemeReturn {
  /**
   * Toggles between light and dark themes
   */
  function toggleTheme(): void {
    theme.value = theme.value === 'light' ? 'dark' : 'light';
  }

  /**
   * Sets the theme explicitly
   */
  function setTheme(newTheme: Theme): void {
    theme.value = newTheme;
  }

  return {
    setTheme,
    theme,
    toggleTheme,
  };
}
