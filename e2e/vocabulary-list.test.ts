/**
 * E2E tests for Vocabulary List page
 */

import { expect, test } from '@playwright/test'

test.describe('Vocabulary List Page', () => {
  test('displays empty state when no vocabulary exist', async ({ page }) => {
    await page.goto('/vocabulary')

    // Wait for loading to complete
    await expect(
      page.getByRole('heading', { name: /vocabulary/i })
    ).toBeVisible()

    // Should show empty state message
    await expect(page.getByText(/no vocabulary yet/i)).toBeVisible()

    // Should show "Add Your First Vocabulary" button
    await expect(
      page.getByRole('button', { name: /add your first vocabulary/i })
    ).toBeVisible()
  })

  test('has working navigation header', async ({ page }) => {
    await page.goto('/vocabulary')

    // Header should be visible
    await expect(page.locator('header')).toBeVisible()

    // Navigation links should be present
    await expect(page.getByRole('link', { name: /kanji/i })).toBeVisible()
    // Components link should be present
    await expect(page.getByRole('link', { name: /components/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /settings/i })).toBeVisible()
  })

  test('page title is set correctly', async ({ page }) => {
    await page.goto('/vocabulary')

    await expect(page).toHaveTitle(/vocabulary list/i)
  })

  test('opens quick create dialog when clicking Add Vocabulary', async ({
    page
  }) => {
    await page.goto('/vocabulary')

    // Wait for page to load
    await expect(
      page.getByRole('heading', { name: /vocabulary/i })
    ).toBeVisible()

    // Click "Add Vocabulary" button
    await page
      .getByRole('button', { name: /add vocabulary/i })
      .first()
      .click()

    // Should open quick create dialog
    await expect(
      page.getByRole('dialog', { name: /quick create vocabulary/i })
    ).toBeVisible()

    // Dialog should have required fields
    await expect(page.getByRole('textbox', { name: /word/i })).toBeVisible()
    await expect(page.getByRole('textbox', { name: /kana/i })).toBeVisible()
    await expect(
      page.getByRole('textbox', { name: /short meaning/i })
    ).toBeVisible()
  })

  test('quick create form validation requires word and kana', async ({
    page
  }) => {
    await page.goto('/vocabulary')

    // Open quick create dialog
    await page
      .getByRole('button', { name: /add vocabulary/i })
      .first()
      .click()
    await expect(
      page.getByRole('dialog', { name: /quick create vocabulary/i })
    ).toBeVisible()

    // Try to submit without filling required fields
    await page.getByRole('button', { name: /create & view/i }).click()

    // Should show validation error for word
    await expect(page.getByText(/word is required/i)).toBeVisible()
  })

  test('filters section is visible', async ({ page }) => {
    await page.goto('/vocabulary')

    // Wait for page to load first
    await expect(
      page.getByRole('heading', { name: /vocabulary/i })
    ).toBeVisible()

    // Should have filters section - it's a button that expands
    await expect(page.getByRole('button', { name: /filters/i })).toBeVisible()
  })

  test('can navigate to kanji list from header', async ({ page }) => {
    await page.goto('/vocabulary')

    // Wait for page to load
    await expect(
      page.getByRole('heading', { name: /vocabulary/i })
    ).toBeVisible()

    // Click on Kanji link in header
    await page.getByRole('link', { name: /kanji/i }).click()

    // Should navigate to kanji list
    await expect(page).toHaveURL(/\/kanji/)
  })
})
