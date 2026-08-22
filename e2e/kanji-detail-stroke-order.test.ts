/**
 * E2E Tests for Kanji Detail Stroke Order Section
 */

import { expect, test } from '@playwright/test'

import { createAndNavigateToKanji } from './helpers/test-utils'

// ---------------------------------------------------------------------------
// Stroke Order upload
// ---------------------------------------------------------------------------

/** Minimal 1×1 pixel PNG buffer for file upload tests */
const MINIMAL_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
)

test.describe('Kanji Detail — Stroke Order', () => {
  test('shows empty state by default and displays image after upload', async ({
    page
  }) => {
    await createAndNavigateToKanji(page, '画')

    const section = page.getByTestId('kanji-section-stroke-order')

    // Expand section if collapsed (section defaults to closed when no content)
    if ((await section.getAttribute('data-state')) === 'closed') {
      await page.getByRole('heading', { name: /stroke order/i }).click()
    }

    // Empty state is shown initially
    await expect(
      section.getByText('No stroke order images available')
    ).toBeVisible()

    // Enter edit mode
    await section.getByRole('button', { name: /edit/i }).click()

    // Upload a stroke diagram via the hidden file input associated with the label
    const diagramInput = section.getByTestId('file-input-hidden').first()
    await diagramInput.setInputFiles({
      name: 'diagram.png',
      mimeType: 'image/png',
      buffer: MINIMAL_PNG
    })

    // File should be previewed (preview element visible)
    await expect(
      section.getByTestId('file-input-preview').first()
    ).toBeVisible()

    // Save
    await section.getByRole('button', { name: /^save$/i }).click()

    // The empty state message should be gone; image display should be shown
    await expect(
      section.getByText('No stroke order images available')
    ).not.toBeVisible()
    await expect(section.getByTestId('stroke-order-display')).toBeVisible()
  })

  test('cancelling upload discards the selection', async ({ page }) => {
    await createAndNavigateToKanji(page, '絵')

    const section = page.getByTestId('kanji-section-stroke-order')

    // Expand section if collapsed
    if ((await section.getAttribute('data-state')) === 'closed') {
      await page.getByRole('heading', { name: /stroke order/i }).click()
    }

    // Enter edit mode
    await section.getByRole('button', { name: /edit/i }).click()

    // Upload a file
    const diagramInput = section.getByTestId('file-input-hidden').first()
    await diagramInput.setInputFiles({
      name: 'diagram.png',
      mimeType: 'image/png',
      buffer: MINIMAL_PNG
    })

    // Cancel
    await section.getByRole('button', { name: /cancel/i }).click()

    // Empty state should still be visible after cancel
    await expect(
      section.getByText('No stroke order images available')
    ).toBeVisible()
  })
})
