/**
 * Tests for KanjiDetailClassifications component
 *
 * Tests cover:
 * - Display mode (primary + additional classifications)
 * - Edit mode rendering
 * - Adding new classifications
 * - Reordering with arrow buttons
 * - Delete in destructive mode
 * - Duplicate validation
 */

import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import KanjiDetailClassifications from './KanjiDetailClassifications.vue'

import type {
  ClassificationType,
  KanjiClassificationWithType
} from '@/shared/types/database-types'

// Mock factories
function createMockClassificationType(
  overrides: Partial<ClassificationType> = {}
): ClassificationType {
  return {
    id: 1,
    typeName: 'pictograph',
    nameJapanese: '象形文字',
    nameEnglish: 'Pictograph',
    description: 'Pictorial representation of physical object',
    descriptionShort: 'Pictures of physical objects',
    displayOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  }
}

function createMockClassification(
  overrides: Partial<KanjiClassificationWithType> = {}
): KanjiClassificationWithType {
  return {
    id: 1,
    kanjiId: 1,
    classificationTypeId: 1,
    displayOrder: 0,
    typeName: 'pictograph',
    nameJapanese: '象形文字',
    nameEnglish: 'Pictograph',
    description: 'Pictorial representation of physical object',
    descriptionShort: 'Pictures of physical objects',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  }
}

