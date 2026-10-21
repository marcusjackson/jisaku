/**
 * Tests for ComponentDetailDialogAddKanji component
 *
 * Note: Uses BaseDialog which renders via portal.
 * Tests use stubs to avoid portal issues.
 * E2E coverage: e2e/component-detail-occurrences.test.ts (open, link, quick create).
 */

import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import ComponentDetailDialogAddKanji from './ComponentDetailDialogAddKanji.vue';

import type { Kanji } from '@/api/kanji';

describe('ComponentDetailDialogAddKanji', () => {
  const mockKanji: Kanji[] = [
    {
      id: 1,
      character: '明',
      strokeCount: 8,
      shortMeaning: 'bright',
      searchKeywords: null,
      radicalId: null,
      jlptLevel: null,
      joyoLevel: null,
      kanjiKenteiLevel: null,
      strokeDiagramImage: null,
      strokeGifImage: null,
      notesEtymology: null,
      notesSemantic: null,
      notesEducationMnemonics: null,
      notesPersonal: null,
      identifier: null,
      radicalStrokeCount: null,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
    {
      id: 2,
      character: '暗',
      strokeCount: 13,
      shortMeaning: 'dark',
      searchKeywords: null,
      radicalId: null,
      jlptLevel: null,
      joyoLevel: null,
      kanjiKenteiLevel: null,
      strokeDiagramImage: null,
      strokeGifImage: null,
      notesEtymology: null,
      notesSemantic: null,
      notesEducationMnemonics: null,
      notesPersonal: null,
      identifier: null,
      radicalStrokeCount: null,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
  ];

  function mountDialog(props = {}, modelValue = true) {
    return mount(ComponentDetailDialogAddKanji, {
      props: {
        open: modelValue,
        'onUpdate:open': (...args: unknown[]) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          args;
        },
        allKanji: mockKanji,
        excludedKanjiIds: [],
        ...props,
      },
      global: {
        stubs: {
          BaseDialog: {
            props: ['open', 'title', 'description'],
            template: `
              <div v-if="open" role="dialog" data-testid="dialog">
                <h2>{{ title }}</h2>
                <p>{{ description }}</p>
                <slot />
              </div>
            `,
          },
          SharedEntitySearch: {
            props: ['entityType', 'options', 'excludeIds', 'placeholder', 'label'],
            emits: ['select', 'createNew'],
            template: `
              <div data-testid="entity-search">
                <span>{{ label }}</span>
                <span>Options: {{ options.length }}</span>
                <span>Excluded: {{ excludeIds.join(',') }}</span>
                <button data-testid="select-first" @click="$emit('select', options[0])">
                  Select First
                </button>
                <button data-testid="create-new" @click="$emit('createNew', 'test')">
                  Create New
                </button>
              </div>
            `,
          },
          SharedQuickCreateKanji: {
            props: ['open', 'initialCharacter'],
            emits: ['update:open', 'create', 'cancel'],
            template: `
              <div v-if="open" data-testid="quick-create-dialog">
                Quick Create: {{ initialCharacter }}
                <button data-testid="quick-create-submit" @click="$emit('create', { character: '新', shortMeaning: 'new', searchKeywords: null })">
                  Create
                </button>
                <button data-testid="quick-create-cancel" @click="$emit('cancel')">Cancel</button>
              </div>
            `,
          },
        },
      },
    });
  }

  it('renders dialog when open', () => {
    const wrapper = mountDialog();
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true);
  });

  it('does not render when closed', () => {
    const wrapper = mountDialog({}, false);
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false);
  });

  it('renders title', () => {
    const wrapper = mountDialog();
    expect(wrapper.find('h2').text()).toBe('Add Kanji');
  });

  it('renders description', () => {
    const wrapper = mountDialog();
    expect(wrapper.find('p').text()).toContain('Search for an existing kanji to link');
  });

  it('renders entity search component', () => {
    const wrapper = mountDialog();
    expect(wrapper.find('[data-testid="entity-search"]').exists()).toBe(true);
  });

  it('passes kanji options to entity search', () => {
    const wrapper = mountDialog();
    expect(wrapper.text()).toContain('Options: 2');
  });

  it('emits select when kanji is selected', async () => {
    const wrapper = mountDialog();
    const selectButton = wrapper.find('[data-testid="select-first"]');
    await selectButton.trigger('click');
    expect(wrapper.emitted('select')).toBeTruthy();
    expect(wrapper.emitted('select')?.[0]).toEqual([1]);
  });

  it('opens quick create when create new is clicked', async () => {
    const wrapper = mountDialog();
    const createButton = wrapper.find('[data-testid="create-new"]');
    await createButton.trigger('click');
    expect(wrapper.find('[data-testid="quick-create-dialog"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('Quick Create: test');
  });

  it('passes excluded IDs to entity search', () => {
    const wrapper = mountDialog({ excludedKanjiIds: [1, 2] });
    expect(wrapper.text()).toContain('Excluded: 1,2');
  });

  it('forwards the quick-create data as a create event', async () => {
    const wrapper = mountDialog();
    await wrapper.find('[data-testid="create-new"]').trigger('click');
    await wrapper.find('[data-testid="quick-create-submit"]').trigger('click');
    expect(wrapper.emitted('create')?.[0]).toEqual([
      { character: '新', shortMeaning: 'new', searchKeywords: null },
    ]);
  });

  it('closes quick create when it is cancelled', async () => {
    const wrapper = mountDialog();
    await wrapper.find('[data-testid="create-new"]').trigger('click');
    await wrapper.find('[data-testid="quick-create-cancel"]').trigger('click');
    expect(wrapper.find('[data-testid="quick-create-dialog"]').exists()).toBe(false);
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true);
  });

  it('closes quick create when the dialog closes', async () => {
    const wrapper = mountDialog();
    await wrapper.find('[data-testid="create-new"]').trigger('click');
    expect(wrapper.find('[data-testid="quick-create-dialog"]').exists()).toBe(true);

    await wrapper.setProps({ open: false });

    expect(wrapper.find('[data-testid="quick-create-dialog"]').exists()).toBe(false);
  });
});
