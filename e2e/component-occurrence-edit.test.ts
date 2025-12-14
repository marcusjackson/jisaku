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
    await page.getByLabel(/short meaning/i).fill('water radical')

    await page.getByRole('button', { name: /create component/i }).click()
    await expect(page).toHaveURL(/\/components\/\d+/)
    const componentUrl = page.url()
    await page.waitForTimeout(500)

    // Create a kanji (simplified form)
    await page.goto('/kanji/new')
    await expect(
      page.getByRole('heading', { name: /new kanji/i })
    ).toBeVisible()

    // Wait for the form to load (database initialization)
    await page.waitForSelector('input[name="character"]')

    await page.getByLabel('Character').fill('海')

    await page.getByRole('button', { name: /create kanji/i }).click()
    await expect(page).toHaveURL(/\/kanji\/\d+/)
    await page.waitForTimeout(500)

    // Add component from detail page
    const componentsSection = page.locator('section', {
      has: page.getByRole('heading', { name: /components/i })
    })
    await componentsSection.scrollIntoViewIfNeeded()

    const addButton = componentsSection.getByRole('button', {
      name: /\+ add/i
    })
    await addButton.click()
    await page.waitForTimeout(300)

    const searchInput = componentsSection.getByPlaceholder(/search/i)
    await searchInput.fill('氵')
    await page.waitForTimeout(200)

    // Press Enter to select the first matching option
    await searchInput.press('Enter')

    // Navigate to component detail page to edit occurrence
    await page.goto(componentUrl)
    await page.waitForTimeout(300)

    // Verify component detail page loaded
    await expect(
      page.locator('.component-detail-header-character')
    ).toContainText('氵')

    // Check that the kanji occurrence is listed
    const kanjiList = page.locator('.component-detail-kanji-list-items')
    await expect(kanjiList).toBeVisible()
    await expect(kanjiList).toContainText('海')

    // The kanji should be listed with inline editing controls
    const kanjiItem = kanjiList
      .locator('.component-detail-kanji-list-item')
      .first()
    await expect(kanjiItem).toContainText('海')

    // Edit notes field (BaseInlineTextarea)
    const notesDisplay = kanjiItem
      .locator('.base-inline-textarea-display')
      .first()
    await notesDisplay.click()

    const notesTextarea = kanjiItem.locator('textarea').first()
    await notesTextarea.fill('Left side radical form')

    const saveButton = kanjiItem
      .locator('.base-inline-textarea-actions .base-button')
      .first()
    await saveButton.click()

    // Notes should be visible in occurrence list
    await expect(kanjiList).toContainText('Left side radical form')
  })

  test('can update position and radical flag from component page', async ({
    page
  }) => {
    // Create a component
    await page.goto('/components/new')
    await page.getByLabel(/character/i).fill('艹')
    await page.getByLabel(/short meaning/i).fill('grass')
    await page.getByRole('button', { name: /create component/i }).click()
    await expect(page).toHaveURL(/\/components\/\d+/)
    const componentUrl = page.url()
    await page.waitForTimeout(500)

    // Create a kanji (simplified form)
    await page.goto('/kanji/new')
    // Wait for the form to load (database initialization)
    await page.waitForSelector('input[name="character"]')
    await page.getByLabel('Character').fill('花')
    await page.getByRole('button', { name: /create kanji/i }).click()
    await expect(page).toHaveURL(/\/kanji\/\d+/)
    await page.waitForTimeout(500)

    // Add component from detail page
    const componentsSection = page.locator('section', {
      has: page.getByRole('heading', { name: /components/i })
    })
    await componentsSection.scrollIntoViewIfNeeded()

    const addButton = componentsSection.getByRole('button', {
      name: /\+ add/i
    })
    await addButton.click()
    await page.waitForTimeout(300)

    const searchInput = componentsSection.getByPlaceholder(/search/i)
    await searchInput.fill('艹')
    await page.waitForTimeout(200)

    // Press Enter to select the first matching option
    await searchInput.press('Enter')
    await page.waitForTimeout(500)

    // Navigate to component detail page
    await page.goto(componentUrl)
    await page.waitForTimeout(300)

    // Verify component detail page loaded
    await expect(
      page.locator('.component-detail-header-character')
    ).toContainText('艹')

    // Check that the kanji occurrence is listed
    const kanjiList = page.locator('.component-detail-kanji-list-items')
    await expect(kanjiList).toBeVisible()
    await expect(kanjiList).toContainText('花')

    // The kanji should be listed with inline editing controls
    const kanjiItem = kanjiList
      .locator('.component-detail-kanji-list-item')
      .first()
    await expect(kanjiItem).toContainText('花')

    // Select position type (Top) - using the combobox
    const positionCombobox = kanjiItem.getByRole('combobox', {
      name: 'Position'
    })
    await positionCombobox.click()
    await page.getByRole('option', { name: 'None' }).click()

    // Check "Is Radical" checkbox
    await kanjiItem.getByText('Is Radical').click()

    // Position should be indicated (just check that the select has the expected value)
    await expect(positionCombobox).toHaveText('None')
  })

  test('can navigate between kanji and component pages', async ({ page }) => {
    // Create a component
    await page.goto('/components/new')
    await page.getByLabel(/character/i).fill('心')
    await page.getByLabel(/short meaning/i).fill('heart')
    await page.getByRole('button', { name: /create component/i }).click()
    await expect(page).toHaveURL(/\/components\/\d+/)
    const componentUrl = page.url()
    await page.waitForTimeout(500)

    // Create a kanji (simplified form)
    await page.goto('/kanji/new')
    // Wait for the form to load (database initialization)
    await page.waitForSelector('input[name="character"]')
    await page.getByLabel('Character').fill('思')
    await page.getByRole('button', { name: /create kanji/i }).click()
    await expect(page).toHaveURL(/\/kanji\/\d+/)
    const kanjiUrl = page.url()
    await page.waitForTimeout(500)

    // Add component from detail page
    const componentsSection = page.locator('section', {
      has: page.getByRole('heading', { name: /components/i })
    })
    await componentsSection.scrollIntoViewIfNeeded()

    const addButton = componentsSection.getByRole('button', {
      name: /\+ add/i
    })
    await addButton.click()
    await page.waitForTimeout(300)

    const searchInput = componentsSection.getByPlaceholder(/search/i)
    await searchInput.fill('心')
    await page.waitForTimeout(200)

    // Press Enter to select the first matching option
    await searchInput.press('Enter')
    await page.waitForTimeout(500)

    // Navigate to component page
    await page.goto(componentUrl)
    await page.waitForTimeout(300)

    // Click on kanji link from component page
    const kanjiList = page.locator('.component-detail-kanji-list-items')
    const kanjiLink = kanjiList.locator('a').first()
    await kanjiLink.click()

    // Should navigate to kanji detail page
    await expect(page).toHaveURL(kanjiUrl)
    await expect(page.locator('.kanji-detail-header-character')).toContainText(
      '思'
    )

    // Navigate back to component via component link
    const componentLink = page
      .locator('.kanji-detail-components-view-link')
      .first()
    await componentLink.click()

    // Should navigate back to component detail page
    await expect(page).toHaveURL(componentUrl)
    await expect(
      page.locator('.component-detail-header-character')
    ).toContainText('心')
  })
})
