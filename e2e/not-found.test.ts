/**
 * E2E tests for the 404 Not Found page.
 */

import { expect, test } from '@playwright/test'

import { VIEWPORTS } from './helpers/test-constants'

test.describe('Not Found Page', () => {
  test('displays 404 content for an unknown route', async ({ page }) => {
    await page.goto('/this-route-does-not-exist')

    await expect(
      page.getByRole('heading', { name: 'Page Not Found' })
    ).toBeVisible()

    await expect(
      page.getByText("The page you're looking for doesn't exist.")
    ).toBeVisible()

    await expect(page.getByRole('button', { name: 'Go to Home' })).toBeVisible()
  })

  test('"Go to Home" navigates back to the kanji list', async ({ page }) => {
    await page.goto('/this-route-does-not-exist')

    await expect(
      page.getByRole('heading', { name: 'Page Not Found' })
    ).toBeVisible()

    await page.getByRole('button', { name: 'Go to Home' }).click()

    // / redirects to /kanji
    await expect(page).toHaveURL('/kanji')
    await expect(
      page.getByRole('heading', { name: /kanji list/i })
    ).toBeVisible()
  })
})

test.describe('Not Found Page Mobile', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile)
  })

  test('displays 404 content at mobile viewport', async ({ page }) => {
    await page.goto('/this-route-does-not-exist')

    await expect(
      page.getByRole('heading', { name: 'Page Not Found' })
    ).toBeVisible()

    await expect(
      page.getByText("The page you're looking for doesn't exist.")
    ).toBeVisible()

    await expect(page.getByRole('button', { name: 'Go to Home' })).toBeVisible()
  })
})
