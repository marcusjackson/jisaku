/**
 * Tests for KanjiDetailBasicInfo component
 *
 * Note: Uses stubs for Reka UI components to avoid portal/JSDOM issues.
 * Full interaction testing is covered by E2E tests.
 */

import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import KanjiDetailBasicInfo from './KanjiDetailBasicInfo.vue'

import type { Component, Kanji } from '@/legacy/shared/types/database-types'

function createMockKanji(overrides: Partial<Kanji> = {}): Kanji {
  return {
    character: '日',
    createdAt: new Date().toISOString(),
    id: 1,
    jlptLevel: 'N5',
    joyoLevel: 'elementary1',
    kenteiLevel: '10',
    notesEtymology: null,
    notesSemantic: null,
    notesEducationMnemonics: null,
    notesPersonal: null,
    identifier: null,
    radicalStrokeCount: null,
    searchKeywords: null,
    radicalId: 1,
    strokeCount: 4,
    shortMeaning: 'sun',
    strokeDiagramImage: null,
    strokeGifImage: null,
    updatedAt: new Date().toISOString(),
    ...overrides
  }
}

function createMockComponent(overrides: Partial<Component> = {}): Component {
  return {
    id: 1,
    character: '日',
    strokeCount: 4,
    shortMeaning: 'sun',
    sourceKanjiId: null,
    searchKeywords: null,
    description: null,
    canBeRadical: true,
    kangxiNumber: 72,
    kangxiMeaning: 'sun',
    radicalNameJapanese: 'ひ',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  }
}

function mountBasicInfo(props: {
  kanji: Kanji
  radical?: Component | null
  radicalOptions?: Component[]
}) {
  return mount(KanjiDetailBasicInfo, {
    props,
    global: {
      stubs: {
        BaseButton: {
          props: ['disabled', 'loading', 'variant', 'size'],
          template: '<button :disabled="disabled"><slot /></button>'
        },
        BaseInput: {
          props: ['modelValue', 'label', 'type', 'min', 'required'],
          emits: ['update:modelValue'],
          template: `
            <div>
              <label>{{ label }}</label>
              <input :value="modelValue" @input="$emit('update:modelValue', $event.target.value)" />
            </div>
          `
        },
        BaseSelect: {
          props: ['modelValue', 'label', 'options'],
          emits: ['update:modelValue'],
          template: `
            <div>
              <label>{{ label }}</label>
              <select @change="$emit('update:modelValue', $event.target.value)">
                <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
              </select>
            </div>
          `
        },
        BaseCombobox: {
          props: ['modelValue', 'label', 'options', 'displayKey', 'valueKey'],
          emits: ['update:modelValue'],
          template: `
            <div>
              <label>{{ label }}</label>
              <select @change="$emit('update:modelValue', $event.target.value)">
                <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
              </select>
            </div>
          `
        }
      }
    }
  })
}

describe('KanjiDetailBasicInfo', () => {
  it('renders stroke count in view mode', () => {
    const kanji = createMockKanji()
    const wrapper = mountBasicInfo({ kanji })

    expect(wrapper.text()).toContain('4')
  })

  it('renders JLPT level in view mode', () => {
    const kanji = createMockKanji()
    const wrapper = mountBasicInfo({ kanji })

    expect(wrapper.text()).toContain('N5')
  })

  it('renders Joyo level in view mode', () => {
    const kanji = createMockKanji()
    const wrapper = mountBasicInfo({ kanji })

    expect(wrapper.text()).toContain('小1')
  })

  it('renders radical display in view mode', () => {
    const kanji = createMockKanji()
    const radical = createMockComponent()
    const wrapper = mountBasicInfo({ kanji, radical })

    expect(wrapper.text()).toContain('日 (sun)')
  })

  it('renders Edit button in view mode', () => {
    const kanji = createMockKanji()
    const wrapper = mountBasicInfo({ kanji })

    const button = wrapper.find('button')
    expect(button.text()).toContain('Edit')
  })

  it('shows dash for missing values', () => {
    const kanji = createMockKanji({
      jlptLevel: null,
      joyoLevel: null,
      kenteiLevel: null,
      radicalId: null
    })

    const wrapper = mountBasicInfo({ kanji })

    // Should have multiple dashes for missing values
    expect(wrapper.text()).toContain('—')
  })

  it('switches to edit mode when Edit clicked', async () => {
    const kanji = createMockKanji()
    const wrapper = mountBasicInfo({ kanji })

    // Click Edit button
    await wrapper.find('button').trigger('click')

    // Should show Save and Cancel buttons in edit mode
    expect(wrapper.text()).toContain('Save')
    expect(wrapper.text()).toContain('Cancel')
  })

  it('emits update event when saving', async () => {
    const kanji = createMockKanji({ strokeCount: 4 })
    const wrapper = mountBasicInfo({ kanji })

    // Enter edit mode
    await wrapper.find('button').trigger('click')

    // Find and update stroke count input
    const input = wrapper.find('input')
    await input.setValue('5')

    // Save
    const saveButton = wrapper
      .findAll('button')
      .find((b) => b.text().includes('Save'))
    await saveButton?.trigger('click')

    // Check that update was emitted
    const emitted = wrapper.emitted('update')
    expect(emitted).toBeTruthy()
  })
})
