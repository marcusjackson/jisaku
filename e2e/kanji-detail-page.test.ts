/**
 * E2E Tests for Kanji Detail Page - Navigation, display, editing, and deletion
 */

import { expect, test } from '@playwright/test'

import { createAndNavigateToKanji } from './helpers/test-utils'

test.describe('Kanji Detail Page', () => {
  test('displays kanji details', async ({ page }) => {
    await createAndNavigateToKanji(page, '詳')

    // Check kanji character is displayed
    await expect(page.getByText('詳', { exact: true }).first()).toBeVisible()
  })

  test('shows back button at top and bottom', async ({ page }) => {
    await createAndNavigateToKanji(page, '話')

    const backButtons = page.getByRole('link', { name: /back to kanji list/i })
    await expect(backButtons).toHaveCount(2)
  })

  test('navigates back to list when back button clicked', async ({ page }) => {
    await createAndNavigateToKanji(page, '語')

    await page
      .getByRole('link', { name: /back to kanji list/i })
      .first()
      .click()
    await page.waitForURL('/kanji')
    expect(page.url()).toMatch(/\/kanji$/)
  })

  test('opens edit dialog when edit button clicked', async ({ page }) => {
    await createAndNavigateToKanji(page, '読')

    await page.getByRole('button', { name: /edit headline/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
  })

  test('saves edited display text', async ({ page }) => {
    await createAndNavigateToKanji(page, '書')

    // Open edit dialog (headline)
    await page.getByRole('button', { name: /edit headline/i }).click()

    // Edit display text
    const displayInput = page.getByLabel(/display text/i)
    await displayInput.fill('write, book')
    await page.getByRole('button', { name: /save/i }).click()

    // Verify display text updated
    await expect(page.getByText('write, book')).toBeVisible()
  })

  test('enables delete button when destructive mode on', async ({ page }) => {
    await createAndNavigateToKanji(page, '消')

    const deleteButton = page.getByRole('button', { name: /^delete$/i })

    // Delete button should be disabled initially
    await expect(deleteButton).toBeDisabled()

    // Toggle destructive mode switch
    await page.getByRole('switch', { name: /destructive mode/i }).click()

    // Delete button should now be enabled
    await expect(deleteButton).toBeEnabled()
  })

  test('shows confirmation dialog when delete clicked', async ({ page }) => {
    await createAndNavigateToKanji(page, '除')

    // Enable destructive mode
    await page.getByRole('switch', { name: /destructive mode/i }).click()

    // Click delete button
    await page.getByRole('button', { name: /^delete$/i }).click()

    // Confirm dialog appears
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByText(/are you sure/i)).toBeVisible()
  })

  test('deletes kanji and navigates to list', async ({ page }) => {
    const character = '削'
    await createAndNavigateToKanji(page, character)

    // Enable destructive mode
    await page.getByRole('switch', { name: /destructive mode/i }).click()

    // Click delete button
    await page.getByRole('button', { name: /^delete$/i }).click()

    // Confirm deletion
    await page
      .getByRole('dialog')
      .getByRole('button', { name: /delete/i })
      .click()

    // Should navigate back to list
    await page.waitForURL('/kanji')
    expect(page.url()).toMatch(/\/kanji$/)

    // Note: Success toast is ephemeral, so we don't verify it in E2E
    // (It's tested in the unit tests)
  })

  test('cancels edit without saving', async ({ page }) => {
    await createAndNavigateToKanji(page, '変')

    // Open edit dialog (headline)
    await page.getByRole('button', { name: /edit headline/i }).click()

    // Edit display text but don't save
    await page.getByLabel(/display text/i).fill('should not save')
    await page.getByRole('button', { name: /cancel/i }).click()

    // Verify text was not changed
    await expect(page.getByText('should not save')).not.toBeVisible()
  })

  test('cancels delete confirmation', async ({ page }) => {
    await createAndNavigateToKanji(page, '更')

    // Enable destructive mode
    await page.getByRole('switch', { name: /destructive mode/i }).click()

    // Click delete button
    await page.getByRole('button', { name: /^delete$/i }).click()

    // Cancel deletion
    await page
      .getByRole('dialog')
      .getByRole('button', { name: /cancel/i })
      .click()

    // Should still be on detail page
    expect(page.url()).toMatch(/\/kanji\/\d+$/)

    // Kanji should still be displayed
    await expect(page.getByText('更', { exact: true }).first()).toBeVisible()
  })
})
