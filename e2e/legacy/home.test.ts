import { expect, test } from '@playwright/test'

test.describe('Home Page', () => {
  test('should display the home page', async ({ page }) => {
    await page.goto('/legacy/kanji')
    await expect(page).toHaveTitle(/Jisaku/)
  })
})
