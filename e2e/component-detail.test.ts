/**
 * E2E Tests for Component Detail Page
 *
 * Tests navigation, display, editing, and deletion of components.
 */

/* eslint-disable max-lines */

import { expect, type Page, test } from '@playwright/test'

/**
 * Helper to create a component and navigate to its detail page
 */
async function createAndNavigateToComponent(
  page: Page,
  character: string
): Promise<string> {
  await page.goto('/components')

  // Wait for page load
  await expect(
    page.getByRole('heading', { name: /component list/i })
  ).toBeVisible()

  // Open create dialog
  await page.getByRole('button', { name: /^add new$/i }).click()
  await expect(page.getByRole('dialog')).toBeVisible()

  // Fill character and submit
  await page.getByRole('textbox', { name: /character/i }).fill(character)
  await page.getByRole('button', { name: /^add$/i }).click()

  // Wait for dialog to close
  await expect(page.getByRole('dialog')).not.toBeVisible()

  // Click on the created component card to navigate to detail page
  const componentCard = page
    .getByTestId('component-list-card')
    .filter({ hasText: character })
  await componentCard.click()

  // Wait for navigation to detail page
  await page.waitForURL(/\/components\/\d+$/)

  return page.url()
}

test.describe('Component Detail Page', () => {
  test('displays component character', async ({ page }) => {
    await createAndNavigateToComponent(page, '氵')
    await expect(page.getByTestId('component-character')).toContainText('氵')
  })

  test('shows back button at top and bottom', async ({ page }) => {
    await createAndNavigateToComponent(page, '亻')
    const backButtons = page.getByRole('link', {
      name: /back to component list/i
    })
    await expect(backButtons).toHaveCount(2)
  })

  test('navigates back to list when back button clicked', async ({ page }) => {
    await createAndNavigateToComponent(page, '扌')
    await page
      .getByRole('link', { name: /back to component list/i })
      .first()
      .click()
    await page.waitForURL('/components')
    expect(page.url()).toMatch(/\/components$/)
  })

  test('opens edit dialog when edit button clicked', async ({ page }) => {
    await createAndNavigateToComponent(page, '木')
    await page.getByTestId('headline-edit-button').click()
    await expect(page.getByRole('dialog')).toBeVisible()
  })

  test('saves edited short meaning', async ({ page }) => {
    await createAndNavigateToComponent(page, '火')
    await page.getByTestId('headline-edit-button').click()
    const meaningInput = page.getByLabel(/short meaning/i)
    await meaningInput.fill('fire, flame')
    await page.getByRole('button', { name: /save/i }).click()
    await expect(page.getByTestId('component-short-meaning')).toContainText(
      'fire, flame'
    )
  })
  test('cancels edit without saving', async ({ page }) => {
    await createAndNavigateToComponent(page, '土')
    await page.getByTestId('headline-edit-button').click()
    await page.getByLabel(/short meaning/i).fill('should not save')
    await page.getByRole('button', { name: /cancel/i }).click()
    await expect(page.getByText('should not save')).not.toBeVisible()
  })
  test('enables delete button when destructive mode on', async ({ page }) => {
    await createAndNavigateToComponent(page, '金')
    const deleteButton = page.getByRole('button', { name: /^delete$/i })
    await expect(deleteButton).toBeDisabled()
    await page.getByTestId('destructive-mode-switch').click()
    await expect(deleteButton).toBeEnabled()
  })

  test('shows confirmation dialog when delete clicked', async ({ page }) => {
    await createAndNavigateToComponent(page, '月')
    await page.getByTestId('destructive-mode-switch').click()
    await page.getByRole('button', { name: /^delete$/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByText(/are you sure/i)).toBeVisible()
  })

  test('deletes component and navigates to list', async ({ page }) => {
    await createAndNavigateToComponent(page, '石')
    await page.getByTestId('destructive-mode-switch').click()
    await page.getByRole('button', { name: /^delete$/i }).click()
    await page
      .getByRole('dialog')
      .getByRole('button', { name: /delete/i })
      .click()
    await page.waitForURL('/components')
    expect(page.url()).toMatch(/\/components$/)
  })

  test('cancels delete confirmation', async ({ page }) => {
    await createAndNavigateToComponent(page, '田')
    await page.getByTestId('destructive-mode-switch').click()
    await page.getByRole('button', { name: /^delete$/i }).click()
    await page
      .getByRole('dialog')
      .getByRole('button', { name: /cancel/i })
      .click()
    expect(page.url()).toMatch(/\/components\/\d+$/)
    await expect(page.getByTestId('component-character')).toContainText('田')
  })

  test('toggles between new and legacy UI', async ({ page }) => {
    const url = await createAndNavigateToComponent(page, '口')
    const componentId = /\/components\/(\d+)$/.exec(url)?.[1]

    if (!componentId) {
      throw new Error('Failed to extract component ID from URL')
    }
    // Click version toggle in header
    const versionToggle = page
      .locator('nav[aria-label="Main navigation"]')
      .getByRole('switch')
    await versionToggle.click()
    await page.waitForURL(`/legacy/components/${componentId}`)
    expect(page.url()).toContain('/legacy/components/')
    // Click version toggle to go back to new UI
    await page
      .locator('nav[aria-label="Main navigation"]')
      .getByRole('switch')
      .click()
    await page.waitForURL(`/components/${componentId}`)
    expect(page.url()).toMatch(/\/components\/\d+$/)
    expect(page.url()).not.toContain('/legacy')
  })
})
test.describe('Component Detail Basic Information', () => {
  test('displays basic information section', async ({ page }) => {
    await createAndNavigateToComponent(page, '氵')
    await expect(page.getByTestId('component-detail-basic-info')).toBeVisible()
    await expect(page.getByText('Basic Information')).toBeVisible()
  })
  test('shows stroke count after setting it', async ({ page }) => {
    await createAndNavigateToComponent(page, '口')
    await page.getByTestId('basic-info-edit-button').click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByLabel(/stroke count/i).fill('3')
    await page.getByRole('button', { name: /save/i }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()
    await expect(page.getByTestId('basic-info-stroke-count')).toContainText('3')
  })

  test('shows can-be-radical status', async ({ page }) => {
    await createAndNavigateToComponent(page, '日')
    await expect(page.getByTestId('basic-info-can-be-radical')).toContainText(
      'No'
    )
  })

  test('toggles radical status and shows radical fields', async ({ page }) => {
    await createAndNavigateToComponent(page, '木')
    // Open edit dialog
    await page.getByTestId('basic-info-edit-button').click()
    await expect(page.getByRole('dialog')).toBeVisible()
    // Toggle can-be-radical on - find the switch button in the switch wrapper
    await page
      .locator('.base-switch')
      .filter({ hasText: 'Can be Radical' })
      .getByRole('switch')
      .click()
    // Wait for the radical fields to appear
    await expect(page.getByLabel(/kangxi number/i)).toBeVisible()
    // Fill in radical attributes
    await page.getByLabel(/kangxi number/i).fill('75')
    await page.getByLabel(/kangxi meaning/i).fill('tree')
    await page.getByLabel(/radical name \(japanese\)/i).fill('きへん')
    await page.getByRole('button', { name: /save/i }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()
    // Verify radical attributes are now displayed
    await expect(page.getByTestId('basic-info-can-be-radical')).toContainText(
      'Yes'
    )
    await expect(page.getByTestId('basic-info-kangxi-number')).toContainText(
      '75'
    )
    await expect(page.getByTestId('basic-info-kangxi-meaning')).toContainText(
      'tree'
    )
    await expect(page.getByTestId('basic-info-radical-name')).toContainText(
      'きへん'
    )
  })
  test('shows validation error for invalid stroke count', async ({ page }) => {
    await createAndNavigateToComponent(page, '火')
    await page.getByTestId('basic-info-edit-button').click()
    await expect(page.getByRole('dialog')).toBeVisible()
    // Enter invalid stroke count
    await page.getByLabel(/stroke count/i).fill('100')
    await page.getByRole('button', { name: /save/i }).click()
    // Dialog should stay open with error
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(
      page.getByText(/stroke count must be between 1 and 64/i)
    ).toBeVisible()
  })

  test('cancels edit without saving changes', async ({ page }) => {
    await createAndNavigateToComponent(page, '水')
    // First set a stroke count
    await page.getByTestId('basic-info-edit-button').click()
    await page.getByLabel(/stroke count/i).fill('4')
    await page.getByRole('button', { name: /save/i }).click()
    await expect(page.getByTestId('basic-info-stroke-count')).toContainText('4')
    // Now try to change it but cancel
    await page.getByTestId('basic-info-edit-button').click()
    await page.getByLabel(/stroke count/i).fill('99')
    await page.getByRole('button', { name: /cancel/i }).click()
    // Should still show 4
    await expect(page.getByTestId('basic-info-stroke-count')).toContainText('4')
  })
})

test.describe('Component Detail Description', () => {
  test('displays description section', async ({ page }) => {
    await createAndNavigateToComponent(page, '氵')
    await expect(page.getByTestId('component-detail-description')).toBeVisible()
  })

  test('inline edits description and saves on blur', async ({ page }) => {
    await createAndNavigateToComponent(page, '口')
    // Expand description section if collapsed
    const section = page.getByTestId('component-detail-description')
    if ((await section.getAttribute('data-state')) === 'closed') {
      await page.getByRole('heading', { name: /description/i }).click()
    }
    // Click to enter edit mode
    await page.getByTestId('description-textarea').click()
    // Type description
    const textarea = page.getByRole('textbox')
    await textarea.fill('This is a test description')
    // Blur by clicking elsewhere
    await page.getByRole('heading', { name: /description/i }).click()
    // Verify toast appears
    await expect(
      page.locator('.base-toast-description').getByText('Description saved')
    ).toBeVisible()
    // Verify content is displayed
    await expect(page.getByTestId('description-textarea')).toContainText(
      'This is a test description'
    )
  })
  test('clears description saves null value', async ({ page }) => {
    await createAndNavigateToComponent(page, '木')
    // First set a description
    const section = page.getByTestId('component-detail-description')
    if ((await section.getAttribute('data-state')) === 'closed') {
      await page.getByRole('heading', { name: /description/i }).click()
    }
    await page.getByTestId('description-textarea').click()
    await page.getByRole('textbox').fill('Initial description')
    await page.getByRole('heading', { name: /description/i }).click()
    await expect(
      page.locator('.base-toast-description').getByText('Description saved')
    ).toBeVisible()

    // Now clear it
    await page.getByTestId('description-textarea').click()
    await page.getByRole('textbox').clear()
    await page.getByRole('heading', { name: /description/i }).click()

    // Verify placeholder is shown
    await expect(page.getByTestId('description-textarea')).toContainText(
      /click to add/i
    )
  })

  test('description persists after page reload', async ({ page }) => {
    const url = await createAndNavigateToComponent(page, '火')
    // Set description
    const section = page.getByTestId('component-detail-description')
    if ((await section.getAttribute('data-state')) === 'closed') {
      await page.getByRole('heading', { name: /description/i }).click()
    }
    await page.getByTestId('description-textarea').click()
    await page.getByRole('textbox').fill('Persisted description')
    await page.getByRole('heading', { name: /description/i }).click()
    await expect(
      page.locator('.base-toast-description').getByText('Description saved')
    ).toBeVisible()

    // Reload page
    await page.goto(url)
    await expect(page.getByTestId('component-detail-description')).toBeVisible()
    // Section should be open because description exists
    await expect(page.getByTestId('description-textarea')).toContainText(
      'Persisted description'
    )
  })
})
test.describe('Component Detail Forms', () => {
  test('displays forms section', async ({ page }) => {
    await createAndNavigateToComponent(page, '氵')
    await expect(page.getByTestId('component-detail-forms')).toBeVisible()
  })
  test('shows empty state when no forms', async ({ page }) => {
    await createAndNavigateToComponent(page, '日')
    // Expand forms section
    const section = page.getByTestId('component-detail-forms')
    if ((await section.getAttribute('data-state')) === 'closed') {
      await page.getByRole('heading', { name: /forms/i }).click()
    }
    await expect(page.getByText(/no forms added yet/i)).toBeVisible()
  })

  test('adds a new form via dialog', async ({ page }) => {
    await createAndNavigateToComponent(page, '水')
    // Expand forms section
    const section = page.getByTestId('component-detail-forms')
    if ((await section.getAttribute('data-state')) === 'closed') {
      await page.getByRole('heading', { name: /forms/i }).click()
    }
    // Click Add button
    await page.getByRole('button', { name: /^add$/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    // Fill form fields
    await page.getByLabel(/character/i).fill('氵')
    await page.getByLabel(/form name/i).fill('water radical')
    await page.getByLabel(/stroke count/i).fill('3')
    await page.getByLabel(/usage notes/i).fill('Used in water kanji')
    // Submit
    await page.getByRole('button', { name: /save/i }).click()
    // Verify dialog closes
    await expect(page.getByRole('dialog')).not.toBeVisible()
    // Verify toast
    await expect(
      page.locator('.base-toast-description').getByText('Form added')
    ).toBeVisible()
    // Verify form appears in list
    await expect(page.getByText('氵')).toBeVisible()
    await expect(page.getByText('water radical')).toBeVisible()
  })

  test('edits an existing form via dialog', async ({ page }) => {
    await createAndNavigateToComponent(page, '金')
    // First add a form
    const section = page.getByTestId('component-detail-forms')
    if ((await section.getAttribute('data-state')) === 'closed') {
      await page.getByRole('heading', { name: /forms/i }).click()
    }
    await page.getByRole('button', { name: /^add$/i }).click()
    await page.getByLabel(/character/i).fill('釒')
    await page.getByLabel(/form name/i).fill('metal radical')
    await page.getByRole('button', { name: /save/i }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Now edit it - scope to the form item
    await page
      .getByTestId(/form-item/)
      .getByRole('button', { name: /edit/i })
      .click()
    await expect(page.getByRole('dialog')).toBeVisible()
    // Character should be disabled
    await expect(page.getByLabel(/character/i)).toBeDisabled()
    // Update form name
    await page.getByLabel(/form name/i).fill('gold radical')
    await page.getByRole('button', { name: /save/i }).click()
    // Verify toast
    await expect(
      page.locator('.base-toast-description').getByText('Form updated')
    ).toBeVisible()
    // Verify updated name
    await expect(page.getByText('gold radical')).toBeVisible()
  })

  test('deletes a form with destructive mode and confirmation', async ({
    page
  }) => {
    await createAndNavigateToComponent(page, '土')
    // Add a form first
    const section = page.getByTestId('component-detail-forms')
    if ((await section.getAttribute('data-state')) === 'closed') {
      await page.getByRole('heading', { name: /forms/i }).click()
    }
    await page.getByRole('button', { name: /^add$/i }).click()
    await page.getByLabel(/character/i).fill('圡')
    await page.getByRole('button', { name: /save/i }).click()
    await expect(page.getByText('圡')).toBeVisible()

    // Delete button should not be visible without destructive mode
    await expect(
      page.getByTestId(/form-item/).getByRole('button', { name: /delete/i })
    ).not.toBeVisible()

    // Enable destructive mode
    await page.getByTestId('destructive-mode-switch').click()

    // Now delete button should be visible
    await page
      .getByTestId(/form-item/)
      .getByRole('button', { name: /delete/i })
      .click()

    // Confirmation dialog should appear
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByText(/are you sure/i)).toBeVisible()

    // Confirm delete
    await page
      .getByRole('dialog')
      .getByRole('button', { name: /delete/i })
      .click()

    // Verify toast
    await expect(
      page.locator('.base-toast-description').getByText('Form deleted')
    ).toBeVisible()
    // Form should be gone
    await expect(page.getByText('圡')).not.toBeVisible()
  })

  test('reorders forms with arrow buttons', async ({ page }) => {
    await createAndNavigateToComponent(page, '月')
    // Add two forms
    const section = page.getByTestId('component-detail-forms')
    if ((await section.getAttribute('data-state')) === 'closed') {
      await page.getByRole('heading', { name: /forms/i }).click()
    }
    // Add first form
    await page.getByRole('button', { name: /^add$/i }).click()
    await page.getByLabel(/character/i).fill('⺝')
    await page.getByLabel(/form name/i).fill('first form')
    await page.getByRole('button', { name: /save/i }).click()
    // Add second form
    await page.getByRole('button', { name: /^add$/i }).click()
    await page.getByLabel(/character/i).fill('⺜')
    await page.getByLabel(/form name/i).fill('second form')
    await page.getByRole('button', { name: /save/i }).click()

    // Verify order - first should have disabled up, second should have disabled down
    const firstItem = page.getByTestId(/form-item/).first()
    const secondItem = page.getByTestId(/form-item/).last()

    await expect(
      firstItem.getByRole('button', { name: /move up/i })
    ).toBeDisabled()
    await expect(
      secondItem.getByRole('button', { name: /move down/i })
    ).toBeDisabled()

    // Move second item up
    await secondItem.getByRole('button', { name: /move up/i }).click()

    // Now the order should be swapped - second form is now first
    await expect(page.getByTestId(/form-item/).first()).toContainText(
      'second form'
    )
  })

  test('forms persist after page reload', async ({ page }) => {
    const url = await createAndNavigateToComponent(page, '石')
    // Add a form
    const section = page.getByTestId('component-detail-forms')
    if ((await section.getAttribute('data-state')) === 'closed') {
      await page.getByRole('heading', { name: /forms/i }).click()
    }
    await page.getByRole('button', { name: /^add$/i }).click()
    await page.getByLabel(/character/i).fill('石')
    await page.getByLabel(/form name/i).fill('stone form')
    await page.getByRole('button', { name: /save/i }).click()
    await expect(page.getByText('stone form')).toBeVisible()

    // Reload page
    await page.goto(url)
    await expect(page.getByTestId('component-detail-forms')).toBeVisible()
    // Verify form is still there
    await expect(page.getByText('stone form')).toBeVisible()
  })
})

// =============================================================================
// Kanji Occurrences Section Tests
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
  // Click the option with force:true (portal may be behind dialog overlay)
  await page
    .getByRole('option')
    .filter({ hasText: character })
    .first()
    .click({ force: true })
  // Wait for dialog to close
  await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10000 })
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
    await expect(
      page.locator('.base-toast-description').getByText(/linked/i)
    ).toBeVisible()
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
    await page.locator('.shared-entity-search-create-button').click()
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
    await expect(
      page.locator('.base-toast-description').getByText(/created and linked/i)
    ).toBeVisible()
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
    await expect(
      page.locator('.base-toast-description').getByText(/updated/i)
    ).toBeVisible()
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
    await expect(
      page.locator('.base-toast-description').getByText(/updated/i)
    ).toBeVisible()
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
    await page.getByTestId('destructive-mode-switch').click()
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
    await expect(
      page.locator('.base-toast-description').getByText(/unlinked/i)
    ).toBeVisible()
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
