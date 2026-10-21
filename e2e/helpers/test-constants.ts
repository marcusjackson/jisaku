/**
 * E2E Test Constants
 *
 * Centralized constants for E2E tests.
 * Provides single source of truth for viewport sizes, thresholds, and other standards.
 */

/**
 * Standard viewport sizes for responsive testing
 */
export const VIEWPORTS = {
  mobile: { width: 375, height: 667 }, // iPhone SE dimensions
  tablet: { width: 768, height: 1024 }, // Standard tablet
  desktop: { width: 1280, height: 800 }, // Standard HD resolution
} as const;

/**
 * Standard timeout values for E2E tests
 */
export const TIMEOUTS = {
  short: 3_000,
  medium: 10_000,
  long: 15_000,
  wasm: 20_000,
} as const;
