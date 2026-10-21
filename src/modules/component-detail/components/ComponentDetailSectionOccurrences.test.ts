/**
 * Tests for ComponentDetailSectionOccurrences component.
 *
 * TDD tests for the Kanji Occurrences section wrapper.
 */

import { flushPromises, mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';

import ComponentDetailSectionOccurrences from './ComponentDetailSectionOccurrences.vue';

import type { OccurrenceWithKanji } from '@/api/component';
import type { Kanji } from '@/api/kanji';
import type { PositionType } from '@/api/position/position-types';

// Factory functions for creating test data
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
    ...overrides,
  };
}

function createTestOccurrence(overrides: Partial<OccurrenceWithKanji> = {}): OccurrenceWithKanji {
  return {
    id: 1,
    kanjiId: 1,
    componentId: 100,
    componentFormId: null,
    positionTypeId: null,
    isRadical: false,
    analysisNotes: null,
    displayOrder: 0,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    kanji: createTestKanji(),
    position: null,
    ...overrides,
  };
}

function createTestPositionType(overrides: Partial<PositionType> = {}): PositionType {
  return {
    id: 1,
    positionName: 'hen',
    nameJapanese: '偏',
    nameEnglish: 'left',
    description: null,
    displayOrder: 0,
    createdAt: '2024-01-01T00:00:00',
    updatedAt: '2024-01-01T00:00:00',
    ...overrides,
  };
}

// Stubs
const SharedSectionStub = {
  name: 'SharedSection',
  template: `<section :data-testid="testId" :data-state="defaultOpen ? 'open' : 'closed'">
    <h2>{{ title }}</h2>
    <div class="actions"><slot name="actions" :isOpen="defaultOpen" /></div>
    <div class="content"><slot /></div>
  </section>`,
  props: ['title', 'collapsible', 'defaultOpen', 'testId'],
};

const ComponentDetailOccurrenceItemStub = {
  name: 'ComponentDetailOccurrenceItem',
  template: `<div class="occurrence-item-stub" :data-testid="'occurrence-item-' + occurrence.id">
    {{ occurrence.kanji.character }}
    <button @click="$emit('edit')">Edit</button>
    <button v-if="isDestructiveMode" @click="$emit('delete')">Delete</button>
    <button @click="$emit('move-up')">Up</button>
    <button @click="$emit('move-down')">Down</button>
  </div>`,
  props: ['occurrence', 'forms', 'index', 'total', 'isDestructiveMode'],
};

const ComponentDetailDialogAddKanjiStub = {
  name: 'ComponentDetailDialogAddKanji',
  template: `<div v-if="open" data-testid="dialog-add-kanji" :data-excluded="excludedKanjiIds.join(',')">
    <button @click="$emit('select', 999)">Select</button>
    <button @click="$emit('create', { character: '新', shortMeaning: 'new' })">Create</button>
  </div>`,
  props: ['open', 'allKanji', 'excludedKanjiIds'],
};

const ComponentDetailDialogEditOccurrenceStub = {
  name: 'ComponentDetailDialogEditOccurrence',
  template: `<div v-if="open" data-testid="dialog-edit-occurrence">
    <button @click="$emit('submit', { positionTypeId: null, componentFormId: null, isRadical: false, analysisNotes: null })">Save</button>
    <button @click="$emit('cancel')">Cancel</button>
  </div>`,
  props: ['open', 'occurrence', 'positionTypes', 'forms'],
};

const SharedConfirmDialogStub = {
  name: 'SharedConfirmDialog',
  template: `<div v-if="open" data-testid="confirm-dialog">
    <button @click="$emit('confirm')">Confirm</button>
    <button @click="$emit('cancel')">Cancel Delete</button>
  </div>`,
  props: ['open', 'title', 'description', 'confirmLabel', 'variant'],
};

