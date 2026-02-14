/**
 * E2E tests for Vocabulary List Page (New UI)
 */

import { expect, test } from '@playwright/test'

test.describe('Vocabulary List Page', () => {
  test('displays loading state then content', async ({ page }) => {
    await page.goto('/vocabulary')

    // Wait for title and content to load
    await expect(
      page.getByRole('heading', { name: /vocabulary/i })
    ).toBeVisible()
  })

  test('displays empty state when no vocabulary exist', async ({ page }) => {
    await page.goto('/vocabulary')

    // Wait for page to load
    await expect(
      page.getByRole('heading', { name: /vocabulary/i })
    ).toBeVisible()

    // Should show empty state message
    await expect(page.getByText(/no vocabulary yet/i)).toBeVisible()

    // Should show "Add First Vocabulary" button
    await expect(
      page.getByRole('button', { name: /add first vocabulary/i })
    ).toBeVisible()
  })

  test('has working header navigation', async ({ page }) => {
    await page.goto('/vocabulary')

    // Header should be visible
    await expect(page.getByRole('banner')).toBeVisible()

    // Logo/brand link should be present
    await expect(page.getByRole('link', { name: /自作/i })).toBeVisible()
  })

  test('page title is set correctly', async ({ page }) => {
    await page.goto('/vocabulary')

    await expect(page).toHaveTitle(/vocabulary list/i)
  })

  test('Add Vocabulary button opens create dialog', async ({ page }) => {
    await page.goto('/vocabulary')

    // Wait for page to load
    await expect(
      page.getByRole('heading', { name: /vocabulary/i })
    ).toBeVisible()

    // Click "Add Vocabulary" button in header
    await page.getByRole('button', { name: /^add new$/i }).click()

    // Should open the create vocabulary dialog
    await expect(page.getByRole('dialog')).toBeVisible()
  })

  test('Add First Vocabulary button opens create dialog', async ({ page }) => {
    await page.goto('/vocabulary')

    // Wait for empty state
    await expect(
      page.getByRole('button', { name: /add first vocabulary/i })
    ).toBeVisible()

    // Click empty state button
    await page.getByRole('button', { name: /add first vocabulary/i }).click()

    // Should open the create vocabulary dialog
    await expect(page.getByRole('dialog')).toBeVisible()
  })

  test('dialog can be closed', async ({ page }) => {
    await page.goto('/vocabulary')

    // Open dialog
    await page.getByRole('button', { name: /^add new$/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()

    // Close with X button
    await page.getByRole('button', { name: /close/i }).click()

    // Dialog should be hidden
    await expect(page.getByRole('dialog')).toBeHidden()
  })
})

test.describe('Vocabulary List Filters', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/vocabulary')

    // Wait for page to load
    await expect(
      page.getByRole('heading', { name: /vocabulary/i })
    ).toBeVisible()

    // Ensure filters section is expanded
    const filtersButton = page.getByTestId('vocab-list-filters-toggle')
    const isExpanded = await filtersButton.getAttribute('aria-expanded')
    if (isExpanded === 'false') {
      await filtersButton.click()
    }
  })

  test('renders filter section with toggle', async ({ page }) => {
    // Filters header button should be visible
    await expect(page.getByTestId('vocab-list-filters-toggle')).toBeVisible()
  })

  test('filter panel can be collapsed and expanded', async ({ page }) => {
    const filtersButton = page.getByTestId('vocab-list-filters-toggle')

    // Panel should be expanded initially (from beforeEach)
    await expect(filtersButton).toHaveAttribute('aria-expanded', 'true')

    // Click to collapse
    await filtersButton.click()
    await expect(filtersButton).toHaveAttribute('aria-expanded', 'false')

    // Click to expand again
    await filtersButton.click()
    await expect(filtersButton).toHaveAttribute('aria-expanded', 'true')
  })

  test('renders search input', async ({ page }) => {
    await expect(
      page.getByRole('textbox', { name: /display.*keywords/i })
    ).toBeVisible()
  })

  test('renders kana search input', async ({ page }) => {
    await expect(page.getByRole('textbox', { name: /kana/i })).toBeVisible()
  })

  test('JLPT level chips are visible and interactive', async ({ page }) => {
    // N5 chip should be visible
    await expect(page.getByRole('button', { name: 'N5' })).toBeVisible()

    // Click N5 to select it
    await page.getByRole('button', { name: 'N5' }).click()

    // N5 should now be pressed
    await expect(page.getByRole('button', { name: 'N5' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
  })

  test('multiple JLPT levels can be selected', async ({ page }) => {
    // Select N5
    await page.getByRole('button', { name: 'N5' }).click()
    await expect(page.getByRole('button', { name: 'N5' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )

    // Select N4 too
    await page.getByRole('button', { name: 'N4' }).click()
    await expect(page.getByRole('button', { name: 'N4' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )

    // Both should be selected
    await expect(page.getByRole('button', { name: 'N5' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
  })

  test('common toggle is visible', async ({ page }) => {
    await expect(
      page.getByTestId('vocab-list-filters').getByRole('switch')
    ).toBeVisible()
  })

  test('common toggle can be switched on', async ({ page }) => {
    const toggle = page.getByTestId('vocab-list-filters').getByRole('switch')

    // Initially unchecked
    await expect(toggle).not.toBeChecked()

    // Click to turn on
    await toggle.click()

    // Should now be checked
    await expect(toggle).toBeChecked()
  })

  test('kanji dropdown is visible', async ({ page }) => {
    await expect(
      page.getByRole('combobox', { name: /contains kanji/i })
    ).toBeVisible()
  })

  test('description filter is visible', async ({ page }) => {
    await expect(
      page.getByRole('combobox', { name: /description/i })
    ).toBeVisible()
  })

  test('Clear Filters button appears when filters are active', async ({
    page
  }) => {
    // Clear button should be disabled initially
    await expect(page.getByTestId('vocab-list-filters-clear')).toBeDisabled()

    // Add a filter
    await page.getByRole('button', { name: 'N5' }).click()

    // Clear button should now be enabled
    await expect(page.getByTestId('vocab-list-filters-clear')).toBeEnabled()
  })

  test('Clear Filters resets all filters', async ({ page }) => {
    // Add a JLPT filter
    await page.getByRole('button', { name: 'N5' }).click()
    await expect(page.getByRole('button', { name: 'N5' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )

    // Click Clear Filters
    await page.getByRole('button', { name: /clear filters/i }).click()

    // Filter should be reset
    await expect(page.getByRole('button', { name: 'N5' })).toHaveAttribute(
      'aria-pressed',
      'false'
    )
  })

  test('active filter count badge updates', async ({ page }) => {
    const filtersButton = page.getByTestId('vocab-list-filters-toggle')

    // Initially no badge (or badge shows 0)
    await expect(filtersButton).not.toContainText('1')

    // Add a filter
    await page.getByRole('button', { name: 'N5' }).click()

    // Badge should show 1
    await expect(filtersButton).toContainText('1')

    // Add another filter
    await page.getByTestId('vocab-list-filters').getByRole('switch').click()

    // Badge should show 2
    await expect(filtersButton).toContainText('2')
  })
})

test.describe('Vocabulary List URL Sync', () => {
  test('JLPT filter syncs to URL', async ({ page }) => {
    await page.goto('/vocabulary')

    // Expand filters if collapsed
    const filtersButton = page.getByTestId('vocab-list-filters-toggle')
    const isExpanded = await filtersButton.getAttribute('aria-expanded')
    if (isExpanded === 'false') {
      await filtersButton.click()
    }

    // Click N5
    await page.getByRole('button', { name: 'N5' }).click()

    // URL should contain JLPT filter
    await page.waitForURL(/jlpt=N5/)
    expect(page.url()).toContain('jlpt=N5')
  })

  test('URL filters are applied on page load', async ({ page }) => {
    // Navigate with filter in URL
    await page.goto('/vocabulary?jlpt=N5')

    // Wait for page to load
    await expect(
      page.getByRole('heading', { name: /vocabulary/i })
    ).toBeVisible()

    // Expand filters if collapsed
    const filtersButton = page.getByTestId('vocab-list-filters-toggle')
    const isExpanded = await filtersButton.getAttribute('aria-expanded')
    if (isExpanded === 'false') {
      await filtersButton.click()
    }

    // N5 should be selected
    await expect(page.getByRole('button', { name: 'N5' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
  })

  test('common filter syncs to URL', async ({ page }) => {
    await page.goto('/vocabulary')

    // Expand filters
    const filtersButton = page.getByTestId('vocab-list-filters-toggle')
    const isExpanded = await filtersButton.getAttribute('aria-expanded')
    if (isExpanded === 'false') {
      await filtersButton.click()
    }

    // Turn on common filter
    await page.getByTestId('vocab-list-filters').getByRole('switch').click()

    // URL should contain common filter
    await page.waitForURL(/common=true/)
    expect(page.url()).toContain('common=true')
  })

  test('clear filters clears URL params', async ({ page }) => {
    // Start with filters in URL
    await page.goto('/vocabulary?jlpt=N5&common=true')

    // Expand filters
    const filtersButton = page.getByTestId('vocab-list-filters-toggle')
    const isExpanded = await filtersButton.getAttribute('aria-expanded')
    if (isExpanded === 'false') {
      await filtersButton.click()
    }

    // Click Clear Filters
    await page.getByRole('button', { name: /clear filters/i }).click()

    // URL should be cleared
    await page.waitForURL('/vocabulary')
    expect(page.url()).not.toContain('jlpt')
    expect(page.url()).not.toContain('common')
  })
})

test.describe('Vocabulary Create Dialog', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/vocabulary')

    // Wait for page to load
    await expect(
      page.getByRole('heading', { name: /vocabulary/i })
    ).toBeVisible()

    // Open the create dialog
    await page.getByRole('button', { name: /^add new$/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
  })

  test('dialog has word input field', async ({ page }) => {
    await expect(
      page.getByRole('dialog').getByRole('textbox', { name: /word/i })
    ).toBeVisible()
  })

  test('dialog has kana input field', async ({ page }) => {
    await expect(
      page.getByRole('dialog').getByRole('textbox', { name: /kana/i })
    ).toBeVisible()
  })

  test('dialog has Add and Cancel buttons', async ({ page }) => {
    await expect(page.getByRole('button', { name: /^add$/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /cancel/i })).toBeVisible()
  })

  test('Cancel button closes the dialog', async ({ page }) => {
    await page.getByRole('button', { name: /cancel/i }).click()

    await expect(page.getByRole('dialog')).toBeHidden()
  })

  test('requires word field', async ({ page }) => {
    // Word input should have required attribute
    await expect(
      page.getByRole('dialog').getByRole('textbox', { name: /word/i })
    ).toHaveAttribute('required', '')
  })

  test('kana field is optional', async ({ page }) => {
    // Kana input should NOT have required attribute (it's optional)
    const kanaInput = page
      .getByRole('dialog')
      .getByRole('textbox', { name: /kana/i })
    await expect(kanaInput).not.toHaveAttribute('required')
  })
})
