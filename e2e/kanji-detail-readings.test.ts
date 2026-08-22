/**
 * E2E Tests for Kanji Detail Readings Section
 */

import { expect, test } from '@playwright/test'

import { createAndNavigateToKanji } from './helpers/test-utils'

test.describe('Kanji Detail Readings', () => {
  test('displays readings section', async ({ page }) => {
    await createAndNavigateToKanji(page, '読')

    await expect(
      page.getByRole('heading', { name: /^readings$/i })
    ).toBeVisible()
  })

  test('opens readings edit dialog', async ({ page }) => {
    await createAndNavigateToKanji(page, '書')

    const section = page.getByTestId('kanji-detail-readings')
    await section.getByRole('button', { name: /edit/i }).click()

    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(
      page.getByRole('heading', { name: /edit readings/i })
    ).toBeVisible()
  })

  test('adds on-yomi reading', async ({ page }) => {
    await createAndNavigateToKanji(page, '音')

    const section = page.getByTestId('kanji-detail-readings')
    await section.getByRole('button', { name: /edit/i }).click()

    // Find On-yomi section by testid
    const onSection = page.getByTestId('on-reading-section')

    // Click the "+ Add" button in On-yomi section
    await onSection.getByRole('button', { name: /\+ add/i }).click()

    // Fill the new reading
    const readingInputs = page.getByPlaceholder(/^Reading$/i)
    await readingInputs.last().fill('オン')

    // Save
    await page.getByRole('button', { name: /^save$/i }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Verify displayed
    await expect(section.getByText('オン')).toBeVisible()
  })

  test('adds kun-yomi reading with okurigana', async ({ page }) => {
    await createAndNavigateToKanji(page, '訓')

    const section = page.getByTestId('kanji-detail-readings')
    await section.getByRole('button', { name: /edit/i }).click()

    // Find Kun-yomi section by testid
    const kunSection = page.getByTestId('kun-reading-section')

    // Click the "+ Add" button in Kun-yomi section
    await kunSection.getByRole('button', { name: /\+ add/i }).click()

    // Fill the new reading
    const readingInputs = kunSection.getByPlaceholder(/^Reading$/i)
    await readingInputs.last().fill('よ')

    // Fill okurigana
    const okuriganaInputs = kunSection.getByPlaceholder(/Okurigana/i)
    await okuriganaInputs.last().fill('む')

    // Save
    await page.getByRole('button', { name: /^save$/i }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Verify displayed (kun readings show with dot separator)
    await expect(section.getByText(/よ/)).toBeVisible()
  })

  test('deletes reading only in destructive mode', async ({ page }) => {
    await createAndNavigateToKanji(page, '除')

    // Enable destructive mode
    await page.getByRole('switch', { name: /destructive mode/i }).click()

    const section = page.getByTestId('kanji-detail-readings')
    await section.getByRole('button', { name: /edit/i }).click()

    // Add a reading first
    const onSection = page.getByTestId('on-reading-section')

    await onSection.getByRole('button', { name: /\+ add/i }).click()
    const readingInputs = page.getByPlaceholder(/^Reading$/i)
    await readingInputs.last().fill('ジョ')

    // Verify delete button is visible (destructive mode is on)
    const deleteButtons = page.getByRole('button', { name: /delete reading/i })
    await expect(deleteButtons.first()).toBeVisible()

    // Click delete
    await deleteButtons.last().click()

    // Verify reading input was removed (no reading inputs remain)
    await expect(page.getByPlaceholder(/^Reading$/i)).toHaveCount(0)

    // Save
    await page.getByRole('button', { name: /^save$/i }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })

  test('hides delete buttons when destructive mode off', async ({ page }) => {
    await createAndNavigateToKanji(page, '隠')

    const section = page.getByTestId('kanji-detail-readings')
    await section.getByRole('button', { name: /edit/i }).click()

    // Add a reading
    const onSection = page.getByTestId('on-reading-section')

    await onSection.getByRole('button', { name: /\+ add/i }).click()
    await page
      .getByPlaceholder(/^Reading$/i)
      .last()
      .fill('イン')

    // Verify delete button is NOT visible (destructive mode is off)
    const deleteButtons = page.getByRole('button', { name: /delete reading/i })
    await expect(deleteButtons).toHaveCount(0)

    // Cancel
    await page.getByRole('button', { name: /cancel/i }).click()
  })

  test('moves reading up and down', async ({ page }) => {
    await createAndNavigateToKanji(page, '動')

    const section = page.getByTestId('kanji-detail-readings')
    await section.getByRole('button', { name: /edit/i }).click()

    // Add two readings
    const onSection = page.getByTestId('on-reading-section')

    await onSection.getByRole('button', { name: /\+ add/i }).click()
    await onSection.getByRole('button', { name: /\+ add/i }).click()

    const readingInputs = onSection.getByPlaceholder(/^Reading$/i)
    await readingInputs.nth(-2).fill('ドウ')
    await readingInputs.nth(-1).fill('トウ')

    // Click move down on first reading
    const moveDownButtons = onSection.getByRole('button', {
      name: /move down/i
    })
    await moveDownButtons.nth(-2).click()

    // Verify order changed
    const inputsAfterMove = onSection.getByPlaceholder(/^Reading$/i)
    await expect(inputsAfterMove.nth(-2)).toHaveValue('トウ')
    await expect(inputsAfterMove.nth(-1)).toHaveValue('ドウ')

    // Cancel
    await page.getByRole('button', { name: /cancel/i }).click()
  })
})
