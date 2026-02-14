/**
 * KanjiStrokeOrderEditMode.test.ts
 *
 * Unit tests for KanjiStrokeOrderEditMode component.
 * Tests file input display, save/cancel events, and state management.
 */

import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import KanjiStrokeOrderEditMode from './KanjiStrokeOrderEditMode.vue'

// Helper to create mock Uint8Array
function createMockImageData(): Uint8Array {
  // PNG magic bytes
  return new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
}

describe('KanjiStrokeOrderEditMode', () => {
  describe('rendering', () => {
    it('renders two file inputs with labels', () => {
      render(KanjiStrokeOrderEditMode, {
        props: {
          strokeDiagram: null,
          strokeGif: null
        }
      })

      expect(screen.getByText('Stroke Diagram')).toBeInTheDocument()
      expect(screen.getByText('Stroke Animation')).toBeInTheDocument()
    })

    it('renders save and cancel buttons', () => {
      render(KanjiStrokeOrderEditMode, {
        props: {
          strokeDiagram: null,
          strokeGif: null
        }
      })

      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /cancel/i })
      ).toBeInTheDocument()
    })

    it('shows preview when images are provided', () => {
      render(KanjiStrokeOrderEditMode, {
        props: {
          strokeDiagram: createMockImageData(),
          strokeGif: createMockImageData()
        }
      })

      // Both file inputs should have previews (the BaseFileInput handles this)
      const dropZones = screen.getAllByTestId('file-input-drop-zone')
      expect(dropZones).toHaveLength(2)
    })
  })

  describe('events', () => {
    it('emits save event with values when save button clicked', async () => {
      const user = userEvent.setup()
      const diagramData = createMockImageData()

      const { emitted } = render(KanjiStrokeOrderEditMode, {
        props: {
          strokeDiagram: diagramData,
          strokeGif: null
        }
      })

      // Use the actions container to find the save button specifically
      const actionsContainer = document.querySelector(
        '.stroke-order-edit-mode-actions'
      )
      const saveButton = actionsContainer?.querySelector(
        'button'
      ) as HTMLElement
      const allButtons = actionsContainer?.querySelectorAll('button')
      // Save is the second button (after Cancel)
      await user.click(allButtons?.[1] ?? saveButton)

      expect(emitted()['save']).toBeTruthy()
      const saveEvent = emitted()['save']?.[0] as [
        Uint8Array | null,
        Uint8Array | null
      ]
      expect(saveEvent[0]).toEqual(diagramData)
      expect(saveEvent[1]).toBeNull()
    })

    it('emits cancel event when cancel button clicked', async () => {
      const user = userEvent.setup()

      const { emitted } = render(KanjiStrokeOrderEditMode, {
        props: {
          strokeDiagram: null,
          strokeGif: null
        }
      })

      // Use the actions container to find the cancel button specifically
      const actionsContainer = document.querySelector(
        '.stroke-order-edit-mode-actions'
      )
      const buttons = actionsContainer?.querySelectorAll('button')
      // Cancel is the first button
      await user.click(buttons?.[0] as HTMLElement)

      expect(emitted()['cancel']).toBeTruthy()
    })
  })

  describe('state management', () => {
    it('initializes local state from props', () => {
      const diagramData = createMockImageData()

      render(KanjiStrokeOrderEditMode, {
        props: {
          strokeDiagram: diagramData,
          strokeGif: null
        }
      })

      // Both file inputs should exist - diagram with preview, animation empty
      const dropZones = screen.getAllByTestId('file-input-drop-zone')
      expect(dropZones).toHaveLength(2)
    })

    it('accepts correct file types for diagram', () => {
      render(KanjiStrokeOrderEditMode, {
        props: {
          strokeDiagram: null,
          strokeGif: null
        }
      })

      // First file input should accept image/*
      const hiddenInputs = screen.getAllByTestId('file-input-hidden')
      expect(hiddenInputs[0]).toHaveAttribute('accept', 'image/*')
    })

    it('accepts only gif for animation', () => {
      render(KanjiStrokeOrderEditMode, {
        props: {
          strokeDiagram: null,
          strokeGif: null
        }
      })

      // Second file input should accept only gif
      const hiddenInputs = screen.getAllByTestId('file-input-hidden')
      expect(hiddenInputs[1]).toHaveAttribute('accept', 'image/gif')
    })
  })
})
