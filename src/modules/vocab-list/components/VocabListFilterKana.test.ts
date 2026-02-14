/**
 * VocabListFilterKana Tests
 */

import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import VocabListFilterKana from './VocabListFilterKana.vue'

describe('VocabListFilterKana', () => {
  it('renders kana input', () => {
    render(VocabListFilterKana, {
      props: { modelValue: '' }
    })

    expect(screen.getByRole('textbox', { name: /kana/i })).toBeInTheDocument()
  })

  it('displays current value', () => {
    render(VocabListFilterKana, {
      props: { modelValue: 'にほん' }
    })

    expect(screen.getByRole('textbox', { name: /kana/i })).toHaveValue('にほん')
  })
})
