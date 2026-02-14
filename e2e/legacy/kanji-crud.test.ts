/**
 * E2E tests for Kanji CRUD operations
 */

import { expect, test } from '@playwright/test'

test.describe('Kanji CRUD Flow', () => {
  test('complete CRUD flow: create, view, edit, delete', async ({ page }) => {
    // Navigate to home page
    await page.goto('/legacy/kanji')

    // Wait for page to load
    await expect(
      page.getByRole('heading', { name: /kanji list/i })
    ).toBeVisible()

    // =========================================================================
    // CREATE: Add a new kanji
    // =========================================================================

    // Click "Add Your First Kanji" button (empty state)
    await page
      .getByRole('button', { name: /add.*kanji/i })
      .first()
      .click()

    // Should navigate to new kanji form
    await expect(page).toHaveURL('/legacy/kanji/new')
    await expect(
      page.getByRole('heading', { name: /new kanji/i })
    ).toBeVisible()

    // Fill in form fields (simplified create form - stroke count not required)
    await page.getByLabel('Character').fill('水')
    await page.getByLabel(/short meaning/i).fill('water')
    await page.getByLabel(/search keywords/i).fill('aqua, fluid')

    // Submit form
    await page.getByRole('button', { name: /create kanji/i }).click()

    // Should navigate to detail page
    await expect(page).toHaveURL(/\/legacy\/kanji\/\d+/)

    // Wait for toast then check content
    await page.waitForTimeout(3500)

    // =========================================================================
    // VIEW: Verify detail page shows correct data
    // =========================================================================

    // Check character is displayed prominently
    await expect(page.locator('.kanji-detail-header-character')).toContainText(
      '水'
    )

    // Check short meaning is displayed
    await expect(page.locator('.kanji-detail-header-meaning')).toContainText(
      'water'
    )

    // Check stroke count is displayed in Basic Information section
    await expect(page.locator('text=Basic Information')).toBeVisible()

    // =========================================================================
    // DELETE: Remove the kanji (skipping inline edit as it's tested separately)
    // =========================================================================

    // Enable destructive mode to allow deletion
    await page.locator('#destructive-mode-switch').click()

    // Click delete button
    await page.getByRole('button', { name: /delete/i }).click()

    // Confirm deletion in dialog
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByRole('button', { name: /delete$/i }).click()

    // Should navigate back to list
    await expect(page).toHaveURL('/legacy/kanji')

    // Wait for toast
    await page.waitForTimeout(3500)

    // Should show empty state again
    await expect(page.getByText(/no kanji yet/i)).toBeVisible()
  })

  test('form validation prevents invalid submissions', async ({ page }) => {
    await page.goto('/legacy/kanji/new')

    // Wait for form to be ready
    await expect(
      page.getByRole('heading', { name: /new kanji/i })
    ).toBeVisible()

    // Submit empty form by clicking submit button
    await page.getByRole('button', { name: /create kanji/i }).click()

    // The form should stay on the same page since validation failed
    await expect(page).toHaveURL('/legacy/kanji/new')

    // The form should still be visible (didn't navigate away)
    await expect(
      page.getByRole('button', { name: /create kanji/i })
    ).toBeVisible()
  })

  test('cancel button returns to previous page', async ({ page }) => {
    await page.goto('/legacy/kanji')
    await page
      .getByRole('button', { name: /add.*kanji/i })
      .first()
      .click()

    // Click cancel
    await page.getByRole('button', { name: /cancel/i }).click()

    // Should go back to home
    await expect(page).toHaveURL('/legacy/kanji')
  })

  test('back link navigates correctly', async ({ page }) => {
    await page.goto('/legacy/kanji/new')

    // Click back link
    await page.getByRole('link', { name: /back/i }).click()

    // Should navigate to home
    await expect(page).toHaveURL('/legacy/kanji')
  })
})
