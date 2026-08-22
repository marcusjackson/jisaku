/**
 * Tests for VocabDetailSectionKanjiBreakdown component.
 *
 * Uses stubs for child components to test orchestration logic.
 */

import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import VocabDetailSectionKanjiBreakdown from './VocabDetailSectionKanjiBreakdown.vue'

import type { Kanji } from '@/api/kanji'
import type { VocabKanjiWithKanji } from '@/api/vocabulary'

// =============================================================================
// Test data factories
// =============================================================================

function createTestKanji(overrides: Partial<Kanji> = {}): Kanji {
  return {
    id: 1,
    character: '明',
    shortMeaning: 'bright',
    strokeCount: 8,
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

function createTestVocabKanji(
  overrides: Partial<VocabKanjiWithKanji> = {}
): VocabKanjiWithKanji {
  return {
    id: 10,
    vocabId: 1,
    kanjiId: 1,
    analysisNotes: null,
    displayOrder: 0,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    kanji: createTestKanji(),
    ...overrides
  }
}

// =============================================================================
// Stubs
// =============================================================================

const SharedSectionStub = {
  name: 'SharedSection',
  template: `<section :data-testid="testId" :data-state="defaultOpen ? 'open' : 'closed'">
    <h2>{{ title }}</h2>
    <div class="actions"><slot name="actions" :isOpen="defaultOpen" /></div>
    <div v-if="defaultOpen" class="content"><slot /></div>
  </section>`,
  props: ['title', 'collapsible', 'defaultOpen', 'testId']
}

const VocabDetailKanjiBreakdownItemStub = {
  name: 'VocabDetailKanjiBreakdownItem',
  template: `<div class="breakdown-item-stub" :data-testid="'breakdown-item-' + vocabKanji.id">
    {{ vocabKanji.kanji.character }}
    <button @click="$emit('edit')">Edit</button>
    <button v-if="isDestructiveMode" @click="$emit('delete')">Delete</button>
    <button @click="$emit('move-up')">Up</button>
    <button @click="$emit('move-down')">Down</button>
  </div>`,
  props: ['vocabKanji', 'index', 'total', 'isDestructiveMode']
}

const VocabDetailDialogAddKanjiStub = {
  name: 'VocabDetailDialogAddKanji',
  template: `<div v-if="open" data-testid="dialog-add-kanji">
    <button @click="$emit('select', 999)">Select</button>
    <button @click="$emit('create', { character: '新', shortMeaning: 'new' })">Create</button>
  </div>`,
  props: ['open', 'allKanji', 'excludedKanjiIds']
}

const VocabDetailDialogEditKanjiNotesStub = {
  name: 'VocabDetailDialogEditKanjiNotes',
  template: `<div v-if="open" data-testid="dialog-edit-notes">
    <button @click="$emit('submit', { id: vocabKanji?.id, notes: 'updated' })">Save</button>
    <button @click="$emit('cancel')">Cancel</button>
  </div>`,
  props: ['open', 'vocabKanji']
}

const SharedConfirmDialogStub = {
  name: 'SharedConfirmDialog',
  template: `<div v-if="open" data-testid="confirm-dialog">
    <button @click="$emit('confirm')">Confirm</button>
    <button @click="$emit('cancel')">Cancel Delete</button>
  </div>`,
  props: ['open', 'title', 'description', 'confirmLabel', 'variant']
}

// =============================================================================
// Test setup
// =============================================================================

describe('VocabDetailSectionKanjiBreakdown', () => {
  const createWrapper = (props = {}) => {
    return mount(VocabDetailSectionKanjiBreakdown, {
      props: {
        kanjiBreakdown: [],
        allKanji: [],
        isDestructiveMode: false,
        ...props
      },
      global: {
        stubs: {
          SharedSection: SharedSectionStub,
          VocabDetailKanjiBreakdownItem: VocabDetailKanjiBreakdownItemStub,
          VocabDetailDialogAddKanji: VocabDetailDialogAddKanjiStub,
          VocabDetailDialogEditKanjiNotes: VocabDetailDialogEditKanjiNotesStub,
          SharedConfirmDialog: SharedConfirmDialogStub
        }
      }
    })
  }

  describe('section structure', () => {
    it('renders with Kanji Breakdown title', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('h2').text()).toBe('Kanji Breakdown')
    })

    it('renders with correct test id', () => {
      const wrapper = createWrapper()
      expect(
        wrapper.find('[data-testid="vocab-detail-kanji-breakdown"]').exists()
      ).toBe(true)
    })
  })

  describe('collapsible behavior', () => {
    it('defaults to open when items exist', () => {
      const wrapper = createWrapper({
        kanjiBreakdown: [createTestVocabKanji()]
      })
      const section = wrapper.find(
        '[data-testid="vocab-detail-kanji-breakdown"]'
      )
      expect(section.attributes('data-state')).toBe('open')
    })

    it('defaults to closed when items are empty', () => {
      const wrapper = createWrapper({ kanjiBreakdown: [] })
      const section = wrapper.find(
        '[data-testid="vocab-detail-kanji-breakdown"]'
      )
      expect(section.attributes('data-state')).toBe('closed')
    })
  })

  describe('empty state', () => {
    it('has no breakdown items when list is empty', () => {
      const wrapper = createWrapper({ kanjiBreakdown: [] })
      expect(wrapper.findAll('.breakdown-item-stub').length).toBe(0)
    })
  })

  describe('breakdown list', () => {
    it('renders item for each entry', () => {
      const wrapper = createWrapper({
        kanjiBreakdown: [
          createTestVocabKanji({ id: 10 }),
          createTestVocabKanji({
            id: 20,
            kanjiId: 2,
            kanji: createTestKanji({ id: 2, character: '日' })
          })
        ]
      })
      expect(wrapper.findAll('.breakdown-item-stub').length).toBe(2)
    })
  })

  describe('add button', () => {
    it('shows add button in actions slot when section open', () => {
      const wrapper = createWrapper({
        kanjiBreakdown: [createTestVocabKanji()]
      })
      const actionsSlot = wrapper.find('.actions')
      expect(actionsSlot.text()).toContain('Add Kanji')
    })
  })

  describe('add kanji flow', () => {
    it('opens add dialog when add button is clicked', async () => {
      const wrapper = createWrapper({
        kanjiBreakdown: [createTestVocabKanji()]
      })

      await wrapper.find('.actions button').trigger('click')
      await flushPromises()

      expect(wrapper.find('[data-testid="dialog-add-kanji"]').exists()).toBe(
        true
      )
    })

    it('emits add event when kanji is selected from dialog', async () => {
      const wrapper = createWrapper({
        kanjiBreakdown: [createTestVocabKanji()]
      })
      await wrapper.find('.actions button').trigger('click')
      await flushPromises()

      await wrapper
        .find('[data-testid="dialog-add-kanji"] button')
        .trigger('click')

      expect(wrapper.emitted('add')).toBeTruthy()
      expect(wrapper.emitted('add')?.[0]).toEqual([999])
    })

    it('emits create event when kanji is quick-created', async () => {
      const wrapper = createWrapper({
        kanjiBreakdown: [createTestVocabKanji()]
      })
      await wrapper.find('.actions button').trigger('click')
      await flushPromises()

      const buttons = wrapper.findAll('[data-testid="dialog-add-kanji"] button')
      await buttons[1]!.trigger('click')

      expect(wrapper.emitted('create')).toBeTruthy()
      expect(wrapper.emitted('create')?.[0]).toEqual([
        { character: '新', shortMeaning: 'new' }
      ])
    })
  })

  describe('edit flow', () => {
    it('opens edit dialog and emits update-notes on submit', async () => {
      const item = createTestVocabKanji({ id: 10 })
      const wrapper = createWrapper({
        kanjiBreakdown: [item]
      })

      // Click edit on item
      const editBtn = wrapper.find('[data-testid="breakdown-item-10"] button')
      await editBtn.trigger('click')
      await flushPromises()

      // Find and click save in edit dialog
      expect(wrapper.find('[data-testid="dialog-edit-notes"]').exists()).toBe(
        true
      )
      await wrapper
        .find('[data-testid="dialog-edit-notes"] button')
        .trigger('click')

      expect(wrapper.emitted('update-notes')).toBeTruthy()
      expect(wrapper.emitted('update-notes')?.[0]).toEqual([10, 'updated'])
    })
  })

  describe('reorder', () => {
    it('emits reorder with swapped IDs on move-up', async () => {
      const wrapper = createWrapper({
        kanjiBreakdown: [
          createTestVocabKanji({ id: 10 }),
          createTestVocabKanji({
            id: 20,
            kanjiId: 2,
            kanji: createTestKanji({ id: 2, character: '日' })
          })
        ]
      })

      // Click "Up" on second item
      const secondItem = wrapper.find('[data-testid="breakdown-item-20"]')
      const upBtn = secondItem.findAll('button').find((b) => b.text() === 'Up')
      await upBtn!.trigger('click')

      expect(wrapper.emitted('reorder')).toBeTruthy()
      expect(wrapper.emitted('reorder')?.[0]).toEqual([[20, 10]])
    })

    it('emits reorder with swapped IDs on move-down', async () => {
      const wrapper = createWrapper({
        kanjiBreakdown: [
          createTestVocabKanji({ id: 10 }),
          createTestVocabKanji({
            id: 20,
            kanjiId: 2,
            kanji: createTestKanji({ id: 2, character: '日' })
          })
        ]
      })

      // Click "Down" on first item
      const firstItem = wrapper.find('[data-testid="breakdown-item-10"]')
      const downBtn = firstItem
        .findAll('button')
        .find((b) => b.text() === 'Down')
      await downBtn!.trigger('click')

      expect(wrapper.emitted('reorder')).toBeTruthy()
      expect(wrapper.emitted('reorder')?.[0]).toEqual([[20, 10]])
    })
  })

  describe('delete flow', () => {
    it('opens confirm dialog in destructive mode and emits remove', async () => {
      const wrapper = createWrapper({
        kanjiBreakdown: [createTestVocabKanji({ id: 10 })],
        isDestructiveMode: true
      })

      // Click delete on item
      const deleteBtn = wrapper
        .find('[data-testid="breakdown-item-10"]')
        .findAll('button')
        .find((b) => b.text() === 'Delete')
      await deleteBtn!.trigger('click')
      await flushPromises()

      expect(wrapper.find('[data-testid="confirm-dialog"]').exists()).toBe(true)

      // Confirm deletion
      await wrapper
        .find('[data-testid="confirm-dialog"] button')
        .trigger('click')

      expect(wrapper.emitted('remove')).toBeTruthy()
      expect(wrapper.emitted('remove')?.[0]).toEqual([10])
    })
  })
})
