/**
 * Tests for RadicalFormModal component
 *
 * Note: This component uses BaseDialog which has portal/teleport limitations in jsdom.
 * These tests verify basic structure. Full interaction testing is done via E2E tests.
 */

import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useComponentRepository } from '@/shared/composables/use-component-repository'

import RadicalFormModal from './RadicalFormModal.vue'

// Mock the component repository
vi.mock('@/shared/composables/use-component-repository')

describe('RadicalFormModal', () => {
  const mockCreate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useComponentRepository).mockReturnValue({
      getAll: vi.fn(),
      search: vi.fn(),
      getById: vi.fn(),
      getByCharacter: vi.fn(),
      create: mockCreate,
      update: vi.fn(),
      remove: vi.fn(),
      getLinkedKanjiCount: vi.fn(),
      getLinkedKanjiIds: vi.fn()
    })
  })

  function mountModal(props: { open?: boolean } = {}) {
    return mount(RadicalFormModal, {
      props: { open: true, ...props },
      global: {
        stubs: {
          // Stub reka-ui Dialog components to avoid portal issues
          DialogRoot: { template: '<div><slot /></div>' },
          DialogPortal: {
            template: '<div data-testid="portal"><slot /></div>'
          },
          DialogOverlay: { template: '<div class="overlay" />' },
          DialogContent: {
            template: '<div role="dialog"><slot /></div>'
          },
          DialogTitle: { template: '<h2><slot /></h2>' },
          DialogDescription: { template: '<p><slot /></p>' },
          DialogClose: {
            template: '<button aria-label="Close"><slot /></button>'
          }
        }
      }
    })
  }

  it('renders dialog title', () => {
    const wrapper = mountModal({ open: true })
    expect(wrapper.text()).toContain('Create Radical')
  })

  it('renders dialog description', () => {
    const wrapper = mountModal({ open: true })
    expect(wrapper.text()).toContain('Add a new Kangxi radical to the database')
  })

  it('renders character input field', () => {
    const wrapper = mountModal({ open: true })
    expect(wrapper.find('input[name="character"]').exists()).toBe(true)
  })

  it('renders kangxi number input field', () => {
    const wrapper = mountModal({ open: true })
    expect(wrapper.find('input[name="kangxiNumber"]').exists()).toBe(true)
  })

  it('renders stroke count input field', () => {
    const wrapper = mountModal({ open: true })
    expect(wrapper.find('input[name="strokeCount"]').exists()).toBe(true)
  })

  it('renders kangxi meaning input field', () => {
    const wrapper = mountModal({ open: true })
    expect(wrapper.find('input[name="kangxiMeaning"]').exists()).toBe(true)
  })

  it('renders radical name japanese input field', () => {
    const wrapper = mountModal({ open: true })
    expect(wrapper.find('input[name="radicalNameJapanese"]').exists()).toBe(
      true
    )
  })

  it('renders cancel button', () => {
    const wrapper = mountModal({ open: true })
    const buttons = wrapper.findAll('button')
    const buttonTexts = buttons.map((b) => b.text())
    expect(buttonTexts).toContain('Cancel')
  })

  it('renders create radical button', () => {
    const wrapper = mountModal({ open: true })
    const buttons = wrapper.findAll('button')
    const buttonTexts = buttons.map((b) => b.text())
    expect(buttonTexts).toContain('Create Radical')
  })

  it('has form element with submit handler', () => {
    const wrapper = mountModal({ open: true })
    const form = wrapper.find('form')
    expect(form.exists()).toBe(true)
  })

  it('has submit button with correct type', () => {
    const wrapper = mountModal({ open: true })
    const submitButton = wrapper.find('button[type="submit"]')
    expect(submitButton.exists()).toBe(true)
    expect(submitButton.text()).toContain('Create Radical')
  })

  it('has cancel button that is not submit type', () => {
    const wrapper = mountModal({ open: true })
    const cancelButton = wrapper.find('button[type="button"]')
    expect(cancelButton.exists()).toBe(true)
  })

  it('renders with proper class names for styling', () => {
    const wrapper = mountModal({ open: true })
    expect(wrapper.find('.radical-form-modal').exists()).toBe(true)
  })
})
