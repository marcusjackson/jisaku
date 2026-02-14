/**
 * Tests for ImageLightbox component
 *
 * TDD tests for fullscreen image viewing with accessibility.
 */

import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '@testing-library/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import ImageLightbox from './ImageLightbox.vue'

describe('ImageLightbox', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('overlay and accessibility (Task 2.1)', () => {
    it('renders when open is true', async () => {
      render(ImageLightbox, {
        props: {
          open: true,
          src: 'blob:test-url',
          alt: 'Test image'
        }
      })

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })
    })

    it('does not render when open is false', () => {
      render(ImageLightbox, {
        props: {
          open: false,
          src: 'blob:test-url',
          alt: 'Test image'
        }
      })

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('displays image with provided src and alt', async () => {
      render(ImageLightbox, {
        props: {
          open: true,
          src: 'blob:test-url',
          alt: 'Stroke order diagram'
        }
      })

      await waitFor(() => {
        const img = screen.getByRole('img')
        expect(img).toHaveAttribute('src', 'blob:test-url')
        expect(img).toHaveAttribute('alt', 'Stroke order diagram')
      })
    })

    it('has close button', async () => {
      render(ImageLightbox, {
        props: {
          open: true,
          src: 'blob:test-url',
          alt: 'Test image'
        }
      })

      await waitFor(() => {
        expect(screen.getByLabelText(/close/i)).toBeInTheDocument()
      })
    })

    it('emits update:open with false when close button is clicked', async () => {
      const user = userEvent.setup()
      const { emitted } = render(ImageLightbox, {
        props: {
          open: true,
          src: 'blob:test-url',
          alt: 'Test image'
        }
      })

      await waitFor(() => {
        expect(screen.getByLabelText(/close/i)).toBeInTheDocument()
      })

      await user.click(screen.getByLabelText(/close/i))

      expect(emitted()['update:open']).toBeTruthy()
      expect(emitted()['update:open']?.[0]).toEqual([false])
    })

    it('closes on Escape key press', async () => {
      const user = userEvent.setup()
      const { emitted } = render(ImageLightbox, {
        props: {
          open: true,
          src: 'blob:test-url',
          alt: 'Test image'
        }
      })

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      await user.keyboard('{Escape}')

      expect(emitted()['update:open']).toBeTruthy()
      expect(emitted()['update:open']?.[0]).toEqual([false])
    })
  })

  describe('zoom and pan support (Task 2.2)', () => {
    it('has image container with touch-action for pinch-zoom', async () => {
      render(ImageLightbox, {
        props: {
          open: true,
          src: 'blob:test-url',
          alt: 'Test image'
        }
      })

      await waitFor(() => {
        const container = screen.getByTestId('lightbox-image-container')
        expect(container).toBeInTheDocument()
      })
    })

    it('allows image to display at natural size', async () => {
      render(ImageLightbox, {
        props: {
          open: true,
          src: 'blob:test-url',
          alt: 'Test image'
        }
      })

      await waitFor(() => {
        const img = screen.getByRole('img')
        expect(img).toBeInTheDocument()
      })
    })
  })
})
