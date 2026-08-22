/**
 * E2E Tests for Component Detail Groupings Section
 */

import { expect, test } from '@playwright/test'

import { createAndNavigateToComponent } from './helpers/test-utils'

import type { Page } from '@playwright/test'

/**
 * Helper to open the groupings section
 */
async function openGroupingsSection(page: Page): Promise<void> {
  const section = page.getByTestId('component-detail-groupings')
  const state = await section.getAttribute('data-state')
  if (state === 'closed') {
    await section.getByRole('button', { name: /groupings/i }).click()
    await expect(section).toHaveAttribute('data-state', 'open')
  }
}

test.describe('Component Detail Groupings', () => {
  test('displays groupings section', async ({ page }) => {
    await createAndNavigateToComponent(page, '山')
    await expect(page.getByTestId('component-detail-groupings')).toBeVisible()
  })

  test('shows empty state when no groupings', async ({ page }) => {
    await createAndNavigateToComponent(page, '川')
    await openGroupingsSection(page)
    await expect(page.getByText(/no groupings yet/i)).toBeVisible()
  })

  test('creates a grouping', async ({ page }) => {
    await createAndNavigateToComponent(page, '花')
    await openGroupingsSection(page)

    // Click Add Grouping
    await page.getByRole('button', { name: /add grouping/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()

    // Fill name and save
    await page.getByLabel('Name').fill('Position A')
    await page.getByRole('button', { name: /^save$/i }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Verify grouping appears in list
    await expect(page.getByText('Position A')).toBeVisible()
    await expect(page.getByTestId(/^grouping-item-/)).toBeVisible()
  })

  test('edits a grouping name', async ({ page }) => {
    await createAndNavigateToComponent(page, '空')
    await openGroupingsSection(page)

    // Create grouping
    await page.getByRole('button', { name: /add grouping/i }).click()
    await page.getByLabel('Name').fill('Original Name')
    await page.getByRole('button', { name: /^save$/i }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Edit grouping
    await page.getByRole('button', { name: /^edit$/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()

    const nameInput = page.getByLabel('Name')
    await nameInput.clear()
    await nameInput.fill('Renamed')
    await page.getByRole('button', { name: /^save$/i }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Verify new name
    await expect(page.getByText('Renamed')).toBeVisible()
    await expect(page.getByText('Original Name')).not.toBeVisible()
  })

  test('reorders groupings', async ({ page }) => {
    await createAndNavigateToComponent(page, '竹')
    await openGroupingsSection(page)

    // Create first grouping
    await page.getByRole('button', { name: /add grouping/i }).click()
    await page.getByLabel('Name').fill('First')
    await page.getByRole('button', { name: /^save$/i }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Create second grouping
    await page.getByRole('button', { name: /add grouping/i }).click()
    await page.getByLabel('Name').fill('Second')
    await page.getByRole('button', { name: /^save$/i }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Verify initial order
    const items = page.getByTestId(/^grouping-item-/)
    await expect(items.first()).toContainText('First')
    await expect(items.last()).toContainText('Second')

    // Move second item up
    await items
      .last()
      .getByRole('button', { name: /move up/i })
      .click()

    // Verify order is swapped
    await expect(items.first()).toContainText('Second')
    await expect(items.last()).toContainText('First')
  })

  test('deletes grouping in destructive mode', async ({ page }) => {
    await createAndNavigateToComponent(page, '米')
    await openGroupingsSection(page)

    // Create a grouping
    await page.getByRole('button', { name: /add grouping/i }).click()
    await page.getByLabel('Name').fill('To Delete')
    await page.getByRole('button', { name: /^save$/i }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()
    await expect(page.getByText('To Delete')).toBeVisible()

    // Enable destructive mode
    await page.getByRole('switch', { name: /destructive mode/i }).click()

    // Click delete on the grouping item
    await page.getByRole('button', { name: /^delete$/i }).click()

    // Confirm deletion in the confirm dialog
    const confirmDialog = page
      .getByRole('dialog')
      .filter({ hasText: /delete grouping/i })
    await expect(confirmDialog).toBeVisible()
    await confirmDialog.getByRole('button', { name: /^delete$/i }).click()
    await expect(confirmDialog).not.toBeVisible()

    // Grouping should no longer appear
    await expect(page.getByText('To Delete')).not.toBeVisible()
  })
})
