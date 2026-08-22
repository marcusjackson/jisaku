/**
 * Visual Regression Tests — Kanji List Page
 *
 * Covers:
 * - Empty-state layout at desktop and mobile viewports (Req 3.1, 3.2)
 * - KanjiListCard element at desktop viewport (Req 3.3)
 * - Filter panel element at desktop viewport (Req 3.4)
 * - Full-page layout at tablet viewport with entries (Req 3.5)
 * - Dark mode full-page at desktop viewport (Req 3.6, 10.2)
 */

import { expect, type Page, test } from '@playwright/test'

import {
  disableAnimations,
  enableDarkMode,
  THRESHOLDS,
  VIEWPORTS,
  waitForFonts,
  waitForToastsGone
} from './vrt-helpers'

/**
 * Creates a kanji via the UI and returns to the kanji list page.
 * Modelled after `createAndNavigateToKanji` in kanji-detail.test.ts,
 * but stops at the list page instead of navigating to the detail page.
 */
async function createKanji(page: Page, character: string): Promise<void> {
  await page.goto('/kanji')
  await expect(page.getByRole('heading', { name: /kanji list/i })).toBeVisible()
  await page.getByRole('button', { name: /^add new$/i }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('textbox', { name: /character/i }).fill(character)
  await page.getByRole('button', { name: /^add$/i }).click()
  await expect(page.getByRole('dialog')).not.toBeVisible()
  await page.waitForURL('/kanji')
  await waitForToastsGone(page)
}

test.describe('Kanji List VRT', () => {
  test.describe('empty state', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop)
      await page.goto('/kanji')
      await disableAnimations(page)
      await waitForFonts(page)
      await page.mouse.move(0, 0)
      await expect(page.getByText(/no kanji yet/i)).toBeVisible()
    })

    test('full-page at desktop viewport', async ({ page }) => {
      await expect(page).toHaveScreenshot('kanji-list-empty-desktop.png', {
        fullPage: true,
        maxDiffPixels: 500,
        threshold: THRESHOLDS.page
      })
    })

    test('full-page at mobile viewport', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.mobile)
      await page.goto('/kanji')
      await disableAnimations(page)
      await waitForFonts(page)
      await page.mouse.move(0, 0)
      await expect(page.getByText(/no kanji yet/i)).toBeVisible()
      await expect(page).toHaveScreenshot('kanji-list-empty-mobile.png', {
        fullPage: true,
        maxDiffPixels: 500,
        threshold: THRESHOLDS.page
      })
    })
  })

  test.describe('dark mode', () => {
    test('full-page dark mode at desktop viewport', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop)
      await createKanji(page, '火')
      await enableDarkMode(page)
      await disableAnimations(page)
      await waitForFonts(page)
      await page.mouse.move(0, 0)
      await expect(page.getByTestId('kanji-list-card').first()).toBeVisible()
      await expect(page).toHaveScreenshot('kanji-list-dark-mode-desktop.png', {
        fullPage: true,
        maxDiffPixels: 500,
        threshold: THRESHOLDS.page
      })
    })
  })

  test.describe('with kanji entries', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop)
      await createKanji(page, '水')
      await disableAnimations(page)
      await waitForFonts(page)
      await page.mouse.move(0, 0)
      await expect(page.getByTestId('kanji-list-card').first()).toBeVisible()
    })

    test('full-page at tablet viewport', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.tablet)
      await page.goto('/kanji')
      await disableAnimations(page)
      await waitForFonts(page)
      await page.mouse.move(0, 0)
      await expect(page.getByTestId('kanji-list-card').first()).toBeVisible()
      await expect(page).toHaveScreenshot('kanji-list-tablet.png', {
        fullPage: true,
        threshold: THRESHOLDS.page
      })
    })

    test('KanjiListCard element at desktop viewport', async ({ page }) => {
      const card = page.getByTestId('kanji-list-card').first()
      await expect(card).toHaveScreenshot('kanji-list-card-desktop.png', {
        maxDiffPixels: 50,
        threshold: THRESHOLDS.component
      })
    })

    test('filters section at desktop viewport', async ({ page }) => {
      const filtersToggle = page.getByTestId('kanji-list-filters-toggle')
      const isExpanded = await filtersToggle.getAttribute('aria-expanded')
      if (isExpanded !== 'true') {
        await filtersToggle.click()
      }
      await expect(page.getByTestId('kanji-list-filters')).toBeVisible()
      const filters = page.getByTestId('kanji-list-filters')
      await expect(filters).toHaveScreenshot('kanji-list-filters-desktop.png', {
        maxDiffPixels: 50,
        threshold: THRESHOLDS.component
      })
    })
  })
})
