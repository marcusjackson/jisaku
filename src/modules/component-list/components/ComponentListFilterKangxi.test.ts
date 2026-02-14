/**
 * ComponentListFilterKangxi Tests
 */

import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import ComponentListFilterKangxi from './ComponentListFilterKangxi.vue'

describe('ComponentListFilterKangxi', () => {
  it('renders kangxi input', () => {
    render(ComponentListFilterKangxi, {
      props: { modelValue: '' }
    })

    expect(
      screen.getByRole('textbox', { name: /kangxi #\/meaning/i })
    ).toBeInTheDocument()
  })

  it('displays current value', () => {
    render(ComponentListFilterKangxi, {
      props: { modelValue: '85' }
    })

    expect(
      screen.getByRole('textbox', { name: /kangxi #\/meaning/i })
    ).toHaveValue('85')
  })
})
