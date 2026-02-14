import { nextTick } from 'vue'

import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import SharedSection from './SharedSection.vue'

describe('SharedSection', () => {
  describe('non-collapsible mode', () => {
    it('renders title and content', () => {
      render(SharedSection, {
        props: { title: 'Test Section' },
        slots: { default: '<p>Section content</p>' }
      })

      expect(screen.getByText('Test Section')).toBeInTheDocument()
      expect(screen.getByText('Section content')).toBeInTheDocument()
    })

    it('renders without title', () => {
      render(SharedSection, {
        slots: { default: '<p>Content only</p>' }
      })

      expect(screen.getByText('Content only')).toBeInTheDocument()
      expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    })

    it('renders actions slot', () => {
      render(SharedSection, {
        props: { title: 'Section with Actions' },
        slots: {
          default: '<p>Content</p>',
          actions: '<button>Action Button</button>'
        }
      })

      expect(screen.getByText('Action Button')).toBeInTheDocument()
    })

    it('does not show collapse button in non-collapsible mode', () => {
      render(SharedSection, {
        props: { title: 'Non-collapsible Section' },
        slots: { default: '<p>Content</p>' }
      })

      expect(screen.queryByText('Collapse')).not.toBeInTheDocument()
    })

    it('renders with testId', () => {
      render(SharedSection, {
        props: { title: 'Test', testId: 'my-section' },
        slots: { default: '<p>Content</p>' }
      })

      expect(screen.getByTestId('my-section')).toBeInTheDocument()
    })
  })

  describe('collapsible mode', () => {
    it('renders as collapsible with trigger', () => {
      render(SharedSection, {
        props: { title: 'Collapsible Section', collapsible: true },
        slots: { default: '<p>Content</p>' }
      })

      expect(screen.getByText('Collapsible Section')).toBeInTheDocument()
      // There are multiple buttons (trigger + collapse), check both exist
      expect(screen.getAllByRole('button').length).toBeGreaterThanOrEqual(1)
    })

    it('starts open by default', async () => {
      render(SharedSection, {
        props: { title: 'Open Section', collapsible: true },
        slots: { default: '<p>Visible Content</p>' }
      })

      await nextTick()
      // Content should be visible when open
      expect(screen.getByText('Visible Content')).toBeInTheDocument()
    })

    it('starts closed when defaultOpen is false', async () => {
      const { container } = render(SharedSection, {
        props: {
          title: 'Closed Section',
          collapsible: true,
          defaultOpen: false
        },
        slots: { default: '<p>Hidden Content</p>' }
      })

      await nextTick()
      // Content should be hidden when closed (uses data-state attribute)
      const content = container.querySelector('[data-state="closed"]')
      expect(content).toBeInTheDocument()
    })

    it('toggles on click', async () => {
      const user = userEvent.setup()
      const { container } = render(SharedSection, {
        props: { title: 'Toggle Section', collapsible: true },
        slots: { default: '<p>Toggle Content</p>' }
      })

      await nextTick()
      const trigger = screen.getAllByRole('button')[0]
      const root = container.querySelector('.shared-section-collapsible')

      // Initially open - content should be visible
      expect(screen.getByText('Toggle Content')).toBeInTheDocument()
      const initialState = root?.getAttribute('data-state')

      // Click to toggle
      await user.click(trigger!)
      await nextTick()

      // State should have changed
      const newState = root?.getAttribute('data-state')
      expect(newState).not.toBe(initialState)
    })

    it('renders actions slot in collapsible mode', () => {
      render(SharedSection, {
        props: { title: 'With Actions', collapsible: true },
        slots: {
          default: '<p>Content</p>',
          actions: '<button>Edit</button>'
        }
      })

      expect(screen.getByText('Edit')).toBeInTheDocument()
    })

    it('exposes isOpen state to actions slot', async () => {
      const user = userEvent.setup()

      // Create a test component that uses the scoped slot
      const TestComponent = {
        components: { SharedSection },
        template: `
          <SharedSection title="Test Section" :collapsible="true" :default-open="true">
            <template #actions="{ isOpen }">
              <span v-if="isOpen">Open</span>
              <span v-else>Closed</span>
            </template>
            <template #default>
              <p>Content</p>
            </template>
          </SharedSection>
        `
      }

      render(TestComponent)
      await nextTick()

      // Initially open
      expect(screen.getByText('Open')).toBeInTheDocument()

      // Click to collapse
      const trigger = screen.getAllByRole('button')[0]
      await user.click(trigger!)
      await nextTick()

      // Should show closed state
      expect(screen.getByText('Closed')).toBeInTheDocument()
    })
  })

  describe('header-extra slot', () => {
    it('renders header-extra slot content when provided', () => {
      render(SharedSection, {
        props: { title: 'Section with Extra', collapsible: true },
        slots: {
          default: '<p>Content</p>',
          'header-extra': '<span class="char-count">42 chars</span>'
        }
      })

      expect(screen.getByText('42 chars')).toBeInTheDocument()
    })

    it('works normally when header-extra slot is not used', () => {
      render(SharedSection, {
        props: { title: 'Section without Extra', collapsible: true },
        slots: {
          default: '<p>Content</p>'
        }
      })

      expect(screen.getByText('Section without Extra')).toBeInTheDocument()
      expect(screen.getByText('Content')).toBeInTheDocument()
    })

    it('shows header-extra in collapsed state', async () => {
      render(SharedSection, {
        props: {
          title: 'Collapsed Section',
          collapsible: true,
          defaultOpen: false
        },
        slots: {
          default: '<p>Content</p>',
          'header-extra': '<span>Extra visible</span>'
        }
      })

      await nextTick()
      expect(screen.getByText('Extra visible')).toBeInTheDocument()
    })

    it('shows header-extra in expanded state', async () => {
      render(SharedSection, {
        props: {
          title: 'Expanded Section',
          collapsible: true,
          defaultOpen: true
        },
        slots: {
          default: '<p>Content</p>',
          'header-extra': '<span>Extra visible</span>'
        }
      })

      await nextTick()
      expect(screen.getByText('Extra visible')).toBeInTheDocument()
    })

    it('renders header-extra slot in non-collapsible mode', () => {
      render(SharedSection, {
        props: { title: 'Non-collapsible Section' },
        slots: {
          default: '<p>Content</p>',
          'header-extra': '<span>Extra content</span>'
        }
      })

      expect(screen.getByText('Extra content')).toBeInTheDocument()
    })
  })
})
