/**
 * E2E tests for Kanji List Page (New UI)
 */

import { expect, test } from '@playwright/test'

test.describe('Kanji List Page', () => {
  test('displays loading state then content', async ({ page }) => {
    await page.goto('/kanji')

    // Wait for title and content to load
    await expect(
      page.getByRole('heading', { name: /kanji list/i })
    ).toBeVisible()
  })

  test('displays empty state when no kanji exist', async ({ page }) => {
    await page.goto('/kanji')

    // Wait for page to load
    await expect(
      page.getByRole('heading', { name: /kanji list/i })
    ).toBeVisible()

    // Should show empty state message
    await expect(page.getByText(/no kanji yet/i)).toBeVisible()

    // Should show "Add First Kanji" button
    await expect(
      page.getByRole('button', { name: /add first kanji/i })
    ).toBeVisible()
  })

  test('has working header navigation', async ({ page }) => {
    await page.goto('/kanji')

    // Header should be visible
    await expect(page.getByRole('banner')).toBeVisible()

    // Logo/brand link should be present
    await expect(page.getByRole('link', { name: /自作/i })).toBeVisible()

    // Navigation with Kanji link should be present
    await expect(page.getByRole('link', { name: /kanji/i })).toBeVisible()
  })

  test('page title is set correctly', async ({ page }) => {
    await page.goto('/kanji')

    await expect(page).toHaveTitle(/kanji list/i)
  })

  test('Add Kanji button opens create dialog', async ({ page }) => {
    await page.goto('/kanji')

    // Wait for page to load
    await expect(
      page.getByRole('heading', { name: /kanji list/i })
    ).toBeVisible()

    // Click "Add Kanji" button in header
    await page.getByRole('button', { name: /^add new$/i }).click()

    // Should open the create kanji dialog
    await expect(page.getByRole('dialog')).toBeVisible()
  })

  test('Add First Kanji button opens create dialog', async ({ page }) => {
    await page.goto('/kanji')

    // Wait for empty state
    await expect(
      page.getByRole('button', { name: /add first kanji/i })
    ).toBeVisible()

    // Click empty state button
    await page.getByRole('button', { name: /add first kanji/i }).click()

    // Should open the create kanji dialog
    await expect(page.getByRole('dialog')).toBeVisible()
  })

  test('dialog can be closed', async ({ page }) => {
    await page.goto('/kanji')

    // Open dialog
    await page.getByRole('button', { name: /^add new$/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()

    // Close with X button
    await page.getByRole('button', { name: /close/i }).click()

    // Dialog should be hidden
    await expect(page.getByRole('dialog')).toBeHidden()
  })
})

test.describe('Kanji List Filters', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/kanji')

    // Wait for page to load
    await expect(
      page.getByRole('heading', { name: /kanji list/i })
    ).toBeVisible()

    // Ensure filters section is expanded
    const filtersButton = page.getByTestId('kanji-list-filters-toggle')
    const isExpanded = await filtersButton.getAttribute('aria-expanded')
    if (isExpanded === 'false') {
      await filtersButton.click()
    }
  })

  test('renders filter section with toggle', async ({ page }) => {
    // Filters header button should be visible
    await expect(page.getByTestId('kanji-list-filters-toggle')).toBeVisible()
  })

  test('filter panel can be collapsed and expanded', async ({ page }) => {
    const filtersButton = page.getByTestId('kanji-list-filters-toggle')

    // Click to collapse
    await filtersButton.click()
    await expect(filtersButton).toHaveAttribute('aria-expanded', 'false')

    // Click to expand
    await filtersButton.click()
    await expect(filtersButton).toHaveAttribute('aria-expanded', 'true')
  })

  test('renders character search input', async ({ page }) => {
    await expect(
      page.getByRole('textbox', { name: /character/i })
    ).toBeVisible()
  })

  test('renders keywords search input', async ({ page }) => {
    await expect(
      page.getByRole('textbox', { name: /display \+ keywords/i })
    ).toBeVisible()
  })

  test('renders meanings search input', async ({ page }) => {
    await expect(
      page.getByRole('textbox', { name: /^meanings$/i })
    ).toBeVisible()
  })

  test('renders stroke range inputs', async ({ page }) => {
    // Strokes label should be visible
    await expect(page.getByText(/strokes/i)).toBeVisible()

    // Stroke inputs (identified by placeholder text)
    await expect(page.getByPlaceholder('Min')).toBeVisible()
    await expect(page.getByPlaceholder('Max')).toBeVisible()
  })

  test('JLPT level chips are visible and interactive', async ({ page }) => {
    // Should show JLPT level label
    await expect(page.getByText(/jlpt level/i)).toBeVisible()

    // Should show level buttons
    const n5Button = page.getByRole('button', { name: 'N5' })
    await expect(n5Button).toBeVisible()
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

  test('Joyo level chips are visible and interactive', async ({ page }) => {
    // Should show Joyo level label
    await expect(page.getByText(/joyo level/i)).toBeVisible()

    // Should show grade buttons (Japanese labels)
    const grade1Button = page.getByRole('button', { name: /小1/i })
    await expect(grade1Button).toBeVisible()
    await expect(grade1Button).toHaveAttribute('aria-pressed', 'false')

    // Click to select
    await grade1Button.click()
    await expect(grade1Button).toHaveAttribute('aria-pressed', 'true')
  })

  test('Kentei level chips are visible', async ({ page }) => {
    // Should show Kentei level label
    await expect(page.getByText(/kentei level/i)).toBeVisible()

    // Should show level buttons
    await expect(page.getByRole('button', { name: '10級' })).toBeVisible()
  })

  test('Clear Filters button appears when filters are active', async ({
    page
  }) => {
    // Clear Filters should always be visible
    await expect(
      page.getByRole('button', { name: /clear filters/i })
    ).toBeVisible()

    // But should be disabled when no filters are active
    await expect(
      page.getByRole('button', { name: /clear filters/i })
    ).toBeDisabled()

    // Add a filter
    await page.getByRole('button', { name: 'N5' }).click()

    // Clear Filters should now be enabled
    await expect(
      page.getByRole('button', { name: /clear filters/i })
    ).toBeEnabled()
  })

  test('Clear Filters resets all filters', async ({ page }) => {
    // Add some filters
    await page.getByRole('button', { name: 'N5' }).click()
    await page.getByRole('button', { name: /小1/i }).click()

    // Verify filters are selected
    await expect(page.getByRole('button', { name: 'N5' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    await expect(page.getByRole('button', { name: /小1/i })).toHaveAttribute(
      'aria-pressed',
      'true'
    )

    // Click Clear Filters
    await page.getByRole('button', { name: /clear filters/i }).click()

    // Filters should be reset
    await expect(page.getByRole('button', { name: 'N5' })).toHaveAttribute(
      'aria-pressed',
      'false'
    )
    await expect(page.getByRole('button', { name: /小1/i })).toHaveAttribute(
      'aria-pressed',
      'false'
    )
  })

  test('active filter count badge updates', async ({ page }) => {
    // Get the filters header button specifically (not Clear filters)
    const filtersHeader = page.getByTestId('kanji-list-filters-toggle')

    // Add JLPT filter (counts as 1 filter category)
    await page.getByRole('button', { name: 'N5' }).click()

    // Badge should show count
    await expect(filtersHeader).toContainText('1')

    // Add Joyo filter (different category = 2 total)
    await page.getByRole('button', { name: /小1/i }).click()

    // Badge should update to 2
    await expect(filtersHeader).toContainText('2')
  })

  test('collapse button at bottom collapses filter panel', async ({ page }) => {
    // Filters should be expanded by default
    const filtersButton = page.getByTestId('kanji-list-filters-toggle')
    await expect(filtersButton).toHaveAttribute('aria-expanded', 'true')

    // Collapse button should be visible
    const collapseButton = page.getByTestId('kanji-list-filters-collapse')
    await expect(collapseButton).toBeVisible()

    // Click collapse button
    await collapseButton.click()

    // Filters should now be collapsed
    await expect(filtersButton).toHaveAttribute('aria-expanded', 'false')

    // Collapse button should no longer be visible
    await expect(collapseButton).toBeHidden()
  })
})

test.describe('Kanji List URL Sync', () => {
  test('JLPT filter syncs to URL', async ({ page }) => {
    await page.goto('/kanji')

    // Wait for load
    await expect(
      page.getByRole('heading', { name: /kanji list/i })
    ).toBeVisible()

    // Expand filters if needed
    const filtersButton = page.getByTestId('kanji-list-filters-toggle')
    const isExpanded = await filtersButton.getAttribute('aria-expanded')
    if (isExpanded === 'false') {
      await filtersButton.click()
    }

    // Select JLPT level
    await page.getByRole('button', { name: 'N5' }).click()

    // Wait for debounce and URL update
    await page.waitForURL(/jlpt=N5/)

    // URL should contain filter
    expect(page.url()).toContain('jlpt=N5')
  })

  test('URL parameters restore filter state on page load', async ({ page }) => {
    // Navigate with filter in URL
    await page.goto('/kanji?jlpt=N5,N4')

    // Wait for load
    await expect(
      page.getByRole('heading', { name: /kanji list/i })
    ).toBeVisible()

    // Expand filters if collapsed
    const filtersButton = page.getByTestId('kanji-list-filters-toggle')
    const isExpanded = await filtersButton.getAttribute('aria-expanded')
    if (isExpanded === 'false') {
      await filtersButton.click()
    }

    // Filters should be restored
    await expect(page.getByRole('button', { name: 'N5' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    await expect(page.getByRole('button', { name: 'N4' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
  })

  test('clear filters clears URL params', async ({ page }) => {
    // Start with filter in URL
    await page.goto('/kanji?jlpt=N5')

    // Wait for load
    await expect(
      page.getByRole('heading', { name: /kanji list/i })
    ).toBeVisible()

    // Expand filters if collapsed
    const filtersButton = page.getByTestId('kanji-list-filters-toggle')
    const isExpanded = await filtersButton.getAttribute('aria-expanded')
    if (isExpanded === 'false') {
      await filtersButton.click()
    }

    // Clear filters
    await page.getByTestId('kanji-list-filters-clear').click()

    // Wait for URL to update
    await page.waitForURL((url) => !url.search.includes('jlpt'))

    // URL should not have filter params
    expect(page.url()).not.toContain('jlpt=')
  })
})
