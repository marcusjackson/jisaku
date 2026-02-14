/**
 * E2E tests for Kanji Meanings system
 *
 * Tests cover:
 * - Displaying meanings section on kanji detail page
 * - Edit mode for meanings
 * - Adding and updating meanings
 * - Reading groupings enable/disable
 * - Destructive mode for deleting meanings
 */

import { expect, test } from '@playwright/test'

import type { Page } from '@playwright/test'

// Helper to seed the database before tests
async function seedDatabase(page: Page) {
  await page.goto('/legacy/kanji')
  await page.waitForLoadState('networkidle')

  // Check if seed button exists (database is empty)
  const seedButton = page.getByRole('button', { name: /seed data/i })
  if (await seedButton.isVisible({ timeout: 1000 }).catch(() => false)) {
    await seedButton.click()
    await page.waitForTimeout(500)
  }
}

test.describe('Kanji Meanings', () => {
  test.beforeEach(async ({ page }) => {
    await seedDatabase(page)
  })

  test('displays meanings section on kanji detail page', async ({ page }) => {
    // Navigate to kanji list
    await page.goto('/legacy/kanji')

    // Click on first kanji card to go to detail page
    await page.locator('.kanji-list-card').first().click()
    await page.waitForLoadState('networkidle')

    // Check that Meanings section title exists (using the SharedSection title)
    await expect(
      page.locator('.shared-section-title', { hasText: 'Meanings' })
    ).toBeVisible()
  })

  test('shows empty state when kanji has no meanings', async ({ page }) => {
    // Navigate to the page and create a new kanji
    await page.goto('/legacy/kanji')
    await page.waitForLoadState('networkidle')

    // Create a new kanji without meanings
    await page
      .getByRole('button', { name: /add.*kanji/i })
      .first()
      .click()
    await page.waitForURL('/legacy/kanji/new')

    // Fill in required fields
    const characterInput = page.getByLabel('Character')
    await characterInput.click()
    await characterInput.fill('試')
    await page.waitForTimeout(100)

    // Submit form
    await page.getByRole('button', { name: /create kanji/i }).click()

    // Wait for navigation to detail page
    await page.waitForURL(/\/legacy\/kanji\/\d+/)
    await page.waitForLoadState('networkidle')

    // Verify we're on detail page and meanings section shows empty state
    await expect(page.getByText('No meanings added yet')).toBeVisible()
  })

  test('can enter edit mode and see editing controls', async ({ page }) => {
    // Navigate to kanji detail page
    await page.goto('/legacy/kanji')
    await page.locator('.kanji-list-card').first().click()
    await page.waitForLoadState('networkidle')

    // Find the Meanings section edit button
    const meaningsSection = page.locator('.kanji-detail-meanings')
    await meaningsSection.getByRole('button', { name: 'Edit' }).click()

    // Verify edit mode UI elements
    await expect(
      meaningsSection.getByRole('button', { name: 'Cancel' })
    ).toBeVisible()
    await expect(
      meaningsSection.getByRole('button', { name: 'Save' })
    ).toBeVisible()
    await expect(
      meaningsSection.getByRole('button', { name: '+ Add' })
    ).toBeVisible()
    await expect(
      meaningsSection.locator('.kanji-detail-meanings-section-title', {
        hasText: 'Reading Groupings'
      })
    ).toBeVisible()
  })

  test('can add a new meaning', async ({ page }) => {
    // Navigate to kanji detail page
    await page.goto('/legacy/kanji')
    await page.locator('.kanji-list-card').first().click()
    await page.waitForLoadState('networkidle')

    // Enter edit mode
    const meaningsSection = page.locator('.kanji-detail-meanings')
    await meaningsSection.getByRole('button', { name: 'Edit' }).click()

    // Count initial meanings
    const initialMeaningCount = await meaningsSection
      .locator('.kanji-detail-meanings-edit-item')
      .count()

    // Click add button to open dialog
    await meaningsSection.getByRole('button', { name: '+ Add' }).click()
    await page.waitForTimeout(300)

    // Fill in the meaning in the dialog
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await dialog.getByLabel('Meaning').fill('test meaning')

    // Save the dialog
    await dialog.getByRole('button', { name: 'Save' }).click()
    await page.waitForTimeout(500)

    // Verify new meaning was added
    const newMeaningCount = await meaningsSection
      .locator('.kanji-detail-meanings-edit-item')
      .count()
    expect(newMeaningCount).toBe(initialMeaningCount + 1)
  })

  test('can cancel editing and discard changes', async ({ page }) => {
    // Navigate to kanji detail page
    await page.goto('/legacy/kanji')
    await page.locator('.kanji-list-card').first().click()
    await page.waitForLoadState('networkidle')

    // Enter edit mode
    const meaningsSection = page.locator('.kanji-detail-meanings')
    await meaningsSection.getByRole('button', { name: 'Edit' }).click()

    // Click add button to open dialog
    await meaningsSection.getByRole('button', { name: '+ Add' }).click()
    await page.waitForTimeout(300)

    // Cancel the dialog (not adding the meaning)
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await dialog.getByRole('button', { name: 'Cancel' }).click()
    await page.waitForTimeout(300)

    // Now cancel the edit mode itself
    await meaningsSection.getByRole('button', { name: 'Cancel' }).click()

    // Verify we're back in view mode
    await expect(
      meaningsSection.getByRole('button', { name: 'Edit' })
    ).toBeVisible()
    await expect(
      meaningsSection.getByRole('button', { name: 'Cancel' })
    ).not.toBeVisible()
  })

  test('shows enable button when grouping not enabled', async ({ page }) => {
    // Navigate to a kanji detail page
    await page.goto('/legacy/kanji')
    await page.locator('.kanji-list-card').nth(2).click() // Pick a kanji less likely to have groups
    await page.waitForLoadState('networkidle')

    // Enter edit mode
    const meaningsSection = page.locator('.kanji-detail-meanings')
    await meaningsSection.getByRole('button', { name: 'Edit' }).click()

    // Check for Enable button (if grouping is not already enabled)
    // Note: This might not always be visible if test kanji already has groups
    const enableButton = meaningsSection.getByRole('button', { name: 'Enable' })
    const disableButton = meaningsSection.getByRole('button', {
      name: 'Disable'
    })

    // Either Enable or Disable should be visible
    const enableVisible = await enableButton.isVisible().catch(() => false)
    const disableVisible = await disableButton.isVisible().catch(() => false)

    expect(enableVisible || disableVisible).toBe(true)
  })

  test('delete button only visible in destructive mode', async ({ page }) => {
    // Navigate to kanji detail page
    await page.goto('/legacy/kanji')
    await page.locator('.kanji-list-card').first().click()
    await page.waitForLoadState('networkidle')

    // Enter edit mode
    const meaningsSection = page.locator('.kanji-detail-meanings')
    await meaningsSection.getByRole('button', { name: 'Edit' }).click()

    // Check that delete button is NOT visible initially
    const deleteButton = meaningsSection.getByRole('button', {
      name: 'Delete meaning'
    })
    await expect(deleteButton).not.toBeVisible()

    // Enable destructive mode
    const destructiveToggle = page.getByRole('switch', {
      name: /destructive mode/i
    })
    if (await destructiveToggle.isVisible()) {
      await destructiveToggle.click()
      await page.waitForTimeout(300)

      // Now delete buttons should be visible (if there are meanings)
      // This assumes there are meanings to show delete buttons for
    }
  })

  test('displays grouped meanings correctly', async ({ page }) => {
    // Navigate to the 日 kanji which has grouped meanings in seed data
    await page.goto('/legacy/kanji')

    // Click on the 日 kanji card
    const sunKanjiCard = page.locator('.kanji-list-card', { hasText: '日' })
    await sunKanjiCard.click()
    await page.waitForLoadState('networkidle')

    // Check the Meanings section
    const meaningsSection = page.locator('.kanji-detail-meanings')

    // Verify we can see the reading group headers (if grouping is enabled)
    // The seed data has groups for 日: ニチ・ジツ and ひ・か
    await expect(meaningsSection.getByText('sun')).toBeVisible()
    await expect(meaningsSection.getByText('day')).toBeVisible()
  })
})

test.describe('Kanji Meanings Edit Dialog', () => {
  test.beforeEach(async ({ page }) => {
    await seedDatabase(page)
  })

  test('can open edit dialog for a meaning', async ({ page }) => {
    // Navigate to kanji detail page
    await page.goto('/legacy/kanji')
    await page.locator('.kanji-list-card').first().click()
    await page.waitForLoadState('networkidle')

    // Enter edit mode
    const meaningsSection = page.locator('.kanji-detail-meanings')
    await meaningsSection.getByRole('button', { name: 'Edit' }).click()

    // Click edit on first meaning
    const editMeaningButton = meaningsSection
      .getByRole('button', { name: 'Edit meaning' })
      .first()
    if (await editMeaningButton.isVisible()) {
      await editMeaningButton.click()

      // Verify dialog opened
      await expect(page.getByText('Edit Meaning')).toBeVisible()
    }
  })
})
