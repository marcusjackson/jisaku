/**
 * Visual Regression Tests — Kanji Detail Page
 *
 * Covers:
 * - Viewport layout at desktop breakpoint (Req 4.1, 11.1)
 * - Viewport layout at mobile breakpoint (Req 4.2, 11.2)
 * - Viewport layout at tablet breakpoint (Req 4.3, 11.3)
 * - Kanji headline section element at desktop viewport (Req 4.4)
 * - Basic-info edit dialog element at desktop viewport (Req 4.5)
 * - Expanded semantic-notes section element at desktop viewport (Req 4.6)
 * - Dark mode full-page at desktop viewport (Req 4.7, 10.2)
 * - Not-found error state at desktop viewport (Req 4.8)
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
 * Creates a kanji via the UI and navigates to its detail page.
 * Modelled after `createAndNavigateToKanji` in kanji-detail.test.ts.
 */
async function createAndNavigateToKanji(
  page: Page,
  character: string
): Promise<void> {
  await page.goto('/kanji')
  await expect(page.getByRole('heading', { name: /kanji list/i })).toBeVisible()
  await page.getByRole('button', { name: /^add new$/i }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('textbox', { name: /character/i }).fill(character)
  await page.getByRole('button', { name: /^add$/i }).click()
  await expect(page.getByRole('dialog')).not.toBeVisible()
  const kanjiCard = page
    .getByTestId('kanji-list-card')
    .filter({ hasText: character })
  await kanjiCard.click()
  await page.waitForURL(/\/kanji\/\d+$/)
  await page.waitForLoadState('networkidle')
  await waitForToastsGone(page)
  // Blur any focused element to prevent focus rings in screenshots
  await page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null
    el?.blur()
  })
}

test.describe('Kanji Detail VRT', () => {
  test.describe('viewport layout', () => {
    test('viewport at desktop breakpoint', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop)
      await createAndNavigateToKanji(page, '水')
      await disableAnimations(page)
      await waitForFonts(page)
      await page.mouse.move(0, 0)
      await expect(page.getByTestId('kanji-detail-headline')).toBeVisible()
      await expect(page).toHaveScreenshot('kanji-detail-desktop.png', {
        fullPage: true,
        maxDiffPixels: 500,
        threshold: THRESHOLDS.page
      })
    })

    test('viewport at mobile breakpoint', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.mobile)
      await createAndNavigateToKanji(page, '水')
      await disableAnimations(page)
      await waitForFonts(page)
      await page.mouse.move(0, 0)
      await expect(page.getByTestId('kanji-detail-headline')).toBeVisible()
      await expect(page).toHaveScreenshot('kanji-detail-mobile.png', {
        fullPage: true,
        maxDiffPixels: 500,
        threshold: THRESHOLDS.page
      })
    })

    test('viewport at tablet breakpoint', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.tablet)
      await createAndNavigateToKanji(page, '水')
      await disableAnimations(page)
      await waitForFonts(page)
      await page.mouse.move(0, 0)
      await expect(page.getByTestId('kanji-detail-headline')).toBeVisible()
      await expect(page).toHaveScreenshot('kanji-detail-tablet.png', {
        fullPage: true,
        maxDiffPixels: 500,
        threshold: THRESHOLDS.page
      })
    })
  })

  test.describe('element screenshots', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop)
      await createAndNavigateToKanji(page, '火')
      await disableAnimations(page)
      await waitForFonts(page)
      await page.mouse.move(0, 0)
      await expect(page.getByTestId('kanji-detail-headline')).toBeVisible()
    })

    test('kanji headline section at desktop viewport', async ({ page }) => {
      // Disable pointer events so link/button hover states don't affect the screenshot.
      // Then trigger a mouse move to ensure the browser re-evaluates pointer targets.
      await page.addStyleTag({
        content: '* { pointer-events: none !important; }'
      })
      await page.mouse.move(1, 1)
      const headline = page.getByTestId('kanji-detail-headline')
      await expect(headline).toHaveScreenshot(
        'kanji-detail-headline-desktop.png',
        {
          // Use looser per-pixel threshold (0.1) because the large kanji character
          // and English text undergo macOS sub-pixel anti-aliasing between runs.
          // maxDiffPixelRatio: 0.05 still catches real layout/content regressions.
          maxDiffPixelRatio: 0.05,
          threshold: 0.1
        }
      )
    })

    test('basic-info edit dialog at desktop viewport', async ({ page }) => {
      await page
        .getByTestId('kanji-detail-basic-info')
        .getByTestId('basic-info-edit-button')
        .click()
      await expect(page.getByRole('dialog')).toBeVisible()
      await disableAnimations(page)
      await page.mouse.move(0, 0)
      const dialog = page.getByRole('dialog')
      await expect(dialog).toHaveScreenshot(
        'kanji-detail-basic-info-dialog-desktop.png',
        {
          maxDiffPixels: 50,
          threshold: THRESHOLDS.component
        }
      )
    })

    test('semantic-notes section expanded at desktop viewport', async ({
      page
    }) => {
      // Expand the semantic-notes collapsible section
      const semanticSection = page.getByTestId('kanji-detail-semantic-notes')
      await semanticSection.getByRole('button').first().click()
      await expect(semanticSection).toBeVisible()
      await page.mouse.move(0, 0)
      await expect(semanticSection).toHaveScreenshot(
        'kanji-detail-semantic-notes-expanded-desktop.png',
        {
          maxDiffPixels: 50,
          threshold: THRESHOLDS.component
        }
      )
    })
  })

  test.describe('dark mode', () => {
    test('full-page dark mode at desktop viewport', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop)
      await createAndNavigateToKanji(page, '山')
      await enableDarkMode(page)
      await disableAnimations(page)
      await waitForFonts(page)
      await page.mouse.move(0, 0)
      await expect(page.getByTestId('kanji-detail-headline')).toBeVisible()
      await expect(page).toHaveScreenshot(
        'kanji-detail-dark-mode-desktop.png',
        {
          fullPage: true,
          maxDiffPixels: 500,
          threshold: THRESHOLDS.page
        }
      )
    })
  })

  test.describe('error state', () => {
    test('shows error for non-existent kanji at desktop viewport', async ({
      page
    }) => {
      await page.setViewportSize(VIEWPORTS.desktop)
      await page.goto('/kanji/99999')
      await page.waitForLoadState('networkidle')
      await disableAnimations(page)
      await waitForFonts(page)
      await page.mouse.move(0, 0)
      await expect(page.getByText(/kanji with id/i)).toBeVisible()
      await expect(page).toHaveScreenshot(
        'kanji-detail-not-found-desktop.png',
        {
          fullPage: true,
          maxDiffPixels: 500,
          threshold: THRESHOLDS.page
        }
      )
    })
  })
})
