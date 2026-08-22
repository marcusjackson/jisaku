/**
 * Visual Regression Tests — Component Detail Page
 *
 * Covers:
 * - Viewport layout at desktop breakpoint (Req 6.1, 11.1)
 * - Viewport layout at mobile breakpoint (Req 6.2, 11.2)
 * - Viewport layout at tablet breakpoint (Req 6.3, 11.3)
 * - Component headline section element at desktop viewport (Req 6.4)
 * - Basic-info edit dialog element at desktop viewport (Req 6.5)
 * - Populated basic-info section element at desktop viewport (Req 6.6)
 * - Expanded forms section element at desktop viewport (Req 6.7)
 * - Dark mode full-page at desktop viewport (Req 6.8, 10.2)
 * - Not-found error state at desktop viewport (Req 6.9)
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
 * Creates a component via the UI and navigates to its detail page.
 * Modelled after `createAndNavigateToComponent` in component-detail.test.ts.
 */
async function createAndNavigateToComponent(
  page: Page,
  character: string
): Promise<void> {
  await page.goto('/components')
  await expect(
    page.getByRole('heading', { name: /component list/i })
  ).toBeVisible()
  await page.getByRole('button', { name: /^add new$/i }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('textbox', { name: /character/i }).fill(character)
  await page.getByRole('button', { name: /^add$/i }).click()
  await expect(page.getByRole('dialog')).not.toBeVisible()
  const componentCard = page
    .getByTestId('component-list-card')
    .filter({ hasText: character })
  await componentCard.click()
  await page.waitForURL(/\/components\/\d+$/)
  await page.waitForLoadState('networkidle')
  await waitForToastsGone(page)
  // Blur any focused element to prevent focus rings in screenshots
  await page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null
    el?.blur()
  })
}

test.describe('Component Detail VRT', () => {
  test.describe('viewport layout', () => {
    test('viewport at desktop breakpoint', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop)
      await createAndNavigateToComponent(page, '氵')
      await disableAnimations(page)
      await waitForFonts(page)
      await page.mouse.move(0, 0)
      await expect(page.getByTestId('component-detail-headline')).toBeVisible()
      await expect(page).toHaveScreenshot('component-detail-desktop.png', {
        fullPage: true,
        maxDiffPixels: 500,
        threshold: THRESHOLDS.page
      })
    })

    test('viewport at mobile breakpoint', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.mobile)
      await createAndNavigateToComponent(page, '氵')
      await disableAnimations(page)
      await waitForFonts(page)
      await page.mouse.move(0, 0)
      await expect(page.getByTestId('component-detail-headline')).toBeVisible()
      await expect(page).toHaveScreenshot('component-detail-mobile.png', {
        fullPage: true,
        maxDiffPixels: 500,
        threshold: THRESHOLDS.page
      })
    })

    test('viewport at tablet breakpoint', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.tablet)
      await createAndNavigateToComponent(page, '氵')
      await disableAnimations(page)
      await waitForFonts(page)
      await page.mouse.move(0, 0)
      await expect(page.getByTestId('component-detail-headline')).toBeVisible()
      await expect(page).toHaveScreenshot('component-detail-tablet.png', {
        fullPage: true,
        maxDiffPixels: 500,
        threshold: THRESHOLDS.page
      })
    })
  })

  test.describe('element screenshots', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop)
      await createAndNavigateToComponent(page, '亻')
      await disableAnimations(page)
      await waitForFonts(page)
      await page.mouse.move(0, 0)
      await expect(page.getByTestId('component-detail-headline')).toBeVisible()
    })

    test('component headline section at desktop viewport', async ({ page }) => {
      // Disable pointer events so link/button hover states don't affect the screenshot.
      // Then trigger a mouse move to ensure the browser re-evaluates pointer targets.
      await page.addStyleTag({
        content: '* { pointer-events: none !important; }'
      })
      await page.mouse.move(1, 1)
      const headline = page.getByTestId('component-detail-headline')
      await expect(headline).toHaveScreenshot(
        'component-detail-headline-desktop.png',
        {
          // Use looser per-pixel threshold (0.1) because the component character
          // and text undergo macOS sub-pixel anti-aliasing between runs.
          // maxDiffPixelRatio: 0.05 still catches real layout/content regressions.
          maxDiffPixelRatio: 0.05,
          threshold: 0.1
        }
      )
    })

    test('basic-info edit dialog at desktop viewport', async ({ page }) => {
      await page
        .getByTestId('component-detail-basic-info')
        .getByTestId('basic-info-edit-button')
        .click()
      await expect(page.getByRole('dialog')).toBeVisible()
      await disableAnimations(page)
      await page.mouse.move(0, 0)
      const dialog = page.getByRole('dialog')
      await expect(dialog).toHaveScreenshot(
        'component-detail-basic-info-dialog-desktop.png',
        {
          maxDiffPixels: 50,
          threshold: THRESHOLDS.component
        }
      )
    })

    test('forms section expanded at desktop viewport', async ({ page }) => {
      // Expand the forms section (closed by default when no forms exist)
      const formsSection = page.getByTestId('component-detail-forms')
      await formsSection.getByRole('button').first().click()
      await expect(formsSection).toBeVisible()
      await page.mouse.move(0, 0)
      await expect(formsSection).toHaveScreenshot(
        'component-detail-forms-expanded-desktop.png',
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
      await createAndNavigateToComponent(page, '木')
      // Populate basic-info via edit dialog
      await page
        .getByTestId('component-detail-basic-info')
        .getByTestId('basic-info-edit-button')
        .click()
      await expect(page.getByRole('dialog')).toBeVisible()
      await page.getByLabel(/stroke count/i).fill('4')
      await page.getByRole('button', { name: /save/i }).click()
      await expect(page.getByRole('dialog')).not.toBeVisible()
      await waitForToastsGone(page)
      await disableAnimations(page)
      await waitForFonts(page)
      await page.mouse.move(0, 0)
    })

    test('basic-info section with stroke count at desktop viewport', async ({
      page
    }) => {
      const section = page.getByTestId('component-detail-basic-info')
      await expect(page.getByTestId('basic-info-stroke-count')).toBeVisible()
      await expect(section).toHaveScreenshot(
        'component-detail-basic-info-populated-desktop.png',
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
      await createAndNavigateToComponent(page, '土')
      await enableDarkMode(page)
      await disableAnimations(page)
      await waitForFonts(page)
      await page.mouse.move(0, 0)
      await expect(page.getByTestId('component-detail-headline')).toBeVisible()
      await expect(page).toHaveScreenshot(
        'component-detail-dark-mode-desktop.png',
        {
          fullPage: true,
          maxDiffPixels: 500,
          threshold: THRESHOLDS.page
        }
      )
    })
  })

  test.describe('error state', () => {
    test('shows error for non-existent component at desktop viewport', async ({
      page
    }) => {
      await page.setViewportSize(VIEWPORTS.desktop)
      await page.goto('/components/99999')
      await page.waitForLoadState('networkidle')
      await disableAnimations(page)
      await waitForFonts(page)
      await page.mouse.move(0, 0)
      await expect(page.getByText(/component with id/i)).toBeVisible()
      await expect(page).toHaveScreenshot(
        'component-detail-not-found-desktop.png',
        {
          fullPage: true,
          maxDiffPixels: 500,
          threshold: THRESHOLDS.page
        }
      )
    })
  })
})
