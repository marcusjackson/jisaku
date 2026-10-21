/**
 * Tests for KanjiDetailReadingsList component.
 */

import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/vue';
import { describe, expect, it } from 'vitest';

import KanjiDetailReadingsList from './KanjiDetailReadingsList.vue';

import type { EditKunReading, EditOnReading } from '../kanji-detail-types';

function mockReading(overrides: Partial<EditOnReading> = {}): EditOnReading {
  return {
    id: 1,
    reading: 'メイ',
    readingLevel: '小',
    ...overrides,
  };
}

// Reka's select needs pointer APIs jsdom lacks; a native select exercises the same wiring.
const BaseSelectStub = {
  name: 'BaseSelect',
  props: ['modelValue', 'options'],
  emits: ['update:modelValue'],
  template:
    '<select aria-label="Reading level" :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><option v-for="o in options" :key="o.value" :value="o.value">{{ o.label }}</option></select>',
};

describe('KanjiDetailReadingsList', () => {
  const defaultProps = {
    readings: [mockReading()],
    title: 'On-yomi (音読み)',
  };

  it('renders section title', () => {
    render(KanjiDetailReadingsList, { props: defaultProps });
    expect(screen.getByText('On-yomi (音読み)')).toBeInTheDocument();
  });

  it('renders empty state when no readings', () => {
    render(KanjiDetailReadingsList, {
      props: { ...defaultProps, emptyText: 'No on-yomi readings', readings: [] },
    });
    expect(screen.getByText('No on-yomi readings')).toBeInTheDocument();
  });

  it('renders reading items', () => {
    render(KanjiDetailReadingsList, { props: defaultProps });
    expect(screen.getByDisplayValue('メイ')).toBeInTheDocument();
  });

  it('emits add event when Add button clicked', async () => {
    const user = userEvent.setup();
    const { emitted } = render(KanjiDetailReadingsList, { props: defaultProps });

    await user.click(screen.getByRole('button', { name: /add/i }));

    expect(emitted()['add']).toBeTruthy();
  });

  it('shows okurigana field when showOkurigana is true', () => {
    render(KanjiDetailReadingsList, {
      props: {
        ...defaultProps,
        readings: [{ ...mockReading(), okurigana: 'い' }],
        showOkurigana: true,
      },
    });
    expect(screen.getByDisplayValue('い')).toBeInTheDocument();
  });

  it('passes warnings to reading items', () => {
    render(KanjiDetailReadingsList, {
      props: {
        ...defaultProps,
        warnings: ['This is a warning'],
      },
    });
    expect(screen.getByText('This is a warning')).toBeInTheDocument();
  });

  describe('item events carry the item index', () => {
    const twoReadings = {
      ...defaultProps,
      destructiveMode: true,
      readings: [
        mockReading({ id: 1, reading: 'メイ' }),
        mockReading({ id: 2, reading: 'ミョウ' }),
      ],
    };

    it('emits move with direction -1 for Move up on the second item', async () => {
      const user = userEvent.setup();
      const { emitted } = render(KanjiDetailReadingsList, { props: twoReadings });

      await user.click(screen.getAllByRole('button', { name: 'Move up' })[1]!);

      expect(emitted()['move']).toEqual([[1, -1]]);
    });

    it('emits move with direction 1 for Move down on the first item', async () => {
      const user = userEvent.setup();
      const { emitted } = render(KanjiDetailReadingsList, { props: twoReadings });

      await user.click(screen.getAllByRole('button', { name: 'Move down' })[0]!);

      expect(emitted()['move']).toEqual([[0, 1]]);
    });

    it('emits delete with the index of the second item', async () => {
      const user = userEvent.setup();
      const { emitted } = render(KanjiDetailReadingsList, { props: twoReadings });

      await user.click(screen.getAllByRole('button', { name: 'Delete reading' })[1]!);

      expect(emitted()['delete']).toEqual([[1]]);
    });

    it('emits update:okurigana with the index and value', async () => {
      const user = userEvent.setup();
      const kun: EditKunReading[] = [
        { id: 1, reading: 'あか', okurigana: '', readingLevel: '小' },
        { id: 2, reading: 'あお', okurigana: '', readingLevel: '小' },
      ];
      const { emitted } = render(KanjiDetailReadingsList, {
        props: { ...defaultProps, readings: kun, showOkurigana: true },
      });

      await user.type(screen.getAllByPlaceholderText('Okurigana')[1]!, 'い');

      expect(emitted()['update:okurigana']).toEqual([[1, 'い']]);
    });

    it('emits update:readingLevel with the index and level', async () => {
      const user = userEvent.setup();
      const { emitted } = render(KanjiDetailReadingsList, {
        props: twoReadings,
        global: { stubs: { BaseSelect: BaseSelectStub } },
      });

      await user.selectOptions(screen.getAllByLabelText('Reading level')[1]!, '中');

      expect(emitted()['update:readingLevel']).toEqual([[1, '中']]);
    });
  });
});
