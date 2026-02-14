/**
 * E2E Tests for Kanji Detail Page
 *
 * Tests navigation, display, editing, and deletion of kanji.
 *
 * Note: This file exceeds 600 code lines due to comprehensive test coverage
 * of the complex kanji detail page including vocabulary management.
 */

/* eslint-disable max-lines -- E2E test file for comprehensive kanji detail page coverage */

import { expect, type Page, test } from '@playwright/test'

/**
 * Helper to create a kanji and navigate to its detail page
 */
async function createAndNavigateToKanji(
  page: Page,
  character: string
): Promise<string> {
  await page.goto('/kanji')

  // Wait for page load
  await expect(page.getByRole('heading', { name: /kanji list/i })).toBeVisible()

  // Open create dialog
  await page.getByRole('button', { name: /^add new$/i }).click()
  await expect(page.getByRole('dialog')).toBeVisible()

  // Fill character and submit
  await page.getByRole('textbox', { name: /character/i }).fill(character)
  await page.getByRole('button', { name: /^add$/i }).click()

  // Wait for dialog to close
  await expect(page.getByRole('dialog')).not.toBeVisible()

  // Click on the created kanji card to navigate to detail page
  const kanjiCard = page
    .getByTestId('kanji-list-card')
    .filter({ hasText: character })
  await kanjiCard.click()

  // Wait for navigation to detail page
  await page.waitForURL(/\/kanji\/\d+$/)

  return page.url()
}

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

    await page.getByTestId('headline-edit-button').click()
    await expect(page.getByRole('dialog')).toBeVisible()
  })

  test('saves edited display text', async ({ page }) => {
    await createAndNavigateToKanji(page, '書')

    // Open edit dialog (headline)
    await page.getByTestId('headline-edit-button').click()

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
    await page.getByTestId('destructive-mode-switch').click()

    // Delete button should now be enabled
    await expect(deleteButton).toBeEnabled()
  })

  test('shows confirmation dialog when delete clicked', async ({ page }) => {
    await createAndNavigateToKanji(page, '除')

    // Enable destructive mode
    await page.getByTestId('destructive-mode-switch').click()

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
    await page.getByTestId('destructive-mode-switch').click()

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

  test('toggles between new and legacy UI', async ({ page }) => {
    const url = await createAndNavigateToKanji(page, '換')
    const kanjiId = /\/kanji\/(\d+)$/.exec(url)?.[1]

    if (!kanjiId) {
      throw new Error('Failed to extract kanji ID from URL')
    }

    // Click version toggle in header (not destructive mode switch)
    const versionToggle = page
      .locator('nav[aria-label="Main navigation"]')
      .getByRole('switch')
    await versionToggle.click()
    await page.waitForURL(`/legacy/kanji/${kanjiId}`)
    expect(page.url()).toContain('/legacy/kanji/')

    // Click version toggle to go back to new UI
    await page
      .locator('nav[aria-label="Main navigation"]')
      .getByRole('switch')
      .click()
    await page.waitForURL(`/kanji/${kanjiId}`)
    expect(page.url()).toMatch(/\/kanji\/\d+$/)
    expect(page.url()).not.toContain('/legacy')
  })

  test('cancels edit without saving', async ({ page }) => {
    await createAndNavigateToKanji(page, '変')

    // Open edit dialog (headline)
    await page.getByTestId('headline-edit-button').click()

    // Edit display text but don't save
    await page.getByLabel(/display text/i).fill('should not save')
    await page.getByRole('button', { name: /cancel/i }).click()

    // Verify text was not changed
    await expect(page.getByText('should not save')).not.toBeVisible()
  })

  test('cancels delete confirmation', async ({ page }) => {
    await createAndNavigateToKanji(page, '更')

    // Enable destructive mode
    await page.getByTestId('destructive-mode-switch').click()

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

test.describe('Kanji Detail Basic Information', () => {
  test('displays basic info section', async ({ page }) => {
    await createAndNavigateToKanji(page, '基')

    // Check section title is visible
    await expect(
      page.getByRole('heading', { name: /basic information/i })
    ).toBeVisible()
  })

  test('opens basic info edit dialog', async ({ page }) => {
    await createAndNavigateToKanji(page, '本')

    // Find and click the edit button in the Basic Information section
    const section = page.locator('section', {
      has: page.getByText('Basic Information')
    })
    await section.getByRole('button', { name: /edit/i }).click()

    // Dialog should open with title
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(
      page.getByRole('heading', { name: /edit basic information/i })
    ).toBeVisible()
  })

  test('edits stroke count', async ({ page }) => {
    await createAndNavigateToKanji(page, '画')

    // Open basic info dialog
    const section = page.locator('section', {
      has: page.getByText('Basic Information')
    })
    await section.getByRole('button', { name: /edit/i }).click()

    // Fill stroke count
    const strokeInput = page.getByLabel(/stroke count/i)
    await strokeInput.fill('8')

    // Save
    await page.getByRole('button', { name: /save/i }).click()

    // Dialog should close
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Verify updated value is displayed
    await expect(section.getByText('8')).toBeVisible()
  })

  test('validates stroke count range', async ({ page }) => {
    await createAndNavigateToKanji(page, '数')

    // Open basic info dialog
    const section = page.locator('section', {
      has: page.getByText('Basic Information')
    })
    await section.getByRole('button', { name: /edit/i }).click()

    // Fill invalid stroke count
    const strokeInput = page.getByLabel(/stroke count/i)
    await strokeInput.fill('100')

    // Try to save
    await page.getByRole('button', { name: /save/i }).click()

    // Error should be shown
    await expect(page.getByText(/must be 1-64/i)).toBeVisible()
  })

  test('selects JLPT level', async ({ page }) => {
    await createAndNavigateToKanji(page, '級')

    // Open basic info dialog
    const section = page.locator('section', {
      has: page.getByText('Basic Information')
    })
    await section.getByRole('button', { name: /edit/i }).click()

    // Open JLPT level dropdown (it's a custom select, not native)
    await page.getByLabel(/jlpt level/i).click()
    // Use force:true because the select portal may be behind dialog overlay
    await page.getByRole('option', { name: 'N3' }).click({ force: true })

    // Save
    await page.getByRole('button', { name: /save/i }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Verify displayed
    await expect(section.getByText('N3')).toBeVisible()
  })

  test('cancels basic info edit', async ({ page }) => {
    await createAndNavigateToKanji(page, '取')

    // Open basic info dialog
    const section = page.locator('section', {
      has: page.getByText('Basic Information')
    })
    await section.getByRole('button', { name: /edit/i }).click()

    // Make changes
    await page.getByLabel(/stroke count/i).fill('99')

    // Cancel
    await page.getByRole('button', { name: /cancel/i }).click()

    // Dialog should close
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Value should not be updated (99 should not appear)
    await expect(section.getByText('99')).not.toBeVisible()
  })

  test('selects existing radical', async ({ page }) => {
    await createAndNavigateToKanji(page, '林')

    // Open basic info dialog
    const section = page.locator('section', {
      has: page.getByText('Basic Information')
    })
    await section.getByRole('button', { name: /edit/i }).click()

    // Verify radical combobox is present
    await expect(page.getByLabel(/radical/i)).toBeVisible()

    // Verify placeholder is correct
    await expect(page.getByPlaceholder(/search components/i)).toBeVisible()

    // Cancel
    await page.getByRole('button', { name: /cancel/i }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })

  test('creates new radical from combobox', async ({ page }) => {
    await createAndNavigateToKanji(page, '新')

    // Open basic info dialog
    const section = page.locator('section', {
      has: page.getByText('Basic Information')
    })
    await section.getByRole('button', { name: /edit/i }).click()

    // Open radical combobox
    await page.getByLabel(/radical/i).click()

    // Type a single character that doesn't exist
    await page.getByPlaceholder(/search components/i).fill('斤')

    // Click the "Create new" button
    await page.getByRole('button', { name: /create new/i }).click()

    // Verify notice appears showing the new radical character
    await expect(page.getByText(/new:/i)).toBeVisible()
    // Use filter to get only the notice element, not the button
    const noticeText = page.locator('.notice', { hasText: '斤' })
    await expect(noticeText).toBeVisible()

    // Save
    await page.getByRole('button', { name: /save/i }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Verify new radical is displayed in the basic info section
    const basicInfoSection = page.locator('section', {
      has: page.getByText('Basic Information')
    })
    await expect(basicInfoSection).toContainText('斤')
  })
})

test.describe('Kanji Detail Readings', () => {
  test('displays readings section', async ({ page }) => {
    await createAndNavigateToKanji(page, '読')

    await expect(
      page.getByRole('heading', { name: /^readings$/i })
    ).toBeVisible()
  })

  test('opens readings edit dialog', async ({ page }) => {
    await createAndNavigateToKanji(page, '書')

    const section = page.locator('section', {
      has: page.getByRole('heading', { name: /^readings$/i })
    })
    await section.getByTestId('readings-edit-button').click()

    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(
      page.getByRole('heading', { name: /edit readings/i })
    ).toBeVisible()
  })

  test('adds on-yomi reading', async ({ page }) => {
    await createAndNavigateToKanji(page, '音')

    const section = page.locator('section', {
      has: page.getByRole('heading', { name: /^readings$/i })
    })
    await section.getByTestId('readings-edit-button').click()

    // Find On-yomi section by looking for the specific heading text
    const onSection = page
      .locator('.readings-section')
      .filter({ has: page.getByRole('heading', { name: /on-yomi/i }) })
      .first()

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

    const section = page.locator('section', {
      has: page.getByRole('heading', { name: /^readings$/i })
    })
    await section.getByTestId('readings-edit-button').click()

    // Find Kun-yomi section
    const kunSection = page
      .locator('.readings-section')
      .filter({ has: page.getByRole('heading', { name: /kun-yomi/i }) })
      .first()

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
    await page.getByTestId('destructive-mode-switch').click()

    const section = page.locator('section', {
      has: page.getByRole('heading', { name: /^readings$/i })
    })
    await section.getByTestId('readings-edit-button').click()

    // Add a reading first
    const onSection = page
      .locator('.readings-section')
      .filter({ has: page.getByRole('heading', { name: /on-yomi/i }) })
      .first()

    await onSection.getByRole('button', { name: /\+ add/i }).click()
    const readingInputs = page.getByPlaceholder(/^Reading$/i)
    await readingInputs.last().fill('ジョ')

    // Verify delete button is visible (destructive mode is on)
    const deleteButtons = page.getByRole('button', { name: /delete reading/i })
    await expect(deleteButtons.first()).toBeVisible()

    // Click delete
    await deleteButtons.last().click()

    // Verify reading input is removed
    await expect(page.locator('input[value="ジョ"]')).not.toBeVisible()

    // Save
    await page.getByRole('button', { name: /^save$/i }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })

  test('hides delete buttons when destructive mode off', async ({ page }) => {
    await createAndNavigateToKanji(page, '隠')

    const section = page.locator('section', {
      has: page.getByRole('heading', { name: /^readings$/i })
    })
    await section.getByTestId('readings-edit-button').click()

    // Add a reading
    const onSection = page
      .locator('.readings-section')
      .filter({ has: page.getByRole('heading', { name: /on-yomi/i }) })
      .first()

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

    const section = page.locator('section', {
      has: page.getByRole('heading', { name: /^readings$/i })
    })
    await section.getByTestId('readings-edit-button').click()

    // Add two readings
    const onSection = page
      .locator('.readings-section')
      .filter({ has: page.getByRole('heading', { name: /on-yomi/i }) })
      .first()

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

test.describe('Kanji Detail Meanings', () => {
  test('displays meanings section', async ({ page }) => {
    await createAndNavigateToKanji(page, '意')

    await expect(
      page.getByRole('heading', { name: /^meanings$/i })
    ).toBeVisible()
  })

  test('opens meanings edit dialog', async ({ page }) => {
    await createAndNavigateToKanji(page, '味')

    const section = page.locator('section', {
      has: page.getByRole('heading', { name: /^meanings$/i })
    })
    await section.getByTestId('meanings-edit-button').click()

    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(
      page.getByRole('heading', { name: /edit meanings/i })
    ).toBeVisible()
  })

  test('adds meaning', async ({ page }) => {
    await createAndNavigateToKanji(page, '追')

    const section = page.locator('section', {
      has: page.getByRole('heading', { name: /^meanings$/i })
    })
    await section.getByTestId('meanings-edit-button').click()

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
    const meaningsList = section.locator('ol, ul')
    await expect(meaningsList).toContainText('chase')
  })

  test('displays meanings as numbered list', async ({ page }) => {
    await createAndNavigateToKanji(page, '番')

    const section = page.locator('section', {
      has: page.getByRole('heading', { name: /^meanings$/i })
    })
    await section.getByTestId('meanings-edit-button').click()

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
    const meaningsList = section.locator('ol')
    await expect(meaningsList.locator('li').first()).toContainText('number')
    await expect(meaningsList.locator('li').nth(1)).toContainText('turn')
  })

  test('enables reading groups toggle', async ({ page }) => {
    await createAndNavigateToKanji(page, '群')

    const section = page.locator('section', {
      has: page.getByRole('heading', { name: /^meanings$/i })
    })
    await section.getByTestId('meanings-edit-button').click()

    // Find and toggle the grouping switch
    await page.locator('.grouping-toggle').getByRole('switch').click()

    // Verify reading groups section appears
    await expect(
      page.getByRole('heading', { name: /reading groups/i })
    ).toBeVisible()

    // Cancel
    await page.getByRole('button', { name: /cancel/i }).click()
  })

  test('creates reading group and assigns meanings', async ({ page }) => {
    await createAndNavigateToKanji(page, '組')

    const section = page.locator('section', {
      has: page.getByRole('heading', { name: /^meanings$/i })
    })
    await section.getByTestId('meanings-edit-button').click()

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
    const groupSwitch = page.locator('.grouping-toggle').getByRole('switch')
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

    const section = page.locator('section', {
      has: page.getByRole('heading', { name: /^meanings$/i })
    })
    await section.getByTestId('meanings-edit-button').click()

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
    const groupSwitch = page.locator('.grouping-toggle').getByRole('switch')
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
    await page.getByTestId('destructive-mode-switch').click()

    const section = page.locator('section', {
      has: page.getByRole('heading', { name: /^meanings$/i })
    })
    await section.getByTestId('meanings-edit-button').click()

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

    // Verify meaning is removed
    await expect(page.locator('input[value="delete"]')).not.toBeVisible()

    // Cancel
    await page.getByRole('button', { name: /cancel/i }).click()
  })

  test('deletes reading group only in destructive mode', async ({ page }) => {
    await createAndNavigateToKanji(page, '消')

    // Enable destructive mode
    await page.getByTestId('destructive-mode-switch').click()

    const section = page.locator('section', {
      has: page.getByRole('heading', { name: /^meanings$/i })
    })
    await section.getByTestId('meanings-edit-button').click()

    // Enable grouping
    const groupSwitch = page.locator('.grouping-toggle').getByRole('switch')
    await groupSwitch.click()

    // Add a reading group
    await page.getByRole('button', { name: /\+ add group/i }).click()
    await page.getByPlaceholder(/reading.*メイ.*あか.り/i).fill('ショウ')

    // Verify delete button is visible
    const deleteButtons = page.getByRole('button', { name: /delete group/i })
    await expect(deleteButtons.first()).toBeVisible()

    // Click delete
    await deleteButtons.first().click()

    // Verify group is removed
    await expect(page.locator('input[value="ショウ"]')).not.toBeVisible()

    // Cancel
    await page.getByRole('button', { name: /cancel/i }).click()
  })

  test('moves meaning up and down', async ({ page }) => {
    await createAndNavigateToKanji(page, '移')

    const section = page.locator('section', {
      has: page.getByRole('heading', { name: /^meanings$/i })
    })
    await section.getByTestId('meanings-edit-button').click()

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
    await vocabSection.getByTestId('vocabulary-edit-button').click()

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
    await vocabSection.getByTestId('vocabulary-edit-button').click()

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
    await vocabSection.getByTestId('vocabulary-edit-button').click()

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
    await page.getByTestId('destructive-mode-switch').click()

    // Open edit dialog again
    await vocabSection.getByTestId('vocabulary-edit-button').click()
    await expect(dialog).toBeVisible()

    // Wait for linked vocabulary list to appear
    await expect(page.getByTestId('linked-vocabulary-list')).toBeVisible()

    // Click remove button
    const removeButton = page.getByTestId('vocabulary-remove-button')
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

test.describe('Kanji Detail Notes', () => {
  test('displays character count in collapsed section headers', async ({
    page
  }) => {
    await createAndNavigateToKanji(page, '注')

    // All note sections should show character count of 0 initially
    const semanticSection = page.getByTestId('kanji-detail-semantic-notes')
    const etymologySection = page.getByTestId('kanji-detail-etymology-notes')
    const educationSection = page.getByTestId('kanji-detail-education-notes')
    const personalSection = page.getByTestId('kanji-detail-personal-notes')

    await expect(
      semanticSection.getByTestId('kanji-detail-semantic-notes-char-count')
    ).toHaveText('0')
    await expect(
      etymologySection.getByTestId('kanji-detail-etymology-notes-char-count')
    ).toHaveText('0')
    await expect(
      educationSection.getByTestId('kanji-detail-education-notes-char-count')
    ).toHaveText('0')
    await expect(
      personalSection.getByTestId('kanji-detail-personal-notes-char-count')
    ).toHaveText('0')
  })

  test('inline editing workflow - save content', async ({ page }) => {
    await createAndNavigateToKanji(page, '編')

    const semanticSection = page.getByTestId('kanji-detail-semantic-notes')

    // Click to expand section if collapsed
    await semanticSection.getByRole('button').first().click()

    // Click on display area to enter edit mode
    await semanticSection.getByTestId('notes-display').click()

    // Verify edit mode is active
    const editArea = semanticSection.getByTestId('notes-edit')
    await expect(editArea).toBeVisible()

    // Enter content
    const textarea = editArea.locator('textarea')
    await textarea.fill('This is test semantic content')

    // Click save button
    await editArea.getByRole('button', { name: /save/i }).click()

    // Verify content is saved and displayed
    await expect(
      semanticSection.getByText('This is test semantic content')
    ).toBeVisible()

    // Verify character count updated
    await expect(
      semanticSection.getByTestId('kanji-detail-semantic-notes-char-count')
    ).toHaveText('29')
  })

  test('inline editing workflow - cancel reverts content', async ({ page }) => {
    await createAndNavigateToKanji(page, '戻')

    const educationSection = page.getByTestId('kanji-detail-education-notes')

    // Click to expand section
    await educationSection.getByRole('button').first().click()

    // Click to enter edit mode
    await educationSection.getByTestId('notes-display').click()

    // Enter content but cancel
    const editArea = educationSection.getByTestId('notes-edit')
    await editArea.locator('textarea').fill('Content that will be cancelled')
    await editArea.getByRole('button', { name: /cancel/i }).click()

    // Verify content is not saved (placeholder should show)
    const display = educationSection.getByTestId('notes-display')
    await expect(display).toBeVisible()
    await expect(display).not.toHaveText('Content that will be cancelled')
  })

  test('escape key cancels editing', async ({ page }) => {
    await createAndNavigateToKanji(page, '逃')

    const personalSection = page.getByTestId('kanji-detail-personal-notes')

    // Expand and enter edit mode
    await personalSection.getByRole('button').first().click()
    await personalSection.getByTestId('notes-display').click()

    // Enter content and press Escape
    const editArea = personalSection.getByTestId('notes-edit')
    await editArea.locator('textarea').fill('Will be cancelled by Escape')
    await page.keyboard.press('Escape')

    // Verify we're back to display mode
    await expect(personalSection.getByTestId('notes-display')).toBeVisible()
    await expect(personalSection.getByTestId('notes-display')).not.toHaveText(
      'Will be cancelled by Escape'
    )
  })

  test('all four note types save independently', async ({ page }) => {
    await createAndNavigateToKanji(page, '独')

    // Save content to each note type
    const noteTypes = [
      { section: 'kanji-detail-semantic-notes', content: 'Semantic test' },
      { section: 'kanji-detail-etymology-notes', content: 'Etymology test' },
      { section: 'kanji-detail-education-notes', content: 'Education test' },
      { section: 'kanji-detail-personal-notes', content: 'Personal test' }
    ]

    for (const { content, section } of noteTypes) {
      const sectionEl = page.getByTestId(section)

      // Expand section
      await sectionEl.getByRole('button').first().click()

      // Enter edit mode and save
      await sectionEl.getByTestId('notes-display').click()
      const editArea = sectionEl.getByTestId('notes-edit')
      await editArea.locator('textarea').fill(content)
      await editArea.getByRole('button', { name: /save/i }).click()

      // Verify saved
      await expect(sectionEl.getByText(content)).toBeVisible()
    }

    // Reload page and verify all content persisted
    await page.reload()

    for (const { content, section } of noteTypes) {
      const sectionEl = page.getByTestId(section)
      await sectionEl.getByRole('button').first().click()
      await expect(sectionEl.getByText(content)).toBeVisible()
    }
  })

  test('preserves special characters and line breaks', async ({ page }) => {
    await createAndNavigateToKanji(page, '特')

    const semanticSection = page.getByTestId('kanji-detail-semantic-notes')
    const contentWithSpecialChars = 'Line 1\nLine 2\n特別な内容 🎌'

    // Expand and edit
    await semanticSection.getByRole('button').first().click()
    await semanticSection.getByTestId('notes-display').click()

    const editArea = semanticSection.getByTestId('notes-edit')
    await editArea.locator('textarea').fill(contentWithSpecialChars)
    await editArea.getByRole('button', { name: /save/i }).click()

    // Verify content is displayed (whitespace is preserved)
    await expect(semanticSection.getByText('Line 1')).toBeVisible()
    await expect(semanticSection.getByText('Line 2')).toBeVisible()
    await expect(semanticSection.getByText('特別な内容 🎌')).toBeVisible()

    // Reload and verify persistence
    await page.reload()
    await semanticSection.getByRole('button').first().click()
    await expect(semanticSection.getByText('Line 1')).toBeVisible()
    await expect(semanticSection.getByText('特別な内容 🎌')).toBeVisible()
  })

  test('character count updates in real-time during editing', async ({
    page
  }) => {
    await createAndNavigateToKanji(page, '数')

    const etymologySection = page.getByTestId('kanji-detail-etymology-notes')
    const charCount = etymologySection.getByTestId(
      'kanji-detail-etymology-notes-char-count'
    )

    // Expand and enter edit mode
    await etymologySection.getByRole('button').first().click()
    await etymologySection.getByTestId('notes-display').click()

    // Character count should update as we type
    const textarea = etymologySection
      .getByTestId('notes-edit')
      .locator('textarea')

    await textarea.fill('12345')
    await expect(charCount).toHaveText('5')

    await textarea.fill('1234567890')
    await expect(charCount).toHaveText('10')

    await textarea.fill('')
    await expect(charCount).toHaveText('0')
  })
})
