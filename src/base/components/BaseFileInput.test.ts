import { fireEvent, render, screen } from '@testing-library/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import BaseFileInput from './BaseFileInput.vue'

describe('BaseFileInput', () => {
  // Mock URL.createObjectURL since it's not available in jsdom
  beforeEach(() => {
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
    global.URL.revokeObjectURL = vi.fn()
  })

  describe('rendering', () => {
    it('renders with label', () => {
      render(BaseFileInput, {
        props: { label: 'Upload Image' }
      })

      expect(screen.getByText('Upload Image')).toBeInTheDocument()
    })

    it('renders empty state by default', () => {
      render(BaseFileInput)

      expect(
        screen.getByText('Drop image here or click to browse')
      ).toBeInTheDocument()
    })

    it('renders hidden file input', () => {
      render(BaseFileInput)

      const input = document.querySelector('input[type="file"]')
      expect(input).toBeInTheDocument()
    })

    it('passes accept prop to file input', () => {
      render(BaseFileInput, {
        props: { accept: 'image/*' }
      })

      const input = document.querySelector('input[type="file"]')
      expect(input).toHaveAttribute('accept', 'image/*')
    })

    it('shows max size in hint text', () => {
      render(BaseFileInput, {
        props: { maxSizeBytes: 5 * 1024 * 1024 } // 5MB
      })

      expect(screen.getByText(/PNG, JPG, GIF up to 5MB/)).toBeInTheDocument()
    })
  })

  describe('disabled state', () => {
    it('applies disabled styles when disabled', () => {
      render(BaseFileInput, {
        props: { disabled: true }
      })

      const dropZone = document.querySelector('[role="button"]')
      expect(dropZone).toHaveAttribute('aria-disabled', 'true')
      expect(dropZone).toHaveAttribute('tabindex', '-1')
    })

    it('disables file input when disabled', () => {
      render(BaseFileInput, {
        props: { disabled: true }
      })

      const input = document.querySelector('input[type="file"]')
      expect(input).toBeDisabled()
    })
  })

  describe('error state', () => {
    it('displays error message', () => {
      render(BaseFileInput, {
        props: { error: 'Invalid file type' }
      })

      expect(screen.getByRole('alert')).toHaveTextContent('Invalid file type')
    })

    it('associates error with drop zone via aria-describedby', () => {
      render(BaseFileInput, {
        props: { error: 'Invalid file' }
      })

      const dropZone = document.querySelector('[role="button"]')
      const errorId = dropZone?.getAttribute('aria-describedby')
      expect(errorId).toBeTruthy()
      expect(document.getElementById(errorId!)).toHaveTextContent(
        'Invalid file'
      )
    })

    it('applies error class to drop zone', () => {
      render(BaseFileInput, {
        props: { error: 'Error message' }
      })

      const dropZone = document.querySelector('[role="button"]')
      expect(dropZone).toHaveClass('base-file-input-drop-zone-error')
    })
  })

  describe('preview state', () => {
    it('shows preview when modelValue is provided', () => {
      const testData = new Uint8Array([1, 2, 3, 4])
      render(BaseFileInput, {
        props: { modelValue: testData }
      })

      // Preview should show image
      const previewImage = document.querySelector('img[alt="Preview"]')
      expect(previewImage).toBeInTheDocument()
      expect(previewImage).toHaveAttribute('src', 'blob:mock-url')
    })

    it('shows remove button when file is present', () => {
      const testData = new Uint8Array([1, 2, 3, 4])
      render(BaseFileInput, {
        props: { modelValue: testData }
      })

      expect(
        screen.getByRole('button', { name: /remove/i })
      ).toBeInTheDocument()
    })
  })

  describe('file removal', () => {
    it('emits null when remove button is clicked', async () => {
      const onUpdate = vi.fn()
      const testData = new Uint8Array([1, 2, 3, 4])

      render(BaseFileInput, {
        props: {
          modelValue: testData,
          'onUpdate:modelValue': onUpdate
        }
      })

      const removeButton = screen.getByRole('button', { name: /remove/i })
      await fireEvent.click(removeButton)

      expect(onUpdate).toHaveBeenCalledWith(null)
    })
  })

  describe('keyboard accessibility', () => {
    it('triggers file input on Enter key', async () => {
      render(BaseFileInput)

      const dropZone = document.querySelector('[role="button"]')!
      const input = document.querySelector('input[type="file"]')!
      const clickSpy = vi.spyOn(input as HTMLInputElement, 'click')

      await fireEvent.keyDown(dropZone, { key: 'Enter' })

      expect(clickSpy).toHaveBeenCalled()
    })

    it('triggers file input on Space key', async () => {
      render(BaseFileInput)

      const dropZone = document.querySelector('[role="button"]')!
      const input = document.querySelector('input[type="file"]')!
      const clickSpy = vi.spyOn(input as HTMLInputElement, 'click')

      await fireEvent.keyDown(dropZone, { key: ' ' })

      expect(clickSpy).toHaveBeenCalled()
    })

    it('is focusable', () => {
      render(BaseFileInput)

      const dropZone = document.querySelector('[role="button"]')
      expect(dropZone).toHaveAttribute('tabindex', '0')
    })
  })

  describe('drag and drop visual feedback', () => {
    it('adds dragging class on dragover', async () => {
      render(BaseFileInput)

      const dropZone = document.querySelector('[role="button"]')!
      await fireEvent.dragOver(dropZone)

      expect(dropZone).toHaveClass('base-file-input-drop-zone-dragging')
    })

    it('removes dragging class on dragleave', async () => {
      render(BaseFileInput)

      const dropZone = document.querySelector('[role="button"]')!
      await fireEvent.dragOver(dropZone)
      await fireEvent.dragLeave(dropZone)

      expect(dropZone).not.toHaveClass('base-file-input-drop-zone-dragging')
    })
  })
})
