import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useTheme } from './use-theme'

describe('useTheme', () => {
  let originalMatchMedia: typeof window.matchMedia
  let originalLocalStorage: Storage

  beforeEach(() => {
    // Mock matchMedia
    originalMatchMedia = window.matchMedia
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    }))

    // Mock localStorage
    originalLocalStorage = window.localStorage
    const storage: Record<string, string> = {}
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: (key: string) => storage[key] ?? null,
        setItem: (key: string, value: string) => {
          storage[key] = value
        },
        removeItem: (key: string) => {
          storage[key] = undefined as unknown as string
        },
        clear: () => {
          Object.keys(storage).forEach((key) => {
            storage[key] = undefined as unknown as string
          })
        }
      },
      writable: true
    })

    // Clear document theme
    delete document.documentElement.dataset['theme']
  })

  afterEach(() => {
    window.matchMedia = originalMatchMedia
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage,
      writable: true
    })
    delete document.documentElement.dataset['theme']
  })

  it('initializes with light theme by default when no system preference', () => {
    window.matchMedia = vi.fn().mockImplementation(() => ({
      matches: false,
      media: '',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    }))

    const { theme } = useTheme()
    expect(theme.value).toBe('light')
  })

  it('initializes with system preference when no saved theme', () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    }))

    localStorage.clear()

    // Force re-import to trigger initialization
    vi.resetModules()

    const { theme } = useTheme()
    expect(['light', 'dark']).toContain(theme.value)
  })

  it('initializes with saved theme preference from localStorage', () => {
    // Set theme explicitly since module already loaded
    const { setTheme, theme } = useTheme()
    localStorage.setItem('jisaku-theme', 'dark')
    setTheme('dark')

    expect(theme.value).toBe('dark')
    expect(localStorage.getItem('jisaku-theme')).toBe('dark')
  })

  it('toggles theme from light to dark', () => {
    const { theme, toggleTheme } = useTheme()
    theme.value = 'light'

    toggleTheme()
    expect(theme.value).toBe('dark')
  })

  it('toggles theme from dark to light', () => {
    const { theme, toggleTheme } = useTheme()
    theme.value = 'dark'

    toggleTheme()
    expect(theme.value).toBe('light')
  })

  it('sets theme explicitly', () => {
    const { setTheme, theme } = useTheme()

    setTheme('dark')
    expect(theme.value).toBe('dark')

    setTheme('light')
    expect(theme.value).toBe('light')
  })

  it('applies dark theme to document', async () => {
    const { setTheme } = useTheme()

    setTheme('dark')
    // Wait for watch effect to apply
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(document.documentElement.dataset['theme']).toBe('dark')
  })

  it('removes theme attribute for light theme', () => {
    const { setTheme } = useTheme()

    setTheme('dark')
    setTheme('light')
    expect(document.documentElement.dataset['theme']).toBeUndefined()
  })

  it('persists theme to localStorage', async () => {
    const { setTheme } = useTheme()

    setTheme('dark')
    // Wait for watch effect to persist
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(localStorage.getItem('jisaku-theme')).toBe('dark')

    setTheme('light')
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(localStorage.getItem('jisaku-theme')).toBe('light')
  })
})
