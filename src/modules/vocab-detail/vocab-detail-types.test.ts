/**
 * Vocabulary Detail Types Tests
 *
 * Type assertion tests to verify that types are exported correctly.
 */

import { describe, expect, it } from 'vitest'

import type {
  ActionsProps,
  HeadlineProps,
  HeadlineSaveData
} from './vocab-detail-types'

describe('vocab-detail-types', () => {
  it('exports HeadlineProps type', () => {
    const props: HeadlineProps = {
      vocab: {
        id: 1,
        word: '日本語',
        kana: 'にほんご',
        shortMeaning: 'Japanese language',
        searchKeywords: null,
        jlptLevel: 'N5',
        isCommon: true,
        description: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }
    expect(props.vocab.word).toBe('日本語')
  })

  it('exports HeadlineSaveData type', () => {
    const data: HeadlineSaveData = {
      word: '日本語',
      kana: 'にほんご',
      shortMeaning: 'Japanese language',
      searchKeywords: 'nihongo'
    }
    expect(data.word).toBe('日本語')
  })

  it('exports ActionsProps type', () => {
    const props: ActionsProps = {
      destructiveMode: false,
      isDeleting: false
    }
    expect(props.destructiveMode).toBe(false)
  })
})