describe('ComponentDetailSectionOccurrences', () => {
  const createWrapper = (props = {}) => {
    return mount(ComponentDetailSectionOccurrences, {
      props: {
        occurrences: [],
        componentId: 100,
        forms: [],
        positionTypes: [],
        isDestructiveMode: false,
        allKanji: [],
        add: vi.fn(() => true),
        create: vi.fn(() => true),
        update: vi.fn(() => true),
        ...props,
      },
      global: {
        stubs: {
          SharedSection: SharedSectionStub,
          ComponentDetailOccurrenceItem: ComponentDetailOccurrenceItemStub,
          ComponentDetailDialogAddKanji: ComponentDetailDialogAddKanjiStub,
          ComponentDetailDialogEditOccurrence: ComponentDetailDialogEditOccurrenceStub,
          SharedConfirmDialog: SharedConfirmDialogStub,
        },
      },
    });
  };

  describe('section structure', () => {
    it('renders with Kanji Occurrences title', () => {
      const wrapper = createWrapper({ occurrences: [] });
      expect(wrapper.find('h2').text()).toBe('Kanji Occurrences');
    });

    it('renders with correct test id', () => {
      const wrapper = createWrapper({ occurrences: [] });
      expect(wrapper.find('[data-testid="component-detail-occurrences"]').exists()).toBe(true);
    });
  });

  describe('collapsible behavior', () => {
    it('defaults to open when occurrences array has items', () => {
      const wrapper = createWrapper({
        occurrences: [createTestOccurrence()],
      });
      const section = wrapper.find('[data-testid="component-detail-occurrences"]');
      expect(section.attributes('data-state')).toBe('open');
    });

    it('defaults to collapsed when occurrences array is empty', () => {
      const wrapper = createWrapper({ occurrences: [] });
      const section = wrapper.find('[data-testid="component-detail-occurrences"]');
      expect(section.attributes('data-state')).toBe('closed');
    });
  });

  describe('empty state', () => {
    it('shows empty state message when no occurrences', () => {
      const wrapper = createWrapper({ occurrences: [] });
      expect(wrapper.find('.empty-state').text()).toContain('No kanji linked yet');
    });
  });

  describe('occurrences list', () => {
    it('renders occurrence items for each occurrence', () => {
      const wrapper = createWrapper({
        occurrences: [createTestOccurrence({ id: 1 }), createTestOccurrence({ id: 2 })],
      });
      expect(wrapper.findAll('.occurrence-item-stub').length).toBe(2);
    });

    it('passes correct props to occurrence items', () => {
      const wrapper = createWrapper({
        occurrences: [createTestOccurrence({ id: 1 }), createTestOccurrence({ id: 2 })],
        isDestructiveMode: true,
      });

      const items = wrapper.findAll('.occurrence-item-stub');
      expect(items.length).toBe(2);
      // Delete buttons should be visible in destructive mode
      expect(items[0]!.findAll('button').some((b) => b.text() === 'Delete')).toBe(true);
    });
  });

  describe('add button', () => {
    it('shows add button in actions slot', () => {
      const wrapper = createWrapper({
        occurrences: [createTestOccurrence()],
      });
      const actionsSlot = wrapper.find('.actions');
      expect(actionsSlot.text()).toContain('Add Kanji');
    });
  });

  describe('add kanji flow', () => {
    it('opens add dialog when add button is clicked', async () => {
      const wrapper = createWrapper({
        occurrences: [createTestOccurrence()],
      });

      await wrapper.find('.actions button').trigger('click');
      await flushPromises();

      expect(wrapper.find('[data-testid="dialog-add-kanji"]').exists()).toBe(true);
    });

    it('closes add dialog and calls add when it saves', async () => {
      const add = vi.fn(() => true);
      const wrapper = createWrapper({
        occurrences: [createTestOccurrence()],
        allKanji: [createTestKanji()],
        add,
      });

      // Open add dialog
      await wrapper.find('.actions button').trigger('click');
      await flushPromises();

      // Select a kanji
      const dialog = wrapper.find('[data-testid="dialog-add-kanji"]');
      await dialog.find('button:first-child').trigger('click');
      await flushPromises();

      expect(add).toHaveBeenCalledWith(999);
      expect(wrapper.find('[data-testid="dialog-add-kanji"]').exists()).toBe(false);
    });

    it('keeps add dialog open when add fails', async () => {
      const add = vi.fn(() => false);
      const wrapper = createWrapper({
        occurrences: [createTestOccurrence()],
        add,
      });
      await wrapper.find('.actions button').trigger('click');
      await flushPromises();

      await wrapper.find('[data-testid="dialog-add-kanji"] button:first-child').trigger('click');
      await flushPromises();

      expect(add).toHaveBeenCalledWith(999);
      expect(wrapper.find('[data-testid="dialog-add-kanji"]').exists()).toBe(true);
    });

    it('keeps add dialog open when create fails', async () => {
      const create = vi.fn(() => false);
      const wrapper = createWrapper({
        occurrences: [createTestOccurrence()],
        create,
      });
      await wrapper.find('.actions button').trigger('click');
      await flushPromises();

      await wrapper.findAll('[data-testid="dialog-add-kanji"] button')[1]!.trigger('click');
      await flushPromises();

      expect(create).toHaveBeenCalled();
      expect(wrapper.find('[data-testid="dialog-add-kanji"]').exists()).toBe(true);
    });

    it('closes add dialog when create saves', async () => {
      const create = vi.fn(() => true);
      const wrapper = createWrapper({
        occurrences: [createTestOccurrence()],
        allKanji: [createTestKanji()],
        create,
      });

      // Open add dialog
      await wrapper.find('.actions button').trigger('click');
      await flushPromises();

      // Create new kanji
      const dialog = wrapper.find('[data-testid="dialog-add-kanji"]');
      await dialog.findAll('button')[1]!.trigger('click');
      await flushPromises();

      expect(create).toHaveBeenCalled();
      expect(wrapper.find('[data-testid="dialog-add-kanji"]').exists()).toBe(false);
    });
  });

  describe('edit occurrence flow', () => {
    it('opens edit dialog when edit button clicked', async () => {
      const occurrence = createTestOccurrence({ id: 42 });
      const wrapper = createWrapper({
        occurrences: [occurrence],
        positionTypes: [createTestPositionType()],
      });

      // Click edit on the occurrence item
      await wrapper.find('.occurrence-item-stub button:first-child').trigger('click');
      await flushPromises();

      expect(wrapper.find('[data-testid="dialog-edit-occurrence"]').exists()).toBe(true);
    });

    it('closes edit dialog and calls update when it saves', async () => {
      const update = vi.fn<(id: number) => boolean>(() => true);
      const occurrence = createTestOccurrence({ id: 42 });
      const wrapper = createWrapper({
        occurrences: [occurrence],
        positionTypes: [createTestPositionType()],
        update,
      });

      // Click edit
      await wrapper.find('.occurrence-item-stub button:first-child').trigger('click');
      await flushPromises();

      // Submit the dialog
      const dialog = wrapper.find('[data-testid="dialog-edit-occurrence"]');
      await dialog.find('button:first-child').trigger('click');
      await flushPromises();

      expect(update.mock.calls[0]![0]).toBe(42);
      expect(wrapper.find('[data-testid="dialog-edit-occurrence"]').exists()).toBe(false);
    });

    it('keeps edit dialog open when update fails', async () => {
      const update = vi.fn(() => false);
      const wrapper = createWrapper({
        occurrences: [createTestOccurrence({ id: 42 })],
        positionTypes: [createTestPositionType()],
        update,
      });
      await wrapper.find('.occurrence-item-stub button:first-child').trigger('click');
      await flushPromises();

      await wrapper
        .find('[data-testid="dialog-edit-occurrence"] button:first-child')
        .trigger('click');
      await flushPromises();

      expect(update).toHaveBeenCalled();
      expect(wrapper.find('[data-testid="dialog-edit-occurrence"]').exists()).toBe(true);
    });
  });

  describe('delete occurrence flow', () => {
    it('opens confirmation dialog when delete clicked', async () => {
      const occurrence = createTestOccurrence({ id: 42 });
      const wrapper = createWrapper({
        occurrences: [occurrence],
        isDestructiveMode: true,
      });

      // Find and click delete button
      const deleteButton = wrapper
        .findAll('.occurrence-item-stub button')
        .find((b) => b.text() === 'Delete')!;
      await deleteButton.trigger('click');
      await flushPromises();

      expect(wrapper.find('[data-testid="confirm-dialog"]').exists()).toBe(true);
    });

    it('emits remove event when deletion is confirmed', async () => {
      const occurrence = createTestOccurrence({ id: 42 });
      const wrapper = createWrapper({
        occurrences: [occurrence],
        isDestructiveMode: true,
      });

      // Click delete
      const deleteButton = wrapper
        .findAll('.occurrence-item-stub button')
        .find((b) => b.text() === 'Delete')!;
      await deleteButton.trigger('click');
      await flushPromises();

      // Confirm deletion
      const dialog = wrapper.find('[data-testid="confirm-dialog"]');
      await dialog.find('button:first-child').trigger('click');
      await flushPromises();

      expect(wrapper.emitted('remove')).toBeDefined();
      expect(wrapper.emitted('remove')![0]).toEqual([42]);
    });
  });

  describe('reorder occurrences', () => {
    it('emits reorder event with swapped IDs when move-up clicked', async () => {
      const wrapper = createWrapper({
        occurrences: [
          createTestOccurrence({ id: 1 }),
          createTestOccurrence({ id: 2 }),
          createTestOccurrence({ id: 3 }),
        ],
      });

      // Click move up on second item
      const items = wrapper.findAll('.occurrence-item-stub');
      const upButton = items[1]!.findAll('button').find((b) => b.text() === 'Up')!;
      await upButton.trigger('click');
      await flushPromises();

      expect(wrapper.emitted('reorder')).toBeDefined();
      expect(wrapper.emitted('reorder')![0]).toEqual([[2, 1, 3]]);
    });

    it('emits reorder event with swapped IDs when move-down clicked', async () => {
      const wrapper = createWrapper({
        occurrences: [
          createTestOccurrence({ id: 1 }),
          createTestOccurrence({ id: 2 }),
          createTestOccurrence({ id: 3 }),
        ],
      });

      // Click move down on first item
      const items = wrapper.findAll('.occurrence-item-stub');
      const downButton = items[0]!.findAll('button').find((b) => b.text() === 'Down')!;
      await downButton.trigger('click');
      await flushPromises();

      expect(wrapper.emitted('reorder')).toBeDefined();
      expect(wrapper.emitted('reorder')![0]).toEqual([[2, 1, 3]]);
    });
  });

  describe('excluded kanji calculation', () => {
    it('passes excluded kanji IDs to add dialog', async () => {
      const wrapper = createWrapper({
        occurrences: [
          createTestOccurrence({ id: 1, kanjiId: 10 }),
          createTestOccurrence({ id: 2, kanjiId: 20 }),
        ],
        allKanji: [
          createTestKanji({ id: 10 }),
          createTestKanji({ id: 20 }),
          createTestKanji({ id: 30 }),
        ],
      });

      await wrapper.find('.actions button').trigger('click');
      await flushPromises();

      expect(wrapper.find('[data-testid="dialog-add-kanji"]').attributes('data-excluded')).toBe(
        '10,20'
      );
    });
  });
});
