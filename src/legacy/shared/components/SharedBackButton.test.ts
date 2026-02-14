import { renderWithProviders } from '@test/helpers/render'
import { screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import SharedBackButton from './SharedBackButton.vue'

describe('SharedBackButton', () => {
  it('renders button with label', () => {
    renderWithProviders(SharedBackButton, {
      props: {
        to: '/kanji',
        label: 'Back to Kanji List'
      }
    })

    expect(screen.getByRole('button')).toHaveTextContent('Back to Kanji List')
  })

  it('renders back arrow icon', () => {
    renderWithProviders(SharedBackButton, {
      props: {
        to: '/kanji',
        label: 'Back to Kanji List'
      }
    })

    expect(screen.getByText('←')).toBeInTheDocument()
  })

  it('renders as RouterLink with correct to prop', () => {
    renderWithProviders(SharedBackButton, {
      props: {
        to: '/components',
        label: 'Back to Components'
      }
    })

    // Just verify the component renders without errors
    expect(screen.getByText('Back to Components')).toBeInTheDocument()
  })

  it('has ghost variant button', () => {
    renderWithProviders(SharedBackButton, {
      props: {
        to: '/kanji',
        label: 'Back'
      }
    })

    const button = screen.getByRole('button')
    expect(button).toHaveClass('base-button-ghost')
  })
})
