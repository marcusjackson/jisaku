/**
 * ComponentListFilterPresence Tests
 */

import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import ComponentListFilterPresence from './ComponentListFilterPresence.vue'

describe('ComponentListFilterPresence', () => {
  it('renders with provided label', () => {
    render(ComponentListFilterPresence, {
      props: { label: 'Description', modelValue: null }
    })

    expect(screen.getByText('Description')).toBeInTheDocument()
  })

  it('renders select dropdown', () => {
    render(ComponentListFilterPresence, {
      props: { label: 'Description', modelValue: null }
    })

    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })
})
