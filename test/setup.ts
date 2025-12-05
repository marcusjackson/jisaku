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
