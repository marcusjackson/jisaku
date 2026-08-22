/**
 * Visual Regression Tests — Settings Page
 *
 * Covers:
 * - Full-page layout at desktop viewport (Req 9.1, 11.1, 10.2, 10.3)
 * - Full-page layout at mobile viewport (Req 9.2, 11.2, 10.2, 10.3)
 * - Full-page layout at tablet viewport (Req 9.3, 11.3)
 * - Dark-mode full-page screenshot at desktop viewport (Req 9.4, 10.2, 10.3)
 * - Appearance section element at desktop viewport (Req 9.5)
 * - Database section element at desktop viewport (Req 9.6)
 * - Classification types section with populated types (Req 9.7)
 */

import { expect, test } from '@playwright/test'

import {
  disableAnimations,
  THRESHOLDS,
  VIEWPORTS,
  waitForFonts
} from './vrt-helpers'

test.describe('Settings VRT', () => {
  test.describe('page layout', () => {
    test('full-page at desktop viewport', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop)
      await page.goto('/settings')
      await disableAnimations(page)
      await waitForFonts(page)
      await page.mouse.move(0, 0)
      await expect(
        page.getByRole('heading', { level: 1, name: /settings/i })
      ).toBeVisible()
      await expect(page).toHaveScreenshot('settings-desktop.png', {
        fullPage: true,
        maxDiffPixels: 500,
        threshold: THRESHOLDS.page,
        mask: [page.getByText(/\d+\.\d+\.\d+/)]
      })
    })

    test('full-page at mobile viewport', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.mobile)
      await page.goto('/settings')
      await disableAnimations(page)
      await waitForFonts(page)
      await page.mouse.move(0, 0)
      await expect(
        page.getByRole('heading', { level: 1, name: /settings/i })
      ).toBeVisible()
      await expect(page).toHaveScreenshot('settings-mobile.png', {
        fullPage: true,
        maxDiffPixels: 500,
        threshold: THRESHOLDS.page,
        mask: [page.getByText(/\d+\.\d+\.\d+/)]
      })
    })

    test('full-page at tablet viewport', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.tablet)
      await page.goto('/settings')
      await disableAnimations(page)
      await waitForFonts(page)
      await page.mouse.move(0, 0)
      await expect(
        page.getByRole('heading', { level: 1, name: /settings/i })
      ).toBeVisible()
      await expect(page).toHaveScreenshot('settings-tablet.png', {
        fullPage: true,
        maxDiffPixels: 500,
        threshold: THRESHOLDS.page,
        mask: [page.getByText(/\d+\.\d+\.\d+/)]
      })
    })
  })

  test.describe('dark mode', () => {
    test('full-page dark mode at desktop viewport', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop)
      await page.goto('/settings')
      await disableAnimations(page)
      await waitForFonts(page)

      // Ensure dark mode is active — toggle if the page starts in light mode
      const htmlElement = page.locator('html')
      const initialTheme = await htmlElement.getAttribute('data-theme')
      if (initialTheme !== 'dark') {
        const themeSwitch = page
          .getByTestId('settings-appearance')
          .getByRole('switch')
        await themeSwitch.click()
        await expect(htmlElement).toHaveAttribute('data-theme', 'dark')
      }

      await page.mouse.move(0, 0)
      await expect(page).toHaveScreenshot('settings-dark-mode-desktop.png', {
        fullPage: true,
        maxDiffPixels: 500,
        threshold: THRESHOLDS.page,
        mask: [page.getByText(/\d+\.\d+\.\d+/)]
      })
    })
  })

  test.describe('element screenshots', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.desktop)
      await page.goto('/settings')
      await disableAnimations(page)
      await waitForFonts(page)
      await page.mouse.move(0, 0)
      await expect(
        page.getByRole('heading', { level: 1, name: /settings/i })
      ).toBeVisible()
    })

    test('appearance section at desktop viewport', async ({ page }) => {
      const appearanceSection = page.getByTestId('settings-appearance')
      await expect(appearanceSection).toBeVisible()
      await expect(appearanceSection).toHaveScreenshot(
        'settings-appearance-desktop.png',
        {
          maxDiffPixels: 50,
          threshold: THRESHOLDS.component,
          mask: [page.getByText(/\d+\.\d+\.\d+/)]
        }
      )
    })

    test('database section at desktop viewport', async ({ page }) => {
      const databaseSection = page.getByTestId('settings-database')
      await expect(databaseSection).toBeVisible()
      await expect(databaseSection).toHaveScreenshot(
        'settings-database-desktop.png',
        {
          maxDiffPixels: 50,
          threshold: THRESHOLDS.component
        }
      )
    })
  })

  test.describe('populated state', () => {
    test('classification types section with a type at desktop viewport', async ({
      page
    }) => {
      await page.setViewportSize(VIEWPORTS.desktop)
      await page.goto('/settings')
      await disableAnimations(page)
      await waitForFonts(page)
      // Expand the classification types section
      const classificationSection = page.getByTestId(
        'settings-classification-types'
      )
      await classificationSection
        .getByRole('button', { name: /classification types/i })
        .click()
      await expect(
        classificationSection.getByRole('button', {
          name: /add classification type/i
        })
      ).toBeVisible()
      // Add a classification type
      await classificationSection
        .getByRole('button', { name: /add classification type/i })
        .click()
      const dialog = page.getByRole('dialog')
      await expect(dialog).toBeVisible()
      await dialog
        .getByRole('textbox', { name: /type name/i })
        .fill('vrt_test_type')
      await dialog.getByRole('button', { name: /^create$/i }).click()
      await expect(dialog).not.toBeVisible()
      await expect(
        classificationSection.getByText('vrt_test_type')
      ).toBeVisible()
      await page.mouse.move(0, 0)
      await expect(classificationSection).toHaveScreenshot(
        'settings-classification-types-populated-desktop.png',
        {
          maxDiffPixels: 50,
          threshold: THRESHOLDS.component
        }
      )
    })
  })
})
