/**
 * ComponentDetailDialogHeadline Tests
 *
 * Tests for the headline edit dialog component.
 */

import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ComponentDetailDialogHeadline from './ComponentDetailDialogHeadline.vue';

const mockGetByCharacter = vi.fn();

vi.mock('@/api/component', () => ({
  useComponentRepository: () => ({ getByCharacter: mockGetByCharacter }),
}));

describe('ComponentDetailDialogHeadline', () => {
  beforeEach(() => {
    mockGetByCharacter.mockReset();
    mockGetByCharacter.mockReturnValue(null);
  });

  const createWrapper = (props = {}) => {
    return mount(ComponentDetailDialogHeadline, {
      props: {
        open: true,
        character: '氵',
        shortMeaning: 'water',
        searchKeywords: 'mizu, sanzui',
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
              '<div><input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" /><span v-if="error" class="error">{{ error }}</span></div>',
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

  it('renders when open is true', () => {
    const wrapper = createWrapper({ open: true });
    expect(wrapper.find('div').exists()).toBe(true);
  });

  it('does not render when open is false', () => {
    const wrapper = createWrapper({ open: false });
    expect(wrapper.find('form').exists()).toBe(false);
  });

  it('populates form with initial values', () => {
    const wrapper = createWrapper();
    const inputs = wrapper.findAll('input');
    expect(inputs.map((i) => i.element.value)).toEqual(['氵', 'water', 'mizu, sanzui']);
  });

  it('emits update:open with false when Cancel is clicked', async () => {
    const wrapper = createWrapper();
    const cancelButton = wrapper.findAll('button').find((b) => b.text() === 'Cancel');
    await cancelButton?.trigger('click');
    expect(wrapper.emitted('update:open')).toBeTruthy();
    expect(wrapper.emitted('update:open')?.[0]).toEqual([false]);
  });

  it('shows empty inputs for null short meaning and keywords', () => {
    const wrapper = createWrapper({ shortMeaning: null, searchKeywords: null });
    expect(wrapper.findAll('input').map((i) => i.element.value)).toEqual(['氵', '', '']);
  });

  it('limits short meaning to 100 and keywords to 500 characters', () => {
    const wrapper = createWrapper();
    const inputs = wrapper.findAllComponents({ name: 'BaseInput' });
    expect(inputs[1]!.props('maxlength')).toBe('100');
    expect(inputs[2]!.props('maxlength')).toBe('500');
  });

  it('saves the initial values unchanged on submit', async () => {
    const wrapper = createWrapper();
    await wrapper.find('form').trigger('submit');
    await new Promise((r) => setTimeout(r, 100));
    expect(wrapper.emitted('save')?.[0]?.[0]).toEqual({
      character: '氵',
      shortMeaning: 'water',
      searchKeywords: 'mizu, sanzui',
    });
  });

  describe('character field', () => {
    async function submitWith(character: string, props = {}) {
      const wrapper = createWrapper(props);
      await wrapper.findAll('input')[0]!.setValue(character);
      // vee-validate debounces field validation by 5 ms; let it settle
      await new Promise((r) => setTimeout(r, 20));
      await wrapper.find('form').trigger('submit');
      await new Promise((r) => setTimeout(r, 100));
      return wrapper;
    }

    it('does not cap the input at one UTF-16 unit', () => {
      const wrapper = createWrapper();
      const input = wrapper.findAllComponents({ name: 'BaseInput' })[0]!;
      expect(input.props('maxlength')).toBeUndefined();
    });

    it.each(['𠀋', 'か\u3099'])('saves the single grapheme %j', async (ch) => {
      const wrapper = await submitWith(ch);
      expect(wrapper.emitted('save')?.[0]?.[0]).toMatchObject({
        character: ch,
      });
    });

    it('rejects two graphemes', async () => {
      const wrapper = await submitWith('氵氺');
      expect(wrapper.emitted('save')).toBeUndefined();
      expect(wrapper.text()).toContain('Please enter only one character');
    });

    it('refuses a character another component uses', async () => {
      mockGetByCharacter.mockReturnValue({ id: 2, character: '氺' });
      const wrapper = await submitWith('氺');
      expect(mockGetByCharacter).toHaveBeenCalledWith('氺');
      expect(wrapper.emitted('save')).toBeUndefined();
      expect(wrapper.text()).toContain('This component is already registered');
    });

    it('saves an unchanged character without a lookup', async () => {
      mockGetByCharacter.mockReturnValue({ id: 1, character: '氵' });
      const wrapper = await submitWith('氵');
      expect(mockGetByCharacter).not.toHaveBeenCalled();
      expect(wrapper.emitted('save')).toHaveLength(1);
    });
  });

  it('saves blank short meaning and keywords as null and trims the rest', async () => {
    const wrapper = createWrapper();
    const inputs = wrapper.findAll('input');
    await inputs[1]!.setValue('   ');
    await inputs[2]!.setValue('   ');
    await new Promise((r) => setTimeout(r, 20));
    await wrapper.find('form').trigger('submit');
    await new Promise((r) => setTimeout(r, 100));
    expect(wrapper.emitted('save')?.[0]?.[0]).toEqual({
      character: '氵',
      shortMeaning: null,
      searchKeywords: null,
    });
  });

  it('trims short meaning and keywords on save', async () => {
    const wrapper = createWrapper();
    const inputs = wrapper.findAll('input');
    await inputs[1]!.setValue('  water  ');
    await inputs[2]!.setValue(' mizu ');
    await new Promise((r) => setTimeout(r, 20));
    await wrapper.find('form').trigger('submit');
    await new Promise((r) => setTimeout(r, 100));
    expect(wrapper.emitted('save')?.[0]?.[0]).toMatchObject({
      shortMeaning: 'water',
      searchKeywords: 'mizu',
    });
  });

  it('resets the fields to the saved values when reopened', async () => {
    const wrapper = createWrapper();
    const inputs = wrapper.findAll('input');
    await inputs[0]!.setValue('水');
    await inputs[1]!.setValue('changed');
    await inputs[2]!.setValue('changed too');

    await wrapper.setProps({ open: false });
    await wrapper.setProps({ open: true });

    expect(wrapper.findAll('input').map((i) => i.element.value)).toEqual([
      '氵',
      'water',
      'mizu, sanzui',
    ]);
  });
});
