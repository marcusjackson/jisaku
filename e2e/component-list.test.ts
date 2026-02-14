/**
 * E2E tests for Component List Page (New UI)
 */

import { expect, test } from '@playwright/test'

test.describe('Component List Page', () => {
  test('displays loading state then content', async ({ page }) => {
    await page.goto('/components')

    // Wait for title and content to load
    await expect(
      page.getByRole('heading', { name: /component list/i })
    ).toBeVisible()
  })

  test('displays empty state when no components exist', async ({ page }) => {
    await page.goto('/components')

    // Wait for page to load
    await expect(
      page.getByRole('heading', { name: /component list/i })
    ).toBeVisible()

    // Should show empty state message
    await expect(page.getByText(/no components yet/i)).toBeVisible()

    // Should show "Add First Component" button
    await expect(
      page.getByRole('button', { name: /add first component/i })
    ).toBeVisible()
  })

  test('has working header navigation', async ({ page }) => {
    await page.goto('/components')

    // Header should be visible
    await expect(page.getByRole('banner')).toBeVisible()

    // Logo/brand link should be present
    await expect(page.getByRole('link', { name: /自作/i })).toBeVisible()
  })

  test('page title is set correctly', async ({ page }) => {
    await page.goto('/components')

    await expect(page).toHaveTitle(/component list/i)
  })

  test('Add Component button opens create dialog', async ({ page }) => {
    await page.goto('/components')

    // Wait for page to load
    await expect(
      page.getByRole('heading', { name: /component list/i })
    ).toBeVisible()

    // Click "Add Component" button in header
    await page.getByRole('button', { name: /^add new$/i }).click()

    // Should open the create component dialog
    await expect(page.getByRole('dialog')).toBeVisible()
  })

  test('Add First Component button opens create dialog', async ({ page }) => {
    await page.goto('/components')

    // Wait for empty state
    await expect(
      page.getByRole('button', { name: /add first component/i })
    ).toBeVisible()

    // Click empty state button
    await page.getByRole('button', { name: /add first component/i }).click()

    // Should open the create component dialog
    await expect(page.getByRole('dialog')).toBeVisible()
  })

  test('dialog can be closed', async ({ page }) => {
    await page.goto('/components')

    // Open dialog
    await page.getByRole('button', { name: /^add new$/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()

    // Close with X button
    await page.getByRole('button', { name: /close/i }).click()

    // Dialog should be hidden
    await expect(page.getByRole('dialog')).toBeHidden()
  })
})

test.describe('Component List Filters', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components')

    // Wait for page to load
    await expect(
      page.getByRole('heading', { name: /component list/i })
    ).toBeVisible()

    // Ensure filters section is expanded
    const filtersButton = page.getByTestId('component-list-filters-toggle')
    const isExpanded = await filtersButton.getAttribute('aria-expanded')
    if (isExpanded === 'false') {
      await filtersButton.click()
    }
  })

  test('renders filter section with toggle', async ({ page }) => {
    // Filters header button should be visible
    await expect(
      page.getByTestId('component-list-filters-toggle')
    ).toBeVisible()
  })

  test('filter panel can be collapsed and expanded', async ({ page }) => {
    const filtersButton = page.getByTestId('component-list-filters-toggle')

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

  test('renders kangxi search input', async ({ page }) => {
    await expect(
      page.getByRole('textbox', { name: /kangxi #\/meaning/i })
    ).toBeVisible()
  })

  test('renders stroke range inputs', async ({ page }) => {
    // Strokes label should be visible
    await expect(page.getByText(/strokes/i)).toBeVisible()

    // Stroke inputs
    await expect(page.getByPlaceholder('Min')).toBeVisible()
    await expect(page.getByPlaceholder('Max')).toBeVisible()
  })

  test('radical status filter is visible and interactive', async ({ page }) => {
    // Should show radical status label
    await expect(page.getByText('Radical')).toBeVisible()

    // Should have the select dropdown with "Any" selected by default
    const select = page
      .getByTestId('component-list-filters')
      .getByRole('combobox')
      .first()
    await expect(select).toBeVisible()
  })

  test('description presence filter is visible', async ({ page }) => {
    await expect(page.getByText('Description')).toBeVisible()
  })

  test('Clear Filters button appears when filters are active', async ({
    page
  }) => {
    // Clear Filters should be visible
    await expect(
      page.getByRole('button', { name: /clear filters/i })
    ).toBeVisible()

    // But should be disabled when no filters are active
    await expect(
      page.getByRole('button', { name: /clear filters/i })
    ).toBeDisabled()

    // Add a filter - type in the character input
    await page.getByRole('textbox', { name: /character/i }).fill('亻')

    // Clear Filters should now be enabled
    await expect(
      page.getByRole('button', { name: /clear filters/i })
    ).toBeEnabled()
  })

  test('Clear Filters resets all filters', async ({ page }) => {
    // Add a filter
    await page.getByRole('textbox', { name: /character/i }).fill('亻')

    // Verify filter has a value
    await expect(page.getByRole('textbox', { name: /character/i })).toHaveValue(
      '亻'
    )

    // Click Clear Filters
    await page.getByRole('button', { name: /clear filters/i }).click()

    // Filter should be reset
    await expect(page.getByRole('textbox', { name: /character/i })).toHaveValue(
      ''
    )
  })
})

test.describe('Component List URL Sync', () => {
  test('character filter syncs to URL', async ({ page }) => {
    await page.goto('/components')

    // Expand filters if collapsed
    const filtersButton = page.getByTestId('component-list-filters-toggle')
    const isExpanded = await filtersButton.getAttribute('aria-expanded')
    if (isExpanded === 'false') {
      await filtersButton.click()
    }

    // Type in character input
    await page.getByRole('textbox', { name: /character/i }).fill('亻')

    // Wait for debounce and URL update
    await page.waitForURL(/character=%E4%BA%BB|character=亻/)

    // URL should contain character filter
    expect(page.url()).toContain('character')
  })

  test('URL filters are applied on page load', async ({ page }) => {
    // Navigate with filter in URL
    await page.goto('/components?character=%E4%BA%BB')

    // Wait for page to load
    await expect(
      page.getByRole('heading', { name: /component list/i })
    ).toBeVisible()

    // Expand filters if collapsed
    const filtersButton = page.getByTestId('component-list-filters-toggle')
    const isExpanded = await filtersButton.getAttribute('aria-expanded')
    if (isExpanded === 'false') {
      await filtersButton.click()
    }

    // Character input should have the value from URL
    await expect(page.getByRole('textbox', { name: /character/i })).toHaveValue(
      '亻'
    )
  })
})

test.describe('Component Create Dialog', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components')

    // Wait for page to load
    await expect(
      page.getByRole('heading', { name: /component list/i })
    ).toBeVisible()

    // Open the create dialog
    await page.getByRole('button', { name: /^add new$/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
  })

  test('dialog has character input field', async ({ page }) => {
    // Use dialog-scoped selector to avoid conflict with filter input
    await expect(
      page.getByRole('dialog').getByRole('textbox', { name: /character/i })
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

  test('shows validation error for empty submission', async ({ page }) => {
    // Try to submit empty form
    await page.getByRole('button', { name: /^add$/i }).click()

    // Should show validation error
    await expect(
      page.getByRole('dialog').getByText(/please enter a character/i)
    ).toBeVisible()
  })

  test('shows validation error for multiple characters', async ({ page }) => {
    // Enter multiple characters using dialog-scoped selector
    await page
      .getByRole('dialog')
      .getByRole('textbox', { name: /character/i })
      .fill('亻氵')
    await page.getByRole('button', { name: /^add$/i }).click()

    // Should show validation error
    await expect(
      page.getByRole('dialog').getByText(/please enter only one character/i)
    ).toBeVisible()
  })
})
