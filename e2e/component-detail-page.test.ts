/**
 * E2E Tests for Component Detail Page - Navigation, display, basic info, and description sections
 */

import { expect, test } from '@playwright/test'

import { createAndNavigateToComponent, expectToast } from './helpers/test-utils'

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
    await page.getByRole('button', { name: /edit headline/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
  })

  test('saves edited short meaning', async ({ page }) => {
    await createAndNavigateToComponent(page, '火')
    await page.getByRole('button', { name: /edit headline/i }).click()
    const meaningInput = page.getByLabel(/short meaning/i)
    await meaningInput.fill('fire, flame')
    await page.getByRole('button', { name: /save/i }).click()
    await expect(page.getByTestId('component-short-meaning')).toContainText(
      'fire, flame'
    )
  })
  test('cancels edit without saving', async ({ page }) => {
    await createAndNavigateToComponent(page, '土')
    await page.getByRole('button', { name: /edit headline/i }).click()
    await page.getByLabel(/short meaning/i).fill('should not save')
    await page.getByRole('button', { name: /cancel/i }).click()
    await expect(page.getByText('should not save')).not.toBeVisible()
  })
  test('enables delete button when destructive mode on', async ({ page }) => {
    await createAndNavigateToComponent(page, '金')
    const deleteButton = page.getByRole('button', { name: /delete component/i })
    await expect(deleteButton).toBeDisabled()
    await page.getByRole('switch', { name: /destructive mode/i }).click()
    await expect(deleteButton).toBeEnabled()
  })

  test('shows confirmation dialog when delete clicked', async ({ page }) => {
    await createAndNavigateToComponent(page, '月')
    await page.getByRole('switch', { name: /destructive mode/i }).click()
    await page.getByRole('button', { name: /delete component/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByText(/are you sure/i)).toBeVisible()
  })

  test('deletes component and navigates to list', async ({ page }) => {
    await createAndNavigateToComponent(page, '石')
    await page.getByRole('switch', { name: /destructive mode/i }).click()
    await page.getByRole('button', { name: /delete component/i }).click()
    await page
      .getByRole('dialog')
      .getByRole('button', { name: /delete/i })
      .click()
    await page.waitForURL('/components')
    expect(page.url()).toMatch(/\/components$/)
  })

  test('cancels delete confirmation', async ({ page }) => {
    await createAndNavigateToComponent(page, '田')
    await page.getByRole('switch', { name: /destructive mode/i }).click()
    await page.getByRole('button', { name: /delete component/i }).click()
    await page
      .getByRole('dialog')
      .getByRole('button', { name: /cancel/i })
      .click()
    expect(page.url()).toMatch(/\/components\/\d+$/)
    await expect(page.getByTestId('component-character')).toContainText('田')
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
    await page.getByRole('switch', { name: /can be radical/i }).click()
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
    await expectToast(page, 'Description saved')
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
    await expectToast(page, 'Description saved')

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
    await expectToast(page, 'Description saved')

    // Reload page
    await page.goto(url)
    await expect(page.getByTestId('component-detail-description')).toBeVisible()
    // Section should be open because description exists
    await expect(page.getByTestId('description-textarea')).toContainText(
      'Persisted description'
    )
  })
})
