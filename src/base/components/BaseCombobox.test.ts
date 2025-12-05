/**
 * Tests for BaseCombobox component
 */

import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import BaseCombobox from './BaseCombobox.vue'

const testOptions = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry' }
]

describe('BaseCombobox', () => {
  it('renders with label', () => {
    render(BaseCombobox, {
      props: { label: 'Fruit', options: testOptions }
    })

    expect(screen.getByText('Fruit')).toBeInTheDocument()
  })

  it('renders input with placeholder', () => {
    render(BaseCombobox, {
      props: { options: testOptions, placeholder: 'Select a fruit...' }
    })

    expect(screen.getByPlaceholderText('Select a fruit...')).toBeInTheDocument()
  })

  it('displays required indicator', () => {
    render(BaseCombobox, {
      props: { label: 'Fruit', options: testOptions, required: true }
    })

    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('renders error message', () => {
    render(BaseCombobox, {
      props: {
        error: 'Selection required',
        label: 'Fruit',
        options: testOptions
      }
    })

    expect(screen.getByText('Selection required')).toBeInTheDocument()
  })

  it('renders combobox input', () => {
    render(BaseCombobox, {
      props: { label: 'Fruit', options: testOptions }
    })

    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('applies error styling when error is present', () => {
    render(BaseCombobox, {
      props: { error: 'Error', label: 'Fruit', options: testOptions }
    })

    expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true')
  })

  it('renders default placeholder when not specified', () => {
    render(BaseCombobox, {
      props: { label: 'Fruit', options: testOptions }
    })

    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument()
  })

  it('shows dropdown toggle button', () => {
    render(BaseCombobox, {
      props: { label: 'Fruit', options: testOptions }
    })

    expect(screen.getByRole('button', { name: /toggle/i })).toBeInTheDocument()
  })

  it('opens dropdown when trigger is clicked', async () => {
    const user = userEvent.setup()
    render(BaseCombobox, {
      props: { label: 'Fruit', options: testOptions }
    })

    await user.click(screen.getByRole('button', { name: /toggle/i }))

    // Check that options are visible
    expect(screen.getByText('Apple')).toBeInTheDocument()
    expect(screen.getByText('Banana')).toBeInTheDocument()
    expect(screen.getByText('Cherry')).toBeInTheDocument()
  })

  it('filters options when typing', async () => {
    const user = userEvent.setup()
    render(BaseCombobox, {
      props: { label: 'Fruit', options: testOptions }
    })

    const input = screen.getByRole('combobox')
    await user.type(input, 'app')

    // Should show filtered results
    expect(screen.getByText('Apple')).toBeInTheDocument()
    expect(screen.queryByText('Banana')).not.toBeInTheDocument()
    expect(screen.queryByText('Cherry')).not.toBeInTheDocument()
  })

  it('shows no results message when no matches', async () => {
    const user = userEvent.setup()
    render(BaseCombobox, {
      props: { label: 'Fruit', options: testOptions }
    })

    const input = screen.getByRole('combobox')
    await user.type(input, 'xyz')

    expect(screen.getByText('No results found')).toBeInTheDocument()
  })

  it('supports numeric values', () => {
    const numericOptions = [
      { label: 'One', value: 1 },
      { label: 'Two', value: 2 },
      { label: 'Three', value: 3 }
    ]

    render(BaseCombobox, {
      props: { label: 'Number', options: numericOptions }
    })

    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })
})
