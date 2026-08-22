/**
 * useTheme tests
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}

// Mock matchMedia
const matchMediaMock = vi.fn()

describe('useTheme', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', localStorageMock)
    vi.stubGlobal('matchMedia', matchMediaMock)
    localStorageMock.getItem.mockReturnValue(null)
    matchMediaMock.mockReturnValue({ matches: false })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.resetModules()
  })

  it('should export useTheme function', async () => {
    const { useTheme } = await import('./use-theme')
    expect(typeof useTheme).toBe('function')
  })

  it('should return theme, toggleTheme, and setTheme', async () => {
    const { useTheme } = await import('./use-theme')
    const result = useTheme()

    expect(result).toHaveProperty('theme')
    expect(result).toHaveProperty('toggleTheme')
    expect(result).toHaveProperty('setTheme')
  })

  it('should default to light theme when no preference stored', async () => {
    const { useTheme } = await import('./use-theme')
    const { theme } = useTheme()

    expect(theme.value).toBe('light')
  })

  it('should toggle theme when toggleTheme is called', async () => {
    const { useTheme } = await import('./use-theme')
    const { theme, toggleTheme } = useTheme()

    const initial = theme.value
    toggleTheme()
    expect(theme.value).not.toBe(initial)
    toggleTheme()
    expect(theme.value).toBe(initial)
  })

  it('should set theme when setTheme is called', async () => {
    const { useTheme } = await import('./use-theme')
    const { setTheme, theme } = useTheme()

    setTheme('dark')
    expect(theme.value).toBe('dark')
    setTheme('light')
    expect(theme.value).toBe('light')
  })
})
