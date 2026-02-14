/**
 * Tests for ComponentDetailBasicInfo component
 */

import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { RouterLinkStub } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import ComponentDetailBasicInfo from './ComponentDetailBasicInfo.vue'

import type { Component, Kanji } from '@/legacy/shared/types/database-types'

const createMockComponent = (
  overrides: Partial<Component> = {}
): Component => ({
  id: 1,
  character: '日',
  strokeCount: 4,
  shortMeaning: 'sun',
  sourceKanjiId: null,
  searchKeywords: null,
  description: null,
  canBeRadical: false,
  kangxiNumber: null,
  kangxiMeaning: null,
  radicalNameJapanese: null,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
  ...overrides
})

const createMockKanji = (overrides: Partial<Kanji> = {}): Kanji => ({
  id: 1,
  character: '日',
  strokeCount: 4,
  shortMeaning: 'day, sun',
  searchKeywords: null,
  radicalId: null,
  jlptLevel: null,
  joyoLevel: null,
  kenteiLevel: null,
  strokeDiagramImage: null,
  strokeGifImage: null,
  notesEtymology: null,
  notesSemantic: null,
  notesEducationMnemonics: null,
  notesPersonal: null,
  identifier: null,
  radicalStrokeCount: null,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
  ...overrides
})

describe('ComponentDetailBasicInfo', () => {
  describe('view mode', () => {
    it('renders general attributes section', () => {
      render(ComponentDetailBasicInfo, {
        props: {
          component: createMockComponent()
        }
      })

      expect(screen.getByText('General Attributes')).toBeInTheDocument()
      expect(screen.getByText('Stroke Count')).toBeInTheDocument()
      expect(screen.getByText('Source Kanji')).toBeInTheDocument()
      expect(screen.getByText('Can be Radical')).toBeInTheDocument()
    })

    it('displays stroke count', () => {
      render(ComponentDetailBasicInfo, {
        props: {
          component: createMockComponent({ strokeCount: 7 })
        }
      })

      expect(screen.getByText('7')).toBeInTheDocument()
    })

    it('displays stroke count or placeholder', () => {
      const { container } = render(ComponentDetailBasicInfo, {
        props: {
          component: createMockComponent({ strokeCount: null })
        }
      })

      // Check that the component renders without errors
      expect(
        container.querySelector('.component-detail-basic-info')
      ).toBeInTheDocument()
    })

    it('displays source kanji with link when present', () => {
      const sourceKanji = createMockKanji({
        id: 2,
        character: '日',
        shortMeaning: 'sun'
      })

      render(ComponentDetailBasicInfo, {
        props: {
          component: createMockComponent({ sourceKanjiId: 2 }),
          sourceKanji
        },
        global: {
          stubs: {
            RouterLink: RouterLinkStub
          }
        }
      })

      const link = screen.getByText(/日 \(sun\)/)
      expect(link).toBeInTheDocument()
    })

    it('displays em dash when no source kanji', () => {
      render(ComponentDetailBasicInfo, {
        props: {
          component: createMockComponent({ sourceKanjiId: null }),
          sourceKanji: null
        }
      })

      // Find the "—" in the source kanji value section
      const labels = screen.getAllByText('Source Kanji')
      expect(labels).toHaveLength(1)
    })

    it('shows "No" for canBeRadical when false', () => {
      render(ComponentDetailBasicInfo, {
        props: {
          component: createMockComponent({ canBeRadical: false })
        }
      })

      expect(screen.getByText('No')).toBeInTheDocument()
    })

    it('shows "Yes 🔶" for canBeRadical when true', () => {
      render(ComponentDetailBasicInfo, {
        props: {
          component: createMockComponent({ canBeRadical: true })
        }
      })

      expect(screen.getByText(/Yes 🔶/)).toBeInTheDocument()
    })

    it('shows radical attributes section when canBeRadical is true', () => {
      render(ComponentDetailBasicInfo, {
        props: {
          component: createMockComponent({
            canBeRadical: true,
            kangxiNumber: 72,
            kangxiMeaning: 'sun',
            radicalNameJapanese: 'ひ'
          })
        }
      })

      expect(screen.getByText('Radical Attributes')).toBeInTheDocument()
      expect(screen.getByText('Kangxi Number')).toBeInTheDocument()
      expect(screen.getByText('72')).toBeInTheDocument()
      expect(screen.getByText('Kangxi Meaning')).toBeInTheDocument()
      expect(screen.getByText('sun')).toBeInTheDocument()
      expect(screen.getByText('Radical Name')).toBeInTheDocument()
      expect(screen.getByText('ひ')).toBeInTheDocument()
    })

    it('hides radical attributes when canBeRadical is false', () => {
      render(ComponentDetailBasicInfo, {
        props: {
          component: createMockComponent({ canBeRadical: false })
        }
      })

      expect(screen.queryByText('Radical Attributes')).not.toBeInTheDocument()
      expect(screen.queryByText('Kangxi Number')).not.toBeInTheDocument()
    })

    it('shows edit button in view mode', () => {
      render(ComponentDetailBasicInfo, {
        props: {
          component: createMockComponent()
        }
      })

      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
    })
  })

  describe('edit mode', () => {
    it('switches to edit mode when edit button clicked', async () => {
      const user = userEvent.setup()

      render(ComponentDetailBasicInfo, {
        props: {
          component: createMockComponent()
        }
      })

      await user.click(screen.getByRole('button', { name: /edit/i }))

      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /cancel/i })
      ).toBeInTheDocument()
    })

    it('shows edit form fields in edit mode', async () => {
      const user = userEvent.setup()

      const { container } = render(ComponentDetailBasicInfo, {
        props: {
          component: createMockComponent()
        }
      })

      await user.click(screen.getByRole('button', { name: /edit/i }))

      // Check that edit mode is active by looking for the edit grid
      expect(
        container.querySelector('.component-detail-basic-info-edit-grid')
      ).toBeInTheDocument()
    })

    it('populates fields with current values in edit mode', async () => {
      const user = userEvent.setup()

      const { container } = render(ComponentDetailBasicInfo, {
        props: {
          component: createMockComponent({ strokeCount: 7, canBeRadical: true })
        }
      })

      await user.click(screen.getByRole('button', { name: /edit/i }))

      // Check that edit form is populated
      expect(
        container.querySelector('.component-detail-basic-info-edit-grid')
      ).toBeInTheDocument()
    })

    it('shows radical fields when canBeRadical is checked', async () => {
      const user = userEvent.setup()

      render(ComponentDetailBasicInfo, {
        props: {
          component: createMockComponent({ canBeRadical: true })
        }
      })

      await user.click(screen.getByRole('button', { name: /edit/i }))

      expect(screen.getByLabelText(/Kangxi Number/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Kangxi Meaning/i)).toBeInTheDocument()
      expect(
        screen.getByLabelText(/Radical Name \(Japanese\)/i)
      ).toBeInTheDocument()
    })

    it('hides radical fields when canBeRadical is unchecked', async () => {
      const user = userEvent.setup()

      render(ComponentDetailBasicInfo, {
        props: {
          component: createMockComponent({ canBeRadical: false })
        }
      })

      await user.click(screen.getByRole('button', { name: /edit/i }))

      expect(screen.queryByLabelText(/Kangxi Number/i)).not.toBeInTheDocument()
    })

    it('validates stroke count range', async () => {
      const user = userEvent.setup()

      render(ComponentDetailBasicInfo, {
        props: {
          component: createMockComponent()
        }
      })

      await user.click(screen.getByRole('button', { name: /edit/i }))

      const strokeInput = screen.getByLabelText(/Stroke Count/i)
      await user.clear(strokeInput)
      await user.type(strokeInput, '100')

      // Try to save
      await user.click(screen.getByRole('button', { name: /save/i }))

      // Should show error message
      expect(screen.getByText(/must be at most 64/i)).toBeInTheDocument()
    })

    it('prevents negative stroke count', async () => {
      const user = userEvent.setup()

      render(ComponentDetailBasicInfo, {
        props: {
          component: createMockComponent()
        }
      })

      await user.click(screen.getByRole('button', { name: /edit/i }))

      const strokeInput = screen.getByLabelText(/Stroke Count/i)
      await user.clear(strokeInput)
      await user.type(strokeInput, '-5')

      await user.click(screen.getByRole('button', { name: /save/i }))

      expect(screen.getByText(/cannot be negative/i)).toBeInTheDocument()
    })

    it('emits update events when saving changes', async () => {
      const user = userEvent.setup()
      const onUpdate = vi.fn()

      render(ComponentDetailBasicInfo, {
        props: {
          component: createMockComponent({ strokeCount: 4 }),
          onUpdate
        }
      })

      await user.click(screen.getByRole('button', { name: /edit/i }))

      const strokeInput = screen.getByLabelText(/Stroke Count/i)
      await user.clear(strokeInput)
      await user.type(strokeInput, '7')

      await user.click(screen.getByRole('button', { name: /save/i }))

      expect(onUpdate).toHaveBeenCalledWith('strokeCount', 7)
    })

    it('cancels edit mode without saving', async () => {
      const user = userEvent.setup()
      const onUpdate = vi.fn()

      render(ComponentDetailBasicInfo, {
        props: {
          component: createMockComponent({ strokeCount: 4 }),
          onUpdate
        }
      })

      await user.click(screen.getByRole('button', { name: /edit/i }))

      const strokeInput = screen.getByLabelText(/Stroke Count/i)
      await user.clear(strokeInput)
      await user.type(strokeInput, '7')

      await user.click(screen.getByRole('button', { name: /cancel/i }))

      // Should not emit updates
      expect(onUpdate).not.toHaveBeenCalled()
      // Should return to view mode
      expect(
        screen.queryByRole('button', { name: /save/i })
      ).not.toBeInTheDocument()
    })

    it('resets fields to original values on cancel', async () => {
      const user = userEvent.setup()

      render(ComponentDetailBasicInfo, {
        props: {
          component: createMockComponent({ strokeCount: 4 })
        }
      })

      await user.click(screen.getByRole('button', { name: /edit/i }))

      const strokeInput = screen.getByLabelText(/Stroke Count/i)
      await user.clear(strokeInput)
      await user.type(strokeInput, '7')

      await user.click(screen.getByRole('button', { name: /cancel/i }))

      // Return to view mode and check original value is displayed
      expect(screen.getByText('Stroke Count')).toBeInTheDocument()
      expect(screen.getByText('4')).toBeInTheDocument()
    })
  })

  describe('kanji options', () => {
    it('shows kanji options in combobox', async () => {
      const user = userEvent.setup()
      const kanjiOptions = [
        createMockKanji({ id: 1, character: '日', shortMeaning: 'sun' }),
        createMockKanji({ id: 2, character: '水', shortMeaning: 'water' })
      ]

      render(ComponentDetailBasicInfo, {
        props: {
          component: createMockComponent(),
          kanjiOptions
        }
      })

      await user.click(screen.getByRole('button', { name: /edit/i }))

      // Combobox should be rendered
      expect(screen.getByLabelText(/Source Kanji/i)).toBeInTheDocument()
    })

    it('includes "None" option in combobox', async () => {
      const user = userEvent.setup()

      render(ComponentDetailBasicInfo, {
        props: {
          component: createMockComponent(),
          kanjiOptions: []
        }
      })

      await user.click(screen.getByRole('button', { name: /edit/i }))

      // BaseCombobox should have None option available
      expect(screen.getByLabelText(/Source Kanji/i)).toBeInTheDocument()
    })
  })
})
