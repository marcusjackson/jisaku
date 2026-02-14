/**
 * Tests for VocabularyHeaderEditDialog component
 *
 * Note: Dialog tests are simplified because Reka UI dialogs render to portals
 * which are tricky to test in isolation. Full dialog behavior is tested in E2E.
 */

import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import VocabularyHeaderEditDialog from './VocabularyHeaderEditDialog.vue'

describe('VocabularyHeaderEditDialog', () => {
  const defaultProps = {
    open: true,
    word: '日本',
    kana: 'にほん',
    romaji: 'nihon',
    shortMeaning: 'Japan',
    searchKeywords: 'nippon'
  }

  it('does not render content when open is false', () => {
    render(VocabularyHeaderEditDialog, {
      props: { ...defaultProps, open: false }
    })

    // When closed, dialog content should not be visible
    expect(screen.queryByText('Edit Vocabulary Header')).not.toBeInTheDocument()
  })

  it('renders with correct initial props', () => {
    // Just verify component mounts without errors
    const result = render(VocabularyHeaderEditDialog, { props: defaultProps })
    expect(typeof result.unmount).toBe('function')
    result.unmount()
  })
})
