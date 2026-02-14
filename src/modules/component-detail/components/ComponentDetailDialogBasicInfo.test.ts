/**
 * ComponentDetailDialogBasicInfo Tests
 *
 * Tests for the basic information edit dialog component.
 */

import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import ComponentDetailDialogBasicInfo from './ComponentDetailDialogBasicInfo.vue'

import type { Component } from '@/api/component/component-types'
import type { Kanji } from '@/api/kanji'

const mockComponent: Component = {
  id: 1,
  character: '氵',
  shortMeaning: 'water',
  searchKeywords: null,
  strokeCount: 3,
  sourceKanjiId: 10,
  description: null,
  canBeRadical: true,
  kangxiNumber: 85,
  kangxiMeaning: 'water',
  radicalNameJapanese: 'さんずい',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

const mockKanji: Kanji = {
  id: 10,
  character: '水',
  shortMeaning: 'water',
  searchKeywords: null,
  strokeCount: 4,
  radicalId: null,
  jlptLevel: 'N5',
  joyoLevel: 'elementary1',
  kanjiKenteiLevel: null,
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

const mockKanjiOptions: Kanji[] = [mockKanji]

describe('ComponentDetailDialogBasicInfo', () => {
  const createWrapper = (props = {}) => {
    return mount(ComponentDetailDialogBasicInfo, {
      props: {
        open: true,
        component: mockComponent,
        sourceKanji: mockKanji,
        kanjiOptions: mockKanjiOptions,
        ...props
      },
      global: {
        stubs: {
          BaseDialog: {
            name: 'BaseDialog',
            template: '<div v-if="open" data-testid="dialog"><slot /></div>',
            props: ['open', 'title']
          },
          ComponentDetailBasicInfoFormFields: {
            name: 'ComponentDetailBasicInfoFormFields',
            template: `<div class="form-fields-stub">
              <div class="stroke-count">Stroke Count: {{ strokeCount }}</div>
              <div class="source-kanji">Source Kanji: {{ sourceKanjiId }}</div>
              <div class="can-be-radical">Can be Radical: {{ canBeRadical }}</div>
              <input 
                type="text" 
                data-testid="stroke-count-input" 
                :value="strokeCount" 
                @input="$emit('update:strokeCount', $event.target.value)" 
              />
              <input 
                type="checkbox" 
                data-testid="can-be-radical-input"
                :checked="canBeRadical" 
                @change="$emit('update:canBeRadical', $event.target.checked)" 
              />
              <span v-if="strokeCountError" class="error">{{ strokeCountError }}</span>
              <span v-if="kangxiNumberError" class="error">{{ kangxiNumberError }}</span>
            </div>`,
            props: [
              'strokeCount',
              'sourceKanjiId',
              'canBeRadical',
              'kangxiNumber',
              'kangxiMeaning',
              'radicalNameJapanese',
              'kanjiOptions',
              'strokeCountError',
              'kangxiNumberError'
            ]
          },
          BaseButton: {
            name: 'BaseButton',
            template:
              '<button :type="type" :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
            props: ['type', 'variant', 'disabled', 'loading']
          }
        }
      }
    })
  }

  it('renders when open is true', () => {
    const wrapper = createWrapper({ open: true })
    expect(wrapper.find('[data-testid="dialog"]').exists()).toBe(true)
  })

  it('does not render when open is false', () => {
    const wrapper = createWrapper({ open: false })
    expect(wrapper.find('[data-testid="dialog"]').exists()).toBe(false)
  })

  it('renders form fields component with correct props', () => {
    const wrapper = createWrapper()
    const formFields = wrapper.findComponent({
      name: 'ComponentDetailBasicInfoFormFields'
    })
    expect(formFields.exists()).toBe(true)
    expect(formFields.props('kanjiOptions')).toEqual(mockKanjiOptions)
  })

  it('passes current component values to form fields', async () => {
    const wrapper = createWrapper()
    await flushPromises()
    expect(wrapper.text()).toContain('Stroke Count: 3')
    expect(wrapper.text()).toContain('Can be Radical: true')
  })

  it('shows validation error for invalid stroke count', async () => {
    const wrapper = createWrapper()
    await flushPromises()
    const strokeInput = wrapper.find('[data-testid="stroke-count-input"]')
    await strokeInput.setValue('100')
    const form = wrapper.find('form')
    await form.trigger('submit')
    await flushPromises()
    expect(wrapper.text()).toContain('Stroke count must be between 1 and 64')
  })

  it('emits save with correct data structure on valid submit', async () => {
    const wrapper = createWrapper()
    await flushPromises()
    const form = wrapper.find('form')
    await form.trigger('submit')
    await flushPromises()
    const saveEvents = wrapper.emitted('save')
    expect(saveEvents).toBeTruthy()
    expect(saveEvents?.[0]?.[0]).toEqual({
      strokeCount: 3,
      sourceKanjiId: 10,
      canBeRadical: true,
      kangxiNumber: 85,
      kangxiMeaning: 'water',
      radicalNameJapanese: 'さんずい'
    })
  })

  it('emits update:open with false when Cancel is clicked', async () => {
    const wrapper = createWrapper()
    const cancelButton = wrapper
      .findAll('button')
      .find((b) => b.text() === 'Cancel')
    await cancelButton?.trigger('click')
    expect(wrapper.emitted('update:open')).toBeTruthy()
    expect(wrapper.emitted('update:open')?.[0]).toEqual([false])
  })

  it('clears radical fields when canBeRadical is toggled off and saved', async () => {
    const wrapper = createWrapper({
      component: { ...mockComponent, canBeRadical: true }
    })
    await flushPromises()
    // Toggle can-be-radical off via the stubbed input
    const checkbox = wrapper.find('[data-testid="can-be-radical-input"]')
    await checkbox.setValue(false)
    await flushPromises()
    const form = wrapper.find('form')
    await form.trigger('submit')
    await flushPromises()
    const saveEvents = wrapper.emitted('save')
    expect(saveEvents?.[0]?.[0]).toMatchObject({
      canBeRadical: false,
      kangxiNumber: null,
      kangxiMeaning: null,
      radicalNameJapanese: null
    })
  })

  it('converts None source kanji selection to null', async () => {
    const wrapper = createWrapper({
      component: { ...mockComponent, sourceKanjiId: null }
    })
    await flushPromises()
    const form = wrapper.find('form')
    await form.trigger('submit')
    await flushPromises()
    const saveEvents = wrapper.emitted('save')
    expect(saveEvents?.[0]?.[0]).toMatchObject({ sourceKanjiId: null })
  })
})
