/**
 * KanjiListFilterClassifications Tests
 *
 * Tests for classification type multi-select filter component.
 */

import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import KanjiListFilterClassifications from './KanjiListFilterClassifications.vue'

import type { ClassificationType } from '@/api/classification'

const mockClassificationTypes: ClassificationType[] = [
  {
    id: 1,
    typeName: 'pictograph',
    nameJapanese: '象形文字',
    nameEnglish: null,
    description: null,
    descriptionShort: null,
    displayOrder: 1
  },
  {
    id: 2,
    typeName: 'ideograph',
    nameJapanese: '指事文字',
    nameEnglish: null,
    description: null,
    descriptionShort: null,
    displayOrder: 2
  }
]

describe('KanjiListFilterClassifications', () => {
  it('renders with label', () => {
    render(KanjiListFilterClassifications, {
      props: {
        modelValue: [],
        classificationTypes: mockClassificationTypes
      }
    })

    expect(screen.getByText(/classification/i)).toBeInTheDocument()
  })

  it('shows combobox input', () => {
    render(KanjiListFilterClassifications, {
      props: {
        modelValue: [],
        classificationTypes: mockClassificationTypes
      }
    })

    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('renders with selected values', () => {
    render(KanjiListFilterClassifications, {
      props: {
        modelValue: [1],
        classificationTypes: mockClassificationTypes
      }
    })

    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })
})
