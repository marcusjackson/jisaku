/**
 * VocabListFilterSearch Tests
 */

import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import VocabListFilterSearch from './VocabListFilterSearch.vue'

describe('VocabListFilterSearch', () => {
  it('renders search input', () => {
    render(VocabListFilterSearch, {
      props: { modelValue: '' }
    })

    expect(
      screen.getByRole('textbox', { name: /display.*keywords/i })
    ).toBeInTheDocument()
  })

  it('displays current value', () => {
    render(VocabListFilterSearch, {
      props: { modelValue: '日本' }
    })

    expect(
      screen.getByRole('textbox', { name: /display.*keywords/i })
    ).toHaveValue('日本')
  })
})
