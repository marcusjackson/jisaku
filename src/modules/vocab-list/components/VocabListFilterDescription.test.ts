/**
 * VocabListFilterDescription Tests
 */

import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import VocabListFilterDescription from './VocabListFilterDescription.vue'

describe('VocabListFilterDescription', () => {
  it('renders select', () => {
    render(VocabListFilterDescription, {
      props: { modelValue: null }
    })

    expect(
      screen.getByRole('combobox', { name: /description/i })
    ).toBeInTheDocument()
  })

  it('shows Any when no selection', () => {
    render(VocabListFilterDescription, {
      props: { modelValue: null }
    })

    expect(screen.getByText('Any')).toBeInTheDocument()
  })
})
