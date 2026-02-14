/**
 * ComponentListFilterKeywords Tests
 */

import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import ComponentListFilterKeywords from './ComponentListFilterKeywords.vue'

describe('ComponentListFilterKeywords', () => {
  it('renders keywords input', () => {
    render(ComponentListFilterKeywords, {
      props: { modelValue: '' }
    })

    expect(
      screen.getByRole('textbox', { name: /display \+ keywords/i })
    ).toBeInTheDocument()
  })

  it('displays current value', () => {
    render(ComponentListFilterKeywords, {
      props: { modelValue: 'person' }
    })

    expect(
      screen.getByRole('textbox', { name: /display \+ keywords/i })
    ).toHaveValue('person')
  })
})
