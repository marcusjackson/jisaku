/**
 * E2E tests for Kanji List page
 */

import { expect, test } from '@playwright/test'

test.describe('Kanji List Page', () => {
  test('displays empty state when no kanji exist', async ({ page }) => {
    await page.goto('/')

    // Wait for loading to complete
    await expect(
      page.getByRole('heading', { name: /kanji list/i })
    ).toBeVisible()

    // Should show empty state message
    await expect(page.getByText(/no kanji yet/i)).toBeVisible()

    // Should show "Add Your First Kanji" button
    await expect(
      page.getByRole('button', { name: /add your first kanji/i })
    ).toBeVisible()
  })

  test('has working navigation header', async ({ page }) => {
    await page.goto('/')

    // Header should be visible
    await expect(page.locator('header')).toBeVisible()

    // Navigation links should be present
    await expect(page.getByRole('link', { name: /home/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /components/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /settings/i })).toBeVisible()
  })

  test('Add Kanji button navigates to new kanji page', async ({ page }) => {
    await page.goto('/')

    // Wait for page to load
    await expect(
      page.getByRole('heading', { name: /kanji list/i })
    ).toBeVisible()

    // Click "Add Kanji" button
    await page
      .getByRole('button', { name: /add kanji/i })
      .first()
      .click()

    // Should navigate to new kanji page
    await expect(page).toHaveURL('/kanji/new')
  })

  test('page title is set correctly', async ({ page }) => {
    await page.goto('/')

    await expect(page).toHaveTitle(/kanji list/i)
  })

  test('navigation to Components page works', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('link', { name: /components/i }).click()

    await expect(page).toHaveURL('/components')
  })

  test('navigation to Settings page works', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('link', { name: /settings/i }).click()

    await expect(page).toHaveURL('/settings')
  })
})
