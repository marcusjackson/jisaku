/**
 * Visual Regression Tests — Not Found (404) Page
 *
 * Covers:
 * - Full-page layout at desktop viewport (Req 12.1, 11.1)
 * - Full-page layout at mobile viewport (Req 12.2, 11.2)
 * - Full-page layout at tablet viewport (Req 12.3, 11.3)
 */

import { expect, test } from '@playwright/test'

import {
  disableAnimations,
  THRESHOLDS,
  VIEWPORTS,
  waitForFonts
} from './vrt-helpers'

test.describe('Not Found VRT', () => {
  test('full-page at desktop viewport', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop)
    await page.goto('/this-route-does-not-exist')
    await disableAnimations(page)
    await waitForFonts(page)
    await page.mouse.move(0, 0)
    await expect(
      page.getByRole('heading', { name: 'Page Not Found' })
    ).toBeVisible()
    await expect(page).toHaveScreenshot('not-found-desktop.png', {
      fullPage: true,
      maxDiffPixels: 500,
      threshold: THRESHOLDS.page
    })
  })

  test('full-page at mobile viewport', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile)
    await page.goto('/this-route-does-not-exist')
    await disableAnimations(page)
    await waitForFonts(page)
    await page.mouse.move(0, 0)
    await expect(
      page.getByRole('heading', { name: 'Page Not Found' })
    ).toBeVisible()
    await expect(page).toHaveScreenshot('not-found-mobile.png', {
      fullPage: true,
      maxDiffPixels: 500,
      threshold: THRESHOLDS.page
    })
  })

  test('full-page at tablet viewport', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.tablet)
    await page.goto('/this-route-does-not-exist')
    await disableAnimations(page)
    await waitForFonts(page)
    await page.mouse.move(0, 0)
    await expect(
      page.getByRole('heading', { name: 'Page Not Found' })
    ).toBeVisible()
    await expect(page).toHaveScreenshot('not-found-tablet.png', {
      fullPage: true,
      maxDiffPixels: 500,
      threshold: THRESHOLDS.page
    })
  })
})
