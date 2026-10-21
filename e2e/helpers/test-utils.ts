/**
 * E2E Test Utilities
 *
 * Reusable helper functions for E2E tests.
 * Reduces duplication and ensures consistent test patterns.
 */

import { expect } from '@playwright/test';

import { TIMEOUTS } from './test-constants';

import type { Page } from '@playwright/test';

/**
 * Assert that a toast notification with the given text is visible.
 *
 * Prefer this over raw `.locator('.shared-toast-description')` selectors so
 * that CSS class renames don't break every E2E assertion at once.
 *
 * @param page - Playwright page object
 * @param text - Text or regex the toast description must contain
 */
export async function expectToast(page: Page, text: string | RegExp): Promise<void> {
  await expect(page.getByTestId('toast-description').filter({ hasText: text })).toBeVisible({
    timeout: TIMEOUTS.medium,
  });
}

/**
 * Create a kanji and navigate to its detail page.
 *
 * @param page - Playwright page object
 * @param character - Kanji character to create
 * @returns URL of the created kanji's detail page
 */
export async function createAndNavigateToKanji(page: Page, character: string): Promise<string> {
  await page.goto('/kanji');

  // Wait for page load
  await expect(page.getByRole('heading', { name: /kanji list/i })).toBeVisible();

  // Open create dialog
  await page.getByRole('button', { name: /^add new$/i }).click();
  await expect(page.getByRole('dialog')).toBeVisible();

  // Fill character and submit
  await page.getByRole('textbox', { name: /character/i }).fill(character);
  await page.getByRole('button', { name: /^add$/i }).click();

  // Wait for dialog to close
  await expect(page.getByRole('dialog')).not.toBeVisible();

  // Click on the created kanji card to navigate to detail page
  const kanjiCard = page.getByTestId('kanji-list-card').filter({ hasText: character });
  await kanjiCard.click();

  // Wait for navigation to detail page
  await page.waitForURL(/\/kanji\/\d+$/);

  return page.url();
}

/**
 * Create a component and navigate to its detail page.
 *
 * @param page - Playwright page object
 * @param character - Component character to create
 * @returns URL of the created component's detail page
 */
export async function createAndNavigateToComponent(page: Page, character: string): Promise<string> {
  await page.goto('/components');

  // Wait for page load
  await expect(page.getByRole('heading', { name: /component list/i })).toBeVisible();

  // Open create dialog
  await page.getByRole('button', { name: /^add new$/i }).click();
  await expect(page.getByRole('dialog')).toBeVisible();

  // Fill character and submit
  await page.getByRole('textbox', { name: /character/i }).fill(character);
  await page.getByRole('button', { name: /^add$/i }).click();

  // Wait for dialog to close
  await expect(page.getByRole('dialog')).not.toBeVisible();

  // Click on the created component card to navigate to detail page
  const componentCard = page.getByTestId('component-list-card').filter({ hasText: character });
  await componentCard.click();

  // Wait for navigation to detail page
  await page.waitForURL(/\/components\/\d+$/);

  return page.url();
}
