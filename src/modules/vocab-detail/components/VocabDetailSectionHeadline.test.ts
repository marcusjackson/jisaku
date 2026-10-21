/**
 * VocabDetailSectionHeadline Tests
 */

import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';

import VocabDetailSectionHeadline from './VocabDetailSectionHeadline.vue';

const mockVocab = {
  id: 1,
  word: '日本語',
  kana: 'にほんご',
  shortMeaning: 'Japanese language',
  searchKeywords: 'language nihongo',
  jlptLevel: 'N5' as const,
  isCommon: true,
  description: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('VocabDetailSectionHeadline', () => {
  it('displays word', () => {
    const wrapper = mount(VocabDetailSectionHeadline, {
      props: { vocab: mockVocab, save: () => true },
      global: {
        stubs: {
          VocabDetailDialogHeadline: true,
          SharedBackButton: true,
          SharedSearchKeywordsIndicator: true,
        },
      },
    });

    expect(wrapper.text()).toContain('日本語');
  });

  it('displays kana', () => {
    const wrapper = mount(VocabDetailSectionHeadline, {
      props: { vocab: mockVocab, save: () => true },
      global: {
        stubs: {
          VocabDetailDialogHeadline: true,
          SharedBackButton: true,
          SharedSearchKeywordsIndicator: true,
        },
      },
    });

    expect(wrapper.text()).toContain('にほんご');
  });

  it('marks word and kana as Japanese text', () => {
    const wrapper = mount(VocabDetailSectionHeadline, {
      props: { vocab: mockVocab, save: () => true },
      global: {
        stubs: {
          VocabDetailDialogHeadline: true,
          SharedBackButton: true,
          SharedSearchKeywordsIndicator: true,
        },
      },
    });

    expect(wrapper.get('[data-testid="vocab-word"]').attributes('lang')).toBe('ja');
    expect(wrapper.get('[data-testid="vocab-kana"]').attributes('lang')).toBe('ja');
  });

  it('displays short meaning when present', () => {
    const wrapper = mount(VocabDetailSectionHeadline, {
      props: { vocab: mockVocab, save: () => true },
      global: {
        stubs: {
          VocabDetailDialogHeadline: true,
          SharedBackButton: true,
          SharedSearchKeywordsIndicator: true,
        },
      },
    });

    expect(wrapper.text()).toContain('Japanese language');
  });

  it('opens edit dialog when edit button clicked', async () => {
    const wrapper = mount(VocabDetailSectionHeadline, {
      props: { vocab: mockVocab, save: () => true },
      global: {
        stubs: {
          VocabDetailDialogHeadline: true,
          SharedBackButton: true,
          SharedSearchKeywordsIndicator: true,
        },
      },
    });

    const editButton = wrapper.find('[data-testid="headline-edit-button"]');
    await editButton.trigger('click');

    const dialog = wrapper.findComponent({ name: 'VocabDetailDialogHeadline' });
    expect(dialog.props('open')).toBe(true);
  });

  describe('closing the dialog', () => {
    const data = {
      word: '日本',
      kana: 'にほん',
      shortMeaning: 'Japan',
      searchKeywords: null,
    };

    async function openAndSave(save: () => boolean) {
      const wrapper = mount(VocabDetailSectionHeadline, {
        props: { vocab: mockVocab, save },
        global: {
          stubs: {
            VocabDetailDialogHeadline: true,
            SharedBackButton: true,
            SharedSearchKeywordsIndicator: true,
          },
        },
      });
      await wrapper.find('[data-testid="headline-edit-button"]').trigger('click');
      const dialog = wrapper.findComponent({
        name: 'VocabDetailDialogHeadline',
      });
      expect(dialog.props('open')).toBe(true);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      await dialog.vm.$emit('save', data);
      return dialog;
    }

    it('passes the data to save and closes after a successful save', async () => {
      const save = vi.fn(() => true);
      const dialog = await openAndSave(save);
      expect(save).toHaveBeenCalledWith(data);
      expect(dialog.props('open')).toBe(false);
    });

    it('keeps the dialog open when the save fails', async () => {
      const save = vi.fn(() => false);
      const dialog = await openAndSave(save);
      expect(save).toHaveBeenCalledWith(data);
      expect(dialog.props('open')).toBe(true);
    });
  });
});
