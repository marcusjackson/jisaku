/**
 * KanjiDetailSectionHeadline Tests
 *
 * Tests for the headline section component.
 */

import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import KanjiDetailSectionHeadline from './KanjiDetailSectionHeadline.vue'

import type { Component } from '@/api/component/component-types'
import type { Kanji } from '@/api/kanji/kanji-types'

// Mock vue-router
vi.mock('vue-router', () => ({
  RouterLink: {
    name: 'RouterLink',
    template: '<a><slot /></a>',
    props: ['to']
  }
}))

const mockKanji: Kanji = {
  id: 1,
  character: '日',
  shortMeaning: 'sun, day',
  searchKeywords: 'hi, nichi',
  radicalId: 1,
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
}

const mockRadical: Component = {
  id: 1,
  character: '日',
  kangxiNumber: 72,
  kangxiMeaning: 'sun',
  strokeCount: 4,
  shortMeaning: 'sun',
  searchKeywords: null,
  sourceKanjiId: null,
  description: null,
  canBeRadical: true,
  radicalNameJapanese: 'ひ',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

describe('KanjiDetailSectionHeadline', () => {
  const createWrapper = (props = {}) => {
    return mount(KanjiDetailSectionHeadline, {
      props: {
        kanji: mockKanji,
        radical: mockRadical,
        ...props
      },
      global: {
        stubs: {
          SharedBackButton: true,
          SharedSearchKeywordsIndicator: true,
          KanjiDetailDialogHeadline: true,
          BaseButton: true
        }
      }
    })
  }

  it('renders kanji character', () => {
    const wrapper = createWrapper()
    expect(wrapper.text()).toContain('日')
  })

  it('renders display text (short meaning)', () => {
    const wrapper = createWrapper()
    expect(wrapper.text()).toContain('sun, day')
  })

  it('renders radical information when provided', () => {
    const wrapper = createWrapper()
    expect(wrapper.text()).toContain('Radical:')
    expect(wrapper.text()).toContain('日')
    expect(wrapper.text()).toContain('(sun)')
  })

  it('does not render radical when null', () => {
    const wrapper = createWrapper({ radical: null })
    expect(wrapper.text()).not.toContain('Radical:')
  })

  it('renders edit button', () => {
    const wrapper = createWrapper()
    expect(wrapper.findComponent({ name: 'BaseButton' }).exists()).toBe(true)
  })

  it('renders back button', () => {
    const wrapper = createWrapper()
    expect(wrapper.findComponent({ name: 'SharedBackButton' }).exists()).toBe(
      true
    )
  })

  it('renders search keywords indicator', () => {
    const wrapper = createWrapper()
    expect(
      wrapper.findComponent({ name: 'SharedSearchKeywordsIndicator' }).exists()
    ).toBe(true)
  })
})
