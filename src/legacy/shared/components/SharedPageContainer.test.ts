/**
 * Tests for SharedPageContainer component
 */

import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import SharedPageContainer from './SharedPageContainer.vue'

describe('SharedPageContainer', () => {
  it('renders slot content', () => {
    render(SharedPageContainer, {
      slots: {
        default: '<p>Page content here</p>'
      }
    })

    expect(screen.getByText('Page content here')).toBeInTheDocument()
  })

  it('applies container class', () => {
    const { container } = render(SharedPageContainer, {
      slots: {
        default: '<p>Content</p>'
      }
    })

    expect(
      container.querySelector('.shared-page-container')
    ).toBeInTheDocument()
  })

  it('wraps multiple children', () => {
    render(SharedPageContainer, {
      slots: {
        default: '<h1>Title</h1><p>Paragraph</p>'
      }
    })

    expect(screen.getByRole('heading', { name: /title/i })).toBeInTheDocument()
    expect(screen.getByText('Paragraph')).toBeInTheDocument()
  })
})
