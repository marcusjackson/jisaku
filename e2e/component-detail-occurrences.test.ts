/**
 * E2E Tests for Component Detail Kanji Occurrences Section
 */

import { expect, test } from '@playwright/test'

import { TIMEOUTS } from './helpers/test-constants'
import { createAndNavigateToComponent, expectToast } from './helpers/test-utils'

import type { Page } from '@playwright/test'

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
 * Helper to open the occurrences section
 */
async function openOccurrencesSection(page: Page): Promise<void> {
  const section = page.getByTestId('component-detail-occurrences')
  const state = await section.getAttribute('data-state')
  if (state === 'closed') {
    await section.getByRole('button', { name: /kanji occurrences/i }).click()
    await expect(section).toHaveAttribute('data-state', 'open')
  }
}

/**
 * Helper to link a kanji to the current component
 */
async function linkKanjiToComponent(
  page: Page,
  character: string
): Promise<void> {
  await page.getByRole('button', { name: /add kanji/i }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  // Click on the Search Kanji label to open the combobox
  await page.getByText('Search Kanji').click()
  // Fill in the search
  const combobox = page.getByRole('combobox', { name: /search kanji/i })
  await combobox.fill(character)
  // Wait for the option to appear
  await expect(
    page.getByRole('option').filter({ hasText: character }).first()
  ).toBeVisible()
  // Click the option
  await page.getByRole('option').filter({ hasText: character }).first().click()
  // Wait for dialog to close
  await expect(page.getByRole('dialog')).not.toBeVisible({
    timeout: TIMEOUTS.medium
  })
}
test.describe('Component Detail Kanji Occurrences', () => {
  test('displays occurrences section', async ({ page }) => {
    await createAndNavigateToComponent(page, '氵')
    await expect(page.getByTestId('component-detail-occurrences')).toBeVisible()
    await expect(
      page.getByRole('button', { name: /kanji occurrences/i })
    ).toBeVisible()
  })
  test('shows empty state when no kanji linked', async ({ page }) => {
    await createAndNavigateToComponent(page, '亻')
    await openOccurrencesSection(page)
    await expect(page.getByText(/no kanji linked yet/i)).toBeVisible()
  })
  test('opens add kanji dialog', async ({ page }) => {
    await createAndNavigateToComponent(page, '扌')
    await openOccurrencesSection(page)
    await page.getByRole('button', { name: /add kanji/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Add Kanji' })).toBeVisible()
  })

  test('links existing kanji to component', async ({ page }) => {
    // First create a kanji
    await createKanji(page, '海')
    // Navigate to component
    await createAndNavigateToComponent(page, '氵')
    await openOccurrencesSection(page)
    // Add kanji
    await linkKanjiToComponent(page, '海')
    // Verify toast appears
    await expectToast(page, /linked/i)
    // Verify kanji appears in list
    await expect(page.getByTestId(/occurrence-item/)).toContainText('海')
  })

  test('quick creates kanji and links to component', async ({ page }) => {
    await createAndNavigateToComponent(page, '木')
    await openOccurrencesSection(page)
    // Open add dialog
    await page.getByRole('button', { name: /add kanji/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    // Type a character that doesn't exist
    const searchInput = page.getByPlaceholder('Type to search...')
    await searchInput.fill('杏')
    // Wait for dropdown and click Create New button
    await page.getByRole('button', { name: /create new/i }).click()
    // Quick create dialog should appear
    await expect(
      page.getByRole('heading', { name: 'Quick Create Kanji' })
    ).toBeVisible()
    // Character should be pre-filled
    await expect(page.getByLabel(/character/i)).toHaveValue('杏')
    // Fill meaning
    await page.getByLabel(/short meaning/i).fill('apricot')
    // Submit
    await page.getByRole('button', { name: /^create$/i }).click()
    // Verify toast
    await expectToast(page, /created and linked/i)
    // Verify kanji appears in list
    await expect(page.getByTestId(/occurrence-item/)).toContainText('杏')
  })

  test('navigates to kanji detail when kanji clicked', async ({ page }) => {
    // Create kanji and component
    await createKanji(page, '池')
    await createAndNavigateToComponent(page, '氵')
    await openOccurrencesSection(page)
    // Link kanji
    await linkKanjiToComponent(page, '池')
    // Wait for item to appear
    await expect(page.getByTestId(/occurrence-item/)).toContainText('池')
    // Click on the kanji link
    await page
      .getByTestId(/occurrence-item/)
      .locator('a')
      .first()
      .click()
    // Should navigate to kanji detail
    await page.waitForURL(/\/kanji\/\d+$/)
    await expect(page.getByText('池', { exact: true }).first()).toBeVisible()
  })

  test('edits occurrence metadata', async ({ page }) => {
    // Create kanji and link
    await createKanji(page, '汁')
    await createAndNavigateToComponent(page, '氵')
    await openOccurrencesSection(page)
    await linkKanjiToComponent(page, '汁')
    // Wait for item
    await expect(page.getByTestId(/occurrence-item/)).toContainText('汁')
    // Open edit dialog
    await page
      .getByTestId(/occurrence-item/)
      .getByRole('button', { name: /edit/i })
      .click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'Edit Occurrence' })
    ).toBeVisible()
    // Toggle radical
    await page.getByRole('switch', { name: /radical/i }).click()
    // Add notes
    await page.getByLabel(/notes/i).fill('Water component on left side')
    // Save
    await page.getByRole('button', { name: /save/i }).click()
    // Verify toast
    await expectToast(page, /updated/i)
    // Verify radical badge appears
    await expect(page.getByTestId(/occurrence-item/)).toContainText('Radical')
  })

  test('shows more/less toggle for long analysis notes', async ({ page }) => {
    // Create kanji and link
    await createKanji(page, '河')
    await createAndNavigateToComponent(page, '氵')
    await openOccurrencesSection(page)
    await linkKanjiToComponent(page, '河')
    // Wait for item
    await expect(page.getByTestId(/occurrence-item/)).toContainText('河')
    // Open edit dialog and add long notes
    await page
      .getByTestId(/occurrence-item/)
      .getByRole('button', { name: /edit/i })
      .click()
    await expect(page.getByRole('dialog')).toBeVisible()
    // Add notes longer than 100 characters
    const longNotes =
      'This is a very long analysis note that exceeds one hundred characters and should trigger the show more/less toggle button in the UI'
    await page.getByLabel(/notes/i).fill(longNotes)
    await page.getByRole('button', { name: /save/i }).click()
    // Wait for dialog to close and toast
    await expectToast(page, /updated/i)
    // Verify truncated text is displayed initially
    const occurrenceItem = page.getByTestId(/occurrence-item/)
    await expect(occurrenceItem).toContainText('This is a very long')
    await expect(occurrenceItem).not.toContainText('toggle button in the UI')
    // Verify show more button exists
    await expect(
      occurrenceItem.getByRole('button', { name: /show more/i })
    ).toBeVisible()
    // Click show more
    await occurrenceItem.getByRole('button', { name: /show more/i }).click()
    // Verify full text is displayed
    await expect(occurrenceItem).toContainText('toggle button in the UI')
    // Verify show less button exists
    await expect(
      occurrenceItem.getByRole('button', { name: /show less/i })
    ).toBeVisible()
    // Click show less
    await occurrenceItem.getByRole('button', { name: /show less/i }).click()
    // Verify truncated text is back
    await expect(occurrenceItem).toContainText('This is a very long')
    await expect(occurrenceItem).not.toContainText('toggle button in the UI')
    await expect(
      occurrenceItem.getByRole('button', { name: /show more/i })
    ).toBeVisible()
  })

  test('deletes occurrence in destructive mode', async ({ page }) => {
    // Create kanji and link
    await createKanji(page, '沢')
    await createAndNavigateToComponent(page, '氵')
    await openOccurrencesSection(page)
    await linkKanjiToComponent(page, '沢')
    await expect(page.getByTestId(/occurrence-item/)).toContainText('沢')
    // Delete button should not be visible
    await expect(
      page
        .getByTestId(/occurrence-item/)
        .getByRole('button', { name: /delete/i })
    ).not.toBeVisible()
    // Enable destructive mode
    await page.getByRole('switch', { name: /destructive mode/i }).click()
    // Delete the occurrence
    await page
      .getByTestId(/occurrence-item/)
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
    // Occurrence should be gone
    await expect(page.getByTestId(/occurrence-item/)).not.toBeVisible()
  })

  test('reorders occurrences with arrow buttons', async ({ page }) => {
    // Create two kanji and link them
    await createKanji(page, '波')
    await createKanji(page, '洗')
    await createAndNavigateToComponent(page, '氵')
    await openOccurrencesSection(page)
    // Link first kanji
    await linkKanjiToComponent(page, '波')
    await expect(page.getByTestId(/occurrence-item/).first()).toContainText(
      '波'
    )
    // Link second kanji
    await linkKanjiToComponent(page, '洗')
    await expect(page.getByTestId(/occurrence-item/).last()).toContainText('洗')
    // First item should have disabled up button
    const firstItem = page.getByTestId(/occurrence-item/).first()
    const secondItem = page.getByTestId(/occurrence-item/).last()
    await expect(
      firstItem.getByRole('button', { name: /move up/i })
    ).toBeDisabled()
    await expect(
      secondItem.getByRole('button', { name: /move down/i })
    ).toBeDisabled()
    // Move second item up
    await secondItem.getByRole('button', { name: /move up/i }).click()
    // Order should be swapped
    await expect(page.getByTestId(/occurrence-item/).first()).toContainText(
      '洗'
    )
  })

  test('occurrences persist after page reload', async ({ page }) => {
    // Create kanji and link
    await createKanji(page, '流')
    const url = await createAndNavigateToComponent(page, '氵')
    await openOccurrencesSection(page)
    await linkKanjiToComponent(page, '流')
    await expect(page.getByTestId(/occurrence-item/)).toContainText('流')
    // Reload
    await page.goto(url)
    await expect(page.getByTestId('component-detail-occurrences')).toBeVisible()
    // Verify occurrence persisted
    await expect(page.getByTestId(/occurrence-item/)).toContainText('流')
  })
})
