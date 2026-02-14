/**
 * Kanji Detail Types Tests
 *
 * Type assertion tests to verify that types are exported correctly.
 */

import { describe, expect, it } from 'vitest'

import type {
  ActionsProps,
  HeadlineProps,
  HeadlineSaveData,
  QuickCreateVocabularyData,
  VocabularyListItem
} from './kanji-detail-types'

describe('kanji-detail-types', () => {
  it('exports HeadlineProps type', () => {
    const props: HeadlineProps = {
      kanji: {
        id: 1,
        character: '日',
        shortMeaning: 'sun',
        searchKeywords: null,
        radicalId: null,
        strokeCount: 4,
        jlptLevel: 'N5',
        joyoLevel: 'elementary1',
        kanjiKenteiLevel: '10',
        strokeDiagramImage: null,
        strokeGifImage: null,
        notesEtymology: null,
        notesSemantic: null,
        notesEducationMnemonics: null,
        notesPersonal: null,
        identifier: null,
        radicalStrokeCount: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      radical: null
    }
    expect(props.kanji.character).toBe('日')
  })

  it('exports HeadlineSaveData type', () => {
    const data: HeadlineSaveData = {
      character: '日',
      shortMeaning: 'sun, day',
      searchKeywords: 'hi, nichi'
    }
    expect(data.character).toBe('日')
  })

  it('exports ActionsProps type', () => {
    const props: ActionsProps = {
      destructiveMode: false,
      isDeleting: false
    }
    expect(props.destructiveMode).toBe(false)
  })

  it('exports QuickCreateVocabularyData type', () => {
    const data: QuickCreateVocabularyData = {
      word: '明日',
      kana: 'あした',
      shortMeaning: 'tomorrow'
    }
    expect(data.word).toBe('明日')
    expect(data.kana).toBe('あした')
  })

  it('exports VocabularyListItem type', () => {
    const item: VocabularyListItem = {
      linkId: 1,
      vocabularyId: 1,
      word: '明日',
      kana: 'あした',
      shortMeaning: 'tomorrow'
    }
    expect(item.linkId).toBe(1)
    expect(item.vocabularyId).toBe(1)
    expect(item.word).toBe('明日')
  })
})
