/**
 * VocabDetailSectionBasicInfo Tests
 *
 * Tests for the basic information section component.
 *
 * @module modules/vocab-detail
 */

import { createTestVocabulary } from '@test/helpers/vocabulary-test-helpers'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import VocabDetailSectionBasicInfo from './VocabDetailSectionBasicInfo.vue'

// Stub child dialog
vi.mock('./VocabDetailDialogBasicInfo.vue', () => ({
  default: {
    name: 'VocabDetailDialogBasicInfo',
    template: '<div data-testid="dialog-stub" v-if="open">Dialog</div>',
    props: ['open', 'vocab'],
    emits: ['update:open', 'save']
  }
}))

function createWrapper(vocabOverrides = {}) {
  const vocab = createTestVocabulary({
    jlptLevel: 'N3',
    isCommon: true,
    description: 'A multi-line\ndescription',
    ...vocabOverrides
  })
  return mount(VocabDetailSectionBasicInfo, {
    props: { vocab },
    global: {
      stubs: {
        SharedSection: {
          name: 'SharedSection',
          template: `<div :data-testid="testId">
            <slot name="actions" />
            <slot />
          </div>`,
          props: ['title', 'testId']
        },
        BaseButton: {
          name: 'BaseButton',
          template:
            '<button v-bind="$attrs" @click="$emit(\'click\')"><slot /></button>',
          props: ['size', 'variant']
        }
      }
    }
  })
}

describe('VocabDetailSectionBasicInfo', () => {
  describe('display values', () => {
    it('displays JLPT level label for N3', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('[data-testid="basic-info-jlpt"]').text()).toBe('N3')
    })

    it('displays JLPT level label for N5', () => {
      const wrapper = createWrapper({ jlptLevel: 'N5' })
      expect(wrapper.find('[data-testid="basic-info-jlpt"]').text()).toBe('N5')
    })

    it('displays Non-JLPT for non-jlpt level', () => {
      const wrapper = createWrapper({ jlptLevel: 'non-jlpt' })
      expect(wrapper.find('[data-testid="basic-info-jlpt"]').text()).toBe(
        'Non-JLPT'
      )
    })

    it('displays dash when JLPT level is null', () => {
      const wrapper = createWrapper({ jlptLevel: null })
      expect(wrapper.find('[data-testid="basic-info-jlpt"]').text()).toBe('—')
    })

    it('displays Yes for isCommon true', () => {
      const wrapper = createWrapper({ isCommon: true })
      expect(wrapper.find('[data-testid="basic-info-common"]').text()).toBe(
        'Yes'
      )
    })

    it('displays No for isCommon false', () => {
      const wrapper = createWrapper({ isCommon: false })
      expect(wrapper.find('[data-testid="basic-info-common"]').text()).toBe(
        'No'
      )
    })

    it('displays description text', () => {
      const wrapper = createWrapper()
      expect(
        wrapper.find('[data-testid="basic-info-description"]').text()
      ).toContain('A multi-line')
    })

    it('displays dash when description is null', () => {
      const wrapper = createWrapper({ description: null })
      expect(
        wrapper.find('[data-testid="basic-info-description"]').text()
      ).toBe('—')
    })
  })

  describe('edit button', () => {
    it('renders edit button with correct testid', () => {
      const wrapper = createWrapper()
      expect(
        wrapper.find('[data-testid="basic-info-edit-button"]').exists()
      ).toBe(true)
    })

    it('opens dialog when edit button clicked', async () => {
      const wrapper = createWrapper()
      await wrapper
        .find('[data-testid="basic-info-edit-button"]')
        .trigger('click')
      const dialog = wrapper.findComponent({
        name: 'VocabDetailDialogBasicInfo'
      })
      expect(dialog.props('open')).toBe(true)
    })
  })

  describe('events', () => {
    it('emits save event from dialog', async () => {
      const wrapper = createWrapper()

      // Open dialog
      await wrapper
        .find('[data-testid="basic-info-edit-button"]')
        .trigger('click')

      const dialog = wrapper.findComponent({
        name: 'VocabDetailDialogBasicInfo'
      })
      const saveData = {
        jlptLevel: 'N2' as const,
        isCommon: false,
        description: 'Updated'
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      await dialog.vm.$emit('save', saveData)

      expect(wrapper.emitted('save')).toBeTruthy()
      expect(wrapper.emitted('save')?.[0]).toEqual([saveData])
    })
  })
})
