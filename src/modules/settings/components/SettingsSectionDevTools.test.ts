/**
 * SettingsSectionDevTools Tests
 */

import { defineComponent } from 'vue'

import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import SettingsSectionDevTools from './SettingsSectionDevTools.vue'

// Mock BaseButton
vi.mock('@/base/components', async (importOriginal) => {
  const original = await importOriginal<Record<string, unknown>>()
  const MockButton = defineComponent({
    name: 'BaseButton',
    props: {
      disabled: Boolean,
      loading: Boolean,
      variant: { type: String, default: 'primary' }
    },
    template: `<button :disabled="disabled"><slot /></button>`
  })
  return { ...original, BaseButton: MockButton }
})

// Mock SharedSection
vi.mock('@/shared/components/SharedSection.vue', () => ({
  default: {
    name: 'SharedSection',
    props: ['title', 'testId', 'collapsible', 'defaultOpen'],
    template: '<section><h2>{{ title }}</h2><slot /></section>'
  }
}))

// Mock SharedConfirmDialog
vi.mock('@/shared/components/SharedConfirmDialog.vue', () => ({
  default: {
    name: 'SharedConfirmDialog',
    props: ['open', 'title', 'description', 'confirmLabel', 'variant'],
    emits: ['update:open', 'confirm', 'cancel'],
    template: `
      <div v-if="open" role="dialog" :aria-label="title">
        <p>{{ description }}</p>
        <button @click="$emit('confirm')">{{ confirmLabel }}</button>
        <button @click="$emit('cancel')">Cancel</button>
      </div>
    `
  }
}))

describe('SettingsSectionDevTools', () => {
  it('renders the section title', () => {
    render(SettingsSectionDevTools, {
      props: {
        isSeeding: false,
        isClearing: false
      }
    })
    expect(screen.getByText('Developer Tools')).toBeInTheDocument()
  })

  it('displays seed and clear buttons', () => {
    render(SettingsSectionDevTools, {
      props: {
        isSeeding: false,
        isClearing: false
      }
    })
    expect(
      screen.getByRole('button', { name: /seed data/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /clear all data/i })
    ).toBeInTheDocument()
  })

  it('emits seedData when seed button is clicked', async () => {
    const user = userEvent.setup()
    const { emitted } = render(SettingsSectionDevTools, {
      props: {
        isSeeding: false,
        isClearing: false
      }
    })

    await user.click(screen.getByRole('button', { name: /seed data/i }))

    expect(emitted()['seed-data']).toBeTruthy()
  })

  it('shows clear confirmation dialog when clear button is clicked', async () => {
    const user = userEvent.setup()
    render(SettingsSectionDevTools, {
      props: {
        isSeeding: false,
        isClearing: false
      }
    })

    await user.click(screen.getByRole('button', { name: /clear all data/i }))

    expect(
      screen.getByRole('dialog', { name: /clear all data/i })
    ).toBeInTheDocument()
  })

  it('emits clearData after confirmation', async () => {
    const user = userEvent.setup()
    const { emitted } = render(SettingsSectionDevTools, {
      props: {
        isSeeding: false,
        isClearing: false
      }
    })

    await user.click(screen.getByRole('button', { name: /clear all data/i }))

    const buttons = screen.getAllByRole('button', { name: /clear all/i })
    const confirmButton = buttons[1]
    expect(confirmButton).toBeDefined()
    await user.click(confirmButton!)

    expect(emitted()['clear-data']).toBeTruthy()
  })

  it('disables seed button when clearing', () => {
    render(SettingsSectionDevTools, {
      props: {
        isSeeding: false,
        isClearing: true
      }
    })

    const seedButton = screen.getByRole('button', { name: /seed data/i })
    expect(seedButton).toBeDisabled()
  })

  it('disables clear button when seeding', () => {
    render(SettingsSectionDevTools, {
      props: {
        isSeeding: true,
        isClearing: false
      }
    })

    const clearButton = screen.getByRole('button', { name: /clear all data/i })
    expect(clearButton).toBeDisabled()
  })
})
