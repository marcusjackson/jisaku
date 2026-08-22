/**
 * Visual Regression Tests — Vocabulary List Page
 *
 * Covers:
 * - Empty-state layout at desktop viewport (Req 7.1, 11.1)
 * - Empty-state layout at mobile viewport (Req 7.2, 11.2)
 * - VocabListCard element at desktop viewport (Req 7.3)
 * - Filter panel element at desktop viewport (Req 7.4)
 * - Full-page layout at tablet viewport with entries (Req 7.5)
 * - Dark mode full-page at desktop viewport (Req 7.6, 10.2)
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
 * Creates a vocabulary item via the UI and stays on the vocabulary list page.
 * Modelled after the kanji-list and component-list VRT helpers.
 */
async function createVocab(page: Page, word: string): Promise<void> {
  await page.goto('/vocabulary')
  await expect(page.getByRole('heading', { name: /vocabulary/i })).toBeVisible()
  await page.getByRole('button', { name: /^add new$/i }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page
    .getByRole('dialog')
    .getByRole('textbox', { name: /word/i })
    .fill(word)
  await page.getByRole('button', { name: /^add$/i }).click()
  await expect(page.getByRole('dialog')).not.toBeVisible()
  await page.waitForURL('/vocabulary')
  await waitForToastsGone(page)
}

test.describe('Vocab List VRT', () => {
  test.describe('empty state', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop)
      await page.goto('/vocabulary')
      await disableAnimations(page)
      await waitForFonts(page)
      await page.mouse.move(0, 0)
      await expect(page.getByText(/no vocabulary yet/i)).toBeVisible()
    })

    test('full-page at desktop viewport', async ({ page }) => {
      await expect(page).toHaveScreenshot('vocab-list-empty-desktop.png', {
        fullPage: true,
        maxDiffPixels: 500,
        threshold: THRESHOLDS.page
      })
    })

    test('full-page at mobile viewport', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.mobile)
      await page.goto('/vocabulary')
      await disableAnimations(page)
      await waitForFonts(page)
      await page.mouse.move(0, 0)
      await expect(page.getByText(/no vocabulary yet/i)).toBeVisible()
      await expect(page).toHaveScreenshot('vocab-list-empty-mobile.png', {
        fullPage: true,
        maxDiffPixels: 500,
        threshold: THRESHOLDS.page
      })
    })
  })

  test.describe('with vocabulary entries', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop)
      await createVocab(page, '水')
      await disableAnimations(page)
      await waitForFonts(page)
      await page.mouse.move(0, 0)
      await expect(page.getByTestId('vocab-list-card').first()).toBeVisible()
    })

    test('VocabListCard element at desktop viewport', async ({ page }) => {
      const card = page.getByTestId('vocab-list-card').first()
      await expect(card).toHaveScreenshot('vocab-list-card-desktop.png', {
        maxDiffPixels: 50,
        threshold: THRESHOLDS.component
      })
    })

    test('filters section at desktop viewport', async ({ page }) => {
      const filtersToggle = page.getByTestId('vocab-list-filters-toggle')
      const isExpanded = await filtersToggle.getAttribute('aria-expanded')
      if (isExpanded !== 'true') {
        await filtersToggle.click()
      }
      await expect(page.getByTestId('vocab-list-filters')).toBeVisible()
      const filters = page.getByTestId('vocab-list-filters')
      await expect(filters).toHaveScreenshot('vocab-list-filters-desktop.png', {
        maxDiffPixels: 50,
        threshold: THRESHOLDS.component
      })
    })

    test('full-page at tablet viewport', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.tablet)
      await page.goto('/vocabulary')
      await disableAnimations(page)
      await waitForFonts(page)
      await page.mouse.move(0, 0)
      await expect(page.getByTestId('vocab-list-card').first()).toBeVisible()
      await expect(page).toHaveScreenshot('vocab-list-tablet.png', {
        fullPage: true,
        maxDiffPixels: 500,
        threshold: THRESHOLDS.page
      })
    })
  })

  test.describe('dark mode', () => {
    test('full-page dark mode at desktop viewport', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop)
      await createVocab(page, '言葉')
      await enableDarkMode(page)
      await disableAnimations(page)
      await waitForFonts(page)
      await page.mouse.move(0, 0)
      await expect(page.getByTestId('vocab-list-card').first()).toBeVisible()
      await expect(page).toHaveScreenshot('vocab-list-dark-mode-desktop.png', {
        fullPage: true,
        maxDiffPixels: 500,
        threshold: THRESHOLDS.page
      })
    })
  })
})
