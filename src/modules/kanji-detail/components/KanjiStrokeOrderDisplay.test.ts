/**
 * KanjiStrokeOrderDisplay.test.ts
 *
 * Unit tests for KanjiStrokeOrderDisplay component.
 * Tests thumbnail rendering, empty state, and lightbox trigger.
 */

import { computed } from 'vue'

import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import KanjiStrokeOrderDisplay from './KanjiStrokeOrderDisplay.vue'

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

describe('KanjiStrokeOrderDisplay', () => {
  describe('rendering', () => {
    it('renders empty state when no images provided', () => {
      render(KanjiStrokeOrderDisplay, {
        props: {
          strokeDiagram: null,
          strokeGif: null
        }
      })

      expect(screen.getByText(/no stroke order images/i)).toBeInTheDocument()
    })

    it('renders stroke diagram thumbnail when provided', () => {
      render(KanjiStrokeOrderDisplay, {
        props: {
          strokeDiagram: createMockImageData(),
          strokeGif: null
        }
      })

      expect(screen.getByRole('figure')).toBeInTheDocument()
      expect(screen.getByText('Stroke Diagram')).toBeInTheDocument()
      expect(
        screen.getByRole('img', { name: /stroke order diagram/i })
      ).toBeInTheDocument()
    })

    it('renders stroke animation thumbnail when provided', () => {
      render(KanjiStrokeOrderDisplay, {
        props: {
          strokeDiagram: null,
          strokeGif: createMockImageData()
        }
      })

      expect(screen.getByRole('figure')).toBeInTheDocument()
      expect(screen.getByText('Animation')).toBeInTheDocument()
      expect(
        screen.getByRole('img', { name: /stroke order animation/i })
      ).toBeInTheDocument()
    })

    it('renders both thumbnails when both images provided', () => {
      render(KanjiStrokeOrderDisplay, {
        props: {
          strokeDiagram: createMockImageData(),
          strokeGif: createMockImageData()
        }
      })

      expect(screen.getAllByRole('figure')).toHaveLength(2)
      expect(screen.getByText('Stroke Diagram')).toBeInTheDocument()
      expect(screen.getByText('Animation')).toBeInTheDocument()
    })

    it('shows magnify icon on thumbnails', () => {
      render(KanjiStrokeOrderDisplay, {
        props: {
          strokeDiagram: createMockImageData(),
          strokeGif: null
        }
      })

      expect(screen.getByTestId('magnify-icon')).toBeInTheDocument()
    })
  })

  describe('lightbox interaction', () => {
    it('thumbnail is keyboard accessible', async () => {
      const user = userEvent.setup()

      render(KanjiStrokeOrderDisplay, {
        props: {
          strokeDiagram: createMockImageData(),
          strokeGif: null
        }
      })

      const thumbnailButton = screen.getByRole('button', {
        name: /view stroke diagram/i
      })
      expect(thumbnailButton).toBeInTheDocument()

      await user.tab()
      expect(thumbnailButton).toHaveFocus()
    })

    it('opens lightbox on thumbnail click', async () => {
      const user = userEvent.setup()

      render(KanjiStrokeOrderDisplay, {
        props: {
          strokeDiagram: createMockImageData(),
          strokeGif: null
        }
      })

      const thumbnailButton = screen.getByRole('button', {
        name: /view stroke diagram/i
      })
      await user.click(thumbnailButton)

      // Lightbox should be open
      expect(screen.getByTestId('lightbox-image-container')).toBeInTheDocument()
    })

    it('closes lightbox when closed', async () => {
      const user = userEvent.setup()

      render(KanjiStrokeOrderDisplay, {
        props: {
          strokeDiagram: createMockImageData(),
          strokeGif: null
        }
      })

      // Open lightbox
      await user.click(
        screen.getByRole('button', { name: /view stroke diagram/i })
      )
      expect(screen.getByTestId('lightbox-image-container')).toBeInTheDocument()

      // Close via close button
      await user.click(screen.getByRole('button', { name: /close/i }))

      // Lightbox should be closed
      expect(
        screen.queryByTestId('lightbox-image-container')
      ).not.toBeInTheDocument()
    })
  })

  describe('alt text', () => {
    it('provides proper alt text for stroke diagram', () => {
      render(KanjiStrokeOrderDisplay, {
        props: {
          strokeDiagram: createMockImageData(),
          strokeGif: null
        }
      })

      expect(
        screen.getByRole('img', { name: /stroke order diagram/i })
      ).toHaveAttribute('alt', 'Stroke order diagram')
    })

    it('provides proper alt text for stroke animation', () => {
      render(KanjiStrokeOrderDisplay, {
        props: {
          strokeDiagram: null,
          strokeGif: createMockImageData()
        }
      })

      expect(
        screen.getByRole('img', { name: /stroke order animation/i })
      ).toHaveAttribute('alt', 'Stroke order animation')
    })
  })
})
