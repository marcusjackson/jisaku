/**
 * E2E tests for Kanji CRUD operations
 */

import { expect, test } from '@playwright/test'

test.describe('Kanji CRUD Flow', () => {
  test('complete CRUD flow: create, view, edit, delete', async ({ page }) => {
    // Navigate to home page
    await page.goto('/')

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
    await expect(page).toHaveURL('/kanji/new')
    await expect(
      page.getByRole('heading', { name: /new kanji/i })
    ).toBeVisible()

    // Fill in form fields
    await page.getByLabel(/character/i).fill('水')
    await page.getByLabel(/stroke count/i).fill('4')

    // Select JLPT level
    await page.getByRole('combobox', { name: /jlpt/i }).click()
    await page.getByRole('option', { name: /n5/i }).click()

    // Select Joyo level
    await page.getByRole('combobox', { name: /jōyō/i }).click()
    await page.getByRole('option', { name: /grade 1/i }).click()

    // Add notes
    await page
      .getByLabel(/etymology/i)
      .fill('Water. Pictograph of flowing water.')

    // Submit form
    await page.getByRole('button', { name: /create kanji/i }).click()

    // Should navigate to detail page
    await expect(page).toHaveURL(/\/kanji\/\d+/)

    // Wait for toast then check content
    await page.waitForTimeout(3500)

    // =========================================================================
    // VIEW: Verify detail page shows correct data
    // =========================================================================

    // Check character is displayed prominently
    await expect(page.locator('.kanji-detail-header-character')).toContainText(
      '水'
    )

    // Check metadata badges
    await expect(page.getByText(/4 strokes/i)).toBeVisible()
    await expect(page.locator('.kanji-detail-badges')).toContainText(/n5/i)

    // Check notes are displayed
    await expect(page.getByText(/flowing water/i)).toBeVisible()

    // =========================================================================
    // EDIT: Modify the kanji
    // =========================================================================

    // Click edit button
    await page.getByRole('link', { name: /edit/i }).click()

    // Should navigate to edit page
    await expect(page).toHaveURL(/\/kanji\/\d+\/edit/)
    await expect(
      page.getByRole('heading', { name: /edit kanji/i })
    ).toBeVisible()

    // Wait for form to populate
    await page.waitForTimeout(500)

    // Update notes
    const notesField = page.getByLabel(/etymology/i)
    await notesField.clear()
    await notesField.fill(
      'Water. One of the most basic elements. Pictograph of flowing water.'
    )

    // Save changes
    await page.getByRole('button', { name: /save changes/i }).click()

    // Should navigate back to detail page
    await expect(page).toHaveURL(/\/kanji\/\d+$/)

    // Wait for toast
    await page.waitForTimeout(3500)

    // Verify updated notes
    await expect(
      page.getByText(/one of the most basic elements/i)
    ).toBeVisible()

    // =========================================================================
    // DELETE: Remove the kanji
    // =========================================================================

    // Click delete button
    await page.getByRole('button', { name: /delete/i }).click()

    // Confirm deletion in dialog
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByRole('button', { name: /delete$/i }).click()

    // Should navigate back to list
    await expect(page).toHaveURL('/')

    // Wait for toast
    await page.waitForTimeout(3500)

    // Should show empty state again
    await expect(page.getByText(/no kanji yet/i)).toBeVisible()
  })

  test('form validation prevents invalid submissions', async ({ page }) => {
    await page.goto('/kanji/new')

    // Wait for form to be ready
    await expect(
      page.getByRole('heading', { name: /new kanji/i })
    ).toBeVisible()

    // Submit empty form by clicking submit button
    await page.getByRole('button', { name: /create kanji/i }).click()

    // The form should stay on the same page since validation failed
    await expect(page).toHaveURL('/kanji/new')

    // The form should still be visible (didn't navigate away)
    await expect(
      page.getByRole('button', { name: /create kanji/i })
    ).toBeVisible()
  })

  test('cancel button returns to previous page', async ({ page }) => {
    await page.goto('/')
    await page
      .getByRole('button', { name: /add.*kanji/i })
      .first()
      .click()

    // Click cancel
    await page.getByRole('button', { name: /cancel/i }).click()

    // Should go back to home
    await expect(page).toHaveURL('/')
  })

  test('back link navigates correctly', async ({ page }) => {
    await page.goto('/kanji/new')

    // Click back link
    await page.getByRole('link', { name: /back/i }).click()

    // Should navigate to home
    await expect(page).toHaveURL('/')
  })
})
