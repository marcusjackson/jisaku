/**
 * Visual Regression Tests — Vocabulary Detail Page
 *
 * Covers:
 * - Viewport layout at desktop breakpoint (Req 8.1, 11.1)
 * - Viewport layout at mobile breakpoint (Req 8.2, 11.2)
 * - Viewport layout at tablet breakpoint (Req 8.3, 11.3)
 * - Vocabulary headline section element at desktop viewport (Req 8.4)
 * - Basic-info edit dialog element at desktop viewport (Req 8.5)
 * - Populated basic-info section element at desktop viewport (Req 8.6)
 * - Expanded kanji-breakdown section element at desktop viewport (Req 8.7)
 * - Dark mode full-page at desktop viewport (Req 8.8, 10.2)
 * - Not-found error state at desktop viewport (Req 8.9)
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
 * Creates a vocabulary entry via the UI and navigates to its detail page.
 * Modelled after `createAndNavigateToVocab` in vocab-detail.test.ts.
 */
async function createAndNavigateToVocab(
  page: Page,
  word: string
): Promise<void> {
  await page.goto('/vocabulary')
  await expect(
    page.getByRole('heading', { name: /^vocabulary$/i })
  ).toBeVisible()

  const addButton = page.getByRole('button', { name: /^add new$/i })
  const addFirstButton = page.getByRole('button', {
    name: /add first vocabulary/i
  })

  if (await addButton.isVisible()) {
    await addButton.click()
  } else {
    await addFirstButton.click()
  }

  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('textbox', { name: /^word$/i }).fill(word)
  await page.getByRole('textbox', { name: /^kana$/i }).fill('かな')
  await page.getByRole('button', { name: /^add$/i }).click()
  await expect(page.getByRole('dialog')).not.toBeVisible()

  const vocabCard = page
    .getByTestId('vocab-list-card')
    .filter({ hasText: word })
  await vocabCard.click()
  await page.waitForURL(/\/vocabulary\/\d+$/)
  await page.waitForLoadState('networkidle')
  await waitForToastsGone(page)
  // Blur any focused element to prevent focus rings in screenshots
  await page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null
    el?.blur()
  })
}

