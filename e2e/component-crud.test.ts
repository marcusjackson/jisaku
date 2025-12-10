/**
 * E2E tests for Component CRUD operations
 */

import { expect, test } from '@playwright/test'

test.describe('Component CRUD Flow', () => {
  test('complete CRUD flow: create, view, edit, delete', async ({ page }) => {
    // Navigate to components page
    await page.goto('/components')

    // Wait for page to load
    await expect(
      page.getByRole('heading', { name: /components/i })
    ).toBeVisible()

    // =========================================================================
    // CREATE: Add a new component
    // =========================================================================

    // Click "Add Component" button (empty state)
    await page
      .getByRole('button', { name: /add.*component/i })
      .first()
      .click()

    // Should navigate to new component form
    await expect(page).toHaveURL('/components/new')
    await expect(
      page.getByRole('heading', { name: /new component/i })
    ).toBeVisible()

    // Fill in form fields
    await page.getByLabel(/character/i).fill('亻')
    await page.getByLabel(/stroke count/i).fill('2')
    await page.getByLabel(/japanese name/i).fill('にんべん')
    await page.getByLabel('Description').fill('Person/human radical.')

    // Submit form
    await page.getByRole('button', { name: /create component/i }).click()

    // Should navigate to detail page
    await expect(page).toHaveURL(/\/components\/\d+/)

    // Wait for toast
    await page.waitForTimeout(3500)

    // =========================================================================
    // VIEW: Verify detail page shows correct data
    // =========================================================================

    // Check character is displayed prominently
    await expect(
      page.locator('.component-detail-header-character')
    ).toContainText('亻')

    // Check metadata
    await expect(page.getByText(/2 strokes/i)).toBeVisible()
    await expect(page.getByText(/にんべん/i)).toBeVisible()

    // Check description is displayed
    await expect(page.getByText('Person/human radical.').first()).toBeVisible()

    // =========================================================================
    // EDIT: Modify the component
    // =========================================================================

    // Click edit button
    await page.getByRole('link', { name: /edit/i }).click()

    // Should navigate to edit page
    await expect(page).toHaveURL(/\/components\/\d+\/edit/)
    await expect(
      page.getByRole('heading', { name: /edit component/i })
    ).toBeVisible()

    // Wait for form to populate
    await page.waitForTimeout(500)

    // Update description
    const descriptionField = page.getByLabel('Description')
    await descriptionField.clear()
    await descriptionField.fill(
      'Person/human radical. Derived from the kanji 人 (person).'
    )

    // Save changes
    await page.getByRole('button', { name: /save changes/i }).click()

    // Should navigate back to detail page
    await expect(page).toHaveURL(/\/components\/\d+$/)

    // Wait for toast
    await page.waitForTimeout(3500)

    // Verify updated description
    await expect(
      page.getByText(/derived from the kanji/i).first()
    ).toBeVisible()

    // =========================================================================
    // DELETE: Remove the component
    // =========================================================================

    // Click delete button
    await page.getByRole('button', { name: /delete/i }).click()

    // Confirm deletion in dialog
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByRole('button', { name: /delete$/i }).click()

    // Should navigate back to list
    await expect(page).toHaveURL('/components')

    // Wait for toast
    await page.waitForTimeout(3500)

    // Should show empty state again
    await expect(page.getByText(/no components yet/i)).toBeVisible()
  })

  test('form validation prevents invalid submissions', async ({ page }) => {
    await page.goto('/components/new')

    // Wait for form to be ready
    await expect(
      page.getByRole('heading', { name: /new component/i })
    ).toBeVisible()

    // Submit empty form by clicking submit button
    await page.getByRole('button', { name: /create component/i }).click()

    // The form should stay on the same page since validation failed
    await expect(page).toHaveURL('/components/new')

    // The form should still be visible (didn't navigate away)
    await expect(
      page.getByRole('button', { name: /create component/i })
    ).toBeVisible()
  })

  test('cancel button returns to components list', async ({ page }) => {
    await page.goto('/components')
    await page
      .getByRole('button', { name: /add.*component/i })
      .first()
      .click()

    // Click cancel
    await page.getByRole('button', { name: /cancel/i }).click()

    // Should go back to components list
    await expect(page).toHaveURL('/components')
  })

  test('back link navigates correctly', async ({ page }) => {
    await page.goto('/components/new')

    // Click back link
    await page.getByRole('link', { name: /back/i }).click()

    // Should navigate to components list
    await expect(page).toHaveURL('/components')
  })

  test('can navigate between components and kanji via header', async ({
    page
  }) => {
    await page.goto('/')

    // Navigate to components
    await page.getByRole('link', { name: /components/i }).click()
    await expect(page).toHaveURL('/components')

    // Navigate back to home
    await page.getByRole('link', { name: /home/i }).click()
    await expect(page).toHaveURL('/')
  })
})
