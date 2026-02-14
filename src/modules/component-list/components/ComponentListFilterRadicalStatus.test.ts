/**
 * ComponentListFilterRadicalStatus Tests
 */

import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import ComponentListFilterRadicalStatus from './ComponentListFilterRadicalStatus.vue'

describe('ComponentListFilterRadicalStatus', () => {
  it('renders radical label', () => {
    render(ComponentListFilterRadicalStatus, {
      props: { modelValue: undefined }
    })

    expect(screen.getByText('Radical')).toBeInTheDocument()
  })

  it('renders select dropdown', () => {
    render(ComponentListFilterRadicalStatus, {
      props: { modelValue: undefined }
    })

    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })
})
