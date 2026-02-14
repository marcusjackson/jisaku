/**
 * E2E Tests for Vocabulary Detail Page
 *
 * Tests navigation, display, editing, and deletion of vocabulary.
 */

import { expect, type Page, test } from '@playwright/test'

/**
 * Helper to create a vocabulary entry and navigate to its detail page
 */
async function createAndNavigateToVocab(
  page: Page,
  word: string
): Promise<string> {
  await page.goto('/vocabulary')

  // Wait for page load
  await expect(
    page.getByRole('heading', { name: /^vocabulary$/i })
  ).toBeVisible()

  // Open create dialog - try regular button first, then empty state button
  const addButton = page.getByRole('button', { name: /^add new$/i })
  const addFirstButton = page.getByRole('button', {
    name: /add first vocabulary/i
  })

  if (await addButton.isVisible()) {
    await addButton.click()
  } else {
    await addFirstButton.click()
  }

  await expect(page.getByRole('dialog')).toBeVisible()

  // Fill word and kana
  await page.getByRole('textbox', { name: /^word$/i }).fill(word)
  await page.getByRole('textbox', { name: /^kana$/i }).fill('かな')
  await page.getByRole('button', { name: /^add$/i }).click()

  // Wait for dialog to close
  await expect(page.getByRole('dialog')).not.toBeVisible()

  // Click on the created vocabulary card to navigate to detail page
  const vocabCard = page
    .getByTestId('vocab-list-card')
    .filter({ hasText: word })
  await vocabCard.click()

  // Wait for navigation to detail page
  await page.waitForURL(/\/vocabulary\/\d+$/)

  return page.url()
}

test.describe('Vocabulary Detail Page', () => {
  test('displays vocabulary details', async ({ page }) => {
    await createAndNavigateToVocab(page, '日本語')

    // Check word is displayed
    await expect(page.getByTestId('vocab-word')).toContainText('日本語')
    // Check kana is displayed
    await expect(page.getByTestId('vocab-kana')).toContainText('かな')
  })

  test('shows back button at top and bottom', async ({ page }) => {
    await createAndNavigateToVocab(page, '勉強')

    const backButtons = page.getByRole('link', {
      name: /back to vocabulary list/i
    })
    await expect(backButtons).toHaveCount(2)
  })

  test('navigates back to list when back button clicked', async ({ page }) => {
    await createAndNavigateToVocab(page, '言葉')

    await page
      .getByRole('link', { name: /back to vocabulary list/i })
      .first()
      .click()
    await page.waitForURL('/vocabulary')
    expect(page.url()).toMatch(/\/vocabulary$/)
  })

  test('opens edit dialog when edit button clicked', async ({ page }) => {
    await createAndNavigateToVocab(page, '話す')

    await page.getByTestId('headline-edit-button').click()
    await expect(page.getByRole('dialog')).toBeVisible()
  })

  test('saves edited short meaning', async ({ page }) => {
    await createAndNavigateToVocab(page, '書く')

    // Open edit dialog (headline)
    await page.getByTestId('headline-edit-button').click()

    // Edit short meaning
    const meaningInput = page.getByLabel(/short meaning/i)
    await meaningInput.fill('to write')
    await page.getByRole('button', { name: /save/i }).click()

    // Verify short meaning updated
    await expect(page.getByText('to write')).toBeVisible()
  })

  test('saves edited kana', async ({ page }) => {
    await createAndNavigateToVocab(page, '食べる')

    // Open edit dialog
    await page.getByTestId('headline-edit-button').click()
    await expect(page.getByRole('dialog')).toBeVisible()

    // Edit kana
    const kanaInput = page.getByLabel(/kana/i)
    await kanaInput.fill('たべる')
    await page.getByRole('button', { name: /save/i }).click()

    // Verify kana updated
    await expect(page.getByTestId('vocab-kana')).toContainText('たべる')
  })

  test('enables delete button when destructive mode on', async ({ page }) => {
    await createAndNavigateToVocab(page, '消す')

    const deleteButton = page.getByRole('button', { name: /^delete$/i })

    // Delete button should be disabled initially
    await expect(deleteButton).toBeDisabled()

    // Toggle destructive mode switch
    await page.getByTestId('destructive-mode-switch').click()

    // Delete button should now be enabled
    await expect(deleteButton).toBeEnabled()
  })

  test('shows confirmation dialog when delete clicked', async ({ page }) => {
    await createAndNavigateToVocab(page, '除く')

    // Enable destructive mode
    await page.getByTestId('destructive-mode-switch').click()

    // Click delete button
    await page.getByRole('button', { name: /^delete$/i }).click()

    // Confirm dialog appears
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByText(/are you sure/i)).toBeVisible()
  })

  test('deletes vocabulary and navigates to list', async ({ page }) => {
    const word = '削除'
    await createAndNavigateToVocab(page, word)

    // Enable destructive mode
    await page.getByTestId('destructive-mode-switch').click()

    // Click delete button
    await page.getByRole('button', { name: /^delete$/i }).click()

    // Confirm deletion
    await page
      .getByRole('dialog')
      .getByRole('button', { name: /delete/i })
      .click()

    // Should navigate back to list
    await page.waitForURL('/vocabulary')
    expect(page.url()).toMatch(/\/vocabulary$/)
  })

  test('toggles between new and legacy UI', async ({ page }) => {
    const url = await createAndNavigateToVocab(page, '切替')
    const vocabId = /\/vocabulary\/(\d+)$/.exec(url)?.[1]

    if (!vocabId) {
      throw new Error('Failed to extract vocabulary ID from URL')
    }

    // Click version toggle in header (not destructive mode switch)
    const versionToggle = page
      .locator('nav[aria-label="Main navigation"]')
      .getByRole('switch')
    await versionToggle.click()
    await page.waitForURL(`/legacy/vocabulary/${vocabId}`)
    expect(page.url()).toContain('/legacy/vocabulary/')

    // Click version toggle to go back to new UI
    await page
      .locator('nav[aria-label="Main navigation"]')
      .getByRole('switch')
      .click()
    await page.waitForURL(`/vocabulary/${vocabId}`)
    expect(page.url()).toMatch(/\/vocabulary\/\d+$/)
    expect(page.url()).not.toContain('/legacy')
  })
})
