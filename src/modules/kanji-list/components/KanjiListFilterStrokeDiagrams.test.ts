/**
 * KanjiListFilterStrokeDiagrams Tests
 *
 * Tests for stroke diagram/animation presence filter component.
 * Note: BaseSelect uses Reka UI which has limited jsdom support,
 * so we test rendering rather than full interaction.
 */

import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import KanjiListFilterStrokeDiagrams from './KanjiListFilterStrokeDiagrams.vue'

describe('KanjiListFilterStrokeDiagrams', () => {
  it('renders both select fields', () => {
    render(KanjiListFilterStrokeDiagrams, {
      props: {
        diagramValue: null,
        animationValue: null
      }
    })

    expect(screen.getByText(/stroke order diagram/i)).toBeInTheDocument()
    expect(screen.getByText(/stroke order animation/i)).toBeInTheDocument()
  })

  it('shows both comboboxes', () => {
    render(KanjiListFilterStrokeDiagrams, {
      props: {
        diagramValue: null,
        animationValue: null
      }
    })

    const selects = screen.getAllByRole('combobox')
    expect(selects).toHaveLength(2)
  })

  it('renders with selected values', () => {
    render(KanjiListFilterStrokeDiagrams, {
      props: {
        diagramValue: 'has',
        animationValue: 'missing'
      }
    })

    // Component should render with current values
    expect(screen.getAllByRole('combobox')).toHaveLength(2)
  })
})
