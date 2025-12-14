/**
 * Vitest Test Setup
 *
 * This file runs before each test file.
 * Sets up testing-library matchers and global test utilities.
 */

import '@testing-library/jest-dom/vitest'

// Mock scrollIntoView for jsdom (not implemented)
// This is needed for Reka UI components that use scrollIntoView
Element.prototype.scrollIntoView = () => {
  // No-op for jsdom environment
}

// Mock matchMedia for jsdom (not implemented)
// This is needed for theme detection with prefers-color-scheme
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {
      // No-op for jsdom
    },
    removeListener: () => {
      // No-op for jsdom
    },
    addEventListener: () => {
      // No-op for jsdom
    },
    removeEventListener: () => {
      // No-op for jsdom
    },
    dispatchEvent: () => true
  })
})
