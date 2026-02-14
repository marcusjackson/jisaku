/**
 * ComponentDetailSectionHeadline Tests
 *
 * Tests for the headline section component.
 */

import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import ComponentDetailSectionHeadline from './ComponentDetailSectionHeadline.vue'

import type { Component } from '@/api/component/component-types'

// Mock vue-router
vi.mock('vue-router', () => ({
  RouterLink: {
    name: 'RouterLink',
    template: '<a><slot /></a>',
    props: ['to']
  }
}))

const mockComponent: Component = {
  id: 1,
  character: '氵',
  shortMeaning: 'water',
  searchKeywords: 'mizu, sanzui',
  strokeCount: 3,
  sourceKanjiId: null,
  description: null,
  canBeRadical: true,
  kangxiNumber: 85,
  kangxiMeaning: 'water',
  radicalNameJapanese: 'さんずい',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

describe('ComponentDetailSectionHeadline', () => {
  const createWrapper = (props = {}) => {
    return mount(ComponentDetailSectionHeadline, {
      props: {
        component: mockComponent,
        ...props
      },
      global: {
        stubs: {
          SharedBackButton: true,
          SharedSearchKeywordsIndicator: true,
          ComponentDetailDialogHeadline: true,
          BaseButton: true
        }
      }
    })
  }

  it('renders component character', () => {
    const wrapper = createWrapper()
    expect(wrapper.text()).toContain('氵')
  })

  it('renders short meaning when provided', () => {
    const wrapper = createWrapper()
    expect(wrapper.text()).toContain('water')
  })

  it('does not render short meaning when null', () => {
    const wrapper = createWrapper({
      component: { ...mockComponent, shortMeaning: null }
    })
    expect(
      wrapper.find('[data-testid="component-short-meaning"]').exists()
    ).toBe(false)
  })

  it('renders edit button', () => {
    const wrapper = createWrapper()
    expect(wrapper.findComponent({ name: 'BaseButton' }).exists()).toBe(true)
  })

  it('renders back button', () => {
    const wrapper = createWrapper()
    expect(wrapper.findComponent({ name: 'SharedBackButton' }).exists()).toBe(
      true
    )
  })

  it('renders search keywords indicator', () => {
    const wrapper = createWrapper()
    expect(
      wrapper.findComponent({ name: 'SharedSearchKeywordsIndicator' }).exists()
    ).toBe(true)
  })
})
