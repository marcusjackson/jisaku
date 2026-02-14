/**
 * KanjiListFiltersContent Tests
 *
 * Tests for the filter content container component.
 */

import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import KanjiListFiltersContent from './KanjiListFiltersContent.vue'

describe('KanjiListFiltersContent', () => {
  const defaultProps = {
    filters: {},
    characterSearch: '',
    keywordsSearch: '',
    meaningsSearch: '',
    onYomiSearch: '',
    kunYomiSearch: '',
    components: [],
    radicals: [],
    classificationTypes: []
  }

  it('renders all filter inputs', () => {
    render(KanjiListFiltersContent, {
      props: defaultProps
    })

    // Check for filter labels
    expect(screen.getByLabelText(/character/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/keywords/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/on-yomi/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/kun-yomi/i)).toBeInTheDocument()
  })

  it('renders level filter sections', () => {
    render(KanjiListFiltersContent, {
      props: defaultProps
    })

    expect(screen.getByText(/jlpt level/i)).toBeInTheDocument()
    expect(screen.getByText(/joyo level/i)).toBeInTheDocument()
    expect(screen.getByText(/kanji kentei level/i)).toBeInTheDocument()
  })

  it('renders stroke filter section', () => {
    render(KanjiListFiltersContent, {
      props: defaultProps
    })

    expect(screen.getByText(/strokes/i)).toBeInTheDocument()
  })
})
