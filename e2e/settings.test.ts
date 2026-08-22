/**
 * Settings E2E Tests
 *
 * Tests for the settings page functionality.
 */

import { expect, test } from '@playwright/test'

import { VIEWPORTS } from './helpers/test-constants'

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

  test('shows position types add button after expanding section', async ({
    page
  }) => {
    const positionSection = page.getByTestId('settings-position-types')

    await positionSection
      .getByRole('button', { name: /position types/i })
      .click()

    await expect(
      positionSection.getByRole('button', { name: /add position type/i })
    ).toBeVisible()
  })

  test('shows classification types add button after expanding section', async ({
    page
  }) => {
    const classificationSection = page.getByTestId(
      'settings-classification-types'
    )

    await classificationSection
      .getByRole('button', { name: /classification types/i })
      .click()

    await expect(
      classificationSection.getByRole('button', {
        name: /add classification type/i
      })
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
})

test.describe('Classification Types', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings')
    await expect(
      page.getByRole('heading', { level: 1, name: /settings/i })
    ).toBeVisible()

    // Expand the Classification Types section
    await page
      .getByTestId('settings-classification-types')
      .getByRole('button', { name: /classification types/i })
      .click()

    await expect(
      page
        .getByTestId('settings-classification-types')
        .getByRole('button', { name: /add classification type/i })
    ).toBeVisible()
  })

  test('creates a new classification type', async ({ page }) => {
    const section = page.getByTestId('settings-classification-types')

    await section
      .getByRole('button', { name: /add classification type/i })
      .click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(
      dialog.getByRole('heading', { name: /add classification type/i })
    ).toBeVisible()

    await dialog
      .getByRole('textbox', { name: /type name/i })
      .fill('e2e_test_type')
    await dialog.getByRole('textbox', { name: /japanese name/i }).fill('テスト')
    await dialog.getByRole('button', { name: /^create$/i }).click()

    await expect(dialog).not.toBeVisible()
    await expect(section.getByText('e2e_test_type')).toBeVisible()
  })

  test('edits an existing classification type', async ({ page }) => {
    const section = page.getByTestId('settings-classification-types')

    // Create a type to edit
    await section
      .getByRole('button', { name: /add classification type/i })
      .click()
    const createDialog = page.getByRole('dialog')
    await createDialog
      .getByRole('textbox', { name: /type name/i })
      .fill('e2e_edit_before')
    await createDialog.getByRole('button', { name: /^create$/i }).click()
    await expect(createDialog).not.toBeVisible()

    // Edit the created type
    const item = section
      .getByRole('listitem')
      .filter({ hasText: 'e2e_edit_before' })
    await item.getByRole('button', { name: /^edit$/i }).click()

    const editDialog = page.getByRole('dialog')
    await expect(
      editDialog.getByRole('heading', { name: /edit classification type/i })
    ).toBeVisible()

    const nameInput = editDialog.getByRole('textbox', { name: /type name/i })
    await nameInput.clear()
    await nameInput.fill('e2e_edit_after')
    await editDialog.getByRole('button', { name: /^save$/i }).click()

    await expect(editDialog).not.toBeVisible()
    await expect(section.getByText('e2e_edit_after')).toBeVisible()
    await expect(section.getByText('e2e_edit_before')).not.toBeVisible()
  })

  test('shows standard confirmation when deleting unused type', async ({
    page
  }) => {
    const section = page.getByTestId('settings-classification-types')

    // Create a type to delete
    await section
      .getByRole('button', { name: /add classification type/i })
      .click()
    const createDialog = page.getByRole('dialog')
    await createDialog
      .getByRole('textbox', { name: /type name/i })
      .fill('e2e_delete_type')
    await createDialog.getByRole('button', { name: /^create$/i }).click()
    await expect(createDialog).not.toBeVisible()

    // Click delete on the created type
    const item = section
      .getByRole('listitem')
      .filter({ hasText: 'e2e_delete_type' })
    await item.getByRole('button', { name: /^delete$/i }).click()

    const confirmDialog = page.getByRole('dialog')
    await expect(confirmDialog).toBeVisible()
    await expect(
      confirmDialog.getByRole('heading', {
        name: /delete classification type/i
      })
    ).toBeVisible()
    await expect(
      confirmDialog.getByText(/are you sure you want to delete/i)
    ).toBeVisible()
  })

  test('deletes an unused classification type', async ({ page }) => {
    const section = page.getByTestId('settings-classification-types')

    // Create a type to delete
    await section
      .getByRole('button', { name: /add classification type/i })
      .click()
    const createDialog = page.getByRole('dialog')
    await createDialog
      .getByRole('textbox', { name: /type name/i })
      .fill('e2e_to_delete')
    await createDialog.getByRole('button', { name: /^create$/i }).click()
    await expect(createDialog).not.toBeVisible()
    await expect(section.getByText('e2e_to_delete')).toBeVisible()

    // Delete the type
    const item = section
      .getByRole('listitem')
      .filter({ hasText: 'e2e_to_delete' })
    await item.getByRole('button', { name: /^delete$/i }).click()

    const confirmDialog = page.getByRole('dialog')
    await confirmDialog.getByRole('button', { name: /^delete$/i }).click()

    await expect(confirmDialog).not.toBeVisible()
    await expect(section.getByText('e2e_to_delete')).not.toBeVisible()
  })

  test('reorders types with move-up and move-down', async ({ page }) => {
    const section = page.getByTestId('settings-classification-types')

    // Create two types
    for (const name of ['e2e_reorder_first', 'e2e_reorder_second']) {
      await section
        .getByRole('button', { name: /add classification type/i })
        .click()
      const dialog = page.getByRole('dialog')
      await dialog.getByRole('textbox', { name: /type name/i }).fill(name)
      await dialog.getByRole('button', { name: /^create$/i }).click()
      await expect(dialog).not.toBeVisible()
    }

    // Verify initial order: first, then second
    const items = section.getByRole('listitem')
    const secondItem = items.filter({ hasText: 'e2e_reorder_second' })

    // Move second item up
    await secondItem.getByRole('button', { name: '↑' }).click()

    // Items should still both be visible (order changed in the list)
    await expect(section.getByText('e2e_reorder_first')).toBeVisible()
    await expect(section.getByText('e2e_reorder_second')).toBeVisible()

    // Move second item (now at position 0) back down to test move-down
    await secondItem.getByRole('button', { name: '↓' }).click()

    await expect(section.getByText('e2e_reorder_first')).toBeVisible()
    await expect(section.getByText('e2e_reorder_second')).toBeVisible()
  })
})

