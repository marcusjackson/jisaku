/**
 * SharedHeader tests
 */

import { createRouter, createWebHistory } from 'vue-router'

import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import { ROUTES } from '@/router/routes'

import SharedHeader from './SharedHeader.vue'

// Create a minimal router for testing
function createTestRouter() {
  return createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/', component: { template: '<div>Home</div>' } },
      { path: '/kanji', component: { template: '<div>Kanji</div>' } },
      {
        path: '/coming-soon',
        component: { template: '<div>Coming Soon</div>' }
      }
    ]
  })
}

describe('SharedHeader', () => {
  it('renders the app logo', () => {
    const router = createTestRouter()
    render(SharedHeader, {
      global: { plugins: [router] }
    })

    expect(screen.getByText('自作')).toBeInTheDocument()
  })

  it('logo links to kanji list page', () => {
    const router = createTestRouter()
    render(SharedHeader, {
      global: { plugins: [router] }
    })

    const logo = screen.getByText('自作')
    expect(logo.closest('a')).toHaveAttribute('href', ROUTES.KANJI_LIST)
  })

  it('renders navigation links', () => {
    const router = createTestRouter()
    render(SharedHeader, {
      global: { plugins: [router] }
    })

    expect(screen.getByRole('link', { name: /kanji/i })).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /components/i })
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /vocab/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /settings/i })).toBeInTheDocument()
  })

  it('has correct navigation hrefs', () => {
    const router = createTestRouter()
    render(SharedHeader, {
      global: { plugins: [router] }
    })

    expect(screen.getByRole('link', { name: /kanji/i })).toHaveAttribute(
      'href',
      '/kanji'
    )
    expect(screen.getByRole('link', { name: /components/i })).toHaveAttribute(
      'href',
      '/components'
    )
    expect(screen.getByRole('link', { name: /vocab/i })).toHaveAttribute(
      'href',
      '/vocabulary'
    )
    expect(screen.getByRole('link', { name: /settings/i })).toHaveAttribute(
      'href',
      '/settings'
    )
  })

  it('has accessible navigation landmark', () => {
    const router = createTestRouter()
    render(SharedHeader, {
      global: { plugins: [router] }
    })

    expect(
      screen.getByRole('navigation', { name: /main navigation/i })
    ).toBeInTheDocument()
  })

  it('renders as header element', () => {
    const router = createTestRouter()
    render(SharedHeader, {
      global: { plugins: [router] }
    })

    expect(screen.getByRole('banner')).toBeInTheDocument()
  })

  it('settings link has accessible icon label', () => {
    const router = createTestRouter()
    render(SharedHeader, {
      global: { plugins: [router] }
    })

    const settingsLink = screen.getByRole('link', { name: /settings/i })
    expect(settingsLink).toHaveAttribute('aria-label', 'Settings')
    expect(settingsLink).toHaveAttribute('title', 'Settings')
  })

  it('renders settings icon', () => {
    const router = createTestRouter()
    render(SharedHeader, {
      global: { plugins: [router] }
    })

    const svg = screen
      .getByRole('link', { name: /settings/i })
      .querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('renders version toggle', () => {
    const router = createTestRouter()
    render(SharedHeader, {
      global: { plugins: [router] }
    })

    expect(screen.getByRole('switch')).toBeInTheDocument()
  })
})
