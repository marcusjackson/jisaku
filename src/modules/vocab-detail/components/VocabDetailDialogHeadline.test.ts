/**
 * VocabDetailDialogHeadline Tests
 *
 * Tests for the headline edit dialog component.
 */

import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/vue';
import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import VocabDetailDialogHeadline from './VocabDetailDialogHeadline.vue';

const getByWord = vi.fn();
vi.mock('@/api/vocabulary', () => ({
  useVocabularyRepository: () => ({ getByWord }),
}));

describe('VocabDetailDialogHeadline', () => {
  beforeEach(() => {
    getByWord.mockReset();
    getByWord.mockReturnValue(null);
  });

  const createWrapper = (props = {}) => {
    return mount(VocabDetailDialogHeadline, {
      props: {
        open: true,
        vocabId: 1,
        word: '日本語',
        kana: 'にほんご',
        shortMeaning: 'Japanese language',
        searchKeywords: 'nihongo',
        ...props,
      },
      global: {
        stubs: {
          BaseDialog: {
            name: 'BaseDialog',
            template: '<div v-if="open"><slot /></div>',
            props: ['open', 'title'],
          },
          BaseInput: {
            name: 'BaseInput',
            template:
              '<div><input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" /><span v-if="error">{{ error }}</span></div>',
            props: ['modelValue', 'label', 'error', 'required', 'maxlength', 'placeholder'],
          },
          BaseButton: {
            name: 'BaseButton',
            template:
              '<button :type="type" :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
            props: ['type', 'variant', 'disabled', 'loading'],
          },
        },
      },
    });
  };

  it('does not render when open is false', () => {
    const wrapper = createWrapper({ open: false });
    expect(wrapper.find('form').exists()).toBe(false);
  });

  it('emits update:open with false when Cancel is clicked', async () => {
    const wrapper = createWrapper();
    const cancelButton = wrapper.findAll('button').find((b) => b.text() === 'Cancel');
    await cancelButton?.trigger('click');
    expect(wrapper.emitted('update:open')).toBeTruthy();
    expect(wrapper.emitted('update:open')?.[0]).toEqual([false]);
  });

  function inputValues(wrapper: ReturnType<typeof createWrapper>): string[] {
    return wrapper.findAll('input').map((i) => (i.element as HTMLInputElement).value);
  }

  async function submit(wrapper: ReturnType<typeof createWrapper>) {
    await wrapper.find('form').trigger('submit');
    await vi.waitFor(() => {
      expect(getByWord).toHaveBeenCalled();
    });
    await flushPromises();
    await wrapper.vm.$nextTick();
  }

  it('prefills the four fields from props', () => {
    expect(inputValues(createWrapper())).toEqual([
      '日本語',
      'にほんご',
      'Japanese language',
      'nihongo',
    ]);
  });

  it('prefills empty strings for null meaning and keywords', () => {
    const wrapper = createWrapper({ shortMeaning: null, searchKeywords: null });
    expect(inputValues(wrapper)).toEqual(['日本語', 'にほんご', '', '']);
  });

  it('emits the form values as the save payload', async () => {
    const wrapper = createWrapper();
    await submit(wrapper);
    expect(wrapper.emitted('save')?.[0]).toEqual([
      {
        word: '日本語',
        kana: 'にほんご',
        shortMeaning: 'Japanese language',
        searchKeywords: 'nihongo',
      },
    ]);
  });

  it('emits null for blank and whitespace-only meaning and keywords', async () => {
    const wrapper = createWrapper();
    const inputs = wrapper.findAll('input');
    await inputs[2]?.setValue('   ');
    await inputs[3]?.setValue('');
    await submit(wrapper);
    expect(wrapper.emitted('save')?.[0]?.[0]).toMatchObject({
      shortMeaning: null,
      searchKeywords: null,
    });
  });

  it('restores the prefilled values when reopened after cancel', async () => {
    const wrapper = createWrapper();
    await wrapper.findAll('input')[0]?.setValue('変更');
    await wrapper
      .findAll('button')
      .find((b) => b.text() === 'Cancel')
      ?.trigger('click');
    await wrapper.setProps({ open: false });
    await wrapper.setProps({ open: true });
    expect(inputValues(wrapper)[0]).toBe('日本語');
  });

  it('restores the prefilled values when reopened after a duplicate-word error', async () => {
    getByWord.mockReturnValue({ id: 2, word: '日本' });
    const wrapper = createWrapper();
    await wrapper.findAll('input')[0]?.setValue('日本');
    await submit(wrapper);
    expect(wrapper.emitted('save')).toBeUndefined();

    await wrapper.setProps({ open: false });
    await wrapper.setProps({ open: true });
    expect(inputValues(wrapper)[0]).toBe('日本語');
  });

  it('keeps the typed values when validation blocks the save', async () => {
    const wrapper = createWrapper();
    const inputs = wrapper.findAll('input');
    await inputs[0]?.setValue('   ');
    await inputs[1]?.setValue('かな');
    await wrapper.find('form').trigger('submit');
    await flushPromises();
    expect(wrapper.emitted('save')).toBeUndefined();
    expect(inputValues(wrapper)[1]).toBe('かな');
  });

  async function submitWith(word: string) {
    const wrapper = createWrapper();
    await wrapper.findAll('input')[0]?.setValue(word);
    await flushPromises();
    await wrapper.find('form').trigger('submit');
    await vi.waitFor(() => {
      expect(getByWord).toHaveBeenCalled();
    });
    await flushPromises();
    await wrapper.vm.$nextTick();
    return wrapper;
  }

  it('saves the trimmed word and blank kana', async () => {
    const wrapper = createWrapper();
    const inputs = wrapper.findAll('input');
    await inputs[0]?.setValue(' 日本 ');
    await inputs[1]?.setValue('');
    await wrapper.find('form').trigger('submit');
    await vi.waitFor(() => {
      expect(getByWord).toHaveBeenCalled();
    });
    await flushPromises();
    expect(wrapper.emitted('save')?.[0]?.[0]).toMatchObject({
      word: '日本',
      kana: '',
    });
    expect(getByWord).toHaveBeenCalledWith('日本');
  });

  it('shows an inline error and does not save a word taken by another entry', async () => {
    getByWord.mockReturnValue({ id: 2, word: '日本' });
    const user = userEvent.setup();
    const { emitted } = render(VocabDetailDialogHeadline, {
      props: {
        open: true,
        vocabId: 1,
        word: '日本語',
        kana: 'にほんご',
        shortMeaning: null,
        searchKeywords: null,
      },
      global: {
        stubs: {
          BaseDialog: { template: '<div><slot /></div>' },
        },
      },
    });

    const word = screen.getByRole('textbox', { name: /^word/i });
    await user.clear(word);
    await user.type(word, '日本');
    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(await screen.findByText('This word is already registered')).toBeInTheDocument();
    expect(emitted()['save']).toBeUndefined();
  });

  it("does not flag the entry's own word as a duplicate", async () => {
    getByWord.mockReturnValue({ id: 1, word: '日本語' });
    const wrapper = await submitWith('日本語');
    expect(wrapper.emitted('save')).toHaveLength(1);
  });
});
