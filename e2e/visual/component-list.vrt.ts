/**
 * Visual Regression Tests — Component List Page
 *
 * Covers:
 * - Empty-state layout at desktop viewport (Req 5.1, 11.1)
 * - Empty-state layout at mobile viewport (Req 5.2, 11.2)
 * - ComponentListCard element at desktop viewport (Req 5.3)
 * - Filter panel element at desktop viewport (Req 5.4)
 * - Full-page layout at tablet viewport with entries (Req 5.5)
 * - Dark mode full-page at desktop viewport (Req 5.6, 10.2)
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
 * Creates a component via the UI and stays on the component list page.
 * Modelled after the kanji-list VRT helper.
 */
async function createComponent(page: Page, character: string): Promise<void> {
  await page.goto('/components')
  await expect(
    page.getByRole('heading', { name: /component list/i })
  ).toBeVisible()
  await page.getByRole('button', { name: /^add new$/i }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('textbox', { name: /character/i }).fill(character)
  await page.getByRole('button', { name: /^add$/i }).click()
  await expect(page.getByRole('dialog')).not.toBeVisible()
  await page.waitForURL('/components')
  await waitForToastsGone(page)
}

test.describe('Component List VRT', () => {
  test.describe('empty state', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop)
      await page.goto('/components')
      await disableAnimations(page)
      await waitForFonts(page)
      await page.mouse.move(0, 0)
      await expect(page.getByText(/no components yet/i)).toBeVisible()
    })

    test('full-page at desktop viewport', async ({ page }) => {
      await expect(page).toHaveScreenshot('component-list-empty-desktop.png', {
        fullPage: true,
        maxDiffPixels: 500,
        threshold: THRESHOLDS.page
      })
    })

    test('full-page at mobile viewport', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.mobile)
      await page.goto('/components')
      await disableAnimations(page)
      await waitForFonts(page)
      await page.mouse.move(0, 0)
      await expect(page.getByText(/no components yet/i)).toBeVisible()
      await expect(page).toHaveScreenshot('component-list-empty-mobile.png', {
        fullPage: true,
        maxDiffPixels: 500,
        threshold: THRESHOLDS.page
      })
    })
  })

  test.describe('with component entries', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop)
      await createComponent(page, '亻')
      await disableAnimations(page)
      await waitForFonts(page)
      await page.mouse.move(0, 0)
      await expect(
        page.getByTestId('component-list-card').first()
      ).toBeVisible()
    })

    test('ComponentListCard element at desktop viewport', async ({ page }) => {
      const card = page.getByTestId('component-list-card').first()
      await expect(card).toHaveScreenshot('component-list-card-desktop.png', {
        maxDiffPixels: 50,
        threshold: THRESHOLDS.component
      })
    })

    test('filters section at desktop viewport', async ({ page }) => {
      const filtersToggle = page.getByTestId('component-list-filters-toggle')
      const isExpanded = await filtersToggle.getAttribute('aria-expanded')
      if (isExpanded !== 'true') {
        await filtersToggle.click()
      }
      await expect(page.getByTestId('component-list-filters')).toBeVisible()
      const filters = page.getByTestId('component-list-filters')
      await expect(filters).toHaveScreenshot(
        'component-list-filters-desktop.png',
        {
          maxDiffPixels: 50,
          threshold: THRESHOLDS.component
        }
      )
    })

    test('full-page at tablet viewport', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.tablet)
      await page.goto('/components')
      await disableAnimations(page)
      await waitForFonts(page)
      await page.mouse.move(0, 0)
      await expect(
        page.getByTestId('component-list-card').first()
      ).toBeVisible()
      await expect(page).toHaveScreenshot('component-list-tablet.png', {
        fullPage: true,
        maxDiffPixels: 500,
        threshold: THRESHOLDS.page
      })
    })
  })

  test.describe('dark mode', () => {
    test('full-page dark mode at desktop viewport', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop)
      await createComponent(page, '当')
      await enableDarkMode(page)
      await disableAnimations(page)
      await waitForFonts(page)
      await page.mouse.move(0, 0)
      await expect(
        page.getByTestId('component-list-card').first()
      ).toBeVisible()
      await expect(page).toHaveScreenshot(
        'component-list-dark-mode-desktop.png',
        {
          fullPage: true,
          maxDiffPixels: 500,
          threshold: THRESHOLDS.page
        }
      )
    })
  })
})
