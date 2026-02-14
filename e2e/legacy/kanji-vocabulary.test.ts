/**
 * E2E tests for Kanji-Vocabulary Integration
 *
 * Tests the vocabulary section on kanji detail pages.
 */

import { expect, test } from '@playwright/test'

test.describe('Kanji Vocabulary Section', () => {
  test('kanji detail page shows vocabulary section', async ({ page }) => {
    // Navigate to kanji list
    await page.goto('/legacy/kanji')

    // Wait for page load
    await expect(
      page.getByRole('heading', { name: /kanji list/i })
    ).toBeVisible()

    // Seed data if empty
    const seedButton = page.getByRole('button', { name: /seed data/i })
    if (await seedButton.isVisible()) {
      await seedButton.click()
      await expect(
        page
          .getByText('Database seeded successfully! Refresh to see data.')
          .first()
      ).toBeVisible({ timeout: 10000 })
      await page.reload()
      await expect(
        page.getByRole('heading', { name: /kanji list/i })
      ).toBeVisible()
    }

    // Click on 日 kanji (used in 日本 and 金曜日 vocabulary)
    await page.getByRole('link', { name: /日.*sun/i }).click()

    // Wait for detail page to load
    await expect(page).toHaveURL(/\/legacy\/kanji\/\d+/)

    // Vocabulary section heading should be visible
    await expect(
      page.getByRole('heading', { name: /vocabulary/i })
    ).toBeVisible()
  })

  test('vocabulary section shows linked vocabulary', async ({ page }) => {
    // Navigate to kanji list
    await page.goto('/legacy/kanji')

    // Wait for page load
    await expect(
      page.getByRole('heading', { name: /kanji list/i })
    ).toBeVisible()

    // Seed data if empty
    const seedButton = page.getByRole('button', { name: /seed data/i })
    if (await seedButton.isVisible()) {
      await seedButton.click()
      await expect(
        page
          .getByText('Database seeded successfully! Refresh to see data.')
          .first()
      ).toBeVisible({ timeout: 10000 })
      await page.reload()
      await expect(
        page.getByRole('heading', { name: /kanji list/i })
      ).toBeVisible()
    }

    // Navigate to 日 kanji detail
    await page.getByRole('link', { name: /日.*sun/i }).click()
    await expect(page).toHaveURL(/\/legacy\/kanji\/\d+/)

    // Should show vocabulary section heading
    const vocabHeading = page.getByRole('heading', { name: /vocabulary/i })
    await expect(vocabHeading).toBeVisible()

    // Should show vocabulary items that use this kanji
    // 日 is used in 日本 (nihon) and 金曜日 (kinyoubi)
    // Use locator that specifically finds the vocabulary links
    await expect(
      page.getByRole('link', { name: /日本.*にほん/i })
    ).toBeVisible()
    await expect(
      page.getByRole('link', { name: /金曜日.*きんようび/i })
    ).toBeVisible()
  })

  test('vocabulary section has edit button', async ({ page }) => {
    // Navigate to kanji list
    await page.goto('/legacy/kanji')

    // Wait for page load
    await expect(
      page.getByRole('heading', { name: /kanji list/i })
    ).toBeVisible()

    // Seed data if empty
    const seedButton = page.getByRole('button', { name: /seed data/i })
    if (await seedButton.isVisible()) {
      await seedButton.click()
      await expect(
        page
          .getByText('Database seeded successfully! Refresh to see data.')
          .first()
      ).toBeVisible({ timeout: 10000 })
      await page.reload()
      await expect(
        page.getByRole('heading', { name: /kanji list/i })
      ).toBeVisible()
    }

    // Navigate to 日 kanji detail
    await page.getByRole('link', { name: /日.*sun/i }).click()
    await expect(page).toHaveURL(/\/legacy\/kanji\/\d+/)

    // Find the Vocabulary section - it should have an Edit button
    const vocabHeading = page.getByRole('heading', { name: /vocabulary/i })
    await expect(vocabHeading).toBeVisible()

    // There should be an Edit button near the vocabulary section
    // Since there are multiple Edit buttons, look for one after the vocabulary heading
    const editButtons = page.getByRole('button', { name: /^edit$/i })
    await expect(editButtons.first()).toBeVisible()
  })

  test('vocabulary item links to vocabulary detail page', async ({ page }) => {
    // Navigate to kanji list
    await page.goto('/legacy/kanji')

    // Wait for page load
    await expect(
      page.getByRole('heading', { name: /kanji list/i })
    ).toBeVisible()

    // Seed data if empty
    const seedButton = page.getByRole('button', { name: /seed data/i })
    if (await seedButton.isVisible()) {
      await seedButton.click()
      await expect(
        page
          .getByText('Database seeded successfully! Refresh to see data.')
          .first()
      ).toBeVisible({ timeout: 10000 })
      await page.reload()
      await expect(
        page.getByRole('heading', { name: /kanji list/i })
      ).toBeVisible()
    }

    // Navigate to 日 kanji detail
    await page.getByRole('link', { name: /日.*sun/i }).click()
    await expect(page).toHaveURL(/\/legacy\/kanji\/\d+/)

    // Click on a vocabulary link (日本)
    await page.getByRole('link', { name: /日本/ }).click()

    // Should navigate to vocabulary detail page
    await expect(page).toHaveURL(/\/legacy\/vocabulary\/\d+/)
  })
})
