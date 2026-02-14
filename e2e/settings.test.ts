/**
 * Settings E2E Tests
 *
 * Tests for the settings page functionality.
 */

import { expect, test } from '@playwright/test'

test.describe('Settings Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /settings/i }).click()
    await expect(page).toHaveURL('/settings')
  })

  test('displays page title and sections', async ({ page }) => {
    await expect(
      page.getByRole('heading', { level: 1, name: /settings/i })
    ).toBeVisible()

    await expect(
      page.getByRole('heading', { level: 2, name: /appearance/i })
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: /position types/i })
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: /classification types/i })
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: /data management/i })
    ).toBeVisible()
  })

  test('toggles theme between light and dark', async ({ page }) => {
    const htmlElement = page.locator('html')

    const initialTheme = await htmlElement.getAttribute('data-theme')

    const themeSwitch = page
      .getByTestId('settings-appearance')
      .getByRole('switch')
    await themeSwitch.click()

    const newTheme = await htmlElement.getAttribute('data-theme')

    if (initialTheme === 'dark') {
      expect(newTheme).toBeNull()
    } else {
      expect(newTheme).toBe('dark')
    }
  })

  test('displays app version', async ({ page }) => {
    await expect(page.getByText('App Version')).toBeVisible()
    await expect(page.getByText(/\d+\.\d+\.\d+/)).toBeVisible()
  })

  test('expands and collapses collapsible sections', async ({ page }) => {
    const databaseSection = page.getByTestId('settings-database')

    await expect(databaseSection.getByText('Export Database')).not.toBeVisible()

    await databaseSection
      .getByRole('button', { name: /data management/i })
      .click()

    await expect(databaseSection.getByText('Export Database')).toBeVisible()

    await databaseSection.getByRole('button', { name: /collapse/i }).click()

    await expect(databaseSection.getByText('Export Database')).not.toBeVisible()
  })

  test('shows placeholder for position types', async ({ page }) => {
    const positionSection = page.getByTestId('settings-position-types')

    await positionSection
      .getByRole('button', { name: /position types/i })
      .click()

    await expect(positionSection.getByText('Coming soon...')).toBeVisible()
  })

  test('shows placeholder for classification types', async ({ page }) => {
    const classificationSection = page.getByTestId(
      'settings-classification-types'
    )

    await classificationSection
      .getByRole('button', { name: /classification types/i })
      .click()

    await expect(
      classificationSection.getByText('Coming soon...')
    ).toBeVisible()
  })

  test('database section has export/import/clear buttons', async ({ page }) => {
    const databaseSection = page.getByTestId('settings-database')

    await databaseSection
      .getByRole('button', { name: /data management/i })
      .click()

    await expect(
      databaseSection.getByRole('button', { name: /^export$/i })
    ).toBeVisible()
    await expect(
      databaseSection.getByRole('button', { name: /^import$/i })
    ).toBeVisible()
    await expect(
      databaseSection.getByRole('button', { name: /clear all data/i })
    ).toBeVisible()
  })

  test('version toggle switches to legacy settings', async ({ page }) => {
    const versionToggle = page.getByRole('navigation').getByRole('switch')
    await versionToggle.click()

    await expect(page).toHaveURL('/legacy/settings')

    await expect(
      page.getByRole('heading', { level: 1, name: /settings/i })
    ).toBeVisible()
  })

  test('navigates from legacy settings to refactored', async ({ page }) => {
    await page.goto('/legacy/settings')

    const versionToggle = page.getByRole('navigation').getByRole('switch')
    await versionToggle.click()

    await expect(page).toHaveURL('/settings')

    await expect(
      page.getByRole('heading', { level: 1, name: /settings/i })
    ).toBeVisible()
  })
})
