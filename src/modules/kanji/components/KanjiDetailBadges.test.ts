/**
 * Tests for KanjiDetailBadges component
 */

import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import KanjiDetailBadges from './KanjiDetailBadges.vue'

import type { Kanji } from '@/shared/types/database-types'

function createMockKanji(overrides: Partial<Kanji> = {}): Kanji {
  return {
    character: '日',
    createdAt: new Date().toISOString(),
    id: 1,
    jlptLevel: null,
    joyoLevel: null,
    notesEtymology: null,
    notesCultural: null,
    notesPersonal: null,
    radicalId: null,
    strokeCount: 4,
    strokeDiagramImage: null,
    strokeGifImage: null,
    updatedAt: new Date().toISOString(),
    ...overrides
  }
}

describe('KanjiDetailBadges', () => {
  it('renders JLPT level badge', () => {
    const kanji = createMockKanji({ jlptLevel: 'N5' })

    render(KanjiDetailBadges, {
      props: { kanji }
    })

    expect(screen.getByText('N5')).toBeInTheDocument()
  })

  it('renders all JLPT levels correctly', () => {
    const levels: Kanji['jlptLevel'][] = ['N5', 'N4', 'N3', 'N2', 'N1']

    levels.forEach((level) => {
      const kanji = createMockKanji({ jlptLevel: level })
      const result = render(KanjiDetailBadges, {
        props: { kanji }
      })

      expect(screen.getByText(level!)).toBeInTheDocument()
      result.unmount()
    })
  })

  it('does not render JLPT badge when not set', () => {
    const kanji = createMockKanji({ jlptLevel: null })

    render(KanjiDetailBadges, {
      props: { kanji }
    })

    expect(screen.queryByText(/N[1-5]/)).not.toBeInTheDocument()
  })

  it('renders Joyo level badge with Japanese label', () => {
    const testCases: { expected: string; joyoLevel: Kanji['joyoLevel'] }[] = [
      { expected: '小1', joyoLevel: 'elementary1' },
      { expected: '小2', joyoLevel: 'elementary2' },
      { expected: '小3', joyoLevel: 'elementary3' },
      { expected: '小4', joyoLevel: 'elementary4' },
      { expected: '小5', joyoLevel: 'elementary5' },
      { expected: '小6', joyoLevel: 'elementary6' },
      { expected: '中学', joyoLevel: 'secondary' }
    ]

    testCases.forEach(({ expected, joyoLevel }) => {
      const kanji = createMockKanji({ joyoLevel })
      const result = render(KanjiDetailBadges, {
        props: { kanji }
      })

      expect(screen.getByText(expected)).toBeInTheDocument()
      result.unmount()
    })
  })

  it('does not render Joyo badge when not set', () => {
    const kanji = createMockKanji({ joyoLevel: null })

    render(KanjiDetailBadges, {
      props: { kanji }
    })

    expect(screen.queryByText(/小[1-6]/)).not.toBeInTheDocument()
    expect(screen.queryByText('中学')).not.toBeInTheDocument()
  })

  it('renders both badges when both are set', () => {
    const kanji = createMockKanji({
      jlptLevel: 'N4',
      joyoLevel: 'elementary3'
    })

    render(KanjiDetailBadges, {
      props: { kanji }
    })

    expect(screen.getByText('N4')).toBeInTheDocument()
    expect(screen.getByText('小3')).toBeInTheDocument()
  })

  it('does not render container when no badges', () => {
    const kanji = createMockKanji({
      jlptLevel: null,
      joyoLevel: null
    })

    const { container } = render(KanjiDetailBadges, {
      props: { kanji }
    })

    expect(
      container.querySelector('.kanji-detail-badges')
    ).not.toBeInTheDocument()
  })
})
