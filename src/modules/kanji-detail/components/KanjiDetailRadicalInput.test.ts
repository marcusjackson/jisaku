import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import KanjiDetailRadicalInput from './KanjiDetailRadicalInput.vue'

import type { Component as RadicalComponent } from '@/api/component/component-types'

describe('KanjiDetailRadicalInput', () => {
  const mockComponents: RadicalComponent[] = [
    {
      id: 1,
      character: '木',
      strokeCount: 4,
      shortMeaning: null,
      searchKeywords: null,
      sourceKanjiId: null,
      description: null,
      kangxiNumber: 75,
      kangxiMeaning: 'tree',
      radicalNameJapanese: null,
      canBeRadical: true,
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z'
    },
    {
      id: 2,
      character: '水',
      strokeCount: 4,
      shortMeaning: null,
      searchKeywords: null,
      sourceKanjiId: null,
      description: null,
      kangxiNumber: 85,
      kangxiMeaning: 'water',
      radicalNameJapanese: null,
      canBeRadical: true,
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z'
    }
  ]

  it('renders combobox with label', () => {
    const wrapper = mount(KanjiDetailRadicalInput, {
      props: {
        allComponents: mockComponents,
        radicalValue: null
      }
    })

    expect(wrapper.text()).toContain('Radical')
  })

  it('displays notice when newRadicalCharacter is set', () => {
    const wrapper = mount(KanjiDetailRadicalInput, {
      props: {
        allComponents: mockComponents,
        radicalValue: null,
        newRadicalCharacter: '斤'
      }
    })

    expect(wrapper.text()).toContain('New:')
    expect(wrapper.text()).toContain('斤')
  })

  it('hides notice when newRadicalCharacter is undefined', () => {
    const wrapper = mount(KanjiDetailRadicalInput, {
      props: {
        allComponents: mockComponents,
        radicalValue: null,
        newRadicalCharacter: undefined
      }
    })

    expect(wrapper.text()).not.toContain('New:')
  })
})
