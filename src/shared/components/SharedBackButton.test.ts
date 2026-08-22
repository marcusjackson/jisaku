/**
 * SharedBackButton tests
 */

import { createMemoryHistory, createRouter } from 'vue-router'

import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import SharedBackButton from './SharedBackButton.vue'

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div />' } },
      { path: '/kanji', component: { template: '<div />' } },
      { path: '/components', component: { template: '<div />' } }
    ]
  })
}

describe('SharedBackButton', () => {
  function mountButton(props: { to: string; label: string }) {
    const router = createTestRouter()
    return mount(SharedBackButton, {
      props,
      global: {
        plugins: [router]
      }
    })
  }

  it('renders with label', () => {
    const wrapper = mountButton({ to: '/kanji', label: 'Back to Kanji List' })
    expect(wrapper.text()).toContain('Back to Kanji List')
  })

  it('contains a link element', () => {
    const wrapper = mountButton({ to: '/kanji', label: 'Back to Kanji List' })
    expect(wrapper.find('a').exists()).toBe(true)
  })

  it('does not nest a button inside the link (BSS-H1 regression)', () => {
    const wrapper = mountButton({ to: '/kanji', label: 'Back to Kanji List' })
    // RouterLink renders as <a>; no <button> should be nested inside it
    expect(wrapper.find('a button').exists()).toBe(false)
  })

  it('displays the back arrow icon', () => {
    const wrapper = mountButton({ to: '/components', label: 'Back' })
    expect(wrapper.text()).toContain('←')
  })

  it('link has correct href', () => {
    const wrapper = mountButton({ to: '/kanji', label: 'Back' })
    expect(wrapper.find('a').attributes('href')).toBe('/kanji')
  })
})
