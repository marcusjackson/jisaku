/**
 * Tests for ComponentDetailSectionDescription component.
 *
 * TDD tests for the Description section wrapper using SharedSection.
 */

import { nextTick } from 'vue'

import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import ComponentDetailSectionDescription from './ComponentDetailSectionDescription.vue'

describe('ComponentDetailSectionDescription', () => {
  describe('section structure', () => {
    it('renders with Description title', () => {
      render(ComponentDetailSectionDescription, {
        props: { description: 'Some description' }
      })

      expect(
        screen.getByRole('heading', { name: /description/i })
      ).toBeInTheDocument()
    })

    it('renders with correct test id', () => {
      render(ComponentDetailSectionDescription, {
        props: { description: 'Some description' }
      })

      expect(
        screen.getByTestId('component-detail-description')
      ).toBeInTheDocument()
    })

    it('displays description textarea component', () => {
      render(ComponentDetailSectionDescription, {
        props: { description: 'Some description' }
      })

      expect(screen.getByTestId('description-textarea')).toBeInTheDocument()
    })
  })

  describe('collapsible behavior', () => {
    it('defaults to open when description has content', () => {
      render(ComponentDetailSectionDescription, {
        props: { description: 'Some description content' }
      })

      // Content should be visible when section is open
      expect(screen.getByText('Some description content')).toBeInTheDocument()
    })

    it('defaults to collapsed when description is null', () => {
      render(ComponentDetailSectionDescription, {
        props: { description: null }
      })

      // Content should not be visible when collapsed
      // The textarea should still render (just inside collapsed section)
      // We check that the section is collapsed by looking for the collapsed state
      const section = screen.getByTestId('component-detail-description')
      expect(section).toHaveAttribute('data-state', 'closed')
    })

    it('can be expanded when collapsed', async () => {
      const user = userEvent.setup()
      render(ComponentDetailSectionDescription, {
        props: { description: null }
      })

      // Click the section title to expand
      await user.click(screen.getByRole('heading', { name: /description/i }))
      await nextTick()

      const section = screen.getByTestId('component-detail-description')
      expect(section).toHaveAttribute('data-state', 'open')
    })
  })

  describe('save event forwarding', () => {
    it('emits save event when description is updated', async () => {
      const user = userEvent.setup()
      const onSave = vi.fn()
      render(ComponentDetailSectionDescription, {
        props: { description: 'Original', onSave }
      })

      // Click to enter edit mode
      await user.click(screen.getByTestId('description-textarea'))
      await nextTick()

      // Type new content
      const textarea = screen.getByRole('textbox')
      await user.clear(textarea)
      await user.type(textarea, 'Updated content')

      // Tab to blur and trigger save
      await user.tab()

      expect(onSave).toHaveBeenCalledWith('Updated content')
    })
  })
})
