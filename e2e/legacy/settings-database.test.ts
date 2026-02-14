/**
 * E2E tests for Settings Database Export/Import operations
 */

import { expect, test } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

test.describe('Settings Database Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to settings page
    await page.goto('/legacy/settings')

    // Wait for page to load
    await expect(
      page.getByRole('heading', { name: /^settings$/i })
    ).toBeVisible()

    // Expand the Data Management section (collapsed by default)
    // Click on the section trigger button which contains the heading
    await page.getByRole('button', { name: /data management/i }).click()

    // Wait for section content to be visible
    await expect(
      page.getByRole('heading', { name: /export database/i })
    ).toBeVisible()
  })

  test('displays data management section', async ({ page }) => {
    // Get the Data Management section specifically
    const dataSection = page.locator('.settings-section-database')

    // Check section title
    await expect(
      page.getByRole('heading', { name: /data management/i })
    ).toBeVisible()

    // Check export action
    await expect(
      page.getByRole('heading', { name: /export database/i })
    ).toBeVisible()
    await expect(page.getByRole('button', { name: /^export$/i })).toBeVisible()

    // Check import action
    await expect(
      page.getByRole('heading', { name: /import database/i })
    ).toBeVisible()
    await expect(page.getByRole('button', { name: /^import$/i })).toBeVisible()

    // Check clear action within Data Management section
    await expect(
      dataSection.getByRole('heading', { name: /clear all data/i })
    ).toBeVisible()
    await expect(
      dataSection.getByRole('button', { name: /clear all data/i })
    ).toBeVisible()

    // Check version is visible in Appearance section (moved from database section)
    await expect(
      page.getByRole('heading', { name: /^version$/i })
    ).toBeVisible()
  })

  test('export database downloads a file', async ({ page }) => {
    // Set up download listener before clicking
    const downloadPromise = page.waitForEvent('download')

    // Click export button
    await page.getByRole('button', { name: /^export$/i }).click()

    // Wait for download
    const download = await downloadPromise

    // Verify filename format
    const filename = download.suggestedFilename()
    expect(filename).toMatch(/^kanji-dictionary-\d{4}-\d{2}-\d{2}\.db$/)

    // Optionally verify the file was saved
    const downloadPath = await download.path()
    expect(downloadPath).toBeTruthy()

    // Check success toast appears (use exact text to avoid duplicates)
    await expect(
      page.getByText('Database exported successfully', { exact: true })
    ).toBeVisible()
  })

  test('import shows confirmation dialog', async ({ page }) => {
    // Create a test database file
    const testDbPath = path.join(__dirname, 'fixtures', 'test-import.db')

    // Click import button - this should trigger file chooser
    const fileChooserPromise = page.waitForEvent('filechooser')
    await page.getByRole('button', { name: /^import$/i }).click()

    const fileChooser = await fileChooserPromise

    // Check that file chooser accepts correct file types
    expect(fileChooser.isMultiple()).toBe(false)

    // If test fixture exists, use it; otherwise skip the import test
    if (fs.existsSync(testDbPath)) {
      await fileChooser.setFiles(testDbPath)

      // Should show confirmation dialog
      await expect(page.getByRole('dialog')).toBeVisible()
      await expect(page.getByText(/replace all existing data/i)).toBeVisible()

      // Cancel import
      await page.getByRole('button', { name: /cancel/i }).click()
      await expect(page.getByRole('dialog')).not.toBeVisible()
    }
  })

  test('clear data shows confirmation dialog and clears data', async ({
    page
  }) => {
    // Get the Data Management section specifically
    const dataSection = page.locator('.settings-section-database')

    // First, seed some data to clear
    // Go to seed data section
    const seedButton = page.getByRole('button', { name: /seed data/i })
    if (await seedButton.isVisible()) {
      await seedButton.click()
      // Wait for seed to complete
      await page.waitForTimeout(2000)
    }

    // Click clear button in Data Management section
    await dataSection.getByRole('button', { name: /clear all data/i }).click()

    // Should show confirmation dialog
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByText(/permanently delete/i)).toBeVisible()

    // Click confirm
    await page.getByRole('button', { name: /clear all/i }).click()

    // Dialog should close
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Wait for operation to complete
    await page.waitForTimeout(1000)

    // Check success toast appears (use exact text)
    await expect(
      page.getByText('All data cleared successfully', { exact: true })
    ).toBeVisible()

    // Navigate to home to verify data is cleared
    await page.goto('/legacy/kanji')
    await expect(
      page.getByRole('heading', { name: /kanji list/i })
    ).toBeVisible()

    // Should show empty state (text from KanjiListSectionGrid.vue)
    await expect(page.getByText(/no kanji yet/i)).toBeVisible()
  })

  test('cancel clear data does not clear data', async ({ page }) => {
    // Get the Data Management section specifically
    const dataSection = page.locator('.settings-section-database')

    // Click clear button in Data Management section
    await dataSection.getByRole('button', { name: /clear all data/i }).click()

    // Should show confirmation dialog
    await expect(page.getByRole('dialog')).toBeVisible()

    // Click cancel
    await page.getByRole('button', { name: /cancel/i }).click()

    // Dialog should close
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // No success toast should appear
    await expect(
      page.getByText('All data cleared successfully', { exact: true })
    ).not.toBeVisible()
  })

  test('displays app version', async ({ page }) => {
    // Check version is displayed in Appearance section
    const versionText = page.locator(
      '.settings-section-appearance-option-description',
      {
        hasText: /^v\d+\.\d+\.\d+$/
      }
    )
    await expect(versionText).toBeVisible()

    // Version should be in semver format
    const version = await versionText.textContent()
    expect(version).toMatch(/^v\d+\.\d+\.\d+$/)
  })
})
