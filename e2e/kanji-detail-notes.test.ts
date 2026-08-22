/**
 * E2E Tests for Kanji Detail Notes Sections
 */

import { expect, test } from '@playwright/test'

import { createAndNavigateToKanji } from './helpers/test-utils'

test.describe('Kanji Detail Notes', () => {
  test('displays character count in collapsed section headers', async ({
    page
  }) => {
    await createAndNavigateToKanji(page, '注')

    // All note sections should show character count of 0 initially
    const semanticSection = page.getByTestId('kanji-detail-semantic-notes')
    const etymologySection = page.getByTestId('kanji-detail-etymology-notes')
    const educationSection = page.getByTestId('kanji-detail-education-notes')
    const personalSection = page.getByTestId('kanji-detail-personal-notes')

    await expect(
      semanticSection.getByTestId('kanji-detail-semantic-notes-char-count')
    ).toHaveText('0')
    await expect(
      etymologySection.getByTestId('kanji-detail-etymology-notes-char-count')
    ).toHaveText('0')
    await expect(
      educationSection.getByTestId('kanji-detail-education-notes-char-count')
    ).toHaveText('0')
    await expect(
      personalSection.getByTestId('kanji-detail-personal-notes-char-count')
    ).toHaveText('0')
  })

  test('inline editing workflow - save content', async ({ page }) => {
    await createAndNavigateToKanji(page, '編')

    const semanticSection = page.getByTestId('kanji-detail-semantic-notes')

    // Click to expand section if collapsed
    await semanticSection
      .getByRole('button', { name: /semantic analysis/i })
      .click()

    // Click on display area to enter edit mode
    await semanticSection.getByTestId('notes-display').click()

    // Verify edit mode is active
    const editArea = semanticSection.getByTestId('notes-edit')
    await expect(editArea).toBeVisible()

    // Enter content
    const textarea = editArea.locator('textarea')
    await textarea.fill('This is test semantic content')

    // Click save button
    await editArea.getByRole('button', { name: /save/i }).click()

    // Verify content is saved and displayed
    await expect(
      semanticSection.getByText('This is test semantic content')
    ).toBeVisible()

    // Verify character count updated
    await expect(
      semanticSection.getByTestId('kanji-detail-semantic-notes-char-count')
    ).toHaveText('29')
  })

  test('inline editing workflow - cancel reverts content', async ({ page }) => {
    await createAndNavigateToKanji(page, '戻')

    const educationSection = page.getByTestId('kanji-detail-education-notes')

    // Click to expand section
    await educationSection.getByRole('button', { name: /education/i }).click()

    // Click to enter edit mode
    await educationSection.getByTestId('notes-display').click()

    // Enter content but cancel
    const editArea = educationSection.getByTestId('notes-edit')
    await editArea.locator('textarea').fill('Content that will be cancelled')
    await editArea.getByRole('button', { name: /cancel/i }).click()

    // Verify content is not saved (placeholder should show)
    const display = educationSection.getByTestId('notes-display')
    await expect(display).toBeVisible()
    await expect(display).not.toHaveText('Content that will be cancelled')
  })

  test('escape key cancels editing', async ({ page }) => {
    await createAndNavigateToKanji(page, '逃')

    const personalSection = page.getByTestId('kanji-detail-personal-notes')

    // Expand and enter edit mode
    await personalSection
      .getByRole('button', { name: /personal notes/i })
      .click()
    await personalSection.getByTestId('notes-display').click()

    // Enter content and press Escape
    const editArea = personalSection.getByTestId('notes-edit')
    await editArea.locator('textarea').fill('Will be cancelled by Escape')
    await page.keyboard.press('Escape')

    // Verify we're back to display mode
    await expect(personalSection.getByTestId('notes-display')).toBeVisible()
    await expect(personalSection.getByTestId('notes-display')).not.toHaveText(
      'Will be cancelled by Escape'
    )
  })

  test('all four note types save independently', async ({ page }) => {
    await createAndNavigateToKanji(page, '独')

    // Save content to each note type
    const noteTypes = [
      {
        section: 'kanji-detail-semantic-notes',
        content: 'Semantic test',
        buttonName: 'semantic analysis'
      },
      {
        section: 'kanji-detail-etymology-notes',
        content: 'Etymology test',
        buttonName: 'etymology notes'
      },
      {
        section: 'kanji-detail-education-notes',
        content: 'Education test',
        buttonName: 'education'
      },
      {
        section: 'kanji-detail-personal-notes',
        content: 'Personal test',
        buttonName: 'personal notes'
      }
    ]

    for (const { buttonName, content, section } of noteTypes) {
      const sectionEl = page.getByTestId(section)

      // Expand section
      await sectionEl
        .getByRole('button', { name: new RegExp(buttonName, 'i') })
        .click()

      // Enter edit mode and save
      await sectionEl.getByTestId('notes-display').click()
      const editArea = sectionEl.getByTestId('notes-edit')
      await editArea.locator('textarea').fill(content)
      await editArea.getByRole('button', { name: /save/i }).click()

      // Verify saved
      await expect(sectionEl.getByText(content)).toBeVisible()
    }

    // Reload page and verify all content persisted
    await page.reload({ waitUntil: 'networkidle' })

    for (const { buttonName, content, section } of noteTypes) {
      const sectionEl = page.getByTestId(section)
      const state = await sectionEl.getAttribute('data-state')
      if (state === 'closed') {
        await sectionEl
          .getByRole('button', { name: new RegExp(buttonName, 'i') })
          .click()
        await expect(sectionEl).toHaveAttribute('data-state', 'open')
      }
      await expect(sectionEl.getByText(content)).toBeVisible()
    }
  })

  test('preserves special characters and line breaks', async ({ page }) => {
    await createAndNavigateToKanji(page, '特')

    const semanticSection = page.getByTestId('kanji-detail-semantic-notes')
    const contentWithSpecialChars = 'Line 1\nLine 2\n特別な内容 🎌'

    // Expand and edit
    await semanticSection
      .getByRole('button', { name: /semantic analysis/i })
      .click()
    await semanticSection.getByTestId('notes-display').click()

    const editArea = semanticSection.getByTestId('notes-edit')
    await editArea.locator('textarea').fill(contentWithSpecialChars)
    await editArea.getByRole('button', { name: /save/i }).click()

    // Verify content is displayed (whitespace is preserved)
    await expect(semanticSection.getByText('Line 1')).toBeVisible()
    await expect(semanticSection.getByText('Line 2')).toBeVisible()
    await expect(semanticSection.getByText('特別な内容 🎌')).toBeVisible()

    // Reload and verify persistence
    await page.reload({ waitUntil: 'networkidle' })
    const semanticState = await semanticSection.getAttribute('data-state')
    if (semanticState === 'closed') {
      await semanticSection
        .getByRole('button', { name: /semantic analysis/i })
        .click()
      await expect(semanticSection).toHaveAttribute('data-state', 'open')
    }
    await expect(semanticSection.getByText('Line 1')).toBeVisible()
    await expect(semanticSection.getByText('特別な内容 🎌')).toBeVisible()
  })

  test('character count updates in real-time during editing', async ({
    page
  }) => {
    await createAndNavigateToKanji(page, '数')

    const etymologySection = page.getByTestId('kanji-detail-etymology-notes')
    const charCount = etymologySection.getByTestId(
      'kanji-detail-etymology-notes-char-count'
    )

    // Expand and enter edit mode
    await etymologySection
      .getByRole('button', { name: /etymology notes/i })
      .click()
    await etymologySection.getByTestId('notes-display').click()

    // Character count should update as we type
    const textarea = etymologySection
      .getByTestId('notes-edit')
      .locator('textarea')

    await textarea.fill('12345')
    await expect(charCount).toHaveText('5')

    await textarea.fill('1234567890')
    await expect(charCount).toHaveText('10')

    await textarea.fill('')
    await expect(charCount).toHaveText('0')
  })
})
