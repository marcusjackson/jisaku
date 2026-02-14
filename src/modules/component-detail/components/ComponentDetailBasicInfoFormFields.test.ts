/**
 * ComponentDetailBasicInfoFormFields Tests
 *
 * This component is a presentational form fields wrapper extracted to keep
 * the dialog component under file size limits. The form fields' functionality
 * is tested through:
 *
 * 1. ComponentDetailDialogBasicInfo.test.ts - Dialog integration tests
 * 2. e2e/component-detail.test.ts - E2E tests for basic info editing
 *
 * This file provides basic rendering tests to verify the component renders.
 */

import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import ComponentDetailBasicInfoFormFields from './ComponentDetailBasicInfoFormFields.vue'

describe('ComponentDetailBasicInfoFormFields', () => {
  const defaultProps = {
    kanjiOptions: [],
    strokeCount: '',
    sourceKanjiId: '__none__',
    canBeRadical: false,
    kangxiNumber: '',
    kangxiMeaning: '',
    radicalNameJapanese: ''
  }

  it('renders stroke count input', () => {
    render(ComponentDetailBasicInfoFormFields, { props: defaultProps })
    expect(screen.getByLabelText(/stroke count/i)).toBeInTheDocument()
  })

  it('renders source kanji combobox', () => {
    render(ComponentDetailBasicInfoFormFields, { props: defaultProps })
    expect(screen.getByLabelText(/source kanji/i)).toBeInTheDocument()
  })

  it('renders can-be-radical switch', () => {
    render(ComponentDetailBasicInfoFormFields, { props: defaultProps })
    expect(screen.getByRole('switch')).toBeInTheDocument()
  })

  it('hides radical fields when canBeRadical is false', () => {
    render(ComponentDetailBasicInfoFormFields, { props: defaultProps })
    expect(screen.queryByLabelText(/kangxi number/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/kangxi meaning/i)).not.toBeInTheDocument()
    expect(
      screen.queryByLabelText(/radical name \(japanese\)/i)
    ).not.toBeInTheDocument()
  })

  it('shows radical fields when canBeRadical is true', () => {
    render(ComponentDetailBasicInfoFormFields, {
      props: { ...defaultProps, canBeRadical: true }
    })
    expect(screen.getByLabelText(/kangxi number/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/kangxi meaning/i)).toBeInTheDocument()
    expect(
      screen.getByLabelText(/radical name \(japanese\)/i)
    ).toBeInTheDocument()
  })
})
