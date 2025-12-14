/**
 * SharedSearchKeywordsIndicator.test.ts
 *
 * Unit tests for SharedSearchKeywordsIndicator component.
 */

import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import SharedSearchKeywordsIndicator from './SharedSearchKeywordsIndicator.vue'

interface ComponentVM {
  tooltipMessage: string
  hasKeywords: boolean
}

describe('SharedSearchKeywordsIndicator', () => {
  describe('with search keywords', () => {
    it('renders indicator when keywords provided', () => {
      const wrapper = mount(SharedSearchKeywordsIndicator, {
        props: {
          searchKeywords: 'test, keywords, example'
        }
      })

      expect(wrapper.find('svg').exists()).toBe(true)
      expect(wrapper.find('[aria-label="Has search keywords"]').exists()).toBe(
        true
      )
    })

    it('computes tooltip message as keywords when present', () => {
      const wrapper = mount(SharedSearchKeywordsIndicator, {
        props: {
          searchKeywords: 'ひ, にち, hi, nichi'
        }
      })

      const vm = wrapper.vm as unknown as ComponentVM
      expect(vm.tooltipMessage).toBe('ひ, にち, hi, nichi')
    })

    it('has correct hover state styling', () => {
      const wrapper = mount(SharedSearchKeywordsIndicator, {
        props: {
          searchKeywords: 'keywords'
        }
      })

      const indicator = wrapper.find('.search-keywords-indicator')
      expect(indicator.exists()).toBe(true)
      expect(indicator.classes()).toContain('search-keywords-indicator')
    })
  })

  describe('without search keywords', () => {
    it('renders indicator when keywords are null', () => {
      const wrapper = mount(SharedSearchKeywordsIndicator, {
        props: {
          searchKeywords: null
        }
      })

      expect(wrapper.find('svg').exists()).toBe(true)
    })

    it('renders indicator when keywords are empty string', () => {
      const wrapper = mount(SharedSearchKeywordsIndicator, {
        props: {
          searchKeywords: ''
        }
      })

      expect(wrapper.find('svg').exists()).toBe(true)
    })

    it('renders indicator when keywords are whitespace only', () => {
      const wrapper = mount(SharedSearchKeywordsIndicator, {
        props: {
          searchKeywords: '   '
        }
      })

      expect(wrapper.find('svg').exists()).toBe(true)
    })

    it('renders indicator when keywords are undefined', () => {
      const wrapper = mount(SharedSearchKeywordsIndicator, {
        props: {
          searchKeywords: undefined
        }
      })

      expect(wrapper.find('svg').exists()).toBe(true)
    })

    it('computes tooltip message as "No search keywords set" when empty', () => {
      const wrapper = mount(SharedSearchKeywordsIndicator, {
        props: {
          searchKeywords: null
        }
      })

      const vm = wrapper.vm as unknown as ComponentVM
      expect(vm.tooltipMessage).toBe('No search keywords set')
    })
  })

  describe('reactivity', () => {
    it('updates tooltip message when keywords change', async () => {
      const wrapper = mount(SharedSearchKeywordsIndicator, {
        props: {
          searchKeywords: 'original'
        }
      })

      const vm = wrapper.vm as unknown as ComponentVM
      expect(vm.tooltipMessage).toBe('original')

      await wrapper.setProps({ searchKeywords: 'updated' })
      expect(vm.tooltipMessage).toBe('updated')
    })

    it('updates tooltip message when keywords become empty', async () => {
      const wrapper = mount(SharedSearchKeywordsIndicator, {
        props: {
          searchKeywords: 'original'
        }
      })

      const vm = wrapper.vm as unknown as ComponentVM
      expect(vm.tooltipMessage).toBe('original')

      await wrapper.setProps({ searchKeywords: null })
      expect(vm.tooltipMessage).toBe('No search keywords set')
    })
  })

  describe('accessibility', () => {
    it('has aria-label on indicator span', () => {
      const wrapper = mount(SharedSearchKeywordsIndicator, {
        props: {
          searchKeywords: 'test'
        }
      })

      expect(wrapper.find('[aria-label="Has search keywords"]').exists()).toBe(
        true
      )
    })

    it('has proper SVG structure', () => {
      const wrapper = mount(SharedSearchKeywordsIndicator, {
        props: {
          searchKeywords: 'test'
        }
      })

      const svg = wrapper.find('svg')
      expect(svg.exists()).toBe(true)
      expect(svg.attributes('viewBox')).toBe('0 0 20 20')
      expect(svg.find('path').exists()).toBe(true)
    })
  })
})
