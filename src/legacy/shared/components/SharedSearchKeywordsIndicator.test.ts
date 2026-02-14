/**
 * SharedSearchKeywordsIndicator.test.ts
 *
 * Unit tests for SharedSearchKeywordsIndicator component.
 */

import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import SharedSearchKeywordsIndicator from './SharedSearchKeywordsIndicator.vue'

interface ComponentVM {
  tooltipMessage: string
  hasKeywords: boolean
}

describe('SharedSearchKeywordsIndicator', () => {
  beforeEach(() => {
    // Mock ResizeObserver for Reka UI
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn()
    }))
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('with search keywords', () => {
    it('renders indicator when keywords provided', () => {
      const wrapper = mount(SharedSearchKeywordsIndicator, {
        props: {
          searchKeywords: 'test, keywords, example'
        }
      })

      expect(wrapper.find('svg').exists()).toBe(true)
      expect(wrapper.find('[aria-label="Show search keywords"]').exists()).toBe(
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

  describe('click behavior', () => {
    it('trigger button is clickable', async () => {
      const wrapper = mount(SharedSearchKeywordsIndicator, {
        props: {
          searchKeywords: 'test'
        }
      })

      const button = wrapper.find('[aria-label="Show search keywords"]')
      expect(button.exists()).toBe(true)

      await button.trigger('click')
      // Verify button remains in DOM and is still accessible
      expect(wrapper.find('[aria-label="Show search keywords"]').exists()).toBe(
        true
      )
    })
  })

  describe('accessibility', () => {
    it('has aria-label on indicator button', () => {
      const wrapper = mount(SharedSearchKeywordsIndicator, {
        props: {
          searchKeywords: 'test'
        }
      })

      expect(wrapper.find('[aria-label="Show search keywords"]').exists()).toBe(
        true
      )
    })

    it('has proper SVG structure for indicator', () => {
      const wrapper = mount(SharedSearchKeywordsIndicator, {
        props: {
          searchKeywords: 'test'
        }
      })

      const svgs = wrapper.findAll('svg')
      // Should have at least the indicator icon SVG
      expect(svgs.length).toBeGreaterThan(0)

      const indicatorSvg = svgs.at(0)
      expect(indicatorSvg).toBeDefined()
      if (indicatorSvg) {
        expect(indicatorSvg.attributes('viewBox')).toBe('0 0 20 20')
        expect(indicatorSvg.find('path').exists()).toBe(true)
      }
    })
  })

  describe('outside click handling', () => {
    it('component mounts and unmounts without errors', () => {
      const wrapper = mount(SharedSearchKeywordsIndicator, {
        props: {
          searchKeywords: 'test'
        }
      })

      expect(wrapper.exists()).toBe(true)

      // Should not throw on unmount
      wrapper.unmount()
    })

    it('document event listeners are cleaned up', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')

      const wrapper = mount(SharedSearchKeywordsIndicator, {
        props: {
          searchKeywords: 'test'
        }
      })

      wrapper.unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'click',
        expect.any(Function)
      )

      removeEventListenerSpy.mockRestore()
    })
  })
})
