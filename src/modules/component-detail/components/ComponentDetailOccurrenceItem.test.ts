/**
 * Tests for ComponentDetailOccurrenceItem component
 */

import { mount, RouterLinkStub } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import ComponentDetailOccurrenceItem from './ComponentDetailOccurrenceItem.vue'

import type { ComponentForm, OccurrenceWithKanji } from '@/api/component'

describe('ComponentDetailOccurrenceItem', () => {
  const mockOccurrence: OccurrenceWithKanji = {
    id: 1,
    kanjiId: 10,
    componentId: 5,
    componentFormId: null,
    positionTypeId: 1,
    isRadical: false,
    analysisNotes: 'Test analysis notes',
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

  function mountComponent(props = {}) {
    return mount(ComponentDetailOccurrenceItem, {
      props: {
        occurrence: mockOccurrence,
        forms: mockForms,
        index: 0,
        total: 3,
        isDestructiveMode: false,
        ...props
      },
      global: {
        stubs: {
          RouterLink: RouterLinkStub,
          BaseButton: {
            props: ['disabled', 'variant', 'size'],
            template:
              '<button :disabled="disabled" @click="$emit(\'click\')"><slot /></button>'
          },
          SharedPositionBadge: {
            props: ['position'],
            template:
              '<span class="position-badge">{{ position.nameJapanese }}</span>'
          },
          ComponentDetailOccurrenceNotes: {
            props: ['notes', 'maxLength'],
            template: '<div class="occurrence-notes-stub">{{ notes }}</div>'
          }
        }
      }
    })
  }

  it('renders kanji character as link', () => {
    const wrapper = mountComponent()
    const link = wrapper.findComponent(RouterLinkStub)
    expect(link.text()).toBe('明')
  })

  it('displays kanji meaning', () => {
    const wrapper = mountComponent()
    expect(wrapper.text()).toContain('bright')
  })

  it('displays position badge when position exists', () => {
    const wrapper = mountComponent()
    // The position badge stub is rendered with class 'position-badge'
    const positionBadge = wrapper.find('.position-badge')
    expect(positionBadge.exists()).toBe(true)
    expect(positionBadge.text()).toBe('偏')
  })

  it('hides position badge when position is null', () => {
    const occurrenceNoPosition: OccurrenceWithKanji = {
      ...mockOccurrence,
      position: null
    }
    const wrapper = mountComponent({ occurrence: occurrenceNoPosition })
    expect(wrapper.find('.position-badge').exists()).toBe(false)
  })

  it('displays form badge when form is assigned', () => {
    const occurrenceWithForm: OccurrenceWithKanji = {
      ...mockOccurrence,
      componentFormId: 1
    }
    const wrapper = mountComponent({ occurrence: occurrenceWithForm })
    expect(wrapper.find('.occurrence-item-form-badge').exists()).toBe(true)
    expect(wrapper.find('.occurrence-item-form-badge').text()).toBe('hihen')
  })

  it('hides form badge when no form is assigned', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('.occurrence-item-form-badge').exists()).toBe(false)
  })

  it('displays radical badge when isRadical is true', () => {
    const radicalOccurrence: OccurrenceWithKanji = {
      ...mockOccurrence,
      isRadical: true
    }
    const wrapper = mountComponent({ occurrence: radicalOccurrence })
    expect(wrapper.find('.occurrence-item-radical-badge').exists()).toBe(true)
    expect(wrapper.find('.occurrence-item-radical-badge').text()).toBe(
      'Radical'
    )
  })

  it('hides radical badge when isRadical is false', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('.occurrence-item-radical-badge').exists()).toBe(false)
  })

  it('displays analysis notes', () => {
    const wrapper = mountComponent()
    expect(wrapper.text()).toContain('Test analysis notes')
  })

  it('passes notes to ComponentDetailOccurrenceNotes with maxLength', () => {
    const wrapper = mountComponent()
    const notesComponent = wrapper.find('.occurrence-notes-stub')
    expect(notesComponent.exists()).toBe(true)
    expect(notesComponent.text()).toBe('Test analysis notes')
  })

  it('disables up button when first item', () => {
    const wrapper = mountComponent({ index: 0 })
    const upButton = wrapper
      .findAll('button')
      .find((b) => b.attributes('aria-label') === 'Move up')
    expect(upButton?.attributes('disabled')).toBeDefined()
  })

  it('disables down button when last item', () => {
    const wrapper = mountComponent({ index: 2, total: 3 })
    const downButton = wrapper
      .findAll('button')
      .find((b) => b.attributes('aria-label') === 'Move down')
    expect(downButton?.attributes('disabled')).toBeDefined()
  })

  it('shows delete button in destructive mode', () => {
    const wrapper = mountComponent({ isDestructiveMode: true })
    const deleteButton = wrapper
      .findAll('button')
      .find((b) => b.attributes('aria-label') === 'Delete')
    expect(deleteButton?.exists()).toBe(true)
  })

  it('hides delete button when not in destructive mode', () => {
    const wrapper = mountComponent({ isDestructiveMode: false })
    const deleteButton = wrapper
      .findAll('button')
      .find((b) => b.attributes('aria-label') === 'Delete')
    expect(deleteButton).toBeUndefined()
  })

  it('emits edit when edit button is clicked', async () => {
    const wrapper = mountComponent()
    const editButton = wrapper
      .findAll('button')
      .find((b) => b.text() === 'Edit')
    await editButton?.trigger('click')
    expect(wrapper.emitted('edit')).toBeTruthy()
  })

  it('emits delete when delete button is clicked', async () => {
    const wrapper = mountComponent({ isDestructiveMode: true })
    const deleteButton = wrapper
      .findAll('button')
      .find((b) => b.text() === 'Delete')
    await deleteButton?.trigger('click')
    expect(wrapper.emitted('delete')).toBeTruthy()
  })

  it('emits move-up when up button is clicked', async () => {
    const wrapper = mountComponent({ index: 1 })
    const upButton = wrapper
      .findAll('button')
      .find((b) => b.attributes('aria-label') === 'Move up')
    await upButton?.trigger('click')
    expect(wrapper.emitted('move-up')).toBeTruthy()
  })

  it('emits move-down when down button is clicked', async () => {
    const wrapper = mountComponent({ index: 0, total: 3 })
    const downButton = wrapper
      .findAll('button')
      .find((b) => b.attributes('aria-label') === 'Move down')
    await downButton?.trigger('click')
    expect(wrapper.emitted('move-down')).toBeTruthy()
  })
})
