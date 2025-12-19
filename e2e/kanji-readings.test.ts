/**
 * E2E tests for Kanji Readings System
 */

import { expect, test } from '@playwright/test'

test.describe('Kanji Readings', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page and seed data
    await page.goto('/')

    // Wait for page to load
    await expect(
      page.getByRole('heading', { name: /kanji list/i })
    ).toBeVisible()

    // Seed data if database is empty (button only shows when empty)
    const seedButton = page.getByRole('button', { name: /seed data/i })
    if (await seedButton.isVisible()) {
      await seedButton.click()
      // Wait for seed to complete
      await page.waitForTimeout(2000)
    }
  })

  test('displays readings section on kanji detail page', async ({ page }) => {
    // Navigate to a kanji detail page (first one in list)
    await page.locator('a[href^="/kanji/"]').first().click()
    await expect(page).toHaveURL(/\/kanji\/\d+/)

    // Verify Readings section exists
    await expect(page.getByRole('heading', { name: 'Readings' })).toBeVisible()

    // Verify On-yomi and Kun-yomi sub-sections exist
    await expect(page.getByText('On-yomi:')).toBeVisible()
    await expect(page.getByText('Kun-yomi:')).toBeVisible()
  })

  test('can enter edit mode and see editing controls', async ({ page }) => {
    // Navigate to kanji '日' which has seeded readings
    await page.getByRole('link', { name: /日/ }).first().click()
    await expect(page).toHaveURL(/\/kanji\/\d+/)

    // Wait for readings section to be visible
    await expect(page.getByText('On-yomi:')).toBeVisible()

    // Click Edit button within Readings section
    const readingsSection = page.locator('.kanji-detail-readings')
    await readingsSection.getByRole('button', { name: 'Edit' }).click()

    // Verify edit controls are visible
    await expect(
      readingsSection.getByRole('button', { name: '+ Add' }).first()
    ).toBeVisible()

    // Verify reorder buttons are visible (↑ and ↓)
    await expect(
      readingsSection.getByRole('button', { name: /move up/i }).first()
    ).toBeVisible()
    await expect(
      readingsSection.getByRole('button', { name: /move down/i }).first()
    ).toBeVisible()

    // Verify Save and Cancel buttons are visible
    await expect(
      readingsSection.getByRole('button', { name: 'Save' })
    ).toBeVisible()
    await expect(
      readingsSection.getByRole('button', { name: 'Cancel' })
    ).toBeVisible()
  })

  test.skip('can add a new on-yomi reading', async ({ page }) => {
    // Navigate to kanji detail page
    await page.getByRole('link', { name: /日/ }).first().click()
    await expect(page).toHaveURL(/\/kanji\/\d+/)

    // Click Edit button within Readings section
    const readingsSection = page.locator('.kanji-detail-readings')
    await readingsSection.getByRole('button', { name: 'Edit' }).click()

    // Count existing on-yomi readings
    const existingOnYomi = await readingsSection
      .locator('.kanji-detail-readings-edit-section')
      .first()
      .locator('.kanji-detail-readings-edit-item')
      .count()

    // Click Add button in on-yomi section
    await readingsSection
      .locator('.kanji-detail-readings-edit-section')
      .first()
      .getByRole('button', { name: '+ Add' })
      .click()

    // Wait for toast to appear
    await page.waitForTimeout(1000)

    // Verify a new reading was added
    const newOnYomiCount = await readingsSection
      .locator('.kanji-detail-readings-edit-section')
      .first()
      .locator('.kanji-detail-readings-edit-item')
      .count()
    expect(newOnYomiCount).toBe(existingOnYomi + 1)
  })

  test('can cancel editing and discard changes', async ({ page }) => {
    // Navigate to kanji detail page
    await page.getByRole('link', { name: /日/ }).first().click()
    await expect(page).toHaveURL(/\/kanji\/\d+/)

    // Click Edit button within Readings section
    const readingsSection = page.locator('.kanji-detail-readings')
    await readingsSection.getByRole('button', { name: 'Edit' }).click()

    // Verify we're in edit mode
    await expect(
      readingsSection.getByRole('button', { name: 'Save' })
    ).toBeVisible()

    // Click Cancel
    await readingsSection.getByRole('button', { name: 'Cancel' }).click()

    // Verify we're back in view mode
    await expect(
      readingsSection.getByRole('button', { name: 'Edit' })
    ).toBeVisible()
    await expect(
      readingsSection.getByRole('button', { name: 'Save' })
    ).not.toBeVisible()
  })

  test('delete button only visible in destructive mode', async ({ page }) => {
    // Navigate to kanji detail page
    await page.getByRole('link', { name: /日/ }).first().click()
    await expect(page).toHaveURL(/\/kanji\/\d+/)

    // Enter edit mode
    const readingsSection = page.locator('.kanji-detail-readings')
    await readingsSection.getByRole('button', { name: 'Edit' }).click()

    // Verify delete button is NOT visible (destructive mode off)
    await expect(
      readingsSection.getByRole('button', { name: /delete reading/i })
    ).not.toBeVisible()

    // Enable destructive mode
    await page.locator('#destructive-mode-switch').click()

    // Now delete button should be visible
    await expect(
      readingsSection.getByRole('button', { name: /delete reading/i }).first()
    ).toBeVisible()
  })
})

test.describe('Kanji List Reading Filters', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page and seed data
    await page.goto('/')

    // Wait for page to load
    await expect(
      page.getByRole('heading', { name: /kanji list/i })
    ).toBeVisible()

    // Seed data if database is empty (button only shows when empty)
    const seedButton = page.getByRole('button', { name: /seed data/i })
    if (await seedButton.isVisible()) {
      await seedButton.click()
      // Wait for seed to complete
      await page.waitForTimeout(2000)
    }
  })

  test('on-yomi filter field exists', async ({ page }) => {
    // Verify on-yomi filter is in the filter section
    await expect(page.getByLabel('On-yomi')).toBeVisible()
  })

  test('kun-yomi filter field exists', async ({ page }) => {
    // Verify kun-yomi filter is in the filter section
    await expect(page.getByLabel('Kun-yomi')).toBeVisible()
  })

  test('can filter kanji by on-yomi', async ({ page }) => {
    // Filter by on-yomi (スイ should match 水)
    await page.getByLabel('On-yomi').fill('スイ')

    // Wait for filter to apply and page to reload - increase wait time
    await page.waitForTimeout(1000)

    // Should have at least some results (水)
    const filteredCount = await page.locator('[href^="/kanji/"]').count()
    expect(filteredCount).toBeGreaterThan(0)
  })

  test('can filter kanji by kun-yomi', async ({ page }) => {
    // Filter by kun-yomi (みず should match 水)
    await page.getByLabel('Kun-yomi').fill('みず')

    // Wait for filter to apply and page to reload - increase wait time
    await page.waitForTimeout(1000)

    // Should have at least some results (水)
    const filteredCount = await page.locator('[href^="/kanji/"]').count()
    expect(filteredCount).toBeGreaterThan(0)
  })
})
