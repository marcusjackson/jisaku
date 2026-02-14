/**
 * Tests for SharedEntitySearch component
 *
 * Note: SharedEntitySearch uses Reka UI Combobox with portal.
 * These tests use Vue Test Utils with stubs to avoid portal issues.
 * Full behavior is tested via E2E tests.
 */

import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import SharedEntitySearch from './SharedEntitySearch.vue'

import type { EntityOption } from './SharedEntitySearch.vue'

// Mock Reka UI components that use portals
vi.mock('reka-ui', () => ({
  ComboboxAnchor: {
    template: '<div class="combobox-anchor"><slot /></div>'
  },
  ComboboxContent: {
    props: ['position', 'sideOffset'],
    template: '<div class="combobox-content"><slot /></div>'
  },
  ComboboxEmpty: {
    template: '<div class="combobox-empty"><slot /></div>'
  },
  ComboboxInput: {
    props: ['id', 'modelValue', 'placeholder'],
    emits: ['update:modelValue'],
    template: `<input 
      :id="id"
      :value="modelValue" 
      :placeholder="placeholder"
      @input="$emit('update:modelValue', $event.target.value)"
      data-testid="search-input"
    />`
  },
  ComboboxItem: {
    props: ['value'],
    template:
      '<div class="combobox-item" @click="$emit(\'click\')"><slot /></div>'
  },
  ComboboxItemIndicator: {
    template: '<span class="combobox-item-indicator"><slot /></span>'
  },
  ComboboxPortal: {
    template: '<div class="combobox-portal"><slot /></div>'
  },
  ComboboxRoot: {
    props: ['modelValue', 'disabled', 'ignoreFilter'],
    emits: ['update:modelValue'],
    template: '<div class="combobox-root"><slot /></div>'
  },
  ComboboxTrigger: {
    props: ['ariaLabel'],
    template:
      '<button class="combobox-trigger" :aria-label="ariaLabel"><slot /></button>'
  },
  ComboboxViewport: {
    template: '<div class="combobox-viewport"><slot /></div>'
  },
  useFilter: () => ({
    contains: (text: string, search: string) =>
      text.toLowerCase().includes(search.toLowerCase())
  })
}))

describe('SharedEntitySearch', () => {
  const mockOptions: EntityOption[] = [
    { id: 1, character: '明', shortMeaning: 'bright', strokeCount: 8 },
    { id: 2, character: '暗', shortMeaning: 'dark', strokeCount: 13 },
    { id: 3, character: '日', shortMeaning: 'sun', strokeCount: 4 }
  ]

  function mountComponent(props = {}) {
    return mount(SharedEntitySearch, {
      props: {
        entityType: 'kanji' as const,
        options: mockOptions,
        ...props
      }
    })
  }

  it('renders search input', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('[data-testid="search-input"]').exists()).toBe(true)
  })

  it('renders with custom placeholder', () => {
    const wrapper = mountComponent({ placeholder: 'Find kanji...' })
    const input = wrapper.find('[data-testid="search-input"]')
    expect(input.attributes('placeholder')).toBe('Find kanji...')
  })

  it('renders label when provided', () => {
    const wrapper = mountComponent({ label: 'Search Kanji' })
    expect(wrapper.find('.shared-entity-search-label').text()).toBe(
      'Search Kanji'
    )
  })

  it('renders all options when no search term', () => {
    const wrapper = mountComponent()
    const items = wrapper.findAll('.combobox-item')
    expect(items).toHaveLength(mockOptions.length)
  })

  it('renders create new button', () => {
    const wrapper = mountComponent()
    const createButton = wrapper.find('.shared-entity-search-create-button')
    expect(createButton.exists()).toBe(true)
    expect(createButton.text()).toContain('Create New Kanji')
  })

  it('emits createNew when create button is clicked', async () => {
    const wrapper = mountComponent()
    const createButton = wrapper.find('.shared-entity-search-create-button')
    await createButton.trigger('click')
    expect(wrapper.emitted('createNew')).toBeTruthy()
  })

  it('excludes specified IDs from options', () => {
    const wrapper = mountComponent({ excludeIds: [1, 2] })
    const items = wrapper.findAll('.combobox-item')
    expect(items).toHaveLength(1)
  })

  it('shows component entity type name', () => {
    const wrapper = mountComponent({ entityType: 'component' })
    const createButton = wrapper.find('.shared-entity-search-create-button')
    expect(createButton.text()).toContain('Create New Component')
  })

  it('displays empty message for component type', () => {
    const wrapper = mountComponent({ entityType: 'component', options: [] })
    expect(wrapper.find('.combobox-empty').text()).toBe('No component found')
  })
})
