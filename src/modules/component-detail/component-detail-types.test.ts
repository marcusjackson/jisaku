/**
 * Component Detail Types Tests
 *
 * Type assertion tests to verify that types are exported correctly.
 */

import { describe, expect, it } from 'vitest'

import type {
  BasicInfoSaveData,
  HeadlineProps,
  HeadlineSaveData
} from './component-detail-types'

describe('component-detail-types', () => {
  it('exports HeadlineProps type', () => {
    const props: HeadlineProps = {
      component: {
        id: 1,
        character: '氵',
        shortMeaning: 'water',
        searchKeywords: null,
        strokeCount: 3,
        sourceKanjiId: null,
        description: null,
        canBeRadical: true,
        kangxiNumber: 85,
        kangxiMeaning: 'water',
        radicalNameJapanese: 'さんずい',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }
    expect(props.component.character).toBe('氵')
  })

  it('exports HeadlineSaveData type', () => {
    const data: HeadlineSaveData = {
      character: '氵',
      shortMeaning: 'water',
      searchKeywords: 'mizu, sanzui'
    }
    expect(data.character).toBe('氵')
  })

  it('allows null values for optional fields in HeadlineSaveData', () => {
    const data: HeadlineSaveData = {
      character: '氵',
      shortMeaning: null,
      searchKeywords: null
    }
    expect(data.shortMeaning).toBeNull()
    expect(data.searchKeywords).toBeNull()
  })

  it('exports BasicInfoSaveData type', () => {
    const data: BasicInfoSaveData = {
      strokeCount: 3,
      sourceKanjiId: 1,
      canBeRadical: true,
      kangxiNumber: 85,
      kangxiMeaning: 'water',
      radicalNameJapanese: 'さんずい'
    }
    expect(data.strokeCount).toBe(3)
    expect(data.canBeRadical).toBe(true)
  })

  it('allows null values for optional fields in BasicInfoSaveData', () => {
    const data: BasicInfoSaveData = {
      strokeCount: null,
      sourceKanjiId: null,
      canBeRadical: false,
      kangxiNumber: null,
      kangxiMeaning: null,
      radicalNameJapanese: null
    }
    expect(data.strokeCount).toBeNull()
    expect(data.sourceKanjiId).toBeNull()
    expect(data.kangxiNumber).toBeNull()
    expect(data.kangxiMeaning).toBeNull()
    expect(data.radicalNameJapanese).toBeNull()
  })
})
