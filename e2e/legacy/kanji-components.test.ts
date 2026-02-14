/**
 * E2E tests for Kanji Components selection flow
 *
 * Tests the ability to select and manage components that make up a kanji.
 * Note: Component selection happens on detail page after creation due to simplified create form.
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
    await page.goto('/legacy/components/new')
    await expect(
      page.getByRole('heading', { name: /new component/i })
    ).toBeVisible()

    await page.getByLabel(/character/i).fill('日')
    await page.getByLabel(/short meaning/i).fill('sun')

    await page.getByRole('button', { name: /create component/i }).click()
    await expect(page).toHaveURL(/\/legacy\/components\/\d+/)
    await page.waitForTimeout(500)

    // Navigate to new kanji form (simplified form - no components section in create mode)
    await page.goto('/legacy/kanji/new')
    await expect(
      page.getByRole('heading', { name: /new kanji/i })
    ).toBeVisible()

    // Fill required fields only (simplified form)
    await page.getByLabel('Character').fill('明')

    // Submit form - components will be added on detail page
    const submitButton = page.getByRole('button', { name: /create kanji/i })
    await expect(submitButton).toBeEnabled()
    await submitButton.click({ force: true })

    // Should navigate to detail page
    await expect(page).toHaveURL(/\/legacy\/kanji\/\d+/)
    await page.waitForTimeout(500)

    // Now add component from detail page
    // Scroll to components section on detail page
    const componentsSection = page.locator('section', {
      has: page.getByRole('heading', { name: /components/i })
    })
    await componentsSection.scrollIntoViewIfNeeded()

    // Click the "+ Add" button to show the search interface
    const addButton = componentsSection.getByRole('button', {
      name: /\+ add/i
    })
    await addButton.click()
    await page.waitForTimeout(300)

    // Search for and select the component
    const searchInput = componentsSection.getByPlaceholder(/search/i)
    await searchInput.fill('日')
    await page.waitForTimeout(200)

    // Press Enter to select the first matching option
    await searchInput.press('Enter')

    // Wait for component to appear in the list
    await expect(componentsSection.getByText('日')).toBeVisible({
      timeout: 5000
    })

    // Verify component is shown on detail page
    await expect(
      page.getByRole('heading', { name: 'Components' })
    ).toBeVisible()
    await expect(
      page.locator('.kanji-detail-components-character')
    ).toContainText('日')

    // Should not have console errors
    expect(consoleErrors).toEqual([])
  })

  test('can modify components when editing a kanji', async ({ page }) => {
    // First create a component
    await page.goto('/legacy/components/new')
    await page.getByLabel(/character/i).fill('月')
    await page.getByLabel(/short meaning/i).fill('moon')
    await page.getByRole('button', { name: /create component/i }).click()
    await expect(page).toHaveURL(/\/legacy\/components\/\d+/)
    await page.waitForTimeout(500)

    // Create a kanji (simplified form)
    await page.goto('/legacy/kanji/new')
    await page.getByLabel('Character').fill('朋')
    await page.getByRole('button', { name: /create kanji/i }).click()
    await expect(page).toHaveURL(/\/legacy\/kanji\/\d+/)
    await page.waitForTimeout(500)

    // Verify that the detail page loads with kanji information
    await expect(page.locator('.kanji-detail-header-character')).toContainText(
      '朋'
    )

    // Verify the Components section is visible
    await expect(page.locator('text=Components').first()).toBeVisible()
  })

  test('can remove selected components via chip button', async ({ page }) => {
    // First create a component
    await page.goto('/legacy/components/new')
    await page.getByLabel(/character/i).fill('火')
    await page.getByLabel(/short meaning/i).fill('fire')
    await page.getByRole('button', { name: /create component/i }).click()
    await expect(page).toHaveURL(/\/legacy\/components\/\d+/)
    await page.waitForTimeout(500)

    // Create a kanji (simplified form)
    await page.goto('/legacy/kanji/new')
    await page.getByLabel('Character').fill('炎')
    await page.getByRole('button', { name: /create kanji/i }).click()
    await expect(page).toHaveURL(/\/legacy\/kanji\/\d+/)
    await page.waitForTimeout(500)

    // Now add component from detail page
    const componentsSection = page.locator('section', {
      has: page.getByRole('heading', { name: /components/i })
    })
    await componentsSection.scrollIntoViewIfNeeded()

    // Click "+ Add" button
    const addButton = componentsSection.getByRole('button', {
      name: /\+ add/i
    })
    await addButton.click()
    await page.waitForTimeout(300)

    // Search for and select the component
    const searchInput = componentsSection.getByPlaceholder(/search/i)
    await searchInput.fill('火')
    await page.waitForTimeout(200)
    await searchInput.press('Enter')

    // Verify component appears
    await expect(componentsSection.getByText('火')).toBeVisible()

    // Enable destructive mode to allow removal
    await page.locator('#destructive-mode-switch').click()
    await page.waitForTimeout(200)

    // Remove the component by clicking the delete button (✕)
    const deleteButton = componentsSection
      .locator('button')
      .filter({ hasText: '✕' })
      .first()
    await expect(deleteButton).toBeVisible()
    await deleteButton.click()

    // Confirm removal in dialog
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByRole('button', { name: /remove$/i }).click()
    await page.waitForTimeout(500)

    // Component should be removed
    await expect(
      componentsSection.getByText('火 — fire (4画)')
    ).not.toBeVisible()
  })

  test('component links on detail page navigate to component detail', async ({
    page
  }) => {
    // Create a component
    await page.goto('/legacy/components/new')
    await page.getByLabel(/character/i).fill('水')
    await page.getByLabel(/short meaning/i).fill('water')
    await page.getByRole('button', { name: /create component/i }).click()
    await expect(page).toHaveURL(/\/legacy\/components\/\d+/)
    await page.waitForTimeout(500)

    // Create a kanji (simplified form)
    await page.goto('/legacy/kanji/new')
    await page.getByLabel('Character').fill('泉')
    await page.getByRole('button', { name: /create kanji/i }).click()
    await expect(page).toHaveURL(/\/legacy\/kanji\/\d+$/, { timeout: 10000 })
    await page.waitForTimeout(500)

    // Add component from detail page
    const componentsSection = page.locator('section', {
      has: page.getByRole('heading', { name: /components/i })
    })
    await componentsSection.scrollIntoViewIfNeeded()

    // Click "+ Add" button
    const addButton = componentsSection.getByRole('button', {
      name: /\+ add/i
    })
    await addButton.click()
    await page.waitForTimeout(300)

    // Search for and select the component
    const searchInput = componentsSection.getByPlaceholder(/search/i)
    await searchInput.fill('水')
    await page.waitForTimeout(200)
    await searchInput.press('Enter')

    // Click on component link (the → button)
    await page.locator('.kanji-detail-components-view-link').first().click()

    // Should navigate to component detail page
    await expect(page).toHaveURL(/\/legacy\/components\/\d+/)
    await expect(
      page.locator('.component-detail-header-character')
    ).toContainText('水')
  })
})
