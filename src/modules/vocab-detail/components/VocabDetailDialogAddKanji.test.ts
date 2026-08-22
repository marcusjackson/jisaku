/**
 * Tests for VocabDetailDialogAddKanji component
 *
 * Note: Uses BaseDialog which renders via portal.
 * Tests use stubs to avoid portal issues.
 * Full behavior is tested via E2E tests.
 */

import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import VocabDetailDialogAddKanji from './VocabDetailDialogAddKanji.vue'

import type { Kanji } from '@/api/kanji'

function createTestKanji(overrides: Partial<Kanji> = {}): Kanji {
  return {
    id: 1,
    character: '水',
    shortMeaning: 'water',
    strokeCount: 4,
    jlptLevel: null,
    joyoLevel: null,
    kanjiKenteiLevel: null,
    searchKeywords: null,
    radicalId: null,
    strokeDiagramImage: null,
    strokeGifImage: null,
    notesEtymology: null,
    notesSemantic: null,
    notesEducationMnemonics: null,
    notesPersonal: null,
    identifier: null,
    radicalStrokeCount: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides
  }
}

describe('VocabDetailDialogAddKanji', () => {
  const mockKanji = [
    createTestKanji(),
    createTestKanji({ id: 2, character: '火', shortMeaning: 'fire' })
  ]

  function mountDialog(props = {}, modelValue = true) {
    return mount(VocabDetailDialogAddKanji, {
      props: {
        open: modelValue,
        'onUpdate:open': (...args: unknown[]) => {
          void args
        },
        allKanji: mockKanji,
        excludedKanjiIds: [5],
        ...props
      },
      global: {
        stubs: {
          BaseDialog: {
            props: ['open', 'title', 'description'],
            template: `
              <div v-if="open" role="dialog" data-testid="dialog">
                <h2>{{ title }}</h2>
                <slot />
              </div>
            `
          },
          SharedEntitySearch: {
            props: [
              'entityType',
              'options',
              'excludeIds',
              'placeholder',
              'label'
            ],
            emits: ['select', 'createNew'],
            template: `
              <div data-testid="entity-search">
                <span>Options: {{ options.length }}</span>
                <button data-testid="select-first" @click="$emit('select', options[0])">Select</button>
                <button data-testid="create-new" @click="$emit('createNew', '新')">Create New</button>
              </div>
            `
          },
          SharedQuickCreateKanji: {
            props: ['open', 'initialCharacter'],
            emits: ['update:open', 'create', 'cancel'],
            template: `
              <div v-if="open" data-testid="quick-create-dialog">
                <button data-testid="quick-create-submit" @click="$emit('create', { character: '新', shortMeaning: 'new' })">Create</button>
              </div>
            `
          }
        }
      }
    })
  }

  it('renders dialog with correct title when open', () => {
    const wrapper = mountDialog()
    expect(wrapper.find('h2').text()).toBe('Add Kanji')
  })

  it('does not render when closed', () => {
    const wrapper = mountDialog({}, false)
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
  })

  it('renders entity search with kanji options', () => {
    const wrapper = mountDialog()
    expect(wrapper.text()).toContain('Options: 2')
  })

  it('emits select event with kanjiId on selection', async () => {
    const wrapper = mountDialog()
    await wrapper.find('[data-testid="select-first"]').trigger('click')

    expect(wrapper.emitted('select')).toBeTruthy()
    expect(wrapper.emitted('select')?.[0]).toEqual([1])
  })

  it('opens quick-create on create-new trigger', async () => {
    const wrapper = mountDialog()
    await wrapper.find('[data-testid="create-new"]').trigger('click')

    expect(wrapper.find('[data-testid="quick-create-dialog"]').exists()).toBe(
      true
    )
  })

  it('emits create event when quick-create submits', async () => {
    const wrapper = mountDialog()
    await wrapper.find('[data-testid="create-new"]').trigger('click')
    await wrapper.find('[data-testid="quick-create-submit"]').trigger('click')

    expect(wrapper.emitted('create')).toBeTruthy()
    expect(wrapper.emitted('create')?.[0]).toEqual([
      { character: '新', shortMeaning: 'new' }
    ])
  })

  it('passes excluded IDs to entity search', () => {
    const wrapper = mountDialog({ excludedKanjiIds: [1, 2] })
    expect(wrapper.find('[data-testid="entity-search"]').exists()).toBe(true)
  })
})
