/**
 * E2E tests for Kanji List Filters
 */

import { expect, test } from '@playwright/test'

test.describe('Kanji List Filters', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/legacy/kanji')

    // Wait for page to load
    await expect(
      page.getByRole('heading', { name: /kanji list/i })
    ).toBeVisible()
  })

  test.describe('Filter Panel', () => {
    test('renders all filter components', async ({ page }) => {
      // Character filter
      await expect(
        page.getByRole('textbox', { name: /character/i })
      ).toBeVisible()

      // Stroke range filters
      await expect(
        page.getByRole('spinbutton', { name: /minimum strokes/i })
      ).toBeVisible()
      await expect(
        page.getByRole('spinbutton', { name: /maximum strokes/i })
      ).toBeVisible()

      // Component dropdown
      await expect(
        page.getByRole('combobox', { name: /component/i })
      ).toBeVisible()

      // JLPT level chips
      await expect(page.getByText('JLPT Level')).toBeVisible()
      await expect(page.getByRole('button', { name: 'N5' })).toBeVisible()
      await expect(page.getByRole('button', { name: 'N1' })).toBeVisible()

      // Joyo level chips
      await expect(page.getByText('Joyo Level')).toBeVisible()
      await expect(page.getByRole('button', { name: /小1/i })).toBeVisible()
    })

    test('JLPT chips toggle selection state', async ({ page }) => {
      const n5Button = page.getByRole('button', { name: 'N5' })

      // Initially not pressed
      await expect(n5Button).toHaveAttribute('aria-pressed', 'false')

      // Click to select
      await n5Button.click()
      await expect(n5Button).toHaveAttribute('aria-pressed', 'true')

      // Click to deselect
      await n5Button.click()
      await expect(n5Button).toHaveAttribute('aria-pressed', 'false')
    })

    test('multiple JLPT levels can be selected', async ({ page }) => {
      const n5Button = page.getByRole('button', { name: 'N5' })
      const n4Button = page.getByRole('button', { name: 'N4' })

      await n5Button.click()
      await n4Button.click()

      await expect(n5Button).toHaveAttribute('aria-pressed', 'true')
      await expect(n4Button).toHaveAttribute('aria-pressed', 'true')
    })

    test('Joyo chips toggle selection state', async ({ page }) => {
      const grade1Button = page.getByRole('button', { name: /小1/i })

      // Initially not pressed
      await expect(grade1Button).toHaveAttribute('aria-pressed', 'false')

      // Click to select
      await grade1Button.click()
      await expect(grade1Button).toHaveAttribute('aria-pressed', 'true')
    })
  })

  test.describe('URL Sync', () => {
    test('character filter updates URL', async ({ page }) => {
      await page.getByRole('textbox', { name: /character/i }).fill('日')

      // Wait for debounce
      await page.waitForTimeout(200)

      await expect(page).toHaveURL(/character=%E6%97%A5/)
    })

    test('stroke min filter updates URL', async ({ page }) => {
      await page.getByRole('spinbutton', { name: /minimum strokes/i }).fill('5')

      await expect(page).toHaveURL(/strokeMin=5/)
    })

    test('stroke max filter updates URL', async ({ page }) => {
      await page
        .getByRole('spinbutton', { name: /maximum strokes/i })
        .fill('10')

      await expect(page).toHaveURL(/strokeMax=10/)
    })

    test('JLPT filter updates URL', async ({ page }) => {
      await page.getByRole('button', { name: 'N3' }).click()

      await expect(page).toHaveURL(/jlpt=N3/)
    })

    test('multiple JLPT levels in URL', async ({ page }) => {
      await page.getByRole('button', { name: 'N5' }).click()
      await page.getByRole('button', { name: 'N4' }).click()

      // URL may or may not encode the comma
      await expect(page).toHaveURL(/jlpt=N5[,|%2C]N4/)
    })

    test('Joyo filter updates URL', async ({ page }) => {
      await page.getByRole('button', { name: /小1/i }).click()

      await expect(page).toHaveURL(/joyo=elementary1/)
    })

    test('URL params restore filter state on page load', async ({ page }) => {
      // Navigate with URL params
      await page.goto('/?jlpt=N3&strokeMin=5')

      // JLPT N3 should be selected
      await expect(page.getByRole('button', { name: 'N3' })).toHaveAttribute(
        'aria-pressed',
        'true'
      )

      // Stroke min should be filled
      await expect(
        page.getByRole('spinbutton', { name: /minimum strokes/i })
      ).toHaveValue('5')
    })
  })

  test.describe('Clear Filters', () => {
    test('clear button appears when filters active', async ({ page }) => {
      // No clear button initially
      await expect(
        page.getByRole('button', { name: /clear filters/i })
      ).not.toBeVisible()

      // Apply a filter
      await page.getByRole('button', { name: 'N5' }).click()

      // Clear button should appear
      await expect(
        page.getByRole('button', { name: /clear filters/i })
      ).toBeVisible()
    })

    test('clear button resets all filters', async ({ page }) => {
      // Apply multiple filters
      await page.getByRole('button', { name: 'N5' }).click()
      await page.getByRole('spinbutton', { name: /minimum strokes/i }).fill('5')

      // Click clear
      await page.getByRole('button', { name: /clear filters/i }).click()

      // Filters should be reset
      await expect(page.getByRole('button', { name: 'N5' })).toHaveAttribute(
        'aria-pressed',
        'false'
      )
      await expect(
        page.getByRole('spinbutton', { name: /minimum strokes/i })
      ).toHaveValue('')

      // URL should be clean
      await expect(page).toHaveURL('/legacy/kanji')
    })
  })

  test.describe('Filter Results', () => {
    test('shows "no results" when filter returns empty', async ({ page }) => {
      // First add a kanji via settings (seed data)
      await page.goto('/legacy/settings')

      // Expand Developer Tools section (collapsed by default)
      await page.getByRole('button', { name: /developer tools/i }).click()

      // Now click Seed Data button
      await page.getByRole('button', { name: /seed data/i }).click()

      // Wait for seed to complete
      await page.waitForTimeout(500)

      // Go back to list
      await page.goto('/legacy/kanji')

      // Apply a filter that won't match anything
      await page.getByRole('textbox', { name: /character/i }).fill('zzz')

      // Wait for debounce
      await page.waitForTimeout(200)

      // Should show no results message
      await expect(page.getByText(/no kanji match your filters/i)).toBeVisible()
    })
  })
})
