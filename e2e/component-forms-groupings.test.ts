/**
 * E2E tests for Component Phase 5.4 Features
 *
 * Tests:
 * - Component Forms (add, edit, delete, reorder)
 * - Form Assignment (assign forms to occurrences)
 * - Component Occurrences Reorder (arrow button reordering)
 * - Component Groupings (create, edit, delete, add/remove members, reorder)
 */

import { expect, type Page, test } from '@playwright/test'

// =============================================================================
// Helper Functions
// =============================================================================

async function createComponent(
  page: Page,
  character: string,
  shortMeaning: string
): Promise<string> {
  await page.goto('/components/new')
  await page.waitForTimeout(300)

  await page.getByLabel(/character/i).fill(character)
  await page.getByLabel(/short meaning/i).fill(shortMeaning)
  await page.getByRole('button', { name: /create component/i }).click()

  await expect(page).toHaveURL(/\/components\/\d+/)
  return page.url()
}

async function createKanji(
  page: Page,
  character: string,
  shortMeaning: string
): Promise<string> {
  await page.goto('/kanji/new')
  await page.waitForSelector('input[name="character"]')

  await page.getByLabel('Character').fill(character)
  await page.getByLabel(/short meaning/i).fill(shortMeaning)
  await page.getByRole('button', { name: /create kanji/i }).click()

  await expect(page).toHaveURL(/\/kanji\/\d+/)
  return page.url()
}

async function addComponentToKanji(
  page: Page,
  componentCharacter: string
): Promise<void> {
  const componentsSection = page.locator('section', {
    has: page.getByRole('heading', { name: /components/i })
  })
  await componentsSection.scrollIntoViewIfNeeded()

  const addButton = componentsSection.getByRole('button', { name: /\+ add/i })
  await addButton.click()
  await page.waitForTimeout(300)

  const searchInput = componentsSection.getByPlaceholder(/search/i)
  await searchInput.fill(componentCharacter)
  await page.waitForTimeout(200)
  await searchInput.press('Enter')
}

// =============================================================================
// Component Forms Tests
// =============================================================================

