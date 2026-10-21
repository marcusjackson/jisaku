/**
 * ComponentDetailSectionHeadline Tests
 *
 * Tests for the headline section component.
 */

import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';

import ComponentDetailSectionHeadline from './ComponentDetailSectionHeadline.vue';

import type { Component } from '@/api/component/component-types';

// Mock vue-router
vi.mock('vue-router', () => ({
  RouterLink: {
    name: 'RouterLink',
    template: '<a><slot /></a>',
    props: ['to'],
  },
}));

const saveData = {
  character: '水',
  shortMeaning: 'water',
  searchKeywords: null,
};

/** Minimal dialog: visible while open, and saves with fixed data from its Save button. */
const DialogHeadlineStub = {
  name: 'ComponentDetailDialogHeadline',
  props: ['open', 'character', 'shortMeaning', 'searchKeywords'],
  emits: ['update:open', 'save'],
  setup: () => ({ saveData }),
  template: `<div v-if="open" data-testid="headline-dialog">
    <button type="button" @click="$emit('save', saveData)">Save</button>
  </div>`,
};

const mockComponent: Component = {
  id: 1,
  character: '氵',
  shortMeaning: 'water',
  searchKeywords: 'mizu, sanzui',
  strokeCount: 3,
  sourceKanjiId: null,
  description: null,
  canBeRadical: true,
  kangxiNumber: 85,
  kangxiMeaning: 'water',
  radicalNameJapanese: 'さんずい',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('ComponentDetailSectionHeadline', () => {
  const createWrapper = (props = {}) => {
    return mount(ComponentDetailSectionHeadline, {
      props: {
        component: mockComponent,
        save: vi.fn(() => true),
        ...props,
      },
      global: {
        stubs: {
          SharedBackButton: true,
          SharedSearchKeywordsIndicator: true,
          ComponentDetailDialogHeadline: DialogHeadlineStub,
        },
      },
    });
  };

  it('renders component character', () => {
    const wrapper = createWrapper();
    expect(wrapper.text()).toContain('氵');
  });

  it('renders short meaning when provided', () => {
    const wrapper = createWrapper();
    expect(wrapper.text()).toContain('water');
  });

  it('does not render short meaning when null', () => {
    const wrapper = createWrapper({
      component: { ...mockComponent, shortMeaning: null },
    });
    expect(wrapper.find('[data-testid="component-short-meaning"]').exists()).toBe(false);
  });

  it('renders edit button', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('[aria-label="Edit headline"]').exists()).toBe(true);
  });

  it('renders back button', () => {
    const wrapper = createWrapper();
    expect(wrapper.findComponent({ name: 'SharedBackButton' }).exists()).toBe(true);
  });

  it('renders search keywords indicator', () => {
    const wrapper = createWrapper();
    expect(wrapper.findComponent({ name: 'SharedSearchKeywordsIndicator' }).exists()).toBe(true);
  });

  describe('closing the dialog', () => {
    async function openAndSave(save: () => boolean) {
      const wrapper = createWrapper({ save });
      expect(wrapper.find('[data-testid="headline-dialog"]').exists()).toBe(false);
      await wrapper.get('[aria-label="Edit headline"]').trigger('click');
      expect(wrapper.find('[data-testid="headline-dialog"]').exists()).toBe(true);
      await wrapper.get('[data-testid="headline-dialog"] button').trigger('click');
      return wrapper;
    }

    it('closes the dialog after a successful save', async () => {
      const save = vi.fn(() => true);
      const wrapper = await openAndSave(save);
      expect(save).toHaveBeenCalledWith(saveData);
      expect(wrapper.find('[data-testid="headline-dialog"]').exists()).toBe(false);
    });

    it('keeps the dialog open when the save fails', async () => {
      const save = vi.fn(() => false);
      const wrapper = await openAndSave(save);
      expect(save).toHaveBeenCalledWith(saveData);
      expect(wrapper.find('[data-testid="headline-dialog"]').exists()).toBe(true);
    });
  });
});
