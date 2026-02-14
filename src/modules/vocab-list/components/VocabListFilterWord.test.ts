/**
 * VocabListFilterWord Tests
 */

import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import VocabListFilterWord from './VocabListFilterWord.vue'

describe('VocabListFilterWord', () => {
  it('renders word input', () => {
    render(VocabListFilterWord, {
      props: { modelValue: '' }
    })

    expect(screen.getByRole('textbox', { name: /word/i })).toBeInTheDocument()
  })

  it('displays current value', () => {
    render(VocabListFilterWord, {
      props: { modelValue: '日本' }
    })

    expect(screen.getByDisplayValue('日本')).toBeInTheDocument()
  })
})
