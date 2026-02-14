/**
 * E2E tests for Kanji List page
 */

import { expect, test } from '@playwright/test'

test.describe('Kanji List Page', () => {
  test('displays empty state when no kanji exist', async ({ page }) => {
    await page.goto('/legacy/kanji')

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
    await page.goto('/legacy/kanji')

    // Header should be visible (use banner role to be specific)
    await expect(page.getByRole('banner')).toBeVisible()

    // Navigation links should be present
    await expect(page.getByRole('link', { name: /kanji/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /components/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /settings/i })).toBeVisible()
  })

  test('Add Kanji button navigates to new kanji page', async ({ page }) => {
    await page.goto('/legacy/kanji')

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
    await expect(page).toHaveURL('/legacy/kanji/new')
  })

  test('page title is set correctly', async ({ page }) => {
    await page.goto('/legacy/kanji')

    await expect(page).toHaveTitle(/kanji list/i)
  })

  test('navigation to Components page works', async ({ page }) => {
    await page.goto('/legacy/kanji')

    await page.getByRole('link', { name: /components/i }).click()

    await expect(page).toHaveURL('/legacy/components')
  })

  test('navigation to Settings page works', async ({ page }) => {
    await page.goto('/legacy/kanji')

    await page.getByRole('link', { name: /settings/i }).click()

    await expect(page).toHaveURL('/legacy/settings')
  })
})
