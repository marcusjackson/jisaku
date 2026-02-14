/**
 * Tests for ComponentDetailDescription component
 */

import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import ComponentDetailDescription from './ComponentDetailDescription.vue'

describe('ComponentDetailDescription', () => {
  it('renders with null description', () => {
    render(ComponentDetailDescription, {
      props: {
        description: null
      }
    })

    // BaseInlineTextarea renders as button initially with placeholder text
    expect(
      screen.getByText(
        /Add a description of this component's semantic meaning/i
      )
    ).toBeInTheDocument()
  })

  it('renders with existing description', () => {
    render(ComponentDetailDescription, {
      props: {
        description: 'This component represents the sun radical'
      }
    })

    expect(
      screen.getByText('This component represents the sun radical')
    ).toBeInTheDocument()
  })

  it('emits update event when description changes', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()

    render(ComponentDetailDescription, {
      props: {
        description: '',
        onUpdate
      }
    })

    // Click to enter edit mode
    const displayButton = screen.getByRole('button')
    await user.click(displayButton)

    // Now textarea should be available
    const textarea = screen.getByRole('textbox')
    await user.clear(textarea)
    await user.type(textarea, 'New description')

    // Click Save button
    const saveButton = screen.getByRole('button', { name: /save/i })
    await user.click(saveButton)

    // Verify the update handler was called
    expect(onUpdate).toHaveBeenCalledWith('New description')
  })

  it('emits null when description is cleared', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()

    render(ComponentDetailDescription, {
      props: {
        description: 'Old description',
        onUpdate
      }
    })

    // Click to enter edit mode
    const displayButton = screen.getByRole('button')
    await user.click(displayButton)

    const textarea = screen.getByRole('textbox')
    await user.clear(textarea)

    // Click Save button
    const saveButton = screen.getByRole('button', { name: /save/i })
    await user.click(saveButton)

    // Should emit null for empty string
    expect(onUpdate).toHaveBeenCalledWith(null)
  })

  it('shows placeholder text in display mode', () => {
    render(ComponentDetailDescription, {
      props: {
        description: null
      }
    })

    expect(
      screen.getByText(
        /Add a description of this component's semantic meaning/i
      )
    ).toBeInTheDocument()
  })
})
