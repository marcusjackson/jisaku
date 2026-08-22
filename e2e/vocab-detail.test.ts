/**
 * E2E Tests for Vocabulary Detail Page
 *
 * Tests navigation, display, editing, and deletion of vocabulary.
 */

import { expect, type Page, test } from '@playwright/test'

import { TIMEOUTS } from './helpers/test-constants'
import { VOCAB_KANJI_CHARS, VOCAB_TEST_WORDS } from './helpers/test-data'
import { expectToast } from './helpers/test-utils'

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
    await createAndNavigateToVocab(page, VOCAB_TEST_WORDS.JAPANESE_LANGUAGE)

    // Check word is displayed
    await expect(page.getByTestId('vocab-word')).toContainText(
      VOCAB_TEST_WORDS.JAPANESE_LANGUAGE
    )
    // Check kana is displayed
    await expect(page.getByTestId('vocab-kana')).toContainText('かな')
  })

  test('shows back button at top and bottom', async ({ page }) => {
    await createAndNavigateToVocab(page, VOCAB_TEST_WORDS.STUDY)

    const backButtons = page.getByRole('link', {
      name: /back to vocabulary list/i
    })
    await expect(backButtons).toHaveCount(2)
  })

  test('navigates back to list when back button clicked', async ({ page }) => {
    await createAndNavigateToVocab(page, VOCAB_TEST_WORDS.WORD)

    await page
      .getByRole('link', { name: /back to vocabulary list/i })
      .first()
      .click()
    await page.waitForURL('/vocabulary')
    expect(page.url()).toMatch(/\/vocabulary$/)
  })

  test('opens edit dialog when edit button clicked', async ({ page }) => {
    await createAndNavigateToVocab(page, VOCAB_TEST_WORDS.SPEAK)

    await page.getByRole('button', { name: /edit headline/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
  })

  test('saves edited short meaning', async ({ page }) => {
    await createAndNavigateToVocab(page, VOCAB_TEST_WORDS.WRITE)

    // Open edit dialog (headline)
    await page.getByRole('button', { name: /edit headline/i }).click()

    // Edit short meaning
    const meaningInput = page.getByLabel(/short meaning/i)
    await meaningInput.fill('to write')
    await page.getByRole('button', { name: /save/i }).click()

    // Verify short meaning updated
    await expect(page.getByText('to write')).toBeVisible()
  })

  test('saves edited kana', async ({ page }) => {
    await createAndNavigateToVocab(page, VOCAB_TEST_WORDS.EAT)

    // Open edit dialog
    await page.getByRole('button', { name: /edit headline/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()

    // Edit kana
    const kanaInput = page.getByLabel(/kana/i)
    await kanaInput.fill('たべる')
    await page.getByRole('button', { name: /save/i }).click()

    // Verify kana updated
    await expect(page.getByTestId('vocab-kana')).toContainText('たべる')
  })

  test('enables delete button when destructive mode on', async ({ page }) => {
    await createAndNavigateToVocab(page, VOCAB_TEST_WORDS.ERASE)

    const deleteButton = page.getByRole('button', { name: /^delete$/i })

    // Delete button should be disabled initially
    await expect(deleteButton).toBeDisabled()

    // Toggle destructive mode switch
    await page.getByRole('switch', { name: /destructive mode/i }).click()

    // Delete button should now be enabled
    await expect(deleteButton).toBeEnabled()
  })

  test('shows confirmation dialog when delete clicked', async ({ page }) => {
    await createAndNavigateToVocab(page, VOCAB_TEST_WORDS.EXCLUDE)

    // Enable destructive mode
    await page.getByRole('switch', { name: /destructive mode/i }).click()

    // Click delete button
    await page.getByRole('button', { name: /^delete$/i }).click()

    // Confirm dialog appears
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByText(/are you sure/i)).toBeVisible()
  })

  test('deletes vocabulary and navigates to list', async ({ page }) => {
    const word = VOCAB_TEST_WORDS.DELETE
    await createAndNavigateToVocab(page, word)

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
    await page.waitForURL('/vocabulary')
    expect(page.url()).toMatch(/\/vocabulary$/)
  })

  test('displays Basic Information section', async ({ page }) => {
    await createAndNavigateToVocab(page, VOCAB_TEST_WORDS.BASICS)

    const section = page.getByTestId('vocab-detail-basic-info')
    await expect(section).toBeVisible()
    await expect(section.getByText('Basic Information')).toBeVisible()
    await expect(page.getByTestId('basic-info-edit-button')).toBeVisible()
  })

  test('edits basic information via dialog', async ({ page }) => {
    await createAndNavigateToVocab(page, VOCAB_TEST_WORDS.EDIT)

    // Verify initial state — JLPT should be "—" and common "No" by default
    await expect(page.getByTestId('basic-info-jlpt')).toContainText('—')
    await expect(page.getByTestId('basic-info-common')).toContainText('No')
    await expect(page.getByTestId('basic-info-description')).toContainText('—')

    // Open edit dialog
    await page.getByTestId('basic-info-edit-button').click()
    await expect(page.getByRole('dialog')).toBeVisible()

    // Change JLPT level to N3
    await page.getByRole('combobox', { name: /jlpt level/i }).click()
    await page.getByRole('option', { name: 'N3' }).click()

    // Toggle common word switch
    await page.getByRole('switch', { name: /common word/i }).click()

    // Add description
    await page
      .getByRole('textbox', { name: /description/i })
      .fill('Test description')

    // Save
    await page.getByRole('button', { name: /save/i }).click()

    // Verify dialog closed
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Verify updated values
    await expect(page.getByTestId('basic-info-jlpt')).toContainText('N3')
    await expect(page.getByTestId('basic-info-common')).toContainText('Yes')
    await expect(page.getByTestId('basic-info-description')).toContainText(
      'Test description'
    )
  })
})

// =============================================================================
// Kanji Breakdown Section Tests
// =============================================================================

/**
 * Helper to create a kanji for testing
 */
async function createKanji(page: Page, character: string): Promise<void> {
  await page.goto('/kanji')
  await expect(page.getByRole('heading', { name: /kanji list/i })).toBeVisible()
  await page.getByRole('button', { name: /^add new$/i }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('textbox', { name: /character/i }).fill(character)
  await page.getByRole('button', { name: /^add$/i }).click()
  await expect(page.getByRole('dialog')).not.toBeVisible()
}

/**
 * Helper to open the kanji breakdown section
 */
async function openBreakdownSection(page: Page): Promise<void> {
  const section = page.getByTestId('vocab-detail-kanji-breakdown')
  const state = await section.getAttribute('data-state')
  if (state === 'closed') {
    await section.getByRole('button', { name: /kanji breakdown/i }).click()
    await expect(section).toHaveAttribute('data-state', 'open')
  }
}

/**
 * Helper to link a kanji to the current vocabulary
 */
async function linkKanjiToVocab(page: Page, character: string): Promise<void> {
  await page.getByRole('button', { name: /add kanji/i }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByText('Search Kanji').click()
  const combobox = page.getByRole('combobox', { name: /search kanji/i })
  await combobox.fill(character)
  await expect(
    page.getByRole('option').filter({ hasText: character }).first()
  ).toBeVisible()
  await page.getByRole('option').filter({ hasText: character }).first().click()
  await expect(page.getByRole('dialog')).not.toBeVisible({
    timeout: TIMEOUTS.medium
  })
}

test.describe('Vocabulary Detail Kanji Breakdown', () => {
  test('displays kanji breakdown section', async ({ page }) => {
    await createAndNavigateToVocab(page, VOCAB_TEST_WORDS.KANJI_WORD)
    await expect(page.getByTestId('vocab-detail-kanji-breakdown')).toBeVisible()
    await expect(
      page.getByRole('button', { name: /kanji breakdown/i })
    ).toBeVisible()
  })

  test('shows empty state when no kanji linked', async ({ page }) => {
    await createAndNavigateToVocab(page, VOCAB_TEST_WORDS.EMPTY_WORD)
    await openBreakdownSection(page)
    await expect(page.getByText(/no kanji linked yet/i)).toBeVisible()
  })

  test('links existing kanji to vocabulary', async ({ page }) => {
    await createKanji(page, VOCAB_KANJI_CHARS.BRIGHT)
    await createAndNavigateToVocab(page, VOCAB_TEST_WORDS.TOMORROW)
    await openBreakdownSection(page)
    await linkKanjiToVocab(page, VOCAB_KANJI_CHARS.BRIGHT)
    // Verify toast
    await expectToast(page, /linked/i)
    // Verify kanji appears in list
    await expect(page.getByTestId(/vocab-detail-kanji-item-\d/)).toContainText(
      VOCAB_KANJI_CHARS.BRIGHT
    )
  })

  test('edits analysis notes on a kanji', async ({ page }) => {
    await createKanji(page, VOCAB_KANJI_CHARS.LIGHT)
    await createAndNavigateToVocab(page, VOCAB_TEST_WORDS.BRIGHT_LIGHT)
    await openBreakdownSection(page)
    await linkKanjiToVocab(page, VOCAB_KANJI_CHARS.LIGHT)
    await expect(page.getByTestId(/vocab-detail-kanji-item-\d/)).toContainText(
      VOCAB_KANJI_CHARS.LIGHT
    )

    // Open edit dialog
    await page
      .getByTestId(/vocab-detail-kanji-item-\d/)
      .getByRole('button', { name: /edit/i })
      .click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'Edit Analysis Notes' })
    ).toBeVisible()

    // Add notes
    await page
      .getByRole('textbox', { name: /analysis notes/i })
      .fill('Light radical in this word')
    await page.getByRole('button', { name: /save/i }).click()

    // Verify toast
    await expectToast(page, /updated/i)
  })

  test('reorders kanji with arrow buttons', async ({ page }) => {
    await createKanji(page, VOCAB_KANJI_CHARS.SUN)
    await createKanji(page, VOCAB_KANJI_CHARS.BOOK)
    await createAndNavigateToVocab(page, VOCAB_TEST_WORDS.JAPAN)
    await openBreakdownSection(page)

    // Link first kanji
    await linkKanjiToVocab(page, VOCAB_KANJI_CHARS.SUN)
    await expect(
      page.getByTestId(/vocab-detail-kanji-item-\d/).first()
    ).toContainText(VOCAB_KANJI_CHARS.SUN)

    // Link second kanji
    await linkKanjiToVocab(page, VOCAB_KANJI_CHARS.BOOK)
    await expect(
      page.getByTestId(/vocab-detail-kanji-item-\d/).last()
    ).toContainText(VOCAB_KANJI_CHARS.BOOK)

    // Move second item up
    const secondItem = page.getByTestId(/vocab-detail-kanji-item-\d/).last()
    await secondItem.getByRole('button', { name: /move up/i }).click()

    // Order should be swapped
    await expect(
      page.getByTestId(/vocab-detail-kanji-item-\d/).first()
    ).toContainText(VOCAB_KANJI_CHARS.BOOK)
  })

  test('deletes kanji link in destructive mode', async ({ page }) => {
    await createKanji(page, VOCAB_KANJI_CHARS.RAIN)
    await createAndNavigateToVocab(page, VOCAB_TEST_WORDS.HEAVY_RAIN)
    await openBreakdownSection(page)
    await linkKanjiToVocab(page, VOCAB_KANJI_CHARS.RAIN)
    await expect(page.getByTestId(/vocab-detail-kanji-item-\d/)).toContainText(
      VOCAB_KANJI_CHARS.RAIN
    )

    // Delete button should not be visible yet
    await expect(
      page
        .getByTestId(/vocab-detail-kanji-item-\d/)
        .getByRole('button', { name: /delete/i })
    ).not.toBeVisible()

    // Enable destructive mode
    await page.getByRole('switch', { name: /destructive mode/i }).click()

    // Delete the kanji link
    await page
      .getByTestId(/vocab-detail-kanji-item-\d/)
      .getByRole('button', { name: /delete/i })
      .click()

    // Confirm
    await expect(page.getByRole('dialog')).toBeVisible()
    await page
      .getByRole('dialog')
      .getByRole('button', { name: /delete/i })
      .click()

    // Verify toast
    await expectToast(page, /unlinked/i)

    // Item should be gone
    await expect(
      page.getByTestId(/vocab-detail-kanji-item-\d/)
    ).not.toBeVisible()
  })
})
