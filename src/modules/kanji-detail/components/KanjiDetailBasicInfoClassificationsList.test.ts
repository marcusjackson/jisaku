/**
 * Tests for KanjiDetailBasicInfoClassificationsList component.
 *
 * @module modules/kanji-detail
 */

import { computed, ref } from 'vue'

import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import KanjiDetailBasicInfoClassificationsList from './KanjiDetailBasicInfoClassificationsList.vue'

import type { ClassificationChange } from '../kanji-detail-types'
import type { ClassificationItem } from '../schemas/basic-info-schema'
import type { ClassificationType } from '@/api/classification/classification-types'

function mockClassificationType(
  overrides: Partial<ClassificationType> = {}
): ClassificationType {
  return {
    id: 1,
    typeName: 'pictograph',
    description: null,
    descriptionShort: null,
    displayOrder: 0,
    nameJapanese: '象形文字',
    nameEnglish: null,
    ...overrides
  }
}

function createMockClassificationsState(items: ClassificationItem[] = []) {
  const itemsRef = ref(items)
  return {
    items: itemsRef,
    normalizedItems: computed<ClassificationChange[]>(() =>
      itemsRef.value.map((item, index) => ({
        id: item.id,
        classificationTypeId: item.classificationTypeId,
        displayOrder: index
      }))
    ),
    add: vi.fn((typeId: number) => {
      itemsRef.value.push({
        id: undefined,
        classificationTypeId: typeId,
        displayOrder: itemsRef.value.length
      })
    }),
    removeAt: vi.fn((index: number) => {
      itemsRef.value.splice(index, 1)
    }),
    moveUp: vi.fn((index: number) => {
      if (index > 0) {
        const item = itemsRef.value[index]
        const prev = itemsRef.value[index - 1]
        if (item && prev) {
          itemsRef.value[index - 1] = item
          itemsRef.value[index] = prev
        }
      }
    }),
    moveDown: vi.fn((index: number) => {
      if (index < itemsRef.value.length - 1) {
        const item = itemsRef.value[index]
        const next = itemsRef.value[index + 1]
        if (item && next) {
          itemsRef.value[index + 1] = item
          itemsRef.value[index] = next
        }
      }
    }),
    hasType: (id: number) =>
      itemsRef.value.some((i) => i.classificationTypeId === id),
    reset: vi.fn()
  }
}

const defaultClassificationTypes = [
  mockClassificationType({ id: 1, nameJapanese: '象形文字' }),
  mockClassificationType({ id: 2, nameJapanese: '会意文字' })
]

describe('KanjiDetailBasicInfoClassificationsList', () => {
  describe('empty state', () => {
    it('shows empty message when no classifications', () => {
      render(KanjiDetailBasicInfoClassificationsList, {
        props: {
          classificationsState: createMockClassificationsState(),
          classificationTypes: defaultClassificationTypes
        }
      })
      expect(screen.getByText('No classifications')).toBeInTheDocument()
    })
  })

  describe('with classifications', () => {
    it('displays classification items', () => {
      const state = createMockClassificationsState([
        { id: 1, classificationTypeId: 1, displayOrder: 0 }
      ])
      render(KanjiDetailBasicInfoClassificationsList, {
        props: {
          classificationsState: state,
          classificationTypes: defaultClassificationTypes
        }
      })
      expect(screen.queryByText('No classifications')).not.toBeInTheDocument()
    })

    it('shows star for first item', () => {
      const state = createMockClassificationsState([
        { id: 1, classificationTypeId: 1, displayOrder: 0 }
      ])
      render(KanjiDetailBasicInfoClassificationsList, {
        props: {
          classificationsState: state,
          classificationTypes: defaultClassificationTypes
        }
      })
      expect(screen.getByText('★')).toBeInTheDocument()
    })

    it('shows number for subsequent items', () => {
      const state = createMockClassificationsState([
        { id: 1, classificationTypeId: 1, displayOrder: 0 },
        { id: 2, classificationTypeId: 2, displayOrder: 1 }
      ])
      render(KanjiDetailBasicInfoClassificationsList, {
        props: {
          classificationsState: state,
          classificationTypes: defaultClassificationTypes
        }
      })
      expect(screen.getByText('2')).toBeInTheDocument()
    })
  })

  describe('add button', () => {
    it('calls add when add button is clicked', async () => {
      const user = userEvent.setup()
      const state = createMockClassificationsState()
      render(KanjiDetailBasicInfoClassificationsList, {
        props: {
          classificationsState: state,
          classificationTypes: defaultClassificationTypes
        }
      })

      await user.click(screen.getByRole('button', { name: /add/i }))

      expect(state.add).toHaveBeenCalled()
    })
  })

  describe('move buttons', () => {
    it('disables move up for first item', () => {
      const state = createMockClassificationsState([
        { id: 1, classificationTypeId: 1, displayOrder: 0 }
      ])
      render(KanjiDetailBasicInfoClassificationsList, {
        props: {
          classificationsState: state,
          classificationTypes: defaultClassificationTypes
        }
      })

      const upButton = screen.getByRole('button', { name: '↑' })
      expect(upButton).toBeDisabled()
    })

    it('disables move down for last item', () => {
      const state = createMockClassificationsState([
        { id: 1, classificationTypeId: 1, displayOrder: 0 }
      ])
      render(KanjiDetailBasicInfoClassificationsList, {
        props: {
          classificationsState: state,
          classificationTypes: defaultClassificationTypes
        }
      })

      const downButton = screen.getByRole('button', { name: '↓' })
      expect(downButton).toBeDisabled()
    })

    it('calls moveUp when up button is clicked', async () => {
      const user = userEvent.setup()
      const state = createMockClassificationsState([
        { id: 1, classificationTypeId: 1, displayOrder: 0 },
        { id: 2, classificationTypeId: 2, displayOrder: 1 }
      ])
      render(KanjiDetailBasicInfoClassificationsList, {
        props: {
          classificationsState: state,
          classificationTypes: defaultClassificationTypes
        }
      })

      const upButtons = screen.getAllByRole('button', { name: '↑' })
      const secondUpButton = upButtons[1]
      if (secondUpButton) await user.click(secondUpButton)

      expect(state.moveUp).toHaveBeenCalledWith(1)
    })

    it('calls moveDown when down button is clicked', async () => {
      const user = userEvent.setup()
      const state = createMockClassificationsState([
        { id: 1, classificationTypeId: 1, displayOrder: 0 },
        { id: 2, classificationTypeId: 2, displayOrder: 1 }
      ])
      render(KanjiDetailBasicInfoClassificationsList, {
        props: {
          classificationsState: state,
          classificationTypes: defaultClassificationTypes
        }
      })

      const downButtons = screen.getAllByRole('button', { name: '↓' })
      const firstDownButton = downButtons[0]
      if (firstDownButton) await user.click(firstDownButton)

      expect(state.moveDown).toHaveBeenCalledWith(0)
    })
  })

  describe('remove button', () => {
    it('calls removeAt when remove button is clicked', async () => {
      const user = userEvent.setup()
      const state = createMockClassificationsState([
        { id: 1, classificationTypeId: 1, displayOrder: 0 }
      ])
      render(KanjiDetailBasicInfoClassificationsList, {
        props: {
          classificationsState: state,
          classificationTypes: defaultClassificationTypes
        }
      })

      await user.click(screen.getByRole('button', { name: '✕' }))

      expect(state.removeAt).toHaveBeenCalledWith(0)
    })
  })
})
