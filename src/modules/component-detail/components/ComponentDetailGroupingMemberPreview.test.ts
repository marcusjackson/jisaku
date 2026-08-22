/**
 * Tests for ComponentDetailGroupingMemberPreview component.
 *
 * Covers expand/collapse pagination of kanji members in a grouping.
 */

import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import ComponentDetailGroupingMemberPreview from './ComponentDetailGroupingMemberPreview.vue'

import type { OccurrenceWithKanji } from '@/api/component'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeOccurrence(
  id: number,
  character: string,
  shortMeaning: string | null = null
): OccurrenceWithKanji {
  return {
    id,
    kanjiId: id,
    componentId: 1,
    componentFormId: null,
    positionTypeId: null,
    isRadical: false,
    analysisNotes: null,
    displayOrder: id,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    kanji: { id, character, shortMeaning, strokeCount: null },
    position: null
  }
}

/** Build N occurrences with sequential characters 一, 二, 三, … */
const CHARS = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十']
function makeOccurrences(count: number): OccurrenceWithKanji[] {
  return Array.from({ length: count }, (_, i) =>
    makeOccurrence(i + 1, CHARS[i] ?? String(i))
  )
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ComponentDetailGroupingMemberPreview', () => {
  describe('empty list', () => {
    it('renders nothing when occurrences is empty', () => {
      const { container } = render(ComponentDetailGroupingMemberPreview, {
        props: { occurrences: [] }
      })

      // v-if leaves a comment node; verify no visible member preview is rendered
      expect(container.querySelector('.member-preview')).toBeNull()
    })
  })

  describe('within limit (≤ 5 items)', () => {
    it('renders all occurrences when count is at the limit', () => {
      const occurrences = makeOccurrences(5)
      render(ComponentDetailGroupingMemberPreview, { props: { occurrences } })

      expect(screen.getByText('一')).toBeInTheDocument()
      expect(screen.getByText('五')).toBeInTheDocument()
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('renders single occurrence without toggle button', () => {
      render(ComponentDetailGroupingMemberPreview, {
        props: { occurrences: [makeOccurrence(1, '字')] }
      })

      expect(screen.getByText('字')).toBeInTheDocument()
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })
  })

  describe('exceeds limit (> 5 items)', () => {
    it('shows first 5 items and a "+N more" button', () => {
      const occurrences = makeOccurrences(8)
      render(ComponentDetailGroupingMemberPreview, { props: { occurrences } })

      expect(screen.getByText('一')).toBeInTheDocument()
      expect(screen.getByText('五')).toBeInTheDocument()
      expect(screen.queryByText('六')).not.toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: '+3 more' })
      ).toBeInTheDocument()
    })

    it('expands to show all items when toggle clicked', async () => {
      const user = userEvent.setup()
      const occurrences = makeOccurrences(7)
      render(ComponentDetailGroupingMemberPreview, { props: { occurrences } })

      await user.click(screen.getByRole('button', { name: '+2 more' }))

      expect(screen.getByText('六')).toBeInTheDocument()
      expect(screen.getByText('七')).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Show less' })
      ).toBeInTheDocument()
    })

    it('collapses back when "Show less" is clicked', async () => {
      const user = userEvent.setup()
      const occurrences = makeOccurrences(7)
      render(ComponentDetailGroupingMemberPreview, { props: { occurrences } })

      await user.click(screen.getByRole('button', { name: '+2 more' }))
      await user.click(screen.getByRole('button', { name: 'Show less' }))

      expect(screen.queryByText('六')).not.toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: '+2 more' })
      ).toBeInTheDocument()
    })
  })

  describe('title tooltip', () => {
    it('uses shortMeaning as title when available', () => {
      const occ = makeOccurrence(1, '字', 'character')
      render(ComponentDetailGroupingMemberPreview, {
        props: { occurrences: [occ] }
      })

      const span = screen.getByTitle('character')
      expect(span).toHaveTextContent('字')
    })

    it('falls back to character as title when shortMeaning is null', () => {
      const occ = makeOccurrence(1, '字', null)
      render(ComponentDetailGroupingMemberPreview, {
        props: { occurrences: [occ] }
      })

      const span = screen.getByTitle('字')
      expect(span).toHaveTextContent('字')
    })
  })
})
