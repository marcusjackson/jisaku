/**
 * E2E tests for Component CRUD operations
 *
 * Tests inline editing pattern: Create → View → Edit inline → Delete
 * No separate edit page exists; editing happens on the detail page.
 */

import { expect, test } from '@playwright/test'

test.describe('Component CRUD Flow', () => {
  test('create component and view detail page', async ({ page }) => {
    // Navigate to components page
    await page.goto('/components')

    // Wait for page to load
    await expect(
      page.getByRole('heading', { name: /components/i })
    ).toBeVisible()

    // Click "Add Component" button
    await page
      .getByRole('button', { name: /add.*component/i })
      .first()
      .click()

    // Should navigate to new component form
    await expect(page).toHaveURL('/components/new')
    await expect(
      page.getByRole('heading', { name: /new component/i })
    ).toBeVisible()

    // Fill in minimal form fields (character and short meaning only in create mode)
    await page.getByLabel(/character/i).fill('亻')
    await page.getByLabel(/short meaning/i).fill('person')
    await page.getByLabel(/search keywords/i).fill('にんべん')

    // Submit form
    await page.getByRole('button', { name: /create component/i }).click()

    // Should navigate to detail page
    await expect(page).toHaveURL(/\/components\/\d+/)

    // Check character is displayed prominently
    await expect(
      page.locator('.component-detail-header-character')
    ).toContainText('亻')

    // Check short meaning is visible in header
    await expect(page.locator('.component-detail-header')).toContainText(
      'person'
    )

    // Check stroke count shows "—" since we didn't set it in create mode
    await expect(page.getByText('—').first()).toBeVisible()
  })

  test('header edit dialog works correctly', async ({ page }) => {
    // Navigate to components page
    await page.goto('/components')

    // Click "Add Component" button
    await page
      .getByRole('button', { name: /add.*component/i })
      .first()
      .click()

    // Wait longer for page to load (if you don't, the character input may not be loaded to be filled)
    await page.waitForTimeout(300)

    // Fill in form and submit
    await page.getByLabel(/character/i).fill('氵')
    await page.getByLabel(/short meaning/i).fill('water')

    await page.getByRole('button', { name: /create component/i }).click()

    // Should navigate to detail page
    await expect(page).toHaveURL(/\/components\/\d+/)

    // Click edit button to open header edit dialog
    await page.getByRole('button', { name: /edit/i }).first().click()

    // Wait for dialog to open
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(
      page.getByRole('heading', { name: /edit header/i })
    ).toBeVisible()

    // Update short meaning
    const shortMeaningInput = page
      .locator('input[name="shortMeaning"]')
      .or(page.getByLabel(/short meaning/i))
    await shortMeaningInput.clear()
    await shortMeaningInput.fill('water radical')

    // Save changes
    await page.getByRole('button', { name: /save/i }).click()

    // Dialog should close
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Verify short meaning was updated in header
    await expect(page.locator('.component-detail-header')).toContainText(
      'water radical'
    )
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

    // Navigate back to kanji list
    await page.getByRole('link', { name: /kanji/i }).click()
    await expect(page).toHaveURL('/kanji')
  })

  test('no edit page route exists', async ({ page }) => {
    // Try to navigate to a non-existent edit route
    await page.goto('/components/1/edit')

    // Should show 404 or redirect
    // The app uses a catch-all route that shows NotFoundPage
    await expect(page).toHaveURL('/components/1/edit')
    await expect(page.getByText(/not found/i)).toBeVisible()
  })
})
