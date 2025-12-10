/**
 * E2E tests for Component Occurrence Editing
 *
 * Tests the ability to edit component occurrence metadata (position, radical, notes)
 * from the component detail page.
 */

import { expect, test } from '@playwright/test'

test.describe('Component Occurrence Editing (from Component Page)', () => {
  test('can edit component occurrence metadata from component page', async ({
    page
  }) => {
    // Create a component first
    await page.goto('/components/new')
    await expect(
      page.getByRole('heading', { name: /new component/i })
    ).toBeVisible()

    await page.getByLabel(/character/i).fill('氵')
    await page.getByLabel(/stroke count/i).fill('3')
    await page.getByLabel('Description').fill('water radical')

    await page.getByRole('button', { name: /create component/i }).click()
    await expect(page).toHaveURL(/\/components\/\d+/)
    const componentUrl = page.url()
    await page.waitForTimeout(500)

    // Create a kanji with the component
    await page.goto('/kanji/new')
    await expect(
      page.getByRole('heading', { name: /new kanji/i })
    ).toBeVisible()

    await page.getByLabel(/character/i).fill('海')
    await page.getByLabel(/stroke count/i).fill('9')

    // Select the component
    const componentsFieldset = page.locator('fieldset', {
      has: page.getByText('Components', { exact: true })
    })
    await componentsFieldset.scrollIntoViewIfNeeded()
    await componentsFieldset.locator('.base-combobox-multi-trigger').click()
    await page.waitForTimeout(300)

    await page.getByText('氵 — water radical').click()

    // Click outside to close dropdown
    await page.getByRole('heading', { name: /new kanji/i }).click()
    await page.waitForTimeout(200)

    // Submit form
    await page.getByRole('button', { name: /create kanji/i }).click()
    await expect(page).toHaveURL(/\/kanji\/\d+$/, { timeout: 10000 })
    await page.waitForTimeout(500)

    // Verify component is shown on kanji detail page (read-only view)
    await expect(
      page.getByRole('heading', { name: 'Components' })
    ).toBeVisible()
    await expect(
      page.locator('.kanji-detail-components-character')
    ).toContainText('氵')

    // Navigate to component page via the → button
    await page.locator('.kanji-detail-components-view-link').first().click()
    await expect(page).toHaveURL(componentUrl)
    await page.waitForTimeout(500)

    // Now on component page, edit the occurrence inline
    await expect(
      page.getByRole('heading', { name: /kanji using this component/i })
    ).toBeVisible()

    // Find the kanji occurrence (海) and add analysis notes
    const kanjiItem = page.locator('.component-detail-kanji-list-item').filter({
      has: page.locator('a', { hasText: '海' })
    })

    // Click the button to start editing notes
    await kanjiItem.getByRole('button', { name: /add analysis notes/i }).click()
    await page.waitForTimeout(200)

    // Fill in the textarea that appears
    const notesTextarea = kanjiItem.getByRole('textbox')
    await notesTextarea.fill('Provides meaning related to water')

    // Click save button
    await kanjiItem.getByRole('button', { name: /save/i }).click()
    await page.waitForTimeout(500)

    // Verify the notes were saved by checking the button text changed
    await expect(
      kanjiItem.getByRole('button', {
        name: /Provides meaning related to water/i
      })
    ).toBeVisible()
  })

  test('can update position and radical flag from component page', async ({
    page
  }) => {
    // Create a component
    await page.goto('/components/new')
    await page.getByLabel(/character/i).fill('艹')
    await page.getByLabel(/stroke count/i).fill('3')
    await page.getByLabel('Description').fill('grass')
    await page.getByRole('button', { name: /create component/i }).click()
    await expect(page).toHaveURL(/\/components\/\d+/)
    const componentUrl = page.url()
    await page.waitForTimeout(500)

    // Create a kanji with the component
    await page.goto('/kanji/new')
    await page.getByLabel(/character/i).fill('花')
    await page.getByLabel(/stroke count/i).fill('7')

    const componentsFieldset = page.locator('fieldset', {
      has: page.getByText('Components', { exact: true })
    })
    await componentsFieldset.scrollIntoViewIfNeeded()
    await componentsFieldset.locator('.base-combobox-multi-trigger').click()
    await page.waitForTimeout(300)
    await page.getByText('艹 — grass').click()

    await page.getByRole('heading', { name: /new kanji/i }).click()
    await page.waitForTimeout(200)

    await page.getByRole('button', { name: /create kanji/i }).click()
    await expect(page).toHaveURL(/\/kanji\/\d+$/, { timeout: 10000 })
    await page.waitForTimeout(500)

    // Navigate to component page
    await page.locator('.kanji-detail-components-view-link').first().click()
    await expect(page).toHaveURL(componentUrl)
    await page.waitForTimeout(500)

    // Find the kanji occurrence and set it as radical
    const kanjiItem = page.locator('.component-detail-kanji-list-item').filter({
      has: page.locator('a', { hasText: '花' })
    })

    // Check the "Is Radical" checkbox by finding it within the control group
    const radicalCheckbox = kanjiItem.getByRole('checkbox')
    await radicalCheckbox.check()
    await page.waitForTimeout(500)

    // Verify by refreshing
    await page.reload()
    await page.waitForTimeout(500)
    const refreshedItem = page
      .locator('.component-detail-kanji-list-item')
      .filter({
        has: page.locator('a', { hasText: '花' })
      })
    await expect(refreshedItem.getByRole('checkbox')).toBeChecked()
  })

  test('can navigate between kanji and component pages', async ({ page }) => {
    // Create a component
    await page.goto('/components/new')
    await page.getByLabel(/character/i).fill('心')
    await page.getByLabel(/stroke count/i).fill('4')
    await page.getByLabel('Description').fill('heart')
    await page.getByRole('button', { name: /create component/i }).click()
    await expect(page).toHaveURL(/\/components\/\d+/)
    const componentUrl = page.url()
    await page.waitForTimeout(500)

    // Create a kanji with the component
    await page.goto('/kanji/new')
    await page.getByLabel(/character/i).fill('愛')
    await page.getByLabel(/stroke count/i).fill('13')

    const componentsFieldset = page.locator('fieldset', {
      has: page.getByText('Components', { exact: true })
    })
    await componentsFieldset.scrollIntoViewIfNeeded()
    await componentsFieldset.locator('.base-combobox-multi-trigger').click()
    await page.waitForTimeout(300)
    await page.getByText('心 — heart').click()

    await page.getByRole('heading', { name: /new kanji/i }).click()
    await page.waitForTimeout(200)

    await page.getByRole('button', { name: /create kanji/i }).click()
    await expect(page).toHaveURL(/\/kanji\/\d+$/, { timeout: 10000 })
    const kanjiUrl = page.url()
    await page.waitForTimeout(500)

    // Navigate to component page from kanji page
    await page.locator('.kanji-detail-components-view-link').first().click()
    await expect(page).toHaveURL(componentUrl)

    // Navigate back to kanji page from component page
    const kanjiLink = page
      .locator('.component-detail-kanji-list-kanji-link')
      .filter({
        hasText: '愛'
      })
    await kanjiLink.click()
    await expect(page).toHaveURL(kanjiUrl)
  })
})
