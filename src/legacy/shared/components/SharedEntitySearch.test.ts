/**
 * Tests for SharedEntitySearch component
 *
 * Note: SharedEntitySearch uses Reka UI ComboboxPortal which renders outside the component tree.
 * These tests use Vue Test Utils with stubs to avoid portal issues.
 * Full behavior is tested via E2E tests.
 */

import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import SharedEntitySearch from './SharedEntitySearch.vue'

import type { EntityOption } from '@/legacy/shared/types/component-types'

describe('SharedEntitySearch', () => {
  const mockOptions: EntityOption[] = [
    { id: 1, character: '日', shortMeaning: 'sun, day', strokeCount: 4 },
    { id: 2, character: '月', shortMeaning: 'moon, month', strokeCount: 4 },
    { id: 3, character: '水', shortMeaning: 'water', strokeCount: 4 },
    { id: 4, character: '火', shortMeaning: 'fire', strokeCount: 4 },
    { id: 5, character: '木', shortMeaning: null, strokeCount: 4 }
  ]

  function mountComponent(props = {}) {
    return mount(SharedEntitySearch, {
      props: {
        entityType: 'kanji',
        options: mockOptions,
        ...props
      },
      global: {
        stubs: {
          ComboboxRoot: {
            props: ['modelValue', 'disabled', 'ignoreFilter'],
            emits: ['update:modelValue'],
            template: `
              <div data-testid="combobox-root">
                <slot />
              </div>
            `
          },
          ComboboxAnchor: {
            template: '<div class="anchor"><slot /></div>'
          },
          ComboboxInput: {
            props: ['modelValue', 'placeholder', 'id'],
            emits: ['update:modelValue'],
            template: `
              <input 
                :id="id"
                :value="modelValue" 
                :placeholder="placeholder"
                @input="$emit('update:modelValue', $event.target.value)"
                data-testid="search-input"
              />
            `
          },
          ComboboxTrigger: {
            props: ['ariaLabel'],
            template: '<button aria-label="Toggle options"><slot /></button>'
          },
          ComboboxPortal: {
            template: '<div data-testid="portal"><slot /></div>'
          },
          ComboboxContent: {
            props: ['position', 'sideOffset'],
            template: '<div data-testid="content"><slot /></div>'
          },
          ComboboxViewport: {
            template: '<div data-testid="viewport"><slot /></div>'
          },
          ComboboxItem: {
            props: ['value'],
            template:
              '<div class="item" data-testid="option" @click="$emit(\'select\', value)"><slot /></div>'
          },
          ComboboxItemIndicator: {
            template: '<span class="indicator"><slot /></span>'
          },
          ComboboxEmpty: {
            template: '<div class="empty" data-testid="empty"><slot /></div>'
          }
        }
      }
    })
  }

  it('renders search input', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('[data-testid="search-input"]').exists()).toBe(true)
  })

  it('renders with custom placeholder', () => {
    const wrapper = mountComponent({ placeholder: 'Search kanji...' })
    expect(
      wrapper.find('[data-testid="search-input"]').attributes('placeholder')
    ).toBe('Search kanji...')
  })

  it('renders label when provided', () => {
    const wrapper = mountComponent({ label: 'Add Component' })
    expect(wrapper.text()).toContain('Add Component')
  })

  it('renders options', () => {
    const wrapper = mountComponent()
    const options = wrapper.findAll('[data-testid="option"]')
    expect(options.length).toBe(5)
  })

  it('renders "Create New" button', () => {
    const wrapper = mountComponent()
    expect(wrapper.text()).toContain('Create New Kanji')
  })

  it('renders empty state message for kanji', () => {
    const wrapper = mountComponent({ options: [] })
    expect(wrapper.text()).toContain('No kanji found')
  })

  it('renders empty state message for component', () => {
    const wrapper = mountComponent({ entityType: 'component', options: [] })
    expect(wrapper.text()).toContain('No component found')
  })

  it('emits createNew event when create button clicked', async () => {
    const wrapper = mountComponent()
    const createButton = wrapper.find('.shared-entity-search-create-button')
    await createButton.trigger('click')
    expect(wrapper.emitted('createNew')).toBeTruthy()
    expect(wrapper.emitted('createNew')?.[0]).toEqual([''])
  })

  it('excludes specified IDs from options', () => {
    const wrapper = mountComponent({ excludeIds: [1, 2] })
    // The component should filter out options with IDs 1 and 2
    const options = wrapper.findAll('[data-testid="option"]')
    // Should have 3 options instead of 5
    expect(options.length).toBe(3)
  })

  it('shows entity type in create button', () => {
    const wrapper = mountComponent({ entityType: 'component' })
    expect(wrapper.text()).toContain('Create New Component')
  })
})
