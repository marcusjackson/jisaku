/**
 * E2E tests for Kanji Components selection flow
 *
 * Tests the ability to select and manage components that make up a kanji.
 */

import { expect, test } from '@playwright/test'

test.describe('Kanji Components Selection', () => {
  test('can select components when creating a kanji', async ({ page }) => {
    // Track console errors
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    // First create a component so we have something to select
    await page.goto('/components/new')
    await expect(
      page.getByRole('heading', { name: /new component/i })
    ).toBeVisible()

    await page.getByLabel(/character/i).fill('日')
    await page.getByLabel(/stroke count/i).fill('4')
    await page.getByLabel(/short description/i).fill('sun')

    await page.getByRole('button', { name: /create component/i }).click()
    await expect(page).toHaveURL(/\/components\/\d+/)
    await page.waitForTimeout(500)

    // Navigate to new kanji form
    await page.goto('/kanji/new')
    await expect(
      page.getByRole('heading', { name: /new kanji/i })
    ).toBeVisible()

    // Fill required fields
    await page.getByLabel(/character/i).fill('明')
    await page.getByLabel(/stroke count/i).fill('8')

    // Scroll to components section and click toggle button to open dropdown
    const componentsFieldset = page.locator('fieldset', {
      has: page.getByText('Components', { exact: true })
    })
    await componentsFieldset.scrollIntoViewIfNeeded()

    // Find the toggle button within the components combobox section
    const componentSelector = componentsFieldset.locator(
      '.base-combobox-multi-trigger'
    )
    await componentSelector.click()
    await page.waitForTimeout(300)

    // Should show available component in dropdown (label format: "日 — sun")
    const optionText = page.getByText('日 — sun')
    await expect(optionText).toBeVisible({ timeout: 5000 })

    // Click to select the option
    await optionText.click()

    // Should show selected component as a chip
    const chipsContainer = page.locator('[data-testid="selected-chips"]')
    await expect(chipsContainer).toBeVisible()
    await expect(chipsContainer).toContainText('日')

    // Click outside to close any open dropdowns/popups
    await page.getByRole('heading', { name: /new kanji/i }).click()
    await page.waitForTimeout(200)

    // Submit form - use force click in case something is obscuring
    const submitButton = page.getByRole('button', { name: /create kanji/i })
    await expect(submitButton).toBeEnabled()
    await submitButton.click({ force: true })

    // Wait for potential error toasts and console errors
    await page.waitForTimeout(1000)

    // Should navigate to detail page (wait a bit for the operation to complete)
    await expect(page).toHaveURL(/\/kanji\/\d+$/, { timeout: 10000 })
    await page.waitForTimeout(500)

    // Verify component is shown on detail page
    await expect(
      page.getByRole('heading', { name: 'Components' })
    ).toBeVisible()
    await expect(
      page.locator('.kanji-detail-components-character')
    ).toContainText('日')
  })

  test('can modify components when editing a kanji', async ({ page }) => {
    // First create a component
    await page.goto('/components/new')
    await page.getByLabel(/character/i).fill('月')
    await page.getByLabel(/stroke count/i).fill('4')
    await page.getByLabel(/short description/i).fill('moon')
    await page.getByRole('button', { name: /create component/i }).click()
    await expect(page).toHaveURL(/\/components\/\d+/)
    await page.waitForTimeout(500)

    // Create a kanji without components
    await page.goto('/kanji/new')
    await page.getByLabel(/character/i).fill('朋')
    await page.getByLabel(/stroke count/i).fill('8')
    await page.getByRole('button', { name: /create kanji/i }).click()
    await expect(page).toHaveURL(/\/kanji\/\d+/)
    await page.waitForTimeout(500)

    // Go to edit page
    await page.getByRole('link', { name: /edit/i }).click()
    await expect(page).toHaveURL(/\/kanji\/\d+\/edit/)
    await page.waitForTimeout(500)

    // Scroll to components section and click toggle button
    const componentsFieldset = page.locator('fieldset', {
      has: page.getByText('Components', { exact: true })
    })
    await componentsFieldset.scrollIntoViewIfNeeded()
    await componentsFieldset.locator('.base-combobox-multi-trigger').click()
    await page.waitForTimeout(300)

    // Select the component
    await page.getByText('月 — moon').click()

    // Should show chip
    const chipsContainer = page.locator('[data-testid="selected-chips"]')
    await expect(chipsContainer).toBeVisible()
    await expect(chipsContainer).toContainText('月')

    // Click outside to close any open dropdowns
    await page.getByRole('heading', { name: /edit kanji/i }).click()
    await page.waitForTimeout(200)

    // Save changes
    await page.getByRole('button', { name: /save changes/i }).click()

    // Should navigate back to detail page
    await expect(page).toHaveURL(/\/kanji\/\d+$/, { timeout: 10000 })
    await page.waitForTimeout(500)

    // Verify component is now shown
    await expect(
      page.getByRole('heading', { name: 'Components' })
    ).toBeVisible()
    await expect(
      page.locator('.kanji-detail-components-character')
    ).toContainText('月')
  })

  test('can remove selected components via chip button', async ({ page }) => {
    // First create a component
    await page.goto('/components/new')
    await page.getByLabel(/character/i).fill('火')
    await page.getByLabel(/stroke count/i).fill('4')
    await page.getByLabel(/short description/i).fill('fire')
    await page.getByRole('button', { name: /create component/i }).click()
    await expect(page).toHaveURL(/\/components\/\d+/)
    await page.waitForTimeout(500)

    // Navigate to new kanji form
    await page.goto('/kanji/new')
    await page.getByLabel(/character/i).fill('炎')
    await page.getByLabel(/stroke count/i).fill('8')

    // Scroll to components section and click toggle button
    const componentsFieldset = page.locator('fieldset', {
      has: page.getByText('Components', { exact: true })
    })
    await componentsFieldset.scrollIntoViewIfNeeded()
    await componentsFieldset.locator('.base-combobox-multi-trigger').click()
    await page.waitForTimeout(300)
    await page.getByText('火 — fire').click()

    // Verify chip is shown
    const chipsContainer = page.locator('[data-testid="selected-chips"]')
    await expect(chipsContainer).toBeVisible()
    await expect(chipsContainer).toContainText('火')

    // Remove the component by clicking the chip button
    await page.locator('.base-combobox-multi-chip').first().click()

    // Chip container should no longer be visible (empty)
    await expect(chipsContainer).not.toBeVisible()
  })

  test('component links on detail page navigate to component detail', async ({
    page
  }) => {
    // Create a component
    await page.goto('/components/new')
    await page.getByLabel(/character/i).fill('水')
    await page.getByLabel(/stroke count/i).fill('4')
    await page.getByLabel(/short description/i).fill('water')
    await page.getByRole('button', { name: /create component/i }).click()
    await expect(page).toHaveURL(/\/components\/\d+/)
    await page.waitForTimeout(500)

    // Create a kanji with a component
    await page.goto('/kanji/new')
    await page.getByLabel(/character/i).fill('泉')
    await page.getByLabel(/stroke count/i).fill('9')

    // Scroll to components section and click toggle button
    const componentsFieldset = page.locator('fieldset', {
      has: page.getByText('Components', { exact: true })
    })
    await componentsFieldset.scrollIntoViewIfNeeded()
    await componentsFieldset.locator('.base-combobox-multi-trigger').click()
    await page.waitForTimeout(300)
    await page.getByText('水 — water').click()

    // Click outside to close any open dropdowns
    await page.getByRole('heading', { name: /new kanji/i }).click()
    await page.waitForTimeout(200)

    // Submit
    await page.getByRole('button', { name: /create kanji/i }).click()
    await expect(page).toHaveURL(/\/kanji\/\d+$/, { timeout: 10000 })
    await page.waitForTimeout(500)

    // Click on component link
    await page.locator('.kanji-detail-components-link').first().click()

    // Should navigate to component detail page
    await expect(page).toHaveURL(/\/components\/\d+/)
    await expect(
      page.locator('.component-detail-header-character')
    ).toContainText('水')
  })
})