test.describe('Component Forms', () => {
  test('can add a form variant', async ({ page }) => {
    // Create component
    const componentUrl = await createComponent(page, '水', 'water')
    await page.goto(componentUrl)
    await page.waitForTimeout(300)

    // Find Forms section and click Add Form
    const formsSection = page.locator('.component-detail-forms')
    await formsSection.scrollIntoViewIfNeeded()
    await formsSection.getByRole('button', { name: /add form/i }).click()

    // Fill in form dialog
    await expect(page.getByText('Add Form Variant')).toBeVisible()
    await page.getByLabel(/character/i).fill('氵')
    await page.getByLabel(/form name/i).fill('sanzui')
    await page.getByLabel(/stroke count/i).fill('3')
    await page
      .getByLabel(/usage notes/i)
      .fill('Used on left side of kanji like 海')

    // Submit
    await page.getByRole('button', { name: /^add$/i }).click()

    // Wait for dialog to close
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Verify form appears in list
    await expect(formsSection).toContainText('氵')
    await expect(formsSection).toContainText('sanzui')
    await expect(formsSection).toContainText('3画')
  })

  test('can edit a form variant', async ({ page }) => {
    // Create component
    const componentUrl = await createComponent(page, '水', 'water')
    await page.goto(componentUrl)
    await page.waitForTimeout(300)

    // Add a form first
    const formsSection = page.locator('.component-detail-forms')
    await formsSection.scrollIntoViewIfNeeded()
    await formsSection.getByRole('button', { name: /add form/i }).click()

    await page.getByLabel(/character/i).fill('氵')
    await page.getByLabel(/form name/i).fill('old name')
    await page.getByRole('button', { name: /^add$/i }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Edit the form
    await formsSection.getByRole('button', { name: /edit/i }).first().click()
    await expect(page.getByText('Edit Form Variant')).toBeVisible()

    const nameInput = page.getByLabel(/form name/i)
    await nameInput.clear()
    await nameInput.fill('sanzui')

    await page.getByRole('button', { name: /save/i }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Verify update
    await expect(formsSection).toContainText('sanzui')
    await expect(formsSection).not.toContainText('old name')
  })

  test.skip('can delete a form variant with confirmation', async ({ page }) => {
    // Create component
    const componentUrl = await createComponent(page, '水', 'water')
    await page.goto(componentUrl)
    await page.waitForTimeout(300)

    // Add a form
    const formsSection = page.locator('.component-detail-forms')
    await formsSection.scrollIntoViewIfNeeded()
    await formsSection.getByRole('button', { name: /add form/i }).click()

    await page.getByLabel(/character/i).fill('氵')
    await page.getByLabel(/form name/i).fill('sanzui')
    await page.getByRole('button', { name: /^add$/i }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Enable destructive mode (click toggle at top of page)
    const destructiveToggle = page.getByRole('checkbox', {
      name: /destructive mode/i
    })
    await destructiveToggle.check()

    // Delete the form
    await formsSection.scrollIntoViewIfNeeded()
    const deleteButton = formsSection.getByRole('button', { name: '✕' })
    await deleteButton.click()

    // Confirm deletion
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByRole('button', { name: /delete/i }).click()

    // Verify form is gone
    await expect(formsSection).not.toContainText('氵')
    await expect(formsSection).not.toContainText('sanzui')
  })

  test('can reorder forms with arrow buttons', async ({ page }) => {
    // Create component
    const componentUrl = await createComponent(page, '水', 'water')
    await page.goto(componentUrl)
    await page.waitForTimeout(300)

    // Add multiple forms
    const formsSection = page.locator('.component-detail-forms')
    await formsSection.scrollIntoViewIfNeeded()

    // Add first form
    await formsSection.getByRole('button', { name: /add form/i }).click()
    await page.getByLabel(/character/i).fill('水')
    await page.getByLabel(/form name/i).fill('standard')
    await page.getByRole('button', { name: /^add$/i }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Add second form
    await formsSection.getByRole('button', { name: /add form/i }).click()
    await page.getByLabel(/character/i).fill('氵')
    await page.getByLabel(/form name/i).fill('sanzui')
    await page.getByRole('button', { name: /^add$/i }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Verify initial order
    const items = formsSection.locator('.component-detail-forms-item')
    await expect(items.nth(0)).toContainText('standard')
    await expect(items.nth(1)).toContainText('sanzui')

    // Move second item up
    const upButtons = formsSection.getByRole('button', { name: '↑' })
    await upButtons.nth(1).click()
    await page.waitForTimeout(200)

    // Verify order changed
    await expect(items.nth(0)).toContainText('sanzui')
    await expect(items.nth(1)).toContainText('standard')
  })

  test('forms persist after page reload', async ({ page }) => {
    // Create component and add form
    const componentUrl = await createComponent(page, '水', 'water')
    await page.goto(componentUrl)
    await page.waitForTimeout(300)

    const formsSection = page.locator('.component-detail-forms')
    await formsSection.scrollIntoViewIfNeeded()
    await formsSection.getByRole('button', { name: /add form/i }).click()

    await page.getByLabel(/character/i).fill('氵')
    await page.getByLabel(/form name/i).fill('sanzui')
    await page.getByRole('button', { name: /^add$/i }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Reload page
    await page.reload()
    await page.waitForTimeout(500)

    // Verify form still exists
    await formsSection.scrollIntoViewIfNeeded()
    await expect(formsSection).toContainText('氵')
    await expect(formsSection).toContainText('sanzui')
  })
})

// =============================================================================
// Form Assignment Tests
// =============================================================================

test.describe('Component Form Assignment', () => {
  test.skip('can assign form to occurrence via dropdown', async ({ page }) => {
    // Create component with form
    const componentUrl = await createComponent(page, '水', 'water')
    await page.goto(componentUrl)
    await page.waitForTimeout(300)

    // Add a form
    const formsSection = page.locator('.component-detail-forms')
    await formsSection.scrollIntoViewIfNeeded()
    await formsSection.getByRole('button', { name: /add form/i }).click()
    await page.getByLabel(/character/i).fill('氵')
    await page.getByLabel(/form name/i).fill('sanzui')
    await page.getByRole('button', { name: /^add$/i }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Create kanji and add this component
    await createKanji(page, '海', 'sea')
    await addComponentToKanji(page, '水')
    await page.waitForTimeout(300)

    // Go back to component page
    await page.goto(componentUrl)
    await page.waitForTimeout(500)

    // Find occurrence in Kanji Using section
    const kanjiSection = page.locator('.component-detail-kanji-list')
    await kanjiSection.scrollIntoViewIfNeeded()

    // Verify kanji is listed
    await expect(kanjiSection).toContainText('海')

    // Find and click form dropdown
    const formSelect = kanjiSection.locator('select').first()
    // Select the first non-"None" option (which should be sanzui)
    const options = await formSelect.locator('option').allTextContents()
    const sanzuiOption = options.find((opt) => opt.includes('sanzui'))
    if (sanzuiOption) {
      await formSelect.selectOption({ label: sanzuiOption })
    }
    await page.waitForTimeout(300)

    // Verify selection persists after reload
    await page.reload()
    await page.waitForTimeout(500)
    await kanjiSection.scrollIntoViewIfNeeded()

    const formSelectAfterReload = kanjiSection.locator('select').first()
    await expect(formSelectAfterReload).toHaveValue(/\d+/)
  })

  test.skip('can change form assignment', async ({ page }) => {
    // Create component with two forms
    const componentUrl = await createComponent(page, '水', 'water')
    await page.goto(componentUrl)
    await page.waitForTimeout(300)

    const formsSection = page.locator('.component-detail-forms')
    await formsSection.scrollIntoViewIfNeeded()

    // Add first form
    await formsSection.getByRole('button', { name: /add form/i }).click()
    await page.getByLabel(/character/i).fill('水')
    await page.getByLabel(/form name/i).fill('standard')
    await page.getByRole('button', { name: /^add$/i }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Add second form
    await formsSection.getByRole('button', { name: /add form/i }).click()
    await page.getByLabel(/character/i).fill('氵')
    await page.getByLabel(/form name/i).fill('sanzui')
    await page.getByRole('button', { name: /^add$/i }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Create kanji and add component
    await createKanji(page, '海', 'sea')
    await addComponentToKanji(page, '水')
    await page.waitForTimeout(300)

    // Go back to component page
    await page.goto(componentUrl)
    await page.waitForTimeout(500)

    const kanjiSection = page.locator('.component-detail-kanji-list')
    await kanjiSection.scrollIntoViewIfNeeded()

    // Assign first form
    const formSelect = kanjiSection.locator('select').first()
    const options1 = await formSelect.locator('option').allTextContents()
    const standardOption = options1.find((opt) => opt.includes('standard'))
    if (standardOption) {
      await formSelect.selectOption({ label: standardOption })
    }
    await page.waitForTimeout(300)

    // Change to second form
    const options2 = await formSelect.locator('option').allTextContents()
    const sanzuiOption = options2.find((opt) => opt.includes('sanzui'))
    if (sanzuiOption) {
      await formSelect.selectOption({ label: sanzuiOption })
    }
    await page.waitForTimeout(300)

    // Verify after reload
    await page.reload()
    await page.waitForTimeout(500)
    await kanjiSection.scrollIntoViewIfNeeded()

    const formSelectAfterReload = kanjiSection.locator('select').first()
    const selectedValue = await formSelectAfterReload.inputValue()
    expect(selectedValue).not.toBe('none')
  })

  test.skip('can unassign form by selecting "None"', async ({ page }) => {
    // Create component with form
    const componentUrl = await createComponent(page, '水', 'water')
    await page.goto(componentUrl)
    await page.waitForTimeout(300)

    const formsSection = page.locator('.component-detail-forms')
    await formsSection.scrollIntoViewIfNeeded()
    await formsSection.getByRole('button', { name: /add form/i }).click()
    await page.getByLabel(/character/i).fill('氵')
    await page.getByLabel(/form name/i).fill('sanzui')
    await page.getByRole('button', { name: /^add$/i }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Create kanji and add component
    await createKanji(page, '海', 'sea')
    await addComponentToKanji(page, '水')
    await page.waitForTimeout(300)

    await page.goto(componentUrl)
    await page.waitForTimeout(500)

    const kanjiSection = page.locator('.component-detail-kanji-list')
    await kanjiSection.scrollIntoViewIfNeeded()

    // Assign form
    const formSelect = kanjiSection.locator('select').first()
    const options = await formSelect.locator('option').allTextContents()
    const sanzuiOption = options.find((opt) => opt.includes('sanzui'))
    if (sanzuiOption) {
      await formSelect.selectOption({ label: sanzuiOption })
    }
    await page.waitForTimeout(300)

    // Unassign by selecting None
    await formSelect.selectOption({ label: 'None' })
    await page.waitForTimeout(300)

    // Verify after reload
    await page.reload()
    await page.waitForTimeout(500)
    await kanjiSection.scrollIntoViewIfNeeded()

    const formSelectAfterReload = kanjiSection.locator('select').first()
    await expect(formSelectAfterReload).toHaveValue('none')
  })
})

// =============================================================================
// Component Occurrences Reorder Tests
// =============================================================================

test.describe('Component Occurrences Reorder', () => {
  test.skip('can reorder occurrences with arrow buttons', async ({ page }) => {
    // Create component
    const componentUrl = await createComponent(page, '水', 'water')

    // Create two kanji with this component
    await createKanji(page, '海', 'sea')
    await addComponentToKanji(page, '水')

    await createKanji(page, '泳', 'swim')
    await addComponentToKanji(page, '水')

    // Go to component page
    await page.goto(componentUrl)
    await page.waitForTimeout(500)

    const kanjiSection = page.locator('.component-detail-kanji-list')
    await kanjiSection.scrollIntoViewIfNeeded()

    // Verify initial order (海 should be first)
    const items = kanjiSection.locator('.component-detail-kanji-list-item')
    await expect(items.nth(0)).toContainText('海')
    await expect(items.nth(1)).toContainText('泳')

    // Move second item up
    const upButtons = kanjiSection.getByRole('button', { name: '↑' })
    await upButtons.nth(1).click()
    await page.waitForTimeout(300)

    // Verify order changed
    await expect(items.nth(0)).toContainText('泳')
    await expect(items.nth(1)).toContainText('海')

    // Verify persists after reload
    await page.reload()
    await page.waitForTimeout(500)
    await kanjiSection.scrollIntoViewIfNeeded()

    await expect(items.nth(0)).toContainText('泳')
    await expect(items.nth(1)).toContainText('海')
  })

  test('arrow buttons are disabled at boundaries', async ({ page }) => {
    // Create component with one kanji
    const componentUrl = await createComponent(page, '水', 'water')
    await createKanji(page, '海', 'sea')
    await addComponentToKanji(page, '水')

    await page.goto(componentUrl)
    await page.waitForTimeout(500)

    const kanjiSection = page.locator('.component-detail-kanji-list')
    await kanjiSection.scrollIntoViewIfNeeded()

    // With only one item, both arrows should be disabled
    const upButton = kanjiSection.getByRole('button', { name: '↑' }).first()
    const downButton = kanjiSection.getByRole('button', { name: '↓' }).first()

    await expect(upButton).toBeDisabled()
    await expect(downButton).toBeDisabled()
  })
})

// =============================================================================
// Component Groupings Tests
// =============================================================================

test.describe('Component Groupings', () => {
  test.skip('can create a grouping with name and description', async ({
    page
  }) => {
    // Create component
    const componentUrl = await createComponent(page, '水', 'water')
    await page.goto(componentUrl)
    await page.waitForTimeout(300)

    // Scroll to groupings section
    const groupingsSection = page.locator('.component-detail-groupings')
    await groupingsSection.scrollIntoViewIfNeeded()

    // Click Add Grouping
    await groupingsSection
      .getByRole('button', { name: /add grouping/i })
      .click()

    // Fill in form
    await expect(page.getByText('Add Grouping')).toBeVisible()
    await page.getByLabel(/name/i).fill('Water-related kanji')
    await page
      .getByLabel(/description/i)
      .fill('Kanji where water is semantic component')

    await page.getByRole('button', { name: /^add$/i }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Verify grouping appears
    await expect(groupingsSection).toContainText('Water-related kanji')
    await expect(groupingsSection).toContainText(
      'Kanji where water is semantic component'
    )
  })

  test('can edit a grouping', async ({ page }) => {
    // Create component and grouping
    const componentUrl = await createComponent(page, '水', 'water')
    await page.goto(componentUrl)
    await page.waitForTimeout(300)

    const groupingsSection = page.locator('.component-detail-groupings')
    await groupingsSection.scrollIntoViewIfNeeded()

    // Create grouping
    await groupingsSection
      .getByRole('button', { name: /add grouping/i })
      .click()
    await page.getByLabel(/name/i).fill('Old Name')
    await page.getByLabel(/description/i).fill('Old description')
    await page.getByRole('button', { name: /^add$/i }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Edit the grouping
    await groupingsSection.getByRole('button', { name: /edit/i }).click()
    await expect(page.getByText('Edit Grouping')).toBeVisible()

    const nameInput = page.getByLabel(/name/i)
    await nameInput.clear()
    await nameInput.fill('New Name')

    const descInput = page.getByLabel(/description/i)
    await descInput.clear()
    await descInput.fill('New description')

    await page.getByRole('button', { name: /save/i }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Verify update
    await expect(groupingsSection).toContainText('New Name')
    await expect(groupingsSection).toContainText('New description')
  })

  test.skip('can delete a grouping with confirmation', async ({ page }) => {
    // Create component and grouping
    const componentUrl = await createComponent(page, '水', 'water')
    await page.goto(componentUrl)
    await page.waitForTimeout(300)

    const groupingsSection = page.locator('.component-detail-groupings')
    await groupingsSection.scrollIntoViewIfNeeded()

    // Create grouping
    await groupingsSection
      .getByRole('button', { name: /add grouping/i })
      .click()
    await page.getByLabel(/name/i).fill('Test Group')
    await page.getByRole('button', { name: /^add$/i }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Enable destructive mode
    const destructiveToggle = page.getByRole('checkbox', {
      name: /destructive mode/i
    })
    await destructiveToggle.check()

    // Delete grouping
    await groupingsSection.scrollIntoViewIfNeeded()
    const deleteButton = groupingsSection.getByRole('button', { name: '✕' })
    await deleteButton.click()

    // Confirm deletion
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByRole('button', { name: /delete/i }).click()

    // Verify grouping is gone
    await expect(groupingsSection).not.toContainText('Test Group')
  })

  test('can add occurrences to grouping', async ({ page }) => {
    // Create component
    const componentUrl = await createComponent(page, '水', 'water')

    // Create two kanji with this component
    await createKanji(page, '海', 'sea')
    await addComponentToKanji(page, '水')

    await createKanji(page, '泳', 'swim')
    await addComponentToKanji(page, '水')

    // Go to component page
    await page.goto(componentUrl)
    await page.waitForTimeout(500)

    const groupingsSection = page.locator('.component-detail-groupings')
    await groupingsSection.scrollIntoViewIfNeeded()

    // Create grouping
    await groupingsSection
      .getByRole('button', { name: /add grouping/i })
      .click()
    await page.getByLabel(/name/i).fill('Water Group')
    await page.getByRole('button', { name: /^add$/i }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Expand the grouping
    const expandButton = groupingsSection.getByRole('button', {
      name: /water group/i
    })
    await expandButton.click()

    // Should show "Add kanji:" section with available kanji
    await expect(groupingsSection).toContainText('Add kanji:')

    // Click on 海 to add it
    const addKanjiButton = groupingsSection.getByRole('button', { name: '海' })
    await addKanjiButton.click()
    await page.waitForTimeout(200)

    // Verify it appears in members
    await expect(groupingsSection).toContainText('Members')
    const membersList = groupingsSection.locator(
      '.component-detail-groupings-members-list'
    )
    await expect(membersList).toContainText('海')
  })

  test('can remove occurrences from grouping', async ({ page }) => {
    // Create component
    const componentUrl = await createComponent(page, '水', 'water')

    // Create kanji
    await createKanji(page, '海', 'sea')
    await addComponentToKanji(page, '水')

    // Go to component page
    await page.goto(componentUrl)
    await page.waitForTimeout(500)

    const groupingsSection = page.locator('.component-detail-groupings')
    await groupingsSection.scrollIntoViewIfNeeded()

    // Create grouping
    await groupingsSection
      .getByRole('button', { name: /add grouping/i })
      .click()
    await page.getByLabel(/name/i).fill('Water Group')
    await page.getByRole('button', { name: /^add$/i }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Expand and add kanji
    const expandButton = groupingsSection.getByRole('button', {
      name: /water group/i
    })
    await expandButton.click()

    const addKanjiButton = groupingsSection.getByRole('button', { name: '海' })
    await addKanjiButton.click()
    await page.waitForTimeout(200)

    // Remove it
    const removeButton = groupingsSection.getByRole('button', {
      name: /remove/i
    })
    await removeButton.click()
    await page.waitForTimeout(200)

    // Verify it's gone
    const membersList = groupingsSection.locator(
      '.component-detail-groupings-members-list'
    )
    await expect(membersList).not.toBeVisible()
    await expect(groupingsSection).toContainText('No kanji in this group yet')
  })

  test('can reorder groupings with arrow buttons', async ({ page }) => {
    // Create component
    const componentUrl = await createComponent(page, '水', 'water')
    await page.goto(componentUrl)
    await page.waitForTimeout(300)

    const groupingsSection = page.locator('.component-detail-groupings')
    await groupingsSection.scrollIntoViewIfNeeded()

    // Create first grouping
    await groupingsSection
      .getByRole('button', { name: /add grouping/i })
      .click()
    await page.getByLabel(/name/i).fill('First Group')
    await page.getByRole('button', { name: /^add$/i }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Create second grouping
    await groupingsSection
      .getByRole('button', { name: /add grouping/i })
      .click()
    await page.getByLabel(/name/i).fill('Second Group')
    await page.getByRole('button', { name: /^add$/i }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Verify initial order
    const items = groupingsSection.locator('.component-detail-groupings-item')
    await expect(items.nth(0)).toContainText('First Group')
    await expect(items.nth(1)).toContainText('Second Group')

    // Move second item up
    const upButtons = groupingsSection.getByRole('button', { name: '↑' })
    await upButtons.nth(1).click()
    await page.waitForTimeout(200)

    // Verify order changed
    await expect(items.nth(0)).toContainText('Second Group')
    await expect(items.nth(1)).toContainText('First Group')
  })

  test('grouping membership persists after page reload', async ({ page }) => {
    // Create component
    const componentUrl = await createComponent(page, '水', 'water')

    // Create kanji
    await createKanji(page, '海', 'sea')
    await addComponentToKanji(page, '水')

    // Go to component page
    await page.goto(componentUrl)
    await page.waitForTimeout(500)

    const groupingsSection = page.locator('.component-detail-groupings')
    await groupingsSection.scrollIntoViewIfNeeded()

    // Create grouping and add member
    await groupingsSection
      .getByRole('button', { name: /add grouping/i })
      .click()
    await page.getByLabel(/name/i).fill('Water Group')
    await page.getByRole('button', { name: /^add$/i }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()

    const expandButton = groupingsSection.getByRole('button', {
      name: /water group/i
    })
    await expandButton.click()

    const addKanjiButton = groupingsSection.getByRole('button', { name: '海' })
    await addKanjiButton.click()
    await page.waitForTimeout(200)

    // Reload page
    await page.reload()
    await page.waitForTimeout(500)

    // Verify grouping and member still exist
    await groupingsSection.scrollIntoViewIfNeeded()
    await expect(groupingsSection).toContainText('Water Group')

    const expandButtonAfterReload = groupingsSection.getByRole('button', {
      name: /water group/i
    })
    await expandButtonAfterReload.click()

    const membersList = groupingsSection.locator(
      '.component-detail-groupings-members-list'
    )
    await expect(membersList).toContainText('海')
  })
})
