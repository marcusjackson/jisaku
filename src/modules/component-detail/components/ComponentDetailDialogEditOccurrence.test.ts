/**
 * Tests for ComponentDetailDialogEditOccurrence component
 *
 * Note: Uses BaseDialog which renders via portal.
 * Tests use stubs to avoid portal issues.
 * Full behavior is tested via E2E tests.
 */

import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import ComponentDetailDialogEditOccurrence from './ComponentDetailDialogEditOccurrence.vue'

import type { ComponentForm, OccurrenceWithKanji } from '@/api/component'
import type { PositionType } from '@/api/position/position-types'

describe('ComponentDetailDialogEditOccurrence', () => {
  const mockOccurrence: OccurrenceWithKanji = {
    id: 1,
    kanjiId: 10,
    componentId: 5,
    componentFormId: null,
    positionTypeId: 1,
    isRadical: false,
    analysisNotes: 'Test notes',
    displayOrder: 0,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    kanji: {
      id: 10,
      character: '明',
      shortMeaning: 'bright',
      strokeCount: 8
    },
    position: {
      id: 1,
      positionName: 'hen',
      nameJapanese: '偏',
      nameEnglish: 'left',
      description: null,
      displayOrder: 0
    }
  }

  const mockPositionTypes: PositionType[] = [
    {
      id: 1,
      positionName: 'hen',
      nameJapanese: '偏',
      nameEnglish: 'Left side',
      description: null,
      displayOrder: 0
    },
    {
      id: 2,
      positionName: 'tsukuri',
      nameJapanese: '旁',
      nameEnglish: 'Right side',
      description: null,
      displayOrder: 1
    }
  ]

  const mockForms: ComponentForm[] = [
    {
      id: 1,
      componentId: 5,
      formCharacter: '⽇',
      formName: 'hihen',
      strokeCount: 4,
      usageNotes: null,
      displayOrder: 0,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    }
  ]

  function mountDialog(props = {}, modelValue = true) {
    return mount(ComponentDetailDialogEditOccurrence, {
      props: {
        open: modelValue,
        'onUpdate:open': (...args: unknown[]) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          args
        },
        occurrence: mockOccurrence,
        positionTypes: mockPositionTypes,
        forms: mockForms,
        ...props
      },
      global: {
        stubs: {
          BaseDialog: {
            props: ['open', 'title', 'description'],
            template: `
              <div v-if="open" role="dialog" data-testid="dialog">
                <h2>{{ title }}</h2>
                <p>{{ description }}</p>
                <slot />
                <slot name="footer" />
              </div>
            `
          },
          BaseButton: {
            props: ['disabled', 'variant', 'type', 'form'],
            template:
              '<button :type="type" :form="form" @click="$emit(\'click\')"><slot /></button>'
          },
          BaseSelect: {
            props: ['modelValue', 'options', 'label', 'name', 'placeholder'],
            emits: ['update:modelValue'],
            template: `
              <div class="base-select">
                <label>{{ label }}</label>
                <select @change="$emit('update:modelValue', $event.target.value)">
                  <option v-for="opt in options" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                  </option>
                </select>
              </div>
            `
          },
          BaseSwitch: {
            props: ['modelValue', 'label'],
            emits: ['update:modelValue'],
            template: `
              <div class="base-switch">
                <label>{{ label }}</label>
                <input type="checkbox" :checked="modelValue" @change="$emit('update:modelValue', $event.target.checked)" />
              </div>
            `
          },
          BaseTextarea: {
            props: ['modelValue', 'label', 'name', 'placeholder', 'rows'],
            emits: ['update:modelValue'],
            template: `
              <div class="base-textarea">
                <label>{{ label }}</label>
                <textarea 
                  :value="modelValue" 
                  :rows="rows"
                  @input="$emit('update:modelValue', $event.target.value)"
                />
              </div>
            `
          }
        }
      }
    })
  }

  it('renders dialog when open', () => {
    const wrapper = mountDialog()
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true)
  })

  it('does not render when closed', () => {
    const wrapper = mountDialog({}, false)
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
  })

  it('renders title', () => {
    const wrapper = mountDialog()
    expect(wrapper.find('h2').text()).toBe('Edit Occurrence')
  })

  it('displays kanji character', () => {
    const wrapper = mountDialog()
    expect(wrapper.text()).toContain('明')
  })

  it('displays kanji meaning', () => {
    const wrapper = mountDialog()
    expect(wrapper.text()).toContain('bright')
  })

  it('renders position type select', () => {
    const wrapper = mountDialog()
    // Find by label text
    expect(wrapper.text()).toContain('Position Type')
    expect(wrapper.findAll('.base-select').length).toBeGreaterThanOrEqual(1)
  })

  it('renders form select when forms exist', () => {
    const wrapper = mountDialog()
    expect(wrapper.text()).toContain('Component Form')
    expect(wrapper.findAll('.base-select').length).toBeGreaterThanOrEqual(2)
  })

  it('hides form select when no forms exist', () => {
    const wrapper = mountDialog({ forms: [] })
    expect(wrapper.text()).not.toContain('Component Form')
  })

  it('renders is radical switch', () => {
    const wrapper = mountDialog()
    expect(wrapper.text()).toContain('Is Radical')
  })

  it('renders analysis notes textarea', () => {
    const wrapper = mountDialog()
    expect(wrapper.text()).toContain('Analysis Notes')
    expect(wrapper.find('.base-textarea').exists()).toBe(true)
  })

  it('renders cancel button', () => {
    const wrapper = mountDialog()
    const cancelButton = wrapper.findAll('button').find((b) => {
      return b.text() === 'Cancel'
    })
    expect(cancelButton?.exists()).toBe(true)
  })

  it('renders save button', () => {
    const wrapper = mountDialog()
    const saveButton = wrapper.findAll('button').find((b) => {
      return b.text() === 'Save'
    })
    expect(saveButton?.exists()).toBe(true)
  })

  it('emits cancel when cancel button is clicked', async () => {
    const wrapper = mountDialog()
    const cancelButton = wrapper.findAll('button').find((b) => {
      return b.text() === 'Cancel'
    })
    await cancelButton?.trigger('click')
    expect(wrapper.emitted('cancel')).toBeTruthy()
  })

  it('does not render content when occurrence is null', () => {
    const wrapper = mountDialog({ occurrence: null })
    expect(wrapper.find('.dialog-edit-occurrence-content').exists()).toBe(false)
  })
})
