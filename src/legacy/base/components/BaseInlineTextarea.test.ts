/**
 * BaseInlineTextarea Tests
 */

import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import BaseInlineTextarea from './BaseInlineTextarea.vue'

describe('BaseInlineTextarea', () => {
  it('renders in display mode by default', () => {
    render(BaseInlineTextarea, {
      props: { modelValue: 'Test content' }
    })

    expect(screen.getByText('Test content')).toBeInTheDocument()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })

  it('shows placeholder when no content', () => {
    render(BaseInlineTextarea, {
      props: {
        modelValue: '',
        placeholder: 'Click to add notes...'
      }
    })

    expect(screen.getByText('Click to add notes...')).toBeInTheDocument()
  })

  it('switches to edit mode when clicked', async () => {
    const user = userEvent.setup()
    render(BaseInlineTextarea, {
      props: { modelValue: 'Test content' }
    })

    const displayButton = screen.getByRole('button', { name: 'Test content' })
    await user.click(displayButton)

    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('emits updated value when saved', async () => {
    const user = userEvent.setup()
    const wrapper = render(BaseInlineTextarea, {
      props: { modelValue: 'Original content' }
    })

    // Enter edit mode
    const displayButton = screen.getByRole('button', {
      name: 'Original content'
    })
    await user.click(displayButton)

    // Edit text
    const textarea = screen.getByRole('textbox')
    await user.clear(textarea)
    await user.type(textarea, 'Updated content')

    // Save
    const saveButton = screen.getByRole('button', { name: 'Save' })
    await user.click(saveButton)

    const updateEvents = wrapper.emitted('update:modelValue')
    expect(updateEvents).toBeDefined()
    expect(updateEvents).toHaveLength(1)
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (updateEvents) {
      expect(updateEvents[0]).toEqual(['Updated content'])
    }
  })

  it('reverts to original value when cancelled', async () => {
    const user = userEvent.setup()
    render(BaseInlineTextarea, {
      props: { modelValue: 'Original content' }
    })

    // Enter edit mode
    const displayButton = screen.getByRole('button', {
      name: 'Original content'
    })
    await user.click(displayButton)

    // Edit text
    const textarea = screen.getByRole('textbox')
    await user.clear(textarea)
    await user.type(textarea, 'Changed content')

    // Cancel
    const cancelButton = screen.getByRole('button', { name: 'Cancel' })
    await user.click(cancelButton)

    // Should show original content again
    expect(screen.getByText('Original content')).toBeInTheDocument()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })

  it('exits edit mode after saving', async () => {
    const user = userEvent.setup()
    render(BaseInlineTextarea, {
      props: { modelValue: 'Test content' }
    })

    // Enter edit mode
    await user.click(screen.getByRole('button', { name: 'Test content' }))

    // Save
    await user.click(screen.getByRole('button', { name: 'Save' }))

    // Should be back in display mode
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })

  it('exits edit mode after cancelling', async () => {
    const user = userEvent.setup()
    render(BaseInlineTextarea, {
      props: { modelValue: 'Test content' }
    })

    // Enter edit mode
    await user.click(screen.getByRole('button', { name: 'Test content' }))

    // Cancel
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    // Should be back in display mode
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })

  it('does not enter edit mode when disabled', async () => {
    const user = userEvent.setup()
    render(BaseInlineTextarea, {
      props: {
        disabled: true,
        modelValue: 'Test content'
      }
    })

    const displayButton = screen.getByRole('button', { name: 'Test content' })
    await user.click(displayButton)

    // Should not switch to edit mode
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })

  it('updates display when modelValue prop changes externally', async () => {
    const wrapper = render(BaseInlineTextarea, {
      props: { modelValue: 'Original' }
    })

    expect(screen.getByText('Original')).toBeInTheDocument()

    await wrapper.rerender({ modelValue: 'Updated externally' })

    expect(screen.getByText('Updated externally')).toBeInTheDocument()
  })
})
