/**
 * E2E Tests for Kanji Detail Basic Information Section
 */

import { expect, test } from '@playwright/test'

import { createAndNavigateToKanji } from './helpers/test-utils'

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
    const section = page.getByTestId('kanji-detail-basic-info')
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
    const section = page.getByTestId('kanji-detail-basic-info')
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
    const section = page.getByTestId('kanji-detail-basic-info')
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
    const section = page.getByTestId('kanji-detail-basic-info')
    await section.getByRole('button', { name: /edit/i }).click()

    // Open JLPT level dropdown (it's a custom select, not native)
    await page.getByLabel(/jlpt level/i).click()
    await page.getByRole('option', { name: 'N3' }).click()

    // Save
    await page.getByRole('button', { name: /save/i }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Verify displayed
    await expect(section.getByText('N3')).toBeVisible()
  })

  test('cancels basic info edit', async ({ page }) => {
    await createAndNavigateToKanji(page, '取')

    // Open basic info dialog
    const section = page.getByTestId('kanji-detail-basic-info')
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
    const section = page.getByTestId('kanji-detail-basic-info')
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
    const section = page.getByTestId('kanji-detail-basic-info')
    await section.getByRole('button', { name: /edit/i }).click()

    // Open radical combobox
    await page.getByLabel(/radical/i).click()

    // Type a single character that doesn't exist
    await page.getByPlaceholder(/search components/i).fill('斤')

    // Click the "Create new" button
    await page.getByRole('button', { name: /create new/i }).click()

    // Verify notice appears showing the new radical character
    await expect(page.getByText(/new:/i)).toBeVisible()
    // Use testid to get only the notice element, not the button
    const noticeText = page.getByTestId('radical-creation-notice')
    await expect(noticeText).toBeVisible()

    // Save
    await page.getByRole('button', { name: /save/i }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Verify new radical is displayed in the basic info section
    const basicInfoSection = page.getByTestId('kanji-detail-basic-info')
    await expect(basicInfoSection).toContainText('斤')
  })
})
