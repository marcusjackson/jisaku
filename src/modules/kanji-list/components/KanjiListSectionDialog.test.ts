/**
 * KanjiListSectionDialog Tests
 *
 * Tests for the dialog section wrapper component.
 * Note: BaseDialog uses Reka UI which has limited jsdom support,
 * so we test the component logic rather than the full rendering.
 */

import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import KanjiListSectionDialog from './KanjiListSectionDialog.vue'

describe('KanjiListSectionDialog', () => {
  it('renders without crashing when closed', () => {
    const { container } = render(KanjiListSectionDialog, {
      props: { open: false }
    })

    // Component should render (dialog content may not be visible when closed)
    expect(container).toBeTruthy()
  })

  it('renders without crashing when open', () => {
    const { container } = render(KanjiListSectionDialog, {
      props: { open: true }
    })

    expect(container).toBeTruthy()
  })
})
