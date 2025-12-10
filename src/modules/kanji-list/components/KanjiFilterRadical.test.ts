/**
 * KanjiFilterRadical tests
 *
 * Tests the radical filter dropdown which uses Component type
 * with canBeRadical=true instead of the old Radical type.
 */

import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import KanjiFilterRadical from './KanjiFilterRadical.vue'

describe('KanjiFilterRadical', () => {
  it('renders with label', () => {
    render(KanjiFilterRadical, {
      props: {
        modelValue: null,
        radicals: []
      }
    })

    expect(screen.getByText('Radical')).toBeInTheDocument()
  })

  it('renders combobox', () => {
    render(KanjiFilterRadical, {
      props: {
        modelValue: null,
        radicals: []
      }
    })

    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('shows placeholder when no selection', () => {
    render(KanjiFilterRadical, {
      props: {
        modelValue: null,
        radicals: []
      }
    })

    expect(screen.getByText('All radicals')).toBeInTheDocument()
  })

  it('handles empty radicals array', () => {
    render(KanjiFilterRadical, {
      props: {
        modelValue: null,
        radicals: []
      }
    })

    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })
})
