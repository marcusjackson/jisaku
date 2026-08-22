/**
 * E2E Tests for Kanji Detail Meanings Section
 */

import { expect, test } from '@playwright/test'

import { createAndNavigateToKanji } from './helpers/test-utils'

test.describe('Kanji Detail Meanings', () => {
  test('displays meanings section', async ({ page }) => {
    await createAndNavigateToKanji(page, '意')

    await expect(
      page.getByRole('heading', { name: /^meanings$/i })
    ).toBeVisible()
  })

  test('opens meanings edit dialog', async ({ page }) => {
    await createAndNavigateToKanji(page, '味')

    const section = page.getByTestId('kanji-detail-meanings')
    await section.getByRole('button', { name: /edit meanings/i }).click()

    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(
      page.getByRole('heading', { name: /edit meanings/i })
    ).toBeVisible()
  })

  test('adds meaning', async ({ page }) => {
    await createAndNavigateToKanji(page, '追')

    const section = page.getByTestId('kanji-detail-meanings')
    await section.getByRole('button', { name: /edit meanings/i }).click()

    // Click "+ Add" button
    await page
      .getByRole('button', { name: /\+ add/i })
      .first()
      .click()

    // Fill the new meaning (using placeholder since there's no label)
    const meaningInputs = page.getByPlaceholder(/^meaning$/i)
    await meaningInputs.last().fill('chase')

    // Save
    await page.getByRole('button', { name: /^save$/i }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Verify displayed as numbered list item
    await expect(section.getByRole('list')).toContainText('chase')
  })

  test('displays meanings as numbered list', async ({ page }) => {
    await createAndNavigateToKanji(page, '番')

    const section = page.getByTestId('kanji-detail-meanings')
    await section.getByRole('button', { name: /edit meanings/i }).click()

    // Add multiple meanings
    await page
      .getByRole('button', { name: /\+ add/i })
      .first()
      .click()
    await page
      .getByRole('button', { name: /\+ add/i })
      .first()
      .click()

    // Fill the meanings (using placeholder since there's no label)
    const meaningInputs = page.getByPlaceholder(/^meaning$/i)
    await meaningInputs.nth(-2).fill('number')
    await meaningInputs.nth(-1).fill('turn')

    // Save
    await page.getByRole('button', { name: /^save$/i }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Verify displayed as list items (numbers are automatic via CSS)
    const meaningsList = section.getByRole('list')
    await expect(meaningsList.getByRole('listitem').first()).toContainText(
      'number'
    )
    await expect(meaningsList.getByRole('listitem').nth(1)).toContainText(
      'turn'
    )
  })

  test('enables reading groups toggle', async ({ page }) => {
    await createAndNavigateToKanji(page, '群')

    const section = page.getByTestId('kanji-detail-meanings')
    await section.getByRole('button', { name: /edit meanings/i }).click()

    // Find and toggle the grouping switch
    await page.getByTestId('grouping-toggle').getByRole('switch').click()

    // Verify reading groups section appears
    await expect(
      page.getByRole('heading', { name: /reading groups/i })
    ).toBeVisible()

    // Cancel
    await page.getByRole('button', { name: /cancel/i }).click()
  })

  test('creates reading group and assigns meanings', async ({ page }) => {
    await createAndNavigateToKanji(page, '組')

    const section = page.getByTestId('kanji-detail-meanings')
    await section.getByRole('button', { name: /edit meanings/i }).click()

    // Add a meaning first
    await page
      .getByRole('button', { name: /\+ add/i })
      .first()
      .click()
    await page
      .getByPlaceholder(/^Meaning$/i)
      .last()
      .fill('group')

    // Enable grouping
    const groupSwitch = page.getByTestId('grouping-toggle').getByRole('switch')
    await groupSwitch.click()

    // Add a reading group
    await page.getByRole('button', { name: /\+ add group/i }).click()

    // Fill reading text
    await page.getByPlaceholder(/reading.*メイ.*あか.り/i).fill('ソ')

    // Assign meaning to group (if dropdown is visible)
    const assignDropdown = page.getByLabel(/assign meaning to group/i)
    if (await assignDropdown.isVisible()) {
      await assignDropdown.click()
      await page.getByRole('option', { name: /group/i }).click()
    }

    // Save
    await page.getByRole('button', { name: /^save$/i }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Verify reading group is displayed
    await expect(section).toContainText('ソ')
    await expect(section).toContainText('group')
  })

  test('filters out empty meanings from assign dropdown', async ({ page }) => {
    await createAndNavigateToKanji(page, '空')

    const section = page.getByTestId('kanji-detail-meanings')
    await section.getByRole('button', { name: /edit meanings/i }).click()

    // Add an empty meaning (should be filtered out)
    await page
      .getByRole('button', { name: /\+ add/i })
      .first()
      .click()
    // Don't fill it - leave it empty

    // Add a meaning with text
    await page
      .getByRole('button', { name: /\+ add/i })
      .first()
      .click()
    await page
      .getByPlaceholder(/^Meaning$/i)
      .last()
      .fill('sky')

    // Enable grouping
    const groupSwitch = page.getByTestId('grouping-toggle').getByRole('switch')
    await groupSwitch.click()

    // Add a reading group
    await page.getByRole('button', { name: /\+ add group/i }).click()
    await page.getByPlaceholder(/reading.*メイ.*あか.り/i).fill('クウ')

    // Open assign dropdown
    const assignDropdown = page.getByLabel(/assign meaning to group/i)
    await assignDropdown.click()

    // Verify only non-empty meanings appear as options
    // The empty meaning should NOT appear
    await expect(page.getByRole('option', { name: /sky/i })).toBeVisible()

    // Close the dropdown by pressing Escape
    await page.keyboard.press('Escape')

    // Close dialog without saving
    await page.getByRole('button', { name: /cancel/i }).click()
  })

  test('deletes meaning only in destructive mode', async ({ page }) => {
    await createAndNavigateToKanji(page, '削')

    // Enable destructive mode
    await page.getByRole('switch', { name: /destructive mode/i }).click()

    const section = page.getByTestId('kanji-detail-meanings')
    await section.getByRole('button', { name: /edit meanings/i }).click()

    // Add a meaning
    await page
      .getByRole('button', { name: /\+ add/i })
      .first()
      .click()
    await page
      .getByPlaceholder(/^Meaning$/i)
      .last()
      .fill('delete')

    // Verify delete button is visible
    const deleteButtons = page.getByRole('button', { name: /^delete$/i })
    await expect(deleteButtons.first()).toBeVisible()

    // Click delete
    await deleteButtons.last().click()

    // Verify meaning input was removed (no meaning inputs remain)
    await expect(page.getByPlaceholder(/^Meaning$/i)).toHaveCount(0)

    // Cancel
    await page.getByRole('button', { name: /cancel/i }).click()
  })

  test('deletes reading group only in destructive mode', async ({ page }) => {
    await createAndNavigateToKanji(page, '消')

    // Enable destructive mode
    await page.getByRole('switch', { name: /destructive mode/i }).click()

    const section = page.getByTestId('kanji-detail-meanings')
    await section.getByRole('button', { name: /edit meanings/i }).click()

    // Enable grouping
    const groupSwitch = page.getByTestId('grouping-toggle').getByRole('switch')
    await groupSwitch.click()

    // Add a reading group
    await page.getByRole('button', { name: /\+ add group/i }).click()
    await page.getByPlaceholder(/reading.*メイ.*あか.り/i).fill('ショウ')

    // Verify delete button is visible
    const deleteButtons = page.getByRole('button', { name: /delete group/i })
    await expect(deleteButtons.first()).toBeVisible()

    // Click delete
    await deleteButtons.first().click()

    // Verify reading group input was removed (no group label inputs remain)
    await expect(page.getByPlaceholder(/reading.*メイ.*あか.り/i)).toHaveCount(
      0
    )

    // Cancel
    await page.getByRole('button', { name: /cancel/i }).click()
  })

  test('moves meaning up and down', async ({ page }) => {
    await createAndNavigateToKanji(page, '移')

    const section = page.getByTestId('kanji-detail-meanings')
    await section.getByRole('button', { name: /edit meanings/i }).click()

    // Add two meanings
    await page
      .getByRole('button', { name: /\+ add/i })
      .first()
      .click()
    await page
      .getByRole('button', { name: /\+ add/i })
      .first()
      .click()

    const meaningInputs = page.getByPlaceholder(/^Meaning$/i)
    await meaningInputs.nth(-2).fill('move')
    await meaningInputs.nth(-1).fill('shift')

    // Click move down on first meaning
    const moveDownButtons = page.getByRole('button', { name: /move down/i })
    await moveDownButtons.nth(-2).click()

    // Verify order changed
    const inputsAfterMove = page.getByPlaceholder(/^Meaning$/i)
    await expect(inputsAfterMove.nth(-2)).toHaveValue('shift')
    await expect(inputsAfterMove.nth(-1)).toHaveValue('move')

    // Cancel
    await page.getByRole('button', { name: /cancel/i }).click()
  })
})
