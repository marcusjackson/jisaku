/**
 * SettingsSectionDatabase Tests
 */

import { defineComponent } from 'vue'

import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import SettingsSectionDatabase from './SettingsSectionDatabase.vue'

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

describe('SettingsSectionDatabase', () => {
  it('renders the section title', () => {
    render(SettingsSectionDatabase, {
      props: {
        isExporting: false,
        isImporting: false,
        isClearing: false
      }
    })
    expect(screen.getByText('Data Management')).toBeInTheDocument()
  })

  it('displays export, import, and clear buttons', () => {
    render(SettingsSectionDatabase, {
      props: {
        isExporting: false,
        isImporting: false,
        isClearing: false
      }
    })
    expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /import/i })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /clear all data/i })
    ).toBeInTheDocument()
  })

  it('emits exportDatabase when export button is clicked', async () => {
    const user = userEvent.setup()
    const { emitted } = render(SettingsSectionDatabase, {
      props: {
        isExporting: false,
        isImporting: false,
        isClearing: false
      }
    })

    await user.click(screen.getByRole('button', { name: /export/i }))

    expect(emitted()['export-database']).toBeTruthy()
  })

  it('shows import confirmation dialog when file is selected', async () => {
    const user = userEvent.setup()
    const { container } = render(SettingsSectionDatabase, {
      props: {
        isExporting: false,
        isImporting: false,
        isClearing: false
      }
    })

    const fileInput = container.querySelector('input[type="file"]')
    expect(fileInput).toBeInTheDocument()

    const file = new File(['db content'], 'test.db', {
      type: 'application/x-sqlite3'
    })
    await user.upload(fileInput as HTMLElement, file)

    expect(
      screen.getByRole('dialog', { name: /import database/i })
    ).toBeInTheDocument()
  })

  it('emits importDatabase after confirmation', async () => {
    const user = userEvent.setup()
    const { container, emitted } = render(SettingsSectionDatabase, {
      props: {
        isExporting: false,
        isImporting: false,
        isClearing: false
      }
    })

    const fileInput = container.querySelector('input[type="file"]')
    const file = new File(['db content'], 'test.db', {
      type: 'application/x-sqlite3'
    })
    await user.upload(fileInput as HTMLElement, file)

    const buttons = screen.getAllByRole('button', { name: /import/i })
    const confirmButton = buttons[1]
    expect(confirmButton).toBeDefined()
    await user.click(confirmButton!)

    expect(emitted()['import-database']).toBeTruthy()
  })

  it('shows clear confirmation dialog when clear button is clicked', async () => {
    const user = userEvent.setup()
    render(SettingsSectionDatabase, {
      props: {
        isExporting: false,
        isImporting: false,
        isClearing: false
      }
    })

    await user.click(screen.getByRole('button', { name: /clear all data/i }))

    expect(
      screen.getByRole('dialog', { name: /clear all data/i })
    ).toBeInTheDocument()
  })

  it('emits clearDatabase after confirmation', async () => {
    const user = userEvent.setup()
    const { emitted } = render(SettingsSectionDatabase, {
      props: {
        isExporting: false,
        isImporting: false,
        isClearing: false
      }
    })

    await user.click(screen.getByRole('button', { name: /clear all data/i }))

    const buttons = screen.getAllByRole('button', { name: /clear all/i })
    const confirmButton = buttons[1]
    expect(confirmButton).toBeDefined()
    await user.click(confirmButton!)

    expect(emitted()['clear-database']).toBeTruthy()
  })
})
