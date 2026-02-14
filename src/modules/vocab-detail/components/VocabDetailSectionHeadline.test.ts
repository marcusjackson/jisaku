/**
 * VocabDetailSectionHeadline Tests
 */

import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import VocabDetailSectionHeadline from './VocabDetailSectionHeadline.vue'

const mockVocab = {
  id: 1,
  word: '日本語',
  kana: 'にほんご',
  shortMeaning: 'Japanese language',
  searchKeywords: 'language nihongo',
  jlptLevel: 'N5' as const,
  isCommon: true,
  description: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

describe('VocabDetailSectionHeadline', () => {
  it('displays word', () => {
    const wrapper = mount(VocabDetailSectionHeadline, {
      props: { vocab: mockVocab },
      global: {
        stubs: {
          VocabDetailDialogHeadline: true,
          SharedBackButton: true,
          SharedSearchKeywordsIndicator: true
        }
      }
    })

    expect(wrapper.text()).toContain('日本語')
  })

  it('displays kana', () => {
    const wrapper = mount(VocabDetailSectionHeadline, {
      props: { vocab: mockVocab },
      global: {
        stubs: {
          VocabDetailDialogHeadline: true,
          SharedBackButton: true,
          SharedSearchKeywordsIndicator: true
        }
      }
    })

    expect(wrapper.text()).toContain('にほんご')
  })

  it('displays short meaning when present', () => {
    const wrapper = mount(VocabDetailSectionHeadline, {
      props: { vocab: mockVocab },
      global: {
        stubs: {
          VocabDetailDialogHeadline: true,
          SharedBackButton: true,
          SharedSearchKeywordsIndicator: true
        }
      }
    })

    expect(wrapper.text()).toContain('Japanese language')
  })

  it('opens edit dialog when edit button clicked', async () => {
    const wrapper = mount(VocabDetailSectionHeadline, {
      props: { vocab: mockVocab },
      global: {
        stubs: {
          VocabDetailDialogHeadline: true,
          SharedBackButton: true,
          SharedSearchKeywordsIndicator: true
        }
      }
    })

    const editButton = wrapper.find('[data-testid="headline-edit-button"]')
    await editButton.trigger('click')

    const dialog = wrapper.findComponent({ name: 'VocabDetailDialogHeadline' })
    expect(dialog.props('open')).toBe(true)
  })

  it('emits save event when dialog saves', async () => {
    const wrapper = mount(VocabDetailSectionHeadline, {
      props: { vocab: mockVocab },
      global: {
        stubs: {
          VocabDetailDialogHeadline: true,
          SharedBackButton: true,
          SharedSearchKeywordsIndicator: true
        }
      }
    })

    const dialog = wrapper.findComponent({ name: 'VocabDetailDialogHeadline' })
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await dialog.vm.$emit('save', {
      word: '日本',
      kana: 'にほん',
      shortMeaning: 'Japan',
      searchKeywords: null
    })

    expect(wrapper.emitted('save')).toBeTruthy()
    expect(wrapper.emitted('save')?.[0]).toEqual([
      {
        word: '日本',
        kana: 'にほん',
        shortMeaning: 'Japan',
        searchKeywords: null
      }
    ])
  })
})
