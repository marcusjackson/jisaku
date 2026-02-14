/**
 * ComponentListFilterCharacter Tests
 */

import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import ComponentListFilterCharacter from './ComponentListFilterCharacter.vue'

describe('ComponentListFilterCharacter', () => {
  it('renders character input', () => {
    render(ComponentListFilterCharacter, {
      props: { modelValue: '' }
    })

    expect(
      screen.getByRole('textbox', { name: /character/i })
    ).toBeInTheDocument()
  })

  it('displays current value', () => {
    render(ComponentListFilterCharacter, {
      props: { modelValue: '亻' }
    })

    expect(screen.getByRole('textbox', { name: /character/i })).toHaveValue(
      '亻'
    )
  })
})
