/**
 * Tests for useFilterPersistence composable
 */
/* eslint-disable vue/one-component-per-file */

import { defineComponent, h } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'

import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useFilterPersistence } from './use-filter-persistence'

const TestComponent = defineComponent({
  setup() {
    const persistence = useFilterPersistence('test-list')
    return { persistence }
  },
  render() {
    return h('div', 'Test Component')
  }
})

describe('useFilterPersistence', () => {
  let router: ReturnType<typeof createRouter>

  beforeEach(() => {
    // Use fake timers for all tests
    vi.useFakeTimers()

    // Clear localStorage before each test
    localStorage.clear()

    // Create a fresh router for each test
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: '/list',
          component: TestComponent,
          name: 'list'
        },
        {
          path: '/detail/:id',
          component: TestComponent,
          name: 'detail'
        }
      ]
    })
  })

  afterEach(() => {
    localStorage.clear()
    vi.useRealTimers()
  })

  it('restores filters from localStorage on mount', async () => {
    // Switch to real timers for this test to allow promises to resolve
    vi.useRealTimers()

    try {
      // Pre-populate localStorage with filters
      localStorage.setItem(
        'filter-state:test-list',
        JSON.stringify({ jlpt: 'N5' })
      )

      // Mount component at /list route with no query params
      await router.push('/list')
      await router.isReady()

      const wrapper = mount(TestComponent, {
        global: {
          plugins: [router]
        }
      })

      // Give time for onMounted and async operations to complete
      await wrapper.vm.$nextTick()
      await new Promise((resolve) => setTimeout(resolve, 50))

      // Check that router was updated with the restored filters
      expect(router.currentRoute.value.query).toEqual({ jlpt: 'N5' })

      wrapper.unmount()
    } finally {
      vi.useFakeTimers()
    }
  })

  it('does not restore filters if URL already has query params', async () => {
    // Pre-populate localStorage with different filters
    localStorage.setItem(
      'filter-state:test-list',
      JSON.stringify({ jlpt: 'N5' })
    )

    // Mount component at /list with existing query params
    await router.push({ path: '/list', query: { character: '漢' } })
    await router.isReady()

    const wrapper = mount(TestComponent, {
      global: {
        plugins: [router]
      }
    })

    await wrapper.vm.$nextTick()
    vi.runAllTimers()
    await wrapper.vm.$nextTick()

    // Should keep the existing params, not restore from localStorage
    expect(router.currentRoute.value.query).toEqual({ character: '漢' })

    wrapper.unmount()
  })

  it('saves filters to localStorage when route query changes', async () => {
    await router.push('/list')
    await router.isReady()

    const wrapper = mount(TestComponent, {
      global: {
        plugins: [router]
      }
    })

    // Change the route query
    await router.replace({
      path: '/list',
      query: { jlpt: 'N4', strokeMin: '5' }
    })
    await wrapper.vm.$nextTick()
    vi.runAllTimers()
    await wrapper.vm.$nextTick()

    // Check that localStorage was updated
    const saved = localStorage.getItem('filter-state:test-list')
    expect(saved).toBe(JSON.stringify({ jlpt: 'N4', strokeMin: '5' }))

    wrapper.unmount()
  })

  it('removes saved state when filters are cleared', async () => {
    // Pre-populate with filters
    localStorage.setItem(
      'filter-state:test-list',
      JSON.stringify({ jlpt: 'N5' })
    )

    await router.push({ path: '/list', query: { jlpt: 'N5' } })
    await router.isReady()

    const wrapper = mount(TestComponent, {
      global: {
        plugins: [router]
      }
    })

    // Clear filters by removing query params
    await router.replace('/list')
    await wrapper.vm.$nextTick()
    vi.runAllTimers()
    await wrapper.vm.$nextTick()

    // Check that localStorage was cleared
    const saved = localStorage.getItem('filter-state:test-list')
    expect(saved).toBeNull()

    wrapper.unmount()
  })

  it('handles multiple filters correctly', async () => {
    await router.push('/list')
    await router.isReady()

    const wrapper = mount(TestComponent, {
      global: {
        plugins: [router]
      }
    })

    // Apply multiple filters
    await router.replace({
      path: '/list',
      query: {
        jlpt: 'N3',
        joyo: 'elementary1',
        character: '水'
      }
    })
    await wrapper.vm.$nextTick()
    vi.runAllTimers()
    await wrapper.vm.$nextTick()

    // Check that all filters were saved
    const saved = localStorage.getItem('filter-state:test-list')
    expect(JSON.parse(saved!)).toEqual({
      jlpt: 'N3',
      joyo: 'elementary1',
      character: '水'
    })

    wrapper.unmount()
  })

  it('uses separate storage keys for different list types', async () => {
    // Switch to real timers for promise resolution
    vi.useRealTimers()

    try {
      const TestComponentOther = defineComponent({
        setup() {
          useFilterPersistence('other-list')
          return {}
        },
        render() {
          return h('div', 'Test Component 2')
        }
      })

      await router.push('/list')
      await router.isReady()

      const wrapper1 = mount(TestComponent, {
        global: {
          plugins: [router]
        }
      })

      // Simulate navigating with filters for first list type
      // Set filters and wait for watcher to save
      await router.replace({ path: '/list', query: { jlpt: 'N5' } })
      await wrapper1.vm.$nextTick()
      await new Promise((resolve) => setTimeout(resolve, 50))

      // Verify first list type saved
      expect(localStorage.getItem('filter-state:test-list')).toBe(
        JSON.stringify({ jlpt: 'N5' })
      )

      // Unmount first component and clear localStorage for next test
      wrapper1.unmount()

      // Mount second component for other-list
      const wrapper2 = mount(TestComponentOther, {
        global: {
          plugins: [router]
        }
      })

      // Set different filters for second list type
      await router.replace({ path: '/list', query: { character: '漢' } })
      await wrapper2.vm.$nextTick()
      await new Promise((resolve) => setTimeout(resolve, 50))

      // Verify second list type is saved independently
      expect(localStorage.getItem('filter-state:other-list')).toBe(
        JSON.stringify({ character: '漢' })
      )
      // First list type's saved state should still exist
      expect(localStorage.getItem('filter-state:test-list')).toBe(
        JSON.stringify({ jlpt: 'N5' })
      )

      wrapper2.unmount()
    } finally {
      vi.useFakeTimers()
    }
  })

  it('handles invalid JSON in localStorage gracefully', async () => {
    // Mock console.error to avoid stderr output in test
    const consoleSpy = vi.spyOn(console, 'error').mockReturnValue(undefined)

    // Put invalid JSON in localStorage
    localStorage.setItem('filter-state:test-list', 'invalid json {')

    await router.push('/list')
    await router.isReady()

    const wrapper = mount(TestComponent, {
      global: {
        plugins: [router]
      }
    })

    await wrapper.vm.$nextTick()
    vi.runAllTimers()
    await wrapper.vm.$nextTick()

    // Should not throw, and should clear the invalid data
    expect(localStorage.getItem('filter-state:test-list')).toBeNull()
    // URL should remain unchanged (no restore happened)
    expect(router.currentRoute.value.query).toEqual({})

    wrapper.unmount()

    consoleSpy.mockRestore()
  })

  it('preserves string values from query params', async () => {
    await router.push('/list')
    await router.isReady()

    const wrapper = mount(TestComponent, {
      global: {
        plugins: [router]
      }
    })

    // Set query with string values
    await router.replace({
      path: '/list',
      query: { strokeMin: '5', strokeMax: '15', character: '水' }
    })
    await wrapper.vm.$nextTick()
    vi.runAllTimers()
    await wrapper.vm.$nextTick()

    // Verify string values are preserved
    const saved = localStorage.getItem('filter-state:test-list')
    const parsed = JSON.parse(saved ?? '{}') as Record<string, string>
    expect(parsed['strokeMin']).toBe('5')
    expect(parsed['strokeMax']).toBe('15')
    expect(parsed['character']).toBe('水')

    wrapper.unmount()
  })
})
