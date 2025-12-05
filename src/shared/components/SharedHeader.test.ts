/**
 * Tests for SharedHeader component
 */

import { renderWithProviders } from '@test/helpers/render'
import { screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import SharedHeader from './SharedHeader.vue'

describe('SharedHeader', () => {
  it('renders the app logo', () => {
    renderWithProviders(SharedHeader)

    expect(screen.getByText('自作字典')).toBeInTheDocument()
  })

  it('renders navigation links', () => {
    renderWithProviders(SharedHeader)

    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /components/i })
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /settings/i })).toBeInTheDocument()
  })

  it('logo links to home page', () => {
    renderWithProviders(SharedHeader)

    const logo = screen.getByText('自作字典')
    expect(logo.closest('a')).toHaveAttribute('href', '/')
  })

  it('has correct navigation hrefs', () => {
    renderWithProviders(SharedHeader)

    expect(screen.getByRole('link', { name: /home/i })).toHaveAttribute(
      'href',
      '/'
    )
    expect(screen.getByRole('link', { name: /components/i })).toHaveAttribute(
      'href',
      '/components'
    )
    expect(screen.getByRole('link', { name: /settings/i })).toHaveAttribute(
      'href',
      '/settings'
    )
  })

  it('has accessible navigation landmark', () => {
    renderWithProviders(SharedHeader)

    expect(
      screen.getByRole('navigation', { name: /main navigation/i })
    ).toBeInTheDocument()
  })

  it('renders as header element', () => {
    renderWithProviders(SharedHeader)

    expect(screen.getByRole('banner')).toBeInTheDocument()
  })
})