describe('KanjiDetailClassifications', () => {
  let classificationTypes: ClassificationType[]

  beforeEach(() => {
    vi.clearAllMocks()

    // Setup default classification types
    classificationTypes = [
      createMockClassificationType({
        id: 1,
        typeName: 'pictograph',
        nameJapanese: '象形文字',
        nameEnglish: 'Pictograph',
        displayOrder: 1
      }),
      createMockClassificationType({
        id: 2,
        typeName: 'ideograph',
        nameJapanese: '指事文字',
        nameEnglish: 'Ideograph',
        displayOrder: 2
      }),
      createMockClassificationType({
        id: 3,
        typeName: 'compound_ideograph',
        nameJapanese: '会意文字',
        nameEnglish: 'Compound Ideograph',
        displayOrder: 3
      }),
      createMockClassificationType({
        id: 4,
        typeName: 'phono_semantic',
        nameJapanese: '形声文字',
        nameEnglish: 'Phono-semantic',
        displayOrder: 4
      }),
      createMockClassificationType({
        id: 5,
        typeName: 'phonetic_loan',
        nameJapanese: '仮借字',
        nameEnglish: 'Phonetic Loan',
        displayOrder: 5
      })
    ]
  })

  describe('Display Mode - Empty State', () => {
    it('renders empty state when no classifications', () => {
      const wrapper = mount(KanjiDetailClassifications, {
        props: {
          classifications: [],
          classificationTypes
        }
      })

      expect(wrapper.text()).toContain('No classifications assigned')
    })

    it('shows Edit button when empty', () => {
      const wrapper = mount(KanjiDetailClassifications, {
        props: {
          classifications: [],
          classificationTypes
        }
      })

      expect(wrapper.find('button').text()).toContain('Edit')
    })
  })

  describe('Display Mode - With Classifications', () => {
    it('displays primary classification with badge', () => {
      const classifications = [
        createMockClassification({
          id: 1,
          classificationTypeId: 4,
          typeName: 'phono_semantic',
          nameJapanese: '形声文字',
          nameEnglish: 'Phono-semantic',
          displayOrder: 0
        })
      ]

      const wrapper = mount(KanjiDetailClassifications, {
        props: {
          classifications,
          classificationTypes
        }
      })

      const primarySection = wrapper.find(
        '.kanji-detail-classifications-primary'
      )
      expect(primarySection.exists()).toBe(true)
      expect(primarySection.text()).toContain('Primary:')
      expect(primarySection.text()).toContain('形声') // Abbreviated
      expect(primarySection.text()).toContain('形声文字 (Phono-semantic)')
    })

    it('displays additional classifications when present', () => {
      const classifications = [
        createMockClassification({
          id: 1,
          classificationTypeId: 4,
          typeName: 'phono_semantic',
          nameJapanese: '形声文字',
          nameEnglish: 'Phono-semantic',
          displayOrder: 0
        }),
        createMockClassification({
          id: 2,
          classificationTypeId: 3,
          typeName: 'compound_ideograph',
          nameJapanese: '会意文字',
          nameEnglish: 'Compound Ideograph',
          displayOrder: 1
        })
      ]

      const wrapper = mount(KanjiDetailClassifications, {
        props: {
          classifications,
          classificationTypes
        }
      })

      const additionalSection = wrapper.find(
        '.kanji-detail-classifications-additional'
      )
      expect(additionalSection.exists()).toBe(true)
      expect(additionalSection.text()).toContain('Additional:')
      expect(additionalSection.text()).toContain(
        '会意文字 (Compound Ideograph)'
      )
    })

    it('abbreviates Japanese names correctly in badge', () => {
      const abbreviations: Record<string, string> = {
        象形文字: '象形',
        指事文字: '指事',
        会意文字: '会意',
        形声文字: '形声',
        仮借字: '仮借'
      }

      Object.entries(abbreviations).forEach(([full, abbrev]) => {
        const classifications = [
          createMockClassification({
            nameJapanese: full,
            displayOrder: 0
          })
        ]

        const wrapper = mount(KanjiDetailClassifications, {
          props: {
            classifications,
            classificationTypes
          }
        })

        const badge = wrapper.find('.kanji-detail-classifications-badge')
        expect(badge.text()).toBe(abbrev)
      })
    })
  })

  describe('Edit Mode - Enter and Exit', () => {
    it('enters edit mode when Edit button clicked', async () => {
      const classifications = [createMockClassification({ displayOrder: 0 })]

      const wrapper = mount(KanjiDetailClassifications, {
        props: {
          classifications,
          classificationTypes
        }
      })

      // Click edit button
      await wrapper.find('button').trigger('click')

      // Should show edit controls
      expect(wrapper.find('.kanji-detail-classifications-edit').exists()).toBe(
        true
      )
      expect(
        wrapper.findAll('button').some((btn) => btn.text().includes('Save'))
      ).toBe(true)
      expect(
        wrapper.findAll('button').some((btn) => btn.text().includes('Cancel'))
      ).toBe(true)
    })

    it('exits edit mode when Cancel button clicked', async () => {
      const classifications = [createMockClassification({ displayOrder: 0 })]

      const wrapper = mount(KanjiDetailClassifications, {
        props: {
          classifications,
          classificationTypes
        }
      })

      // Enter edit mode
      await wrapper.find('button').trigger('click')

      // Click cancel
      const cancelBtn = wrapper
        .findAll('button')
        .find((btn) => btn.text().includes('Cancel'))
      await cancelBtn?.trigger('click')

      // Should be back in view mode
      expect(wrapper.find('.kanji-detail-classifications-view').exists()).toBe(
        true
      )
    })
  })

  describe('Edit Mode - Add Classification', () => {
    it('shows "+ Add Classification" button in edit mode', async () => {
      const wrapper = mount(KanjiDetailClassifications, {
        props: {
          classifications: [],
          classificationTypes
        }
      })

      await wrapper.find('button').trigger('click')

      const addBtn = wrapper
        .findAll('button')
        .find((btn) => btn.text().includes('+ Add Classification'))
      expect(addBtn).toBeDefined()
    })

    it('adds new classification item when "+ Add" clicked', async () => {
      const wrapper = mount(KanjiDetailClassifications, {
        props: {
          classifications: [],
          classificationTypes
        }
      })

      // Enter edit mode
      await wrapper.find('button').trigger('click')

      // Click add button
      const addBtn = wrapper
        .findAll('button')
        .find((btn) => btn.text().includes('+ Add Classification'))
      await addBtn?.trigger('click')

      // Should show a new item with Save/Cancel buttons
      const items = wrapper.findAll('.kanji-detail-classifications-edit-item')
      expect(items.length).toBeGreaterThan(0)

      const newItem = items[items.length - 1]
      expect(newItem?.text()).toContain('Save')
      expect(newItem?.text()).toContain('Cancel')
    })

    it('emits addClassification when new item saved', async () => {
      const wrapper = mount(KanjiDetailClassifications, {
        props: {
          classifications: [],
          classificationTypes
        }
      })

      // Enter edit mode and add new item
      await wrapper.find('button').trigger('click')
      const addBtn = wrapper
        .findAll('button')
        .find((btn) => btn.text().includes('+ Add Classification'))
      await addBtn?.trigger('click')

      // Find and click Save button for the new item
      const items = wrapper.findAll('.kanji-detail-classifications-edit-item')
      const newItem = items[items.length - 1]
      const saveBtn = newItem
        ?.findAll('button')
        .find((btn) => btn.text().includes('Save'))
      await saveBtn?.trigger('click')

      expect(wrapper.emitted('addClassification')).toBeDefined()
    })
  })

  describe('Edit Mode - Reordering', () => {
    it('shows arrow buttons for reordering', async () => {
      const classifications = [
        createMockClassification({ id: 1, displayOrder: 0 }),
        createMockClassification({ id: 2, displayOrder: 1 })
      ]

      const wrapper = mount(KanjiDetailClassifications, {
        props: {
          classifications,
          classificationTypes
        }
      })

      await wrapper.find('button').trigger('click')

      const upButtons = wrapper
        .findAll('button')
        .filter((btn) => btn.text() === '↑')
      const downButtons = wrapper
        .findAll('button')
        .filter((btn) => btn.text() === '↓')

      expect(upButtons.length).toBeGreaterThan(0)
      expect(downButtons.length).toBeGreaterThan(0)
    })

    it('disables up arrow for first item', async () => {
      const classifications = [
        createMockClassification({ id: 1, displayOrder: 0 }),
        createMockClassification({ id: 2, displayOrder: 1 })
      ]

      const wrapper = mount(KanjiDetailClassifications, {
        props: {
          classifications,
          classificationTypes
        }
      })

      await wrapper.find('button').trigger('click')

      const items = wrapper.findAll('.kanji-detail-classifications-edit-item')
      const firstItemUpBtn = items[0]
        ?.findAll('button')
        .find((btn) => btn.text() === '↑')

      expect(firstItemUpBtn?.attributes('disabled')).toBeDefined()
    })

    it('disables down arrow for last item', async () => {
      const classifications = [
        createMockClassification({ id: 1, displayOrder: 0 }),
        createMockClassification({ id: 2, displayOrder: 1 })
      ]

      const wrapper = mount(KanjiDetailClassifications, {
        props: {
          classifications,
          classificationTypes
        }
      })

      await wrapper.find('button').trigger('click')

      const items = wrapper.findAll('.kanji-detail-classifications-edit-item')
      const lastItemDownBtn = items[items.length - 1]
        ?.findAll('button')
        .find((btn) => btn.text() === '↓')

      expect(lastItemDownBtn?.attributes('disabled')).toBeDefined()
    })

    it('disables both arrows when only one classification', async () => {
      const classifications = [
        createMockClassification({ id: 1, displayOrder: 0 })
      ]

      const wrapper = mount(KanjiDetailClassifications, {
        props: {
          classifications,
          classificationTypes
        }
      })

      await wrapper.find('button').trigger('click')

      const upButton = wrapper
        .findAll('button')
        .find((btn) => btn.text() === '↑')
      const downButton = wrapper
        .findAll('button')
        .find((btn) => btn.text() === '↓')

      expect(upButton?.attributes('disabled')).toBeDefined()
      expect(downButton?.attributes('disabled')).toBeDefined()
    })

    it('emits reorderClassifications on Save after reordering', async () => {
      const classifications = [
        createMockClassification({
          id: 1,
          classificationTypeId: 1,
          displayOrder: 0
        }),
        createMockClassification({
          id: 2,
          classificationTypeId: 2,
          displayOrder: 1
        })
      ]

      const wrapper = mount(KanjiDetailClassifications, {
        props: {
          classifications,
          classificationTypes
        }
      })

      // Enter edit mode
      await wrapper.find('button').trigger('click')

      // Click down arrow on first item (moves it down)
      const items = wrapper.findAll('.kanji-detail-classifications-edit-item')
      const firstItemDownBtn = items[0]
        ?.findAll('button')
        .find((btn) => btn.text() === '↓')
      await firstItemDownBtn?.trigger('click')

      // Click Save
      const saveBtn = wrapper
        .findAll('button')
        .find((btn) => btn.text() === 'Save')
      await saveBtn?.trigger('click')

      expect(wrapper.emitted('reorderClassifications')).toBeDefined()
      const emittedOrder = wrapper.emitted('reorderClassifications')?.[0]?.[0]
      expect(emittedOrder).toEqual([2, 1]) // Order reversed
    })
  })

  describe('Edit Mode - Delete', () => {
    it('shows delete button only in destructive mode', async () => {
      const classifications = [createMockClassification({ displayOrder: 0 })]

      const wrapperNoDestructive = mount(KanjiDetailClassifications, {
        props: {
          classifications,
          classificationTypes,
          isDestructiveMode: false
        }
      })

      await wrapperNoDestructive.find('button').trigger('click')
      const deleteBtn = wrapperNoDestructive
        .findAll('button')
        .find((btn) => btn.text() === '✕')
      expect(deleteBtn).toBeUndefined()

      // Now with destructive mode
      const wrapperWithDestructive = mount(KanjiDetailClassifications, {
        props: {
          classifications,
          classificationTypes,
          isDestructiveMode: true
        }
      })

      await wrapperWithDestructive.find('button').trigger('click')
      const deleteBtnDestructive = wrapperWithDestructive
        .findAll('button')
        .find((btn) => btn.text() === '✕')
      expect(deleteBtnDestructive).toBeDefined()
    })

    it('clicking delete button opens confirmation state', async () => {
      const classifications = [
        createMockClassification({ id: 42, displayOrder: 0 })
      ]

      const wrapper = mount(KanjiDetailClassifications, {
        props: {
          classifications,
          classificationTypes,
          isDestructiveMode: true
        }
      })

      // Enter edit mode
      await wrapper.find('button').trigger('click')

      // Click delete button - this opens the dialog internally
      const deleteBtn = wrapper
        .findAll('button')
        .find((btn) => btn.text() === '✕')

      // Verify delete button exists and is clickable
      expect(deleteBtn).toBeDefined()
      await deleteBtn?.trigger('click')

      // Dialog should be in the component tree (SharedConfirmDialog component)
      const dialogs = wrapper.findAllComponents({ name: 'SharedConfirmDialog' })
      expect(dialogs.length).toBeGreaterThan(0)
    })
  })

  describe('Edit Mode - Validation', () => {
    it('shows duplicate warning when same type selected twice', async () => {
      const classifications = [
        createMockClassification({
          id: 1,
          classificationTypeId: 1,
          displayOrder: 0
        }),
        createMockClassification({
          id: 2,
          classificationTypeId: 1, // Same type!
          displayOrder: 1
        })
      ]

      const wrapper = mount(KanjiDetailClassifications, {
        props: {
          classifications,
          classificationTypes
        }
      })

      await wrapper.find('button').trigger('click')

      expect(wrapper.text()).toContain('Duplicate classification')
    })

    it('disables Save button when duplicates exist', async () => {
      const classifications = [
        createMockClassification({
          id: 1,
          classificationTypeId: 1,
          displayOrder: 0
        }),
        createMockClassification({
          id: 2,
          classificationTypeId: 1, // Same type!
          displayOrder: 1
        })
      ]

      const wrapper = mount(KanjiDetailClassifications, {
        props: {
          classifications,
          classificationTypes
        }
      })

      await wrapper.find('button').trigger('click')

      const saveBtn = wrapper
        .findAll('button')
        .find((btn) => btn.text() === 'Save')
      expect(saveBtn?.attributes('disabled')).toBeDefined()
    })
  })

  describe('Edit Mode - Save Changes', () => {
    it('exits edit mode when Save clicked', async () => {
      const classifications = [
        createMockClassification({
          id: 1,
          classificationTypeId: 1,
          displayOrder: 0
        })
      ]

      const wrapper = mount(KanjiDetailClassifications, {
        props: {
          classifications,
          classificationTypes
        }
      })

      // Enter edit mode
      await wrapper.find('button').trigger('click')
      expect(wrapper.find('.kanji-detail-classifications-edit').exists()).toBe(
        true
      )

      // Click Save
      const saveBtn = wrapper
        .findAll('button')
        .find((btn) => btn.text() === 'Save')
      await saveBtn?.trigger('click')

      // Should exit edit mode and be back in view mode
      expect(wrapper.find('.kanji-detail-classifications-view').exists()).toBe(
        true
      )
    })
  })
})
