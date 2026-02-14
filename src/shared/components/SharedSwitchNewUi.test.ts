/**
 * Tests for SharedSwitchNewUi component
 */

import { createRouter, createWebHistory } from 'vue-router'

import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import SharedSwitchNewUi from './SharedSwitchNewUi.vue'

// Create test router with routes
function createTestRouter() {
  return createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/', redirect: '/legacy/kanji' },
      { path: '/kanji', component: { template: '<div>Kanji New</div>' } },
      {
        path: '/coming-soon',
        component: { template: '<div>Coming Soon</div>' }
      },
      {
        path: '/legacy/kanji',
        component: { template: '<div>Kanji Legacy</div>' }
      }
    ]
  })
}

describe('SharedSwitchNewUi', () => {
  it('renders the switch', () => {
    const router = createTestRouter()
    render(SharedSwitchNewUi, {
      global: { plugins: [router] }
    })

    expect(screen.getByRole('switch')).toBeInTheDocument()
  })

  it('renders the label', () => {
    const router = createTestRouter()
    render(SharedSwitchNewUi, {
      global: { plugins: [router] }
    })

    expect(screen.getByText('New UI')).toBeInTheDocument()
  })

  it('shows switch as unchecked when on legacy route', async () => {
    const router = createTestRouter()
    await router.push('/legacy/kanji')
    await router.isReady()

    render(SharedSwitchNewUi, {
      global: { plugins: [router] }
    })

    const switchElement = screen.getByRole('switch')
    expect(switchElement).toHaveAttribute('data-state', 'unchecked')
  })

  it('shows switch as checked when on new route', async () => {
    const router = createTestRouter()
    await router.push('/kanji')
    await router.isReady()

    render(SharedSwitchNewUi, {
      global: { plugins: [router] }
    })

    const switchElement = screen.getByRole('switch')
    expect(switchElement).toHaveAttribute('data-state', 'checked')
  })

  it('navigates to new UI when clicked from legacy', async () => {
    const user = userEvent.setup()
    const router = createTestRouter()
    await router.push('/legacy/kanji')
    await router.isReady()

    render(SharedSwitchNewUi, {
      global: { plugins: [router] }
    })

    const switchElement = screen.getByRole('switch')
    await user.click(switchElement)

    expect(router.currentRoute.value.path).toBe('/kanji')
  })

  it('navigates to legacy UI when clicked from new', async () => {
    const user = userEvent.setup()
    const router = createTestRouter()
    await router.push('/kanji')
    await router.isReady()

    render(SharedSwitchNewUi, {
      global: { plugins: [router] }
    })

    const switchElement = screen.getByRole('switch')
    await user.click(switchElement)

    expect(router.currentRoute.value.path).toBe('/legacy/kanji')
  })

  it('has accessible title', () => {
    const router = createTestRouter()
    const { container } = render(SharedSwitchNewUi, {
      global: { plugins: [router] }
    })

    const wrapper = container.querySelector('.shared-switch-new-ui')
    expect(wrapper).toHaveAttribute('title', 'Toggle between legacy and new UI')
  })
})
