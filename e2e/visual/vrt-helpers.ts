/**
 * Shared helpers for Visual Regression Testing (VRT).
 *
 * All VRT module files should import constants and utilities from this module
 * rather than from test-constants.ts directly.
 *
 * ## Updating baselines
 *
 * When intentional visual changes cause screenshot diffs, regenerate baselines
 * with the `UPDATE=1` flag:
 *
 * ```bash
 * make test-e2e-vrt UPDATE=1
 * ```
 *
 * Commit the updated snapshot files alongside the code change that caused them.
 * Never regenerate baselines to silence a regression.
 */

import { expect } from '@playwright/test'

import type { Page } from '@playwright/test'

export { TIMEOUTS, VIEWPORTS } from '../helpers/test-constants'

/**
 * Screenshot threshold constants for VRT tests.
 *
 * - component: 1% tolerance for element-level screenshots
 * - page: 2% tolerance for full-page screenshots
 */
export const THRESHOLDS = {
  component: 0.01,
  page: 0.02
} as const

/**
 * Injects a `<style>` tag that disables all CSS animations and transitions
 * via `addInitScript`, which survives page navigations within the same test.
 *
 * Use `addInitScript` rather than `addStyleTag`: style tags are cleared on
 * navigation, so `addStyleTag` only works for the current page load. `addInitScript`
 * runs before every page script on every navigation, keeping animations suppressed
 * across multi-navigation tests.
 *
 * Call this before `page.goto()` for the most reliable results, or after
 * navigation if the test only navigates once.
 *
 * After navigation, also call {@link waitForFonts} to prevent font-swap flakiness.
 *
 * @example
 * test.beforeEach(async ({ page }) => {
 *   await disableAnimations(page)
 *   await page.goto('/kanji')
 *   await waitForFonts(page)
 * })
 */
export async function disableAnimations(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const style = document.createElement('style')
    style.textContent = `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
      }
    `
    document.head.appendChild(style)
  })
}

/**
 * Waits for all web fonts on the page to finish loading.
 * Prevents font-swap flakiness in screenshots.
 */
export async function waitForFonts(page: Page): Promise<void> {
  await page.evaluate(() => document.fonts.ready)
}

/**
 * Activates dark mode by setting the `data-theme="dark"` attribute directly on
 * the `<html>` element.
 *
 * This is equivalent to what the theme toggle in Settings does, but works on any
 * page without navigating to Settings first. Call this after navigation to apply
 * the theme before capturing screenshots.
 *
 * @example
 * test('dark mode layout', async ({ page }) => {
 *   await page.goto('/kanji')
 *   await enableDarkMode(page)
 *   await disableAnimations(page)
 *   await waitForFonts(page)
 *   await expect(page.getByTestId('kanji-list-section')).toHaveScreenshot('dark.png')
 * })
 */
export async function enableDarkMode(page: Page): Promise<void> {
  await page.evaluate(() => {
    document.documentElement.dataset['theme'] = 'dark'
  })
}

/**
 * Waits for all active toast notifications to be dismissed from the viewport.
 *
 * Success toasts appear after create/update actions and persist for 2 s by
 * default. If a toast is still animating when `disableAnimations` is called,
 * it gets frozen mid-transition at an unpredictable position, creating
 * pixel-level diff noise between runs. Call this after any UI action that
 * triggers a toast, before capturing screenshots.
 */
export async function waitForToastsGone(page: Page): Promise<void> {
  await expect(page.getByTestId('toast-description')).toHaveCount(0)
}
