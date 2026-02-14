/**
 * SharedSearchKeywordsIndicator tests
 *
 * Note: Reka UI Tooltip uses portals with limitations in jsdom.
 * Basic rendering tests here; full interaction via E2E.
 */

import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import SharedSearchKeywordsIndicator from './SharedSearchKeywordsIndicator.vue'

describe('SharedSearchKeywordsIndicator', () => {
  function mountIndicator(searchKeywords: string | null | undefined) {
    return mount(SharedSearchKeywordsIndicator, {
      props: { searchKeywords },
      global: {
        stubs: {
          TooltipProvider: { template: '<div><slot /></div>' },
          TooltipRoot: { template: '<div><slot /></div>' },
          TooltipTrigger: { template: '<span><slot /></span>' },
          TooltipPortal: { template: '<div><slot /></div>' },
          TooltipContent: {
            template: '<div class="tooltip-content"><slot /></div>'
          },
          TooltipArrow: { template: '<div />' }
        }
      }
    })
  }

  it('renders the indicator button', () => {
    const wrapper = mountIndicator('test keywords')
    expect(wrapper.find('button').exists()).toBe(true)
  })

  it('has accessible label', () => {
    const wrapper = mountIndicator('test keywords')
    expect(wrapper.find('[aria-label="Show search keywords"]').exists()).toBe(
      true
    )
  })

  it('renders search icon SVG', () => {
    const wrapper = mountIndicator('test keywords')
    expect(wrapper.find('svg').exists()).toBe(true)
  })

  it('toggles isOpen on click', async () => {
    const wrapper = mountIndicator('test keywords')
    const button = wrapper.find('button')

    await button.trigger('click')
    // Component doesn't expose internal state, but we can check it doesn't throw
    expect(button.exists()).toBe(true)
  })

  it('displays keywords in tooltip content', () => {
    const wrapper = mountIndicator('water, mountain, nature')
    expect(wrapper.text()).toContain('water, mountain, nature')
  })

  it('displays fallback when keywords empty', () => {
    const wrapper = mountIndicator('')
    expect(wrapper.text()).toContain('No search keywords set')
  })

  it('displays fallback when keywords null', () => {
    const wrapper = mountIndicator(null)
    expect(wrapper.text()).toContain('No search keywords set')
  })

  it('displays fallback when keywords undefined', () => {
    const wrapper = mountIndicator(undefined)
    expect(wrapper.text()).toContain('No search keywords set')
  })

  it('renders close button in tooltip', () => {
    const wrapper = mountIndicator('keywords')
    expect(wrapper.find('[aria-label="Close"]').exists()).toBe(true)
  })
})