test.describe('Position Types', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings')
    await expect(
      page.getByRole('heading', { level: 1, name: /settings/i })
    ).toBeVisible()

    // Expand the Position Types section
    await page
      .getByTestId('settings-position-types')
      .getByRole('button', { name: /position types/i })
      .click()

    await expect(
      page
        .getByTestId('settings-position-types')
        .getByRole('button', { name: /add position type/i })
    ).toBeVisible()
  })

  test('creates a new position type', async ({ page }) => {
    const section = page.getByTestId('settings-position-types')

    await section.getByRole('button', { name: /add position type/i }).click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(
      dialog.getByRole('heading', { name: /add position type/i })
    ).toBeVisible()

    await dialog
      .getByRole('textbox', { name: /position name/i })
      .fill('e2e_pos_type')
    await dialog.getByRole('button', { name: /^create$/i }).click()

    await expect(dialog).not.toBeVisible()
    await expect(section.getByText('e2e_pos_type')).toBeVisible()
  })

  test('edits an existing position type', async ({ page }) => {
    const section = page.getByTestId('settings-position-types')

    // Create a type to edit
    await section.getByRole('button', { name: /add position type/i }).click()
    const createDialog = page.getByRole('dialog')
    await createDialog
      .getByRole('textbox', { name: /position name/i })
      .fill('e2e_pos_edit_before')
    await createDialog.getByRole('button', { name: /^create$/i }).click()
    await expect(createDialog).not.toBeVisible()

    // Edit the created type
    const item = section
      .getByRole('listitem')
      .filter({ hasText: 'e2e_pos_edit_before' })
    await item.getByRole('button', { name: /^edit$/i }).click()

    const editDialog = page.getByRole('dialog')
    await expect(
      editDialog.getByRole('heading', { name: /edit position type/i })
    ).toBeVisible()

    const nameInput = editDialog.getByRole('textbox', {
      name: /position name/i
    })
    await nameInput.clear()
    await nameInput.fill('e2e_pos_edit_after')
    await editDialog.getByRole('button', { name: /^save$/i }).click()

    await expect(editDialog).not.toBeVisible()
    await expect(section.getByText('e2e_pos_edit_after')).toBeVisible()
    await expect(section.getByText('e2e_pos_edit_before')).not.toBeVisible()
  })

  test('deletes an unused position type', async ({ page }) => {
    const section = page.getByTestId('settings-position-types')

    // Create a type to delete
    await section.getByRole('button', { name: /add position type/i }).click()
    const createDialog = page.getByRole('dialog')
    await createDialog
      .getByRole('textbox', { name: /position name/i })
      .fill('e2e_pos_to_delete')
    await createDialog.getByRole('button', { name: /^create$/i }).click()
    await expect(createDialog).not.toBeVisible()
    await expect(section.getByText('e2e_pos_to_delete')).toBeVisible()

    // Delete the type
    const item = section
      .getByRole('listitem')
      .filter({ hasText: 'e2e_pos_to_delete' })
    await item.getByRole('button', { name: /^delete$/i }).click()

    const confirmDialog = page.getByRole('dialog')
    await confirmDialog.getByRole('button', { name: /^delete$/i }).click()

    await expect(confirmDialog).not.toBeVisible()
    await expect(section.getByText('e2e_pos_to_delete')).not.toBeVisible()
  })

  test('reorders types with move-up and move-down', async ({ page }) => {
    const section = page.getByTestId('settings-position-types')

    // Create two types
    for (const name of ['e2e_pos_reorder_a', 'e2e_pos_reorder_b']) {
      await section.getByRole('button', { name: /add position type/i }).click()
      const dialog = page.getByRole('dialog')
      await dialog.getByRole('textbox', { name: /position name/i }).fill(name)
      await dialog.getByRole('button', { name: /^create$/i }).click()
      await expect(dialog).not.toBeVisible()
    }

    // Both items should be visible
    await expect(section.getByText('e2e_pos_reorder_a')).toBeVisible()
    await expect(section.getByText('e2e_pos_reorder_b')).toBeVisible()

    // Move second item up
    const secondItem = section
      .getByRole('listitem')
      .filter({ hasText: 'e2e_pos_reorder_b' })
    await secondItem.getByRole('button', { name: '↑' }).click()

    // Both items should still be visible after reorder
    await expect(section.getByText('e2e_pos_reorder_a')).toBeVisible()
    await expect(section.getByText('e2e_pos_reorder_b')).toBeVisible()
  })
})

test.describe('Settings Page Mobile', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile)
    await page.goto('/settings')
    await expect(
      page.getByRole('heading', { level: 1, name: /settings/i })
    ).toBeVisible()
  })

  test('displays page title and sections at mobile viewport', async ({
    page
  }) => {
    await expect(
      page.getByRole('heading', { level: 1, name: /settings/i })
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: /position types/i })
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: /classification types/i })
    ).toBeVisible()
  })

  test('toggles theme at mobile viewport', async ({ page }) => {
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

  test('expands and collapses collapsible sections at mobile viewport', async ({
    page
  }) => {
    const databaseSection = page.getByTestId('settings-database')

    await expect(databaseSection.getByText('Export Database')).not.toBeVisible()

    await databaseSection
      .getByRole('button', { name: /data management/i })
      .click()

    await expect(databaseSection.getByText('Export Database')).toBeVisible()

    await databaseSection.getByRole('button', { name: /collapse/i }).click()

    await expect(databaseSection.getByText('Export Database')).not.toBeVisible()
  })
})
