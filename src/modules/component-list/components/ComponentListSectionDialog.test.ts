/**
 * Component List Section Dialog Tests
 *
 * Basic rendering tests for section dialog component.
 */

import { render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import ComponentListSectionDialog from './ComponentListSectionDialog.vue'

// Mock child component
vi.mock('./ComponentListDialogCreate.vue', () => ({
  default: { template: '<div data-testid="dialog-create"></div>' }
}))

// Mock base component
vi.mock('@/base/components', () => ({
  BaseDialog: {
    props: ['title', 'open'],
    template: `
      <div data-testid="base-dialog" :data-open="open">
        <h2>{{ title }}</h2>
        <slot />
      </div>
    `
  }
}))

describe('ComponentListSectionDialog', () => {
  const defaultProps = {
    open: false
  }

  it('renders the dialog with correct title', () => {
    render(ComponentListSectionDialog, {
      props: { ...defaultProps, open: true }
    })

    expect(screen.getByText('Add New Component')).toBeInTheDocument()
  })

  it('renders the create form', () => {
    render(ComponentListSectionDialog, {
      props: { ...defaultProps, open: true }
    })

    expect(screen.getByTestId('dialog-create')).toBeInTheDocument()
  })

  it('passes open state to dialog', () => {
    render(ComponentListSectionDialog, {
      props: { ...defaultProps, open: true }
    })

    const dialog = screen.getByTestId('base-dialog')
    expect(dialog).toHaveAttribute('data-open', 'true')
  })
})
