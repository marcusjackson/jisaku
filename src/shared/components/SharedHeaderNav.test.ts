/**
 * Tests for SharedHeaderNav component
 */

import { createRouter, createWebHistory } from 'vue-router'

import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import { ROUTES } from '@/router/routes'

import SharedHeaderNav from './SharedHeaderNav.vue'

describe('SharedHeaderNav', () => {
  it('renders navigation links', async () => {
    const router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Root</div>' } },
        { path: '/kanji', component: { template: '<div>Kanji</div>' } },
        {
          path: '/components',
          component: { template: '<div>Components</div>' }
        },
        {
          path: '/vocabulary',
          component: { template: '<div>Vocabulary</div>' }
        },
        { path: '/coming-soon', component: { template: '<div>Coming</div>' } }
      ]
    })

    await router.push('/')

    render(SharedHeaderNav, {
      global: {
        plugins: [router]
      }
    })

    expect(screen.getByRole('link', { name: /kanji/i })).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /components/i })
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /vocab/i })).toBeInTheDocument()
  })

  it('links to correct refactored routes', async () => {
    const router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Root</div>' } },
        { path: '/kanji', component: { template: '<div>Kanji</div>' } },
        {
          path: '/components',
          component: { template: '<div>Components</div>' }
        },
        {
          path: '/vocabulary',
          component: { template: '<div>Vocabulary</div>' }
        },
        { path: '/coming-soon', component: { template: '<div>Coming</div>' } }
      ]
    })

    await router.push('/')

    render(SharedHeaderNav, {
      global: {
        plugins: [router]
      }
    })

    const kanjiLink = screen.getByRole('link', { name: /kanji/i })
    expect(kanjiLink).toHaveAttribute('href', ROUTES.KANJI_LIST)

    const componentsLink = screen.getByRole('link', { name: /components/i })
    expect(componentsLink).toHaveAttribute('href', ROUTES.COMPONENT_LIST)

    const vocabLink = screen.getByRole('link', { name: /vocab/i })
    expect(vocabLink).toHaveAttribute('href', ROUTES.VOCABULARY_LIST)
  })

  it('renders settings icon', async () => {
    const router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Root</div>' } },
        { path: '/kanji', component: { template: '<div>Kanji</div>' } },
        {
          path: '/components',
          component: { template: '<div>Components</div>' }
        },
        {
          path: '/vocabulary',
          component: { template: '<div>Vocabulary</div>' }
        },
        { path: '/coming-soon', component: { template: '<div>Coming</div>' } }
      ]
    })

    await router.push('/')

    render(SharedHeaderNav, {
      global: {
        plugins: [router]
      }
    })

    expect(screen.getByRole('link', { name: /settings/i })).toBeInTheDocument()
  })

  it('settings link points to coming-soon', async () => {
    const router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Root</div>' } },
        { path: '/kanji', component: { template: '<div>Kanji</div>' } },
        {
          path: '/components',
          component: { template: '<div>Components</div>' }
        },
        {
          path: '/vocabulary',
          component: { template: '<div>Vocabulary</div>' }
        },
        { path: '/coming-soon', component: { template: '<div>Coming</div>' } }
      ]
    })

    await router.push('/')

    render(SharedHeaderNav, {
      global: {
        plugins: [router]
      }
    })

    const settingsLink = screen.getByRole('link', { name: /settings/i })
    expect(settingsLink).toHaveAttribute('href', ROUTES.SETTINGS)
  })

  it('renders version toggle', async () => {
    const router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Root</div>' } },
        { path: '/kanji', component: { template: '<div>Kanji</div>' } },
        {
          path: '/components',
          component: { template: '<div>Components</div>' }
        },
        {
          path: '/vocabulary',
          component: { template: '<div>Vocabulary</div>' }
        },
        { path: '/coming-soon', component: { template: '<div>Coming</div>' } }
      ]
    })

    await router.push('/')

    render(SharedHeaderNav, {
      global: {
        plugins: [router]
      }
    })

    expect(screen.getByRole('switch')).toBeInTheDocument()
  })
})
