/**
 * Tests for KanjiDetailComponentSearch component
 */

import { renderWithProviders as render } from '@test/helpers/render';
import { userEvent } from '@testing-library/user-event';
import { screen } from '@testing-library/vue';
import { describe, expect, it } from 'vitest';

import KanjiDetailComponentSearch from './KanjiDetailComponentSearch.vue';

import type { Component } from '@/api/component/component-types';

const mockComponents: Component[] = [
  {
    id: 1,
    character: '人',
    shortMeaning: 'person',
    strokeCount: null,
    searchKeywords: null,
    sourceKanjiId: null,
    description: null,
    canBeRadical: false,
    kangxiNumber: null,
    kangxiMeaning: null,
    radicalNameJapanese: null,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 2,
    character: '木',
    shortMeaning: 'tree, wood',
    strokeCount: null,
    searchKeywords: null,
    sourceKanjiId: null,
    description: null,
    canBeRadical: false,
    kangxiNumber: null,
    kangxiMeaning: null,
    radicalNameJapanese: null,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 3,
    character: '水',
    shortMeaning: 'water',
    strokeCount: null,
    searchKeywords: null,
    sourceKanjiId: null,
    description: null,
    canBeRadical: false,
    kangxiNumber: null,
    kangxiMeaning: null,
    radicalNameJapanese: null,
    createdAt: '',
    updatedAt: '',
  },
];

describe('KanjiDetailComponentSearch', () => {
  describe('search filtering', () => {
    it('shows results matching character', async () => {
      const user = userEvent.setup();
      render(KanjiDetailComponentSearch, {
        props: {
          availableComponents: mockComponents,
        },
      });

      const input = screen.getByRole('textbox');
      await user.type(input, '人');

      expect(screen.getByText('人')).toBeInTheDocument();
      expect(screen.queryByText('木')).not.toBeInTheDocument();
    });

    it('shows results matching short meaning', async () => {
      const user = userEvent.setup();
      render(KanjiDetailComponentSearch, {
        props: {
          availableComponents: mockComponents,
        },
      });

      const input = screen.getByRole('textbox');
      await user.type(input, 'water');

      expect(screen.getByText('水')).toBeInTheDocument();
      expect(screen.getByText('water')).toBeInTheDocument();
    });

    it('filters case-insensitively', async () => {
      const user = userEvent.setup();
      render(KanjiDetailComponentSearch, {
        props: {
          availableComponents: mockComponents,
        },
      });

      const input = screen.getByRole('textbox');
      await user.type(input, 'TREE');

      expect(screen.getByText('木')).toBeInTheDocument();
    });

    it('shows all components when search is empty', () => {
      render(KanjiDetailComponentSearch, {
        props: {
          availableComponents: mockComponents,
        },
      });

      expect(screen.getByText('人')).toBeInTheDocument();
      expect(screen.getByText('木')).toBeInTheDocument();
      expect(screen.getByText('水')).toBeInTheDocument();
    });

    it('lists no components when nothing matches', async () => {
      const user = userEvent.setup();
      render(KanjiDetailComponentSearch, {
        props: {
          availableComponents: mockComponents,
        },
      });

      const input = screen.getByRole('textbox');
      await user.type(input, 'xyz');

      expect(screen.queryByText('人')).not.toBeInTheDocument();
      expect(screen.queryByText('木')).not.toBeInTheDocument();
    });
  });

  describe('create new button', () => {
    it('shows create button when no results found', async () => {
      const user = userEvent.setup();
      render(KanjiDetailComponentSearch, {
        props: {
          availableComponents: mockComponents,
        },
      });

      const input = screen.getByRole('textbox');
      await user.type(input, 'xyz');

      expect(screen.getByText('Create New Component: "xyz"')).toBeInTheDocument();
    });

    it('does not show create button when results exist', async () => {
      const user = userEvent.setup();
      render(KanjiDetailComponentSearch, {
        props: {
          availableComponents: mockComponents,
        },
      });

      const input = screen.getByRole('textbox');
      await user.type(input, 'person');

      expect(screen.queryByText(/Create New Component/)).not.toBeInTheDocument();
    });

    it('does not show create button when search is empty', () => {
      render(KanjiDetailComponentSearch, {
        props: {
          availableComponents: mockComponents,
        },
      });

      expect(screen.queryByText(/Create New Component/)).not.toBeInTheDocument();
    });
  });

  describe('event emission', () => {
    it('emits select event when result clicked', async () => {
      const user = userEvent.setup();
      const { emitted } = render(KanjiDetailComponentSearch, {
        props: {
          availableComponents: mockComponents,
        },
      });

      const input = screen.getByRole('textbox');
      await user.type(input, '人');

      const resultButton = screen.getByRole('button', { name: /人.*person/ });
      await user.click(resultButton);

      expect(emitted()).toHaveProperty('select');
      expect(emitted()['select']?.[0]).toEqual([1]);
    });

    it('emits create event when create button clicked', async () => {
      const user = userEvent.setup();
      const { emitted } = render(KanjiDetailComponentSearch, {
        props: {
          availableComponents: mockComponents,
        },
      });

      const input = screen.getByRole('textbox');
      await user.type(input, 'xyz');

      const createButton = screen.getByRole('button', {
        name: 'Create New Component: "xyz"',
      });
      await user.click(createButton);

      expect(emitted()).toHaveProperty('create');
      expect(emitted()['create']?.[0]).toEqual(['xyz']);
    });

    it('clears search term after selection', async () => {
      const user = userEvent.setup();
      render(KanjiDetailComponentSearch, {
        props: {
          availableComponents: mockComponents,
        },
      });

      const input = screen.getByRole('textbox');
      await user.type(input, '人');

      const resultButton = screen.getByRole('button', { name: /人.*person/ });
      await user.click(resultButton);

      expect((input as HTMLInputElement).value).toBe('');
    });

    it('clears search term after create', async () => {
      const user = userEvent.setup();
      render(KanjiDetailComponentSearch, {
        props: {
          availableComponents: mockComponents,
        },
      });

      const input = screen.getByRole('textbox');
      await user.type(input, 'xyz');

      const createButton = screen.getByRole('button', {
        name: 'Create New Component: "xyz"',
      });
      await user.click(createButton);

      expect((input as HTMLInputElement).value).toBe('');
    });
  });

  describe('props', () => {
    it('uses custom label', () => {
      render(KanjiDetailComponentSearch, {
        props: {
          availableComponents: mockComponents,
          label: 'Find Component',
        },
      });

      expect(screen.getByText('Find Component')).toBeInTheDocument();
    });

    it('uses custom placeholder', () => {
      render(KanjiDetailComponentSearch, {
        props: {
          availableComponents: mockComponents,
          placeholder: 'Type to search...',
        },
      });

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('placeholder', 'Type to search...');
    });
  });
});
