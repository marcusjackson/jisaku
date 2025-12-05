/**
 * Tests for BaseTextarea component
 */

import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import BaseTextarea from './BaseTextarea.vue'

describe('BaseTextarea', () => {
  it('renders with label', () => {
    render(BaseTextarea, {
      props: { label: 'Notes' }
    })

    expect(screen.getByLabelText('Notes')).toBeInTheDocument()
  })

  it('renders without label', () => {
    render(BaseTextarea, {
      props: { placeholder: 'Enter notes...' }
    })

    expect(screen.getByPlaceholderText('Enter notes...')).toBeInTheDocument()
  })

  it('displays required indicator', () => {
    render(BaseTextarea, {
      props: { label: 'Notes', required: true }
    })

    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('renders error message', () => {
    render(BaseTextarea, {
      props: { error: 'Notes are required', label: 'Notes' }
    })

    expect(screen.getByText('Notes are required')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveAttribute(
      'aria-describedby',
      expect.stringContaining('error')
    )
  })

  it('disables textarea when disabled prop is true', () => {
    render(BaseTextarea, {
      props: { disabled: true, label: 'Notes' }
    })

    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  it('updates model value on input', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()

    render(BaseTextarea, {
      props: {
        label: 'Notes',
        modelValue: '',
        'onUpdate:modelValue': onUpdate
      }
    })

    await user.type(screen.getByRole('textbox'), 'Test note')
    expect(onUpdate).toHaveBeenCalled()
  })

  it('renders with custom rows', () => {
    render(BaseTextarea, {
      props: { label: 'Notes', rows: 8 }
    })

    expect(screen.getByRole('textbox')).toHaveAttribute('rows', '8')
  })

  it('applies error styling when error is present', () => {
    render(BaseTextarea, {
      props: { error: 'Error message', label: 'Notes' }
    })

    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
  })

  it('has default rows of 4', () => {
    render(BaseTextarea, {
      props: { label: 'Notes' }
    })

    expect(screen.getByRole('textbox')).toHaveAttribute('rows', '4')
  })
})
