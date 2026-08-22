/**
 * E2E Tests for Kanji Detail Vocabulary Section
 */

import { expect, test } from '@playwright/test'

import { createAndNavigateToKanji } from './helpers/test-utils'

test.describe('Kanji Detail Vocabulary', () => {
  test('displays vocabulary section with linked vocabulary', async ({
    page
  }) => {
    // Create kanji
    await createAndNavigateToKanji(page, '本')

    // Verify vocabulary section is visible
    const vocabSection = page.getByTestId('kanji-detail-vocabulary')
    await expect(vocabSection).toBeVisible()

    // Verify section has title
    await expect(
      vocabSection.getByRole('heading', { name: /vocabulary/i })
    ).toBeVisible()
  })

  test('links existing vocabulary to kanji', async ({ page }) => {
    // Create kanji first
    await createAndNavigateToKanji(page, '日')

    // Create a vocabulary entry
    await page.goto('/vocabulary')
    await expect(
      page.getByRole('heading', { name: /^vocabulary$/i })
    ).toBeVisible()

    await page.getByRole('button', { name: /^add new$/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()

    await page.getByRole('textbox', { name: /^word$/i }).fill('日本')
    await page.getByRole('textbox', { name: /^kana$/i }).fill('にほん')
    await page.getByRole('button', { name: /^add$/i }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Navigate back to kanji detail
    await page.goto('/kanji')
    const kanjiCard = page
      .getByTestId('kanji-list-card')
      .filter({ hasText: '日' })
    await kanjiCard.click()
    await page.waitForURL(/\/kanji\/\d+$/)

    // Open vocabulary edit dialog
    const vocabSection = page.getByTestId('kanji-detail-vocabulary')
    await vocabSection.getByRole('button', { name: /edit/i }).click()

    // Wait for dialog
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog.getByText('Link Vocabulary')).toBeVisible()

    // Search for vocabulary
    const searchInput = page.getByPlaceholder(
      /search vocabulary by word, kana, or meaning/i
    )
    await searchInput.fill('日本')

    // Wait for search results
    await expect(page.getByText('日本')).toBeVisible()
    await expect(page.getByText('にほん')).toBeVisible()

    // Click on the search result
    const resultButton = page.getByRole('button', { name: /日本.*にほん/i })
    await resultButton.click()

    // Dialog should close
    await expect(dialog).not.toBeVisible()

    // Verify vocabulary is now linked and displayed in the list
    await expect(vocabSection.getByText('日本')).toBeVisible()
    await expect(vocabSection.getByText('にほん')).toBeVisible()
  })

  test('creates and links new vocabulary via quick-create', async ({
    page
  }) => {
    // Create kanji first
    await createAndNavigateToKanji(page, '月')

    // Open vocabulary edit dialog
    const vocabSection = page.getByTestId('kanji-detail-vocabulary')
    await vocabSection.getByRole('button', { name: /edit/i }).click()

    // Wait for dialog
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog.getByText('Link Vocabulary')).toBeVisible()

    // Search for non-existent vocabulary
    const searchInput = page.getByPlaceholder(
      /search vocabulary by word, kana, or meaning/i
    )
    await searchInput.fill('月曜日')

    // Wait for "No vocabulary found" message
    await expect(dialog.getByText(/no vocabulary found/i)).toBeVisible()

    // Click "Create" button to show quick-create form
    await dialog.getByRole('button', { name: /create "月曜日"/i }).click()

    // Verify quick-create form is visible
    await expect(
      dialog.getByTestId('quick-create-vocabulary-form')
    ).toBeVisible()

    // Verify word field is pre-filled with search term
    const wordInput = dialog.getByRole('textbox', { name: /^word$/i })
    await expect(wordInput).toHaveValue('月曜日')

    // Fill in kana and short meaning
    await dialog
      .getByRole('textbox', { name: /kana.*optional/i })
      .fill('げつようび')
    await dialog
      .getByRole('textbox', { name: /short meaning.*optional/i })
      .fill('Monday')

    // Submit the form
    await dialog.getByRole('button', { name: /create & link/i }).click()

    // Dialog should close
    await expect(dialog).not.toBeVisible()

    // Verify vocabulary is now created, linked, and displayed in the list
    await expect(vocabSection.getByText('月曜日')).toBeVisible()
    await expect(vocabSection.getByText('げつようび')).toBeVisible()
    await expect(vocabSection.getByText('Monday')).toBeVisible()
  })

  test('unlinks vocabulary from kanji when destructive mode enabled', async ({
    page
  }) => {
    // Create kanji first
    await createAndNavigateToKanji(page, '土')

    // Create and link a vocabulary entry
    await page.goto('/vocabulary')
    await expect(
      page.getByRole('heading', { name: /^vocabulary$/i })
    ).toBeVisible()

    await page.getByRole('button', { name: /^add new$/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()

    await page.getByRole('textbox', { name: /^word$/i }).fill('土曜日')
    await page.getByRole('textbox', { name: /^kana$/i }).fill('どようび')
    await page.getByRole('button', { name: /^add$/i }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Navigate back to kanji detail
    await page.goto('/kanji')
    const kanjiCard = page
      .getByTestId('kanji-list-card')
      .filter({ hasText: '土' })
    await kanjiCard.click()
    await page.waitForURL(/\/kanji\/\d+$/)

    // Link the vocabulary to kanji
    const vocabSection = page.getByTestId('kanji-detail-vocabulary')
    await vocabSection.getByRole('button', { name: /edit/i }).click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()

    const searchInput = page.getByPlaceholder(
      /search vocabulary by word, kana, or meaning/i
    )
    await searchInput.fill('土曜日')

    await expect(page.getByText('土曜日')).toBeVisible()
    const resultButton = page.getByRole('button', { name: /土曜日.*どようび/i })
    await resultButton.click()

    await expect(dialog).not.toBeVisible()

    // Verify vocabulary is linked
    await expect(vocabSection.getByText('土曜日')).toBeVisible()

    // Enable destructive mode
    await page.getByRole('switch', { name: /destructive mode/i }).click()

    // Open edit dialog again
    await vocabSection.getByRole('button', { name: /edit/i }).click()
    await expect(dialog).toBeVisible()

    // Wait for linked vocabulary list to appear
    await expect(page.getByTestId('linked-vocabulary-list')).toBeVisible()

    // Click remove button
    const removeButton = page.getByRole('button', {
      name: /remove vocabulary link/i
    })
    await removeButton.click()

    // Confirm removal in the confirmation dialog
    const confirmDialog = page.getByRole('dialog').filter({
      hasText: /remove vocabulary link/i
    })
    await expect(confirmDialog).toBeVisible()
    await confirmDialog.getByRole('button', { name: /^remove$/i }).click()

    // Wait for confirmation dialog to close
    await expect(confirmDialog).not.toBeVisible()

    // The linked vocabulary list should now be empty (so the section disappears)
    await expect(page.getByTestId('linked-vocabulary-list')).not.toBeVisible()

    // Close the main dialog by pressing Escape
    await page.keyboard.press('Escape')
    await expect(dialog).not.toBeVisible()

    // Verify vocabulary is no longer linked
    await expect(vocabSection.getByText('土曜日')).not.toBeVisible()
  })
})
