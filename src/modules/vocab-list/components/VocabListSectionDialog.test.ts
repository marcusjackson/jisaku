/**
 * VocabListSectionDialog Tests
 *
 * Note: Reka UI Dialog uses teleport/portal with limitations in jsdom.
 * Tests verify component structure; full rendering via E2E.
 */

import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import VocabListSectionDialog from './VocabListSectionDialog.vue'

// Mock vocabulary repository
vi.mock('@/api/vocabulary', () => ({
  useVocabularyRepository: () => ({
    create: vi.fn().mockReturnValue({ id: 1, word: 'test' }),
    getByWord: vi.fn().mockReturnValue(null)
  })
}))

// Mock toast
vi.mock('@/shared/composables', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn()
  })
}))

function mountDialog(props: Record<string, unknown> = {}) {
  return mount(VocabListSectionDialog, {
    props: {
      open: true,
      ...props
    },
    global: {
      stubs: {
        BaseDialog: {
          template: `
            <div v-if="open" role="dialog">
              <h2>{{ title }}</h2>
              <slot />
            </div>
          `,
          props: ['open', 'title', 'description']
        },
        VocabListDialogCreate: {
          template: '<div data-testid="dialog-create-form">Form</div>'
        }
      }
    }
  })
}

describe('VocabListSectionDialog', () => {
  it('renders dialog when open', () => {
    const wrapper = mountDialog({ open: true })
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true)
  })

  it('shows dialog title', () => {
    const wrapper = mountDialog({ open: true })
    expect(wrapper.find('h2').text()).toBe('Add New Vocabulary')
  })

  it('hides dialog when closed', () => {
    const wrapper = mountDialog({ open: false })
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
  })
})