test.describe('Vocabulary Detail VRT', () => {
  test.describe('viewport layout', () => {
    test('viewport at desktop breakpoint', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop)
      await createAndNavigateToVocab(page, '日本語')
      await disableAnimations(page)
      await waitForFonts(page)
      await page.mouse.move(0, 0)
      await expect(page.getByTestId('vocab-detail-headline')).toBeVisible()
      await expect(page).toHaveScreenshot('vocab-detail-desktop.png', {
        fullPage: true,
        maxDiffPixels: 500,
        threshold: THRESHOLDS.page
      })
    })

    test('viewport at mobile breakpoint', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.mobile)
      await createAndNavigateToVocab(page, '日本語')
      await disableAnimations(page)
      await waitForFonts(page)
      await page.mouse.move(0, 0)
      await expect(page.getByTestId('vocab-detail-headline')).toBeVisible()
      await expect(page).toHaveScreenshot('vocab-detail-mobile.png', {
        fullPage: true,
        maxDiffPixels: 500,
        threshold: THRESHOLDS.page
      })
    })

    test('viewport at tablet breakpoint', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.tablet)
      await createAndNavigateToVocab(page, '日本語')
      await disableAnimations(page)
      await waitForFonts(page)
      await page.mouse.move(0, 0)
      await expect(page.getByTestId('vocab-detail-headline')).toBeVisible()
      await expect(page).toHaveScreenshot('vocab-detail-tablet.png', {
        fullPage: true,
        maxDiffPixels: 500,
        threshold: THRESHOLDS.page
      })
    })
  })

  test.describe('element screenshots', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop)
      await createAndNavigateToVocab(page, '勉強')
      await disableAnimations(page)
      await waitForFonts(page)
      await page.mouse.move(0, 0)
      await expect(page.getByTestId('vocab-detail-headline')).toBeVisible()
    })

    test('vocabulary headline section at desktop viewport', async ({
      page
    }) => {
      // Disable pointer events so link/button hover states don't affect the screenshot.
      // Then trigger a mouse move to ensure the browser re-evaluates pointer targets.
      await page.addStyleTag({
        content: '* { pointer-events: none !important; }'
      })
      await page.mouse.move(1, 1)
      const headline = page.getByTestId('vocab-detail-headline')
      await expect(headline).toHaveScreenshot(
        'vocab-detail-headline-desktop.png',
        {
          // Use looser per-pixel threshold (0.1) because Japanese text undergoes
          // macOS sub-pixel anti-aliasing between runs.
          // maxDiffPixelRatio: 0.05 still catches real layout/content regressions.
          maxDiffPixelRatio: 0.05,
          threshold: 0.1
        }
      )
    })

    test('basic-info edit dialog at desktop viewport', async ({ page }) => {
      await page
        .getByTestId('vocab-detail-basic-info')
        .getByTestId('basic-info-edit-button')
        .click()
      await expect(page.getByRole('dialog')).toBeVisible()
      await disableAnimations(page)
      await page.mouse.move(0, 0)
      const dialog = page.getByRole('dialog')
      await expect(dialog).toHaveScreenshot(
        'vocab-detail-basic-info-dialog-desktop.png',
        {
          maxDiffPixels: 50,
          threshold: THRESHOLDS.component
        }
      )
    })

    test('kanji-breakdown section expanded at desktop viewport', async ({
      page
    }) => {
      // Expand the kanji-breakdown section (closed by default when empty)
      const breakdownSection = page.getByTestId('vocab-detail-kanji-breakdown')
      await breakdownSection.getByRole('button').first().click()
      await expect(breakdownSection).toBeVisible()
      await page.mouse.move(0, 0)
      await expect(breakdownSection).toHaveScreenshot(
        'vocab-detail-kanji-breakdown-expanded-desktop.png',
        {
          maxDiffPixels: 50,
          threshold: THRESHOLDS.component
        }
      )
    })
  })

  test.describe('populated basic-info section', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop)
      await createAndNavigateToVocab(page, '学習')
      // Populate basic-info via edit dialog
      await page
        .getByTestId('vocab-detail-basic-info')
        .getByTestId('basic-info-edit-button')
        .click()
      await expect(page.getByRole('dialog')).toBeVisible()
      await page
        .getByRole('textbox', { name: /description/i })
        .fill('The act of studying or learning.')
      await page.getByRole('button', { name: /save/i }).click()
      await expect(page.getByRole('dialog')).not.toBeVisible()
      await waitForToastsGone(page)
      await disableAnimations(page)
      await waitForFonts(page)
      await page.mouse.move(0, 0)
    })

    test('basic-info section with description at desktop viewport', async ({
      page
    }) => {
      const section = page.getByTestId('vocab-detail-basic-info')
      await expect(page.getByTestId('basic-info-description')).toBeVisible()
      await expect(section).toHaveScreenshot(
        'vocab-detail-basic-info-populated-desktop.png',
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
      await createAndNavigateToVocab(page, '語彙')
      await enableDarkMode(page)
      await disableAnimations(page)
      await waitForFonts(page)
      await page.mouse.move(0, 0)
      await expect(page.getByTestId('vocab-detail-headline')).toBeVisible()
      await expect(page).toHaveScreenshot(
        'vocab-detail-dark-mode-desktop.png',
        {
          fullPage: true,
          maxDiffPixels: 500,
          threshold: THRESHOLDS.page
        }
      )
    })
  })

  test.describe('error state', () => {
    test('shows error for non-existent vocabulary at desktop viewport', async ({
      page
    }) => {
      await page.setViewportSize(VIEWPORTS.desktop)
      await page.goto('/vocabulary/99999')
      await page.waitForLoadState('networkidle')
      await disableAnimations(page)
      await waitForFonts(page)
      await page.mouse.move(0, 0)
      await expect(page.getByText(/vocabulary with id/i)).toBeVisible()
      await expect(page).toHaveScreenshot(
        'vocab-detail-not-found-desktop.png',
        {
          fullPage: true,
          maxDiffPixels: 500,
          threshold: THRESHOLDS.page
        }
      )
    })
  })
})
