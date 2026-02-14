/**
 * KanjiListFilterAnalysisFields Tests
 *
 * Tests for analysis field filter component with add/remove/update.
 */

import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import KanjiListFilterAnalysisFields from './KanjiListFilterAnalysisFields.vue'

describe('KanjiListFilterAnalysisFields', () => {
  it('renders label', () => {
    render(KanjiListFilterAnalysisFields, {
      props: { modelValue: [] }
    })

    expect(screen.getByText(/analysis field/i)).toBeInTheDocument()
  })

  it('shows add field select when empty', () => {
    render(KanjiListFilterAnalysisFields, {
      props: { modelValue: [] }
    })

    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('displays active filter field names', () => {
    render(KanjiListFilterAnalysisFields, {
      props: {
        modelValue: [{ field: 'notesEtymology', threshold: 'short' }]
      }
    })

    // Should show the filter with field label (語源 = etymology in Japanese)
    expect(screen.getByText('語源')).toBeInTheDocument()
  })
})
