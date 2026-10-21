/**
 * useTheme tests
 */

import { nextTick } from 'vue';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Mock matchMedia
const matchMediaMock = vi.fn();

describe('useTheme', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', localStorageMock);
    vi.stubGlobal('matchMedia', matchMediaMock);
    localStorageMock.getItem.mockReset();
    localStorageMock.setItem.mockReset();
    localStorageMock.getItem.mockReturnValue(null);
    matchMediaMock.mockReturnValue({ matches: false });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('should export useTheme function', async () => {
    const { useTheme } = await import('./use-theme');
    expect(typeof useTheme).toBe('function');
  });

  it('should return theme, toggleTheme, and setTheme', async () => {
    const { useTheme } = await import('./use-theme');
    const result = useTheme();

    expect(result).toHaveProperty('theme');
    expect(result).toHaveProperty('toggleTheme');
    expect(result).toHaveProperty('setTheme');
  });

  it('should default to light theme when no preference stored', async () => {
    const { useTheme } = await import('./use-theme');
    const { theme } = useTheme();

    expect(theme.value).toBe('light');
  });

  it('should toggle theme when toggleTheme is called', async () => {
    const { useTheme } = await import('./use-theme');
    const { theme, toggleTheme } = useTheme();

    const initial = theme.value;
    toggleTheme();
    expect(theme.value).not.toBe(initial);
    toggleTheme();
    expect(theme.value).toBe(initial);
  });

  it('should set theme when setTheme is called', async () => {
    const { useTheme } = await import('./use-theme');
    const { setTheme, theme } = useTheme();

    setTheme('dark');
    expect(theme.value).toBe('dark');
    setTheme('light');
    expect(theme.value).toBe('light');
  });

  it('should use a stored dark preference', async () => {
    localStorageMock.getItem.mockReturnValue('dark');
    const { useTheme } = await import('./use-theme');

    expect(useTheme().theme.value).toBe('dark');
  });

  it('should use the system theme when it is dark and nothing is stored', async () => {
    matchMediaMock.mockReturnValue({ matches: true });
    const { useTheme } = await import('./use-theme');

    expect(useTheme().theme.value).toBe('dark');
  });

  it('should ignore an invalid stored value and use the system theme', async () => {
    localStorageMock.getItem.mockReturnValue('purple');
    matchMediaMock.mockReturnValue({ matches: true });
    const { useTheme } = await import('./use-theme');

    expect(useTheme().theme.value).toBe('dark');
  });

  it('should persist and apply the theme to the document on change', async () => {
    const { useTheme } = await import('./use-theme');
    const { setTheme } = useTheme();

    setTheme('dark');
    await nextTick();
    expect(localStorageMock.setItem).toHaveBeenCalledWith('jisaku-theme', 'dark');
    expect(document.documentElement.dataset['theme']).toBe('dark');

    setTheme('light');
    await nextTick();
    expect(localStorageMock.setItem).toHaveBeenCalledWith('jisaku-theme', 'light');
    expect(document.documentElement.dataset['theme']).toBeUndefined();
  });

  it('should fall back to the system theme when reading storage throws', async () => {
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('SecurityError');
    });
    matchMediaMock.mockReturnValue({ matches: true });
    const { useTheme } = await import('./use-theme');

    expect(useTheme().theme.value).toBe('dark');
  });

  it('should still apply the theme when writing storage throws', async () => {
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    const { useTheme } = await import('./use-theme');
    const { setTheme, theme } = useTheme();

    setTheme('dark');
    await nextTick();
    expect(theme.value).toBe('dark');
    expect(document.documentElement.dataset['theme']).toBe('dark');
  });
});
