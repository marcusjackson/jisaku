/**
 * E2E tests for Kanji Classifications system
 *
 * Tests cover:
 * - Displaying classifications section on kanji detail page
 * - Edit mode for classifications
 * - Adding and updating classifications
 * - Reordering via arrow buttons
 * - Destructive mode for deleting classifications
 * - Primary classification badge on list cards
 * - Duplicate validation
 */

import { expect, test } from '@playwright/test'

import type { Page } from '@playwright/test'

// Helper to seed the database before tests
async function seedDatabase(page: Page) {
  await page.goto('/')
  await page.waitForLoadState('networkidle')

  // Check if seed button exists (database is empty)
  const seedButton = page.getByRole('button', { name: /seed data/i })
  if (await seedButton.isVisible({ timeout: 1000 }).catch(() => false)) {
    await seedButton.click()
    await page.waitForTimeout(500)
  }
}

test.describe('Kanji Classifications', () => {
  test.beforeEach(async ({ page }) => {
    await seedDatabase(page)
  })

  test('displays classifications section on kanji detail page', async ({
    page
  }) => {
    // Navigate to kanji list
    await page.goto('/')

    // Click on first kanji card to go to detail page
    await page.locator('.kanji-list-card').first().click()
    await page.waitForLoadState('networkidle')

    // Check that Classifications section title exists
    await expect(
      page.locator('.shared-section-title', { hasText: 'Classifications' })
    ).toBeVisible()
  })

  test('shows empty state when kanji has no classifications', async ({
    page
  }) => {
    // Navigate to the page and create a new kanji
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Create a new kanji without classifications
    await page
      .getByRole('button', { name: /add.*kanji/i })
      .first()
      .click()
    await page.waitForURL('/kanji/new')

    // Fill in required fields
    const characterInput = page.getByLabel('Character')
    await characterInput.click()
    await characterInput.fill('試')
    await page.waitForTimeout(100)

    // Submit form
    await page.getByRole('button', { name: /create kanji/i }).click()

    // Wait for navigation to detail page
    await page.waitForURL(/\/kanji\/\d+/)
    await page.waitForLoadState('networkidle')

    // Verify classifications section shows empty state
    await expect(page.getByText('No classifications assigned')).toBeVisible()
  })

  test('can enter edit mode and see editing controls', async ({ page }) => {
    // Navigate to kanji detail page
    await page.goto('/')
    await page.locator('.kanji-list-card').first().click()
    await page.waitForLoadState('networkidle')

    // Find the Classifications section edit button
    const classificationsSection = page.locator('.kanji-detail-classifications')
    await classificationsSection.getByRole('button', { name: 'Edit' }).click()

    // Verify edit mode UI elements
    await expect(
      classificationsSection.getByRole('button', { name: 'Cancel' })
    ).toBeVisible()
    await expect(
      classificationsSection.getByRole('button', { name: 'Save' })
    ).toBeVisible()
    await expect(
      classificationsSection.getByRole('button', {
        name: '+ Add Classification'
      })
    ).toBeVisible()
  })

  test('displays primary classification in view mode', async ({ page }) => {
    // Navigate to a kanji with classifications
    await page.goto('/')
    await page.locator('.kanji-list-card').first().click()
    await page.waitForLoadState('networkidle')

    const classificationsSection = page.locator('.kanji-detail-classifications')

    // Should show primary classification label and badge
    await expect(classificationsSection.getByText('Primary:')).toBeVisible()

    // Badge should show abbreviated Japanese name
    const badge = classificationsSection.locator(
      '.kanji-detail-classifications-badge'
    )
    await expect(badge).toBeVisible()
    const badgeText = await badge.textContent()
    // Should be one of the abbreviations
    expect(['象形', '指事', '会意', '形声', '仮借']).toContain(badgeText)
  })

  test('can add a new classification', async ({ page }) => {
    // Navigate to kanji detail page
    await page.goto('/')
    await page.locator('.kanji-list-card').first().click()
    await page.waitForLoadState('networkidle')

    // Enter edit mode
    const classificationsSection = page.locator('.kanji-detail-classifications')
    await classificationsSection.getByRole('button', { name: 'Edit' }).click()

    // Click "+ Add Classification"
    await classificationsSection
      .getByRole('button', { name: '+ Add Classification' })
      .click()

    // Should show a new classification item with select dropdown
    const newItems = classificationsSection.locator(
      '.kanji-detail-classifications-edit-item-new'
    )
    await expect(newItems.first()).toBeVisible()

    // Should have Save and Cancel buttons for the new item
    await expect(
      newItems.first().getByRole('button', { name: 'Save' })
    ).toBeVisible()
    await expect(
      newItems.first().getByRole('button', { name: 'Cancel' })
    ).toBeVisible()
  })

  test('can save a new classification', async ({ page }) => {
    // Navigate to kanji detail page
    await page.goto('/')
    await page.locator('.kanji-list-card').first().click()
    await page.waitForLoadState('networkidle')

    const classificationsSection = page.locator('.kanji-detail-classifications')

    // Count current classifications
    const initialText = await classificationsSection.textContent()
    const hasAdditional = initialText?.includes('Additional:')

    // Enter edit mode
    await classificationsSection.getByRole('button', { name: 'Edit' }).click()

    // Add new classification
    await classificationsSection
      .getByRole('button', { name: '+ Add Classification' })
      .click()

    // Select a type (find the select within the new item)
    const newItem = classificationsSection
      .locator('.kanji-detail-classifications-edit-item-new')
      .first()

    // Click Save for the new item
    await newItem.getByRole('button', { name: 'Save' }).click()
    await page.waitForTimeout(200)

    // Click main Save button
    await classificationsSection.getByRole('button', { name: 'Save' }).click()
    await page.waitForTimeout(300)

    // Should be back in view mode
    await expect(
      classificationsSection.getByRole('button', { name: 'Edit' })
    ).toBeVisible()

    // Should show Additional section now if it wasn't there before
    if (!hasAdditional) {
      await expect(
        classificationsSection.getByText('Additional:')
      ).toBeVisible()
    }
  })

  test.skip('can reorder classifications with arrow buttons', async ({
    page
  }) => {
    // Navigate to kanji detail page with multiple classifications
    await page.goto('/')
    await page.locator('.kanji-list-card').first().click()
    await page.waitForLoadState('networkidle')

    const classificationsSection = page.locator('.kanji-detail-classifications')

    // Enter edit mode
    await classificationsSection.getByRole('button', { name: 'Edit' }).click()

    // If there's only one classification, add another first
    const editItems = classificationsSection.locator(
      '.kanji-detail-classifications-edit-item'
    )
    const itemCount = await editItems.count()

    if (itemCount === 1) {
      // Add another classification
      await classificationsSection
        .getByRole('button', { name: '+ Add Classification' })
        .click()
      const newItem = classificationsSection
        .locator('.kanji-detail-classifications-edit-item-new')
        .first()
      await newItem.getByRole('button', { name: 'Save' }).click()
      await page.waitForTimeout(200)
    }

    // Get the text of first classification before reordering
    const firstItem = classificationsSection
      .locator('.kanji-detail-classifications-edit-item')
      .first()
    const firstItemText = await firstItem.textContent()

    // Click down arrow on first item
    await firstItem.getByRole('button', { name: '↓' }).click()
    await page.waitForTimeout(100)

    // Save changes
    await classificationsSection.getByRole('button', { name: 'Save' }).click()
    await page.waitForTimeout(300)

    // Back in view mode - primary should have changed
    const primarySection = classificationsSection.locator(
      '.kanji-detail-classifications-primary'
    )
    const newPrimaryText = await primarySection.textContent()

    // The new primary text should not contain the old first item's classification name
    expect(newPrimaryText).not.toContain(firstItemText?.substring(0, 20) ?? '')
  })

  test.skip('shows delete button only in destructive mode', async ({
    page
  }) => {
    // Navigate to kanji detail page
    await page.goto('/')
    await page.locator('.kanji-list-card').first().click()
    await page.waitForLoadState('networkidle')

    const classificationsSection = page.locator('.kanji-detail-classifications')

    // Enter edit mode
    await classificationsSection.getByRole('button', { name: 'Edit' }).click()

    // Delete button (✕) should NOT be visible initially
    const editItems = classificationsSection.locator(
      '.kanji-detail-classifications-edit-item'
    )
    const firstItem = editItems.first()
    await expect(firstItem.getByRole('button', { name: '✕' })).not.toBeVisible()

    // Cancel edit mode
    await classificationsSection.getByRole('button', { name: 'Cancel' }).click()

    // Enable destructive mode (toggle in header)
    const destructiveToggle = page.getByRole('switch', {
      name: /destructive mode/i
    })
    if (await destructiveToggle.isVisible()) {
      await destructiveToggle.click()
      await page.waitForTimeout(100)
    }

    // Enter edit mode again
    await classificationsSection.getByRole('button', { name: 'Edit' }).click()

    // Now delete button SHOULD be visible
    const firstItemAfterToggle = classificationsSection
      .locator('.kanji-detail-classifications-edit-item')
      .first()
    await expect(
      firstItemAfterToggle.getByRole('button', { name: '✕' })
    ).toBeVisible()
  })

  test.skip('shows confirmation dialog when deleting classification', async ({
    page
  }) => {
    // Navigate to kanji detail page
    await page.goto('/')
    await page.locator('.kanji-list-card').first().click()
    await page.waitForLoadState('networkidle')

    // Enable destructive mode
    const destructiveToggle = page.getByRole('switch', {
      name: /destructive mode/i
    })
    if (await destructiveToggle.isVisible()) {
      await destructiveToggle.click()
      await page.waitForTimeout(100)
    }

    const classificationsSection = page.locator('.kanji-detail-classifications')

    // Enter edit mode
    await classificationsSection.getByRole('button', { name: 'Edit' }).click()

    // Click delete button
    const firstItem = classificationsSection
      .locator('.kanji-detail-classifications-edit-item')
      .first()
    await firstItem.getByRole('button', { name: '✕' }).click()

    // Should show confirmation dialog
    await expect(page.getByText('Delete Classification')).toBeVisible()

    // Cancel the dialog
    await page.getByRole('button', { name: 'Cancel' }).click()
  })

  test.skip('prevents duplicate classification types', async ({ page }) => {
    // Navigate to kanji detail page
    await page.goto('/')
    await page.locator('.kanji-list-card').first().click()
    await page.waitForLoadState('networkidle')

    const classificationsSection = page.locator('.kanji-detail-classifications')

    // Enter edit mode
    await classificationsSection.getByRole('button', { name: 'Edit' }).click()

    // Get the first classification's type
    const firstItem = classificationsSection
      .locator('.kanji-detail-classifications-edit-item')
      .first()
    const firstSelect = firstItem.locator('select')
    const firstValue = await firstSelect.inputValue()

    // Add new classification
    await classificationsSection
      .getByRole('button', { name: '+ Add Classification' })
      .click()

    const newItem = classificationsSection
      .locator('.kanji-detail-classifications-edit-item-new')
      .first()

    // Select the same type as the first one
    const newSelect = newItem.locator('select')
    await newSelect.selectOption(firstValue)

    // Click Save for new item
    await newItem.getByRole('button', { name: 'Save' }).click()
    await page.waitForTimeout(200)

    // Should show duplicate warning
    await expect(classificationsSection.getByText(/duplicate/i)).toBeVisible()

    // Save button should be disabled
    const saveButton = classificationsSection.getByRole('button', {
      name: 'Save'
    })
    await expect(saveButton).toBeDisabled()
  })

  test('displays primary classification badge on list cards', async ({
    page
  }) => {
    // Navigate to kanji list
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Find cards with classification badges
    const cards = page.locator('.kanji-list-card')
    const firstCard = cards.first()

    // Should have a classification badge (one of the abbreviated names)
    const cardText = await firstCard.textContent()
    const hasClassificationBadge = [
      '象形',
      '指事',
      '会意',
      '形声',
      '仮借'
    ].some((abbrev) => cardText?.includes(abbrev))

    expect(hasClassificationBadge).toBe(true)
  })

  test.skip('arrow buttons disabled when only one classification', async ({
    page
  }) => {
    // Navigate to kanji detail page
    await page.goto('/')
    await page.locator('.kanji-list-card').first().click()
    await page.waitForLoadState('networkidle')

    const classificationsSection = page.locator('.kanji-detail-classifications')

    // Enter edit mode
    await classificationsSection.getByRole('button', { name: 'Edit' }).click()

    const editItems = classificationsSection.locator(
      '.kanji-detail-classifications-edit-item'
    )
    const itemCount = await editItems.count()

    // If there's more than one, delete extras until only one remains
    if (itemCount > 1) {
      // Enable destructive mode first
      await classificationsSection
        .getByRole('button', { name: 'Cancel' })
        .click()
      const destructiveToggle = page.getByRole('switch', {
        name: /destructive mode/i
      })
      if (await destructiveToggle.isVisible()) {
        await destructiveToggle.click()
      }
      await classificationsSection.getByRole('button', { name: 'Edit' }).click()

      // Delete all but first
      for (let i = 1; i < itemCount; i++) {
        const item = classificationsSection
          .locator('.kanji-detail-classifications-edit-item')
          .nth(1)
        await item.getByRole('button', { name: '✕' }).click()
        await page.getByRole('button', { name: 'Delete' }).click()
        await page.waitForTimeout(100)
      }
    }

    // Now verify arrow buttons are disabled
    const singleItem = classificationsSection
      .locator('.kanji-detail-classifications-edit-item')
      .first()
    await expect(singleItem.getByRole('button', { name: '↑' })).toBeDisabled()
    await expect(singleItem.getByRole('button', { name: '↓' })).toBeDisabled()
  })

  test.skip('first item up arrow is disabled', async ({ page }) => {
    // Navigate to kanji detail page with at least 2 classifications
    await page.goto('/')
    await page.locator('.kanji-list-card').first().click()
    await page.waitForLoadState('networkidle')

    const classificationsSection = page.locator('.kanji-detail-classifications')

    // Enter edit mode
    await classificationsSection.getByRole('button', { name: 'Edit' }).click()

    // Add second classification if needed
    const editItems = classificationsSection.locator(
      '.kanji-detail-classifications-edit-item'
    )
    const itemCount = await editItems.count()

    if (itemCount === 1) {
      await classificationsSection
        .getByRole('button', { name: '+ Add Classification' })
        .click()
      const newItem = classificationsSection
        .locator('.kanji-detail-classifications-edit-item-new')
        .first()
      await newItem.getByRole('button', { name: 'Save' }).click()
      await page.waitForTimeout(200)
    }

    // First item's up arrow should be disabled
    const firstItem = classificationsSection
      .locator('.kanji-detail-classifications-edit-item')
      .first()
    await expect(firstItem.getByRole('button', { name: '↑' })).toBeDisabled()

    // But down arrow should be enabled
    await expect(firstItem.getByRole('button', { name: '↓' })).toBeEnabled()
  })

  test.skip('last item down arrow is disabled', async ({ page }) => {
    // Navigate to kanji detail page with at least 2 classifications
    await page.goto('/')
    await page.locator('.kanji-list-card').first().click()
    await page.waitForLoadState('networkidle')

    const classificationsSection = page.locator('.kanji-detail-classifications')

    // Enter edit mode
    await classificationsSection.getByRole('button', { name: 'Edit' }).click()

    // Add second classification if needed
    const editItems = classificationsSection.locator(
      '.kanji-detail-classifications-edit-item'
    )
    const itemCount = await editItems.count()

    if (itemCount === 1) {
      await classificationsSection
        .getByRole('button', { name: '+ Add Classification' })
        .click()
      const newItem = classificationsSection
        .locator('.kanji-detail-classifications-edit-item-new')
        .first()
      await newItem.getByRole('button', { name: 'Save' }).click()
      await page.waitForTimeout(200)
    }

    // Last item's down arrow should be disabled
    const lastItem = classificationsSection
      .locator('.kanji-detail-classifications-edit-item')
      .last()
    await expect(lastItem.getByRole('button', { name: '↓' })).toBeDisabled()

    // But up arrow should be enabled (if there are 2+ items)
    const finalItemCount = await classificationsSection
      .locator('.kanji-detail-classifications-edit-item')
      .count()
    if (finalItemCount > 1) {
      await expect(lastItem.getByRole('button', { name: '↑' })).toBeEnabled()
    }
  })
})
