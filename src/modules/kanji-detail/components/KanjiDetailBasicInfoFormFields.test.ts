/**
 * Tests for KanjiDetailBasicInfoFormFields component.
 *
 * @module modules/kanji-detail
 */

import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import KanjiDetailBasicInfoFormFields from './KanjiDetailBasicInfoFormFields.vue'

import type { Component as RadicalComponent } from '@/api/component/component-types'

function mockComponent(
  overrides: Partial<RadicalComponent> = {}
): RadicalComponent {
  return {
    id: 1,
    character: '氵',
    strokeCount: null,
    shortMeaning: null,
    searchKeywords: null,
    sourceKanjiId: null,
    description: null,
    canBeRadical: true,
    kangxiNumber: 85,
    kangxiMeaning: 'water',
    radicalNameJapanese: null,
    createdAt: '',
    updatedAt: '',
    ...overrides
  }
}

const defaultProps = {
  allComponents: [mockComponent()],
  strokeCount: 4,
  jlptLevel: '__none__',
  joyoLevel: '__none__',
  kenteiLevel: '__none__',
  radicalValue: null
}

describe('KanjiDetailBasicInfoFormFields', () => {
  describe('rendering', () => {
    it('renders stroke count input', () => {
      render(KanjiDetailBasicInfoFormFields, { props: defaultProps })
      expect(screen.getByLabelText(/stroke count/i)).toBeInTheDocument()
    })

    it('renders JLPT level select', () => {
      render(KanjiDetailBasicInfoFormFields, { props: defaultProps })
      expect(screen.getByLabelText(/jlpt level/i)).toBeInTheDocument()
    })

    it('renders Jōyō grade select', () => {
      render(KanjiDetailBasicInfoFormFields, { props: defaultProps })
      expect(screen.getByLabelText(/jōyō grade/i)).toBeInTheDocument()
    })

    it('renders Kentei level select', () => {
      render(KanjiDetailBasicInfoFormFields, { props: defaultProps })
      expect(screen.getByLabelText(/kentei level/i)).toBeInTheDocument()
    })

    it('renders radical combobox', () => {
      render(KanjiDetailBasicInfoFormFields, { props: defaultProps })
      expect(screen.getByLabelText(/radical/i)).toBeInTheDocument()
    })
  })

  describe('stroke count error', () => {
    it('displays stroke count error when provided', () => {
      render(KanjiDetailBasicInfoFormFields, {
        props: { ...defaultProps, strokeCountError: 'Must be 1-64' }
      })
      expect(screen.getByText('Must be 1-64')).toBeInTheDocument()
    })
  })
})
