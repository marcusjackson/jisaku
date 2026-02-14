/**
 * VocabListFilterCommon Tests
 */

import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import VocabListFilterCommon from './VocabListFilterCommon.vue'

describe('VocabListFilterCommon', () => {
  it('renders switch', () => {
    render(VocabListFilterCommon, {
      props: { modelValue: false }
    })

    expect(screen.getByRole('switch')).toBeInTheDocument()
  })

  it('shows unchecked when false', () => {
    render(VocabListFilterCommon, {
      props: { modelValue: false }
    })

    expect(screen.getByRole('switch')).not.toBeChecked()
  })

  it('shows checked when true', () => {
    render(VocabListFilterCommon, {
      props: { modelValue: true }
    })

    expect(screen.getByRole('switch')).toBeChecked()
  })
})
