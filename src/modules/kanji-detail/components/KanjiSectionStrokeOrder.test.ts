/**
 * KanjiSectionStrokeOrder.test.ts
 *
 * Unit tests for KanjiSectionStrokeOrder component.
 * Tests view/edit toggle, save/cancel events, and collapsed state.
 */

import { computed } from 'vue'

import userEvent from '@testing-library/user-event'
import { render, screen, within } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import KanjiSectionStrokeOrder from './KanjiSectionStrokeOrder.vue'

// Mock useBlobUrl to return computed ref with predictable URLs
vi.mock('../composables/use-blob-url', () => ({
  useBlobUrl: vi.fn(
    (data: (() => Uint8Array | null) | { value: Uint8Array | null }) => {
      const url = computed(() => {
        const dataValue = typeof data === 'function' ? data() : data.value
        return dataValue ? 'blob:mock-url' : null
      })
      return { url }
    }
  )
}))

// Helper to create mock Uint8Array
function createMockImageData(): Uint8Array {
  // PNG magic bytes
  return new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
}

describe('KanjiSectionStrokeOrder', () => {
  // Helper to find the edit button in actions slot
  function getEditButton(): HTMLElement {
    return screen.getByRole('button', { name: /edit/i })
  }

  describe('rendering', () => {
    it('renders section with title', () => {
      render(KanjiSectionStrokeOrder, {
        props: {
          strokeDiagram: null,
          strokeGif: null
        }
      })

      expect(screen.getByText('Stroke Order')).toBeInTheDocument()
    })

    it('shows display component in view mode by default', () => {
      render(KanjiSectionStrokeOrder, {
        props: {
          strokeDiagram: createMockImageData(),
          strokeGif: null
        }
      })

      expect(screen.getByTestId('stroke-order-display')).toBeInTheDocument()
    })

    it('shows edit button in section actions', async () => {
      const user = userEvent.setup()

      render(KanjiSectionStrokeOrder, {
        props: {
          strokeDiagram: null,
          strokeGif: null
        }
      })

      // Expand the section first (it starts collapsed with no content)
      const section = screen.getByTestId('kanji-section-stroke-order')
      const trigger = within(section).getByRole('button', {
        name: /stroke order/i
      })
      await user.click(trigger)

      // Now the edit button should be visible
      expect(getEditButton()).toBeInTheDocument()
    })
  })

  describe('view/edit mode toggle', () => {
    it('switches to edit mode when edit button clicked', async () => {
      const user = userEvent.setup()

      render(KanjiSectionStrokeOrder, {
        props: {
          strokeDiagram: null,
          strokeGif: null
        }
      })

      // Expand the section first
      const section = screen.getByTestId('kanji-section-stroke-order')
      const trigger = within(section).getByRole('button', {
        name: /stroke order/i
      })
      await user.click(trigger)

      await user.click(getEditButton())

      // Should show edit mode inputs
      expect(screen.getByText('Stroke Diagram')).toBeInTheDocument()
      expect(screen.getByText('Stroke Animation')).toBeInTheDocument()
    })

    it('returns to view mode when cancel clicked', async () => {
      const user = userEvent.setup()

      render(KanjiSectionStrokeOrder, {
        props: {
          strokeDiagram: null,
          strokeGif: null
        }
      })

      // Expand the section first
      const section = screen.getByTestId('kanji-section-stroke-order')
      const trigger = within(section).getByRole('button', {
        name: /stroke order/i
      })
      await user.click(trigger)

      // Enter edit mode
      await user.click(getEditButton())

      // Click cancel - use actions container to find the right cancel button
      const actionsContainer = document.querySelector(
        '.stroke-order-edit-mode-actions'
      )
      const cancelButton = actionsContainer?.querySelectorAll('button')[0]
      await user.click(cancelButton as HTMLElement)

      // Should be back in view mode
      expect(screen.getByTestId('stroke-order-display')).toBeInTheDocument()
    })
  })

  describe('events', () => {
    it('emits save:diagram event on save', async () => {
      const user = userEvent.setup()
      const diagramData = createMockImageData()

      const { emitted } = render(KanjiSectionStrokeOrder, {
        props: {
          strokeDiagram: diagramData,
          strokeGif: null
        }
      })

      // Enter edit mode
      await user.click(getEditButton())

      // Click save
      const actionsContainer = document.querySelector(
        '.stroke-order-edit-mode-actions'
      )
      const saveButton = actionsContainer?.querySelectorAll('button')[1]
      await user.click(saveButton as HTMLElement)

      // Check events emitted
      expect(emitted()['save:diagram']).toBeTruthy()
      expect(emitted()['save:animation']).toBeTruthy()
    })

    it('returns to view mode after save', async () => {
      const user = userEvent.setup()

      render(KanjiSectionStrokeOrder, {
        props: {
          strokeDiagram: null,
          strokeGif: null
        }
      })

      // Expand the section first
      const section = screen.getByTestId('kanji-section-stroke-order')
      const trigger = within(section).getByRole('button', {
        name: /stroke order/i
      })
      await user.click(trigger)

      // Enter edit mode
      await user.click(getEditButton())

      // Click save
      const actionsContainer = document.querySelector(
        '.stroke-order-edit-mode-actions'
      )
      const saveButton = actionsContainer?.querySelectorAll('button')[1]
      await user.click(saveButton as HTMLElement)

      // Should be back in view mode
      expect(screen.getByTestId('stroke-order-display')).toBeInTheDocument()
    })
  })

  describe('collapsed state', () => {
    it('expands by default when images exist', () => {
      render(KanjiSectionStrokeOrder, {
        props: {
          strokeDiagram: createMockImageData(),
          strokeGif: null
        }
      })

      // Section content should be visible
      expect(screen.getByTestId('stroke-order-display')).toBeInTheDocument()
    })

    it('is collapsible', () => {
      render(KanjiSectionStrokeOrder, {
        props: {
          strokeDiagram: null,
          strokeGif: null
        }
      })

      // Section should have a trigger button (collapsible)
      const section = screen.getByTestId('kanji-section-stroke-order')
      expect(
        within(section).getByRole('button', { name: /stroke order/i })
      ).toBeInTheDocument()
    })

    it('hides edit button when section is collapsed', async () => {
      const user = userEvent.setup()

      render(KanjiSectionStrokeOrder, {
        props: {
          strokeDiagram: createMockImageData(),
          strokeGif: null
        }
      })

      // Verify edit button is visible when expanded
      expect(screen.getByTestId('stroke-order-edit-button')).toBeInTheDocument()

      // Click section title to collapse
      const section = screen.getByTestId('kanji-section-stroke-order')
      const trigger = within(section).getByRole('button', {
        name: /stroke order/i
      })
      await user.click(trigger)

      // Edit button should now be hidden
      expect(
        screen.queryByTestId('stroke-order-edit-button')
      ).not.toBeInTheDocument()
    })
  })
})
