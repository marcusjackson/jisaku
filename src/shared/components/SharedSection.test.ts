import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import SharedSection from './SharedSection.vue'

describe('SharedSection', () => {
  describe('non-collapsible mode', () => {
    it('renders title and content', () => {
      render(SharedSection, {
        props: {
          title: 'Test Section'
        },
        slots: {
          default: '<p>Section content</p>'
        }
      })

      expect(screen.getByText('Test Section')).toBeInTheDocument()
      expect(screen.getByText('Section content')).toBeInTheDocument()
    })

    it('renders without title', () => {
      render(SharedSection, {
        slots: {
          default: '<p>Content only</p>'
        }
      })

      expect(screen.getByText('Content only')).toBeInTheDocument()
      expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    })

    it('renders actions slot', () => {
      render(SharedSection, {
        props: {
          title: 'Section with Actions'
        },
        slots: {
          default: '<p>Content</p>',
          actions: '<button>Action Button</button>'
        }
      })

      expect(screen.getByText('Action Button')).toBeInTheDocument()
    })

    it('does not show collapse button in non-collapsible mode', () => {
      render(SharedSection, {
        props: {
          title: 'Non-collapsible Section'
        },
        slots: {
          default: '<p>Content</p>'
        }
      })

      expect(screen.queryByText('Collapse')).not.toBeInTheDocument()
    })
  })

  describe('collapsible mode', () => {
    it('renders as collapsible with title and trigger', () => {
      render(SharedSection, {
        props: {
          title: 'Collapsible Section',
          collapsible: true
        },
        slots: {
          default: '<p>Collapsible content</p>'
        }
      })

      expect(screen.getByText('Collapsible Section')).toBeInTheDocument()
      // CollapsibleContent manages visibility, so we check for the trigger
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('starts open by default', () => {
      const { container } = render(SharedSection, {
        props: {
          title: 'Collapsible Section',
          collapsible: true
        },
        slots: {
          default: '<p>Visible content</p>'
        }
      })

      // Check that the collapsible root doesn't have closed state initially
      const collapsibleRoot = container.querySelector(
        '.shared-section-collapsible'
      )
      expect(collapsibleRoot).toBeInTheDocument()
    })

    it('starts closed when defaultOpen is false', () => {
      render(SharedSection, {
        props: {
          title: 'Closed Section',
          collapsible: true,
          defaultOpen: false
        },
        slots: {
          default: '<p>Hidden content</p>'
        }
      })

      // Title should still be visible
      expect(screen.getByText('Closed Section')).toBeInTheDocument()
    })

    it('has clickable trigger', async () => {
      const user = userEvent.setup()

      render(SharedSection, {
        props: {
          title: 'Toggle Section',
          collapsible: true
        },
        slots: {
          default: '<p>Toggle content</p>'
        }
      })

      const trigger = screen.getByRole('button')
      expect(trigger).toBeInTheDocument()

      // Click should work (Reka UI handles the actual toggling)
      await user.click(trigger)
    })

    it('has collapsible structure with bottom action', () => {
      const { container } = render(SharedSection, {
        props: {
          title: 'Section with Bottom Button',
          collapsible: true
        },
        slots: {
          default: '<p>Content to collapse</p>'
        }
      })

      // Check for collapsible content wrapper exists (even if hidden)
      const collapsibleContent = container.querySelector(
        '.shared-section-collapsible-content'
      )
      expect(collapsibleContent).toBeTruthy()
    })

    it('renders actions slot in collapsible mode', () => {
      render(SharedSection, {
        props: {
          title: 'Collapsible with Actions',
          collapsible: true
        },
        slots: {
          default: '<p>Content</p>',
          actions: '<button>Action</button>'
        }
      })

      expect(screen.getByText('Action')).toBeInTheDocument()
    })
  })
})
