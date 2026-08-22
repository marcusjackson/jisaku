/**
 * E2E Tests for Component Detail Forms Section
 */

import { expect, test } from '@playwright/test'

import { createAndNavigateToComponent, expectToast } from './helpers/test-utils'

test.describe('Component Detail Forms', () => {
  test('displays forms section', async ({ page }) => {
    await createAndNavigateToComponent(page, '氵')
    await expect(page.getByTestId('component-detail-forms')).toBeVisible()
  })
  test('shows empty state when no forms', async ({ page }) => {
    await createAndNavigateToComponent(page, '日')
    // Expand forms section
    const section = page.getByTestId('component-detail-forms')
    if ((await section.getAttribute('data-state')) === 'closed') {
      await page.getByRole('heading', { name: /forms/i }).click()
    }
    await expect(page.getByText(/no forms added yet/i)).toBeVisible()
  })

  test('adds a new form via dialog', async ({ page }) => {
    await createAndNavigateToComponent(page, '水')
    // Expand forms section
    const section = page.getByTestId('component-detail-forms')
    if ((await section.getAttribute('data-state')) === 'closed') {
      await page.getByRole('heading', { name: /forms/i }).click()
    }
    // Click Add button
    await page.getByRole('button', { name: /^add$/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    // Fill form fields
    await page.getByLabel(/character/i).fill('氵')
    await page.getByLabel(/form name/i).fill('water radical')
    await page.getByLabel(/stroke count/i).fill('3')
    await page.getByLabel(/usage notes/i).fill('Used in water kanji')
    // Submit
    await page.getByRole('button', { name: /save/i }).click()
    // Verify dialog closes
    await expect(page.getByRole('dialog')).not.toBeVisible()
    // Verify toast
    await expectToast(page, 'Form added')
    // Verify form appears in list
    await expect(page.getByText('氵')).toBeVisible()
    await expect(page.getByText('water radical')).toBeVisible()
  })

  test('edits an existing form via dialog', async ({ page }) => {
    await createAndNavigateToComponent(page, '金')
    // First add a form
    const section = page.getByTestId('component-detail-forms')
    if ((await section.getAttribute('data-state')) === 'closed') {
      await page.getByRole('heading', { name: /forms/i }).click()
    }
    await page.getByRole('button', { name: /^add$/i }).click()
    await page.getByLabel(/character/i).fill('釒')
    await page.getByLabel(/form name/i).fill('metal radical')
    await page.getByRole('button', { name: /save/i }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Now edit it - scope to the form item
    await page
      .getByTestId(/form-item/)
      .getByRole('button', { name: /edit/i })
      .click()
    await expect(page.getByRole('dialog')).toBeVisible()
    // Character should be disabled
    await expect(page.getByLabel(/character/i)).toBeDisabled()
    // Update form name
    await page.getByLabel(/form name/i).fill('gold radical')
    await page.getByRole('button', { name: /save/i }).click()
    // Verify toast
    await expectToast(page, 'Form updated')
    // Verify updated name
    await expect(page.getByText('gold radical')).toBeVisible()
  })

  test('deletes a form with destructive mode and confirmation', async ({
    page
  }) => {
    await createAndNavigateToComponent(page, '土')
    // Add a form first
    const section = page.getByTestId('component-detail-forms')
    if ((await section.getAttribute('data-state')) === 'closed') {
      await page.getByRole('heading', { name: /forms/i }).click()
    }
    await page.getByRole('button', { name: /^add$/i }).click()
    await page.getByLabel(/character/i).fill('圡')
    await page.getByRole('button', { name: /save/i }).click()
    await expect(page.getByText('圡')).toBeVisible()

    // Delete button should not be visible without destructive mode
    await expect(
      page.getByTestId(/form-item/).getByRole('button', { name: /delete/i })
    ).not.toBeVisible()

    // Enable destructive mode
    await page.getByRole('switch', { name: /destructive mode/i }).click()

    // Now delete button should be visible
    await page
      .getByTestId(/form-item/)
      .getByRole('button', { name: /delete/i })
      .click()

    // Confirmation dialog should appear
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByText(/are you sure/i)).toBeVisible()

    // Confirm delete
    await page
      .getByRole('dialog')
      .getByRole('button', { name: /delete/i })
      .click()

    // Verify toast
    await expectToast(page, 'Form deleted')
    // Form should be gone
    await expect(page.getByText('圡')).not.toBeVisible()
  })

  test('reorders forms with arrow buttons', async ({ page }) => {
    await createAndNavigateToComponent(page, '月')
    // Add two forms
    const section = page.getByTestId('component-detail-forms')
    if ((await section.getAttribute('data-state')) === 'closed') {
      await page.getByRole('heading', { name: /forms/i }).click()
    }
    // Add first form
    await page.getByRole('button', { name: /^add$/i }).click()
    await page.getByLabel(/character/i).fill('⺝')
    await page.getByLabel(/form name/i).fill('first form')
    await page.getByRole('button', { name: /save/i }).click()
    // Add second form
    await page.getByRole('button', { name: /^add$/i }).click()
    await page.getByLabel(/character/i).fill('⺜')
    await page.getByLabel(/form name/i).fill('second form')
    await page.getByRole('button', { name: /save/i }).click()

    // Verify order - first should have disabled up, second should have disabled down
    const firstItem = page.getByTestId(/form-item/).first()
    const secondItem = page.getByTestId(/form-item/).last()

    await expect(
      firstItem.getByRole('button', { name: /move up/i })
    ).toBeDisabled()
    await expect(
      secondItem.getByRole('button', { name: /move down/i })
    ).toBeDisabled()

    // Move second item up
    await secondItem.getByRole('button', { name: /move up/i }).click()

    // Now the order should be swapped - second form is now first
    await expect(page.getByTestId(/form-item/).first()).toContainText(
      'second form'
    )
  })

  test('forms persist after page reload', async ({ page }) => {
    const url = await createAndNavigateToComponent(page, '石')
    // Add a form
    const section = page.getByTestId('component-detail-forms')
    if ((await section.getAttribute('data-state')) === 'closed') {
      await page.getByRole('heading', { name: /forms/i }).click()
    }
    await page.getByRole('button', { name: /^add$/i }).click()
    await page.getByLabel(/character/i).fill('石')
    await page.getByLabel(/form name/i).fill('stone form')
    await page.getByRole('button', { name: /save/i }).click()
    await expect(page.getByText('stone form')).toBeVisible()

    // Reload page
    await page.goto(url)
    await expect(page.getByTestId('component-detail-forms')).toBeVisible()
    // Verify form is still there
    await expect(page.getByText('stone form')).toBeVisible()
  })

  test('Escape key closes the add form dialog', async ({ page }) => {
    await createAndNavigateToComponent(page, '手')

    // Expand forms section
    const section = page.getByTestId('component-detail-forms')
    if ((await section.getAttribute('data-state')) === 'closed') {
      await page.getByRole('heading', { name: /forms/i }).click()
    }

    // Open add dialog
    await page.getByRole('button', { name: /^add$/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()

    // Press Escape — dialog should close without saving
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toBeHidden()
  })
})
