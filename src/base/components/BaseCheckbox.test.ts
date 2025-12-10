/**
 * Tests for BaseCheckbox component
 */

import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import BaseCheckbox from './BaseCheckbox.vue'

describe('BaseCheckbox', () => {
  it('renders with label text', () => {
    render(BaseCheckbox, {
      props: {
        label: 'Accept terms',
        modelValue: false
      }
    })

    expect(screen.getByText('Accept terms')).toBeInTheDocument()
  })

  it('renders with slot content', () => {
    render(BaseCheckbox, {
      props: { modelValue: false },
      slots: {
        default: '<span>Custom label</span>'
      }
    })

    expect(screen.getByText('Custom label')).toBeInTheDocument()
  })

  it('renders checked state correctly', () => {
    render(BaseCheckbox, {
      props: {
        label: 'Checked box',
        modelValue: true
      }
    })

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeChecked()
  })

  it('renders unchecked state correctly', () => {
    render(BaseCheckbox, {
      props: {
        label: 'Unchecked box',
        modelValue: false
      }
    })

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).not.toBeChecked()
  })

  it('renders indeterminate state correctly', () => {
    render(BaseCheckbox, {
      props: {
        label: 'Indeterminate box',
        modelValue: 'indeterminate'
      }
    })

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveAttribute('data-state', 'indeterminate')
  })

  it('emits update:modelValue when clicked', async () => {
    const user = userEvent.setup()
    const wrapper = render(BaseCheckbox, {
      props: {
        label: 'Click me',
        modelValue: false
      }
    })

    const checkbox = screen.getByRole('checkbox')
    await user.click(checkbox)

    const events = wrapper.emitted('update:modelValue')
    expect(events).toBeDefined()
    expect(events).toHaveLength(1)
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (events) {
      expect(events[0]).toEqual([true])
    }
  })

  it('toggles checked state when clicked multiple times', async () => {
    const user = userEvent.setup()
    const wrapper = render(BaseCheckbox, {
      props: {
        label: 'Toggle me',
        modelValue: false
      }
    })

    const checkbox = screen.getByRole('checkbox')

    await user.click(checkbox)
    let events = wrapper.emitted('update:modelValue')
    expect(events).toBeDefined()
    expect(events[0]).toEqual([true])

    await wrapper.rerender({ modelValue: true })
    await user.click(checkbox)
    events = wrapper.emitted('update:modelValue')
    expect(events).toBeDefined()
    expect(events[1]).toEqual([false])
  })

  it('toggles from indeterminate to checked when clicked', async () => {
    const user = userEvent.setup()
    const wrapper = render(BaseCheckbox, {
      props: {
        label: 'Toggle from indeterminate',
        modelValue: 'indeterminate'
      }
    })

    const checkbox = screen.getByRole('checkbox')
    await user.click(checkbox)

    const events = wrapper.emitted('update:modelValue')
    expect(events).toBeDefined()
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (events) {
      expect(events[0]).toEqual([true])
    }
  })

  it('can be disabled', async () => {
    const user = userEvent.setup()
    const wrapper = render(BaseCheckbox, {
      props: {
        disabled: true,
        label: 'Disabled checkbox',
        modelValue: false
      }
    })

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeDisabled()

    await user.click(checkbox)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('displays error message when error prop is provided', () => {
    render(BaseCheckbox, {
      props: {
        error: 'This field is required',
        label: 'Required checkbox',
        modelValue: false
      }
    })

    expect(screen.getByText('This field is required')).toBeInTheDocument()
  })

  it('does not display error message when error prop is empty', () => {
    render(BaseCheckbox, {
      props: {
        error: '',
        label: 'Optional checkbox',
        modelValue: false
      }
    })

    expect(screen.queryByText('This field is required')).not.toBeInTheDocument()
  })

  it('is keyboard accessible', async () => {
    const user = userEvent.setup()
    const wrapper = render(BaseCheckbox, {
      props: {
        label: 'Keyboard test',
        modelValue: false
      }
    })

    const checkbox = screen.getByRole('checkbox')
    checkbox.focus()
    expect(checkbox).toHaveFocus()

    await user.keyboard(' ')
    const events = wrapper.emitted('update:modelValue')
    expect(events).toBeDefined()
    expect(events[0]).toEqual([true])
  })
})
