/**
 * Tests for KanjiDetailSectionMeanings component.
 */

import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/vue';
import { describe, expect, it } from 'vitest';

import KanjiDetailSectionMeanings from './KanjiDetailSectionMeanings.vue';

import type { KanjiMeaning, KanjiMeaningGroupMember, KanjiMeaningReadingGroup } from '@/api/kanji';

function mockMeaning(overrides: Partial<KanjiMeaning> = {}): KanjiMeaning {
  return {
    additionalInfo: null,
    createdAt: '',
    displayOrder: 0,
    id: 1,
    kanjiId: 1,
    meaningText: 'bright',
    updatedAt: '',
    ...overrides,
  };
}

describe('KanjiDetailSectionMeanings', () => {
  const defaultProps = {
    groupMembers: [] as KanjiMeaningGroupMember[],
    meanings: [mockMeaning()],
    readingGroups: [] as KanjiMeaningReadingGroup[],
    save: () => true,
  };

  it('renders section title', () => {
    render(KanjiDetailSectionMeanings, { props: defaultProps });
    expect(screen.getByText('Meanings')).toBeInTheDocument();
  });

  it('displays meanings', () => {
    render(KanjiDetailSectionMeanings, { props: defaultProps });
    expect(screen.getByText('bright')).toBeInTheDocument();
  });

  it('has edit button', () => {
    render(KanjiDetailSectionMeanings, { props: defaultProps });
    expect(screen.getByRole('button', { name: /edit meanings/i })).toBeInTheDocument();
  });

  it('shows empty state when no meanings', () => {
    render(KanjiDetailSectionMeanings, {
      props: { ...defaultProps, meanings: [] },
    });
    expect(screen.getByText('No meanings defined')).toBeInTheDocument();
  });

  it('closes the dialog after a successful save', async () => {
    const user = userEvent.setup();
    render(KanjiDetailSectionMeanings, { props: defaultProps });

    await user.click(screen.getByRole('button', { name: /edit meanings/i }));
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('keeps the dialog open when the save fails', async () => {
    const user = userEvent.setup();
    render(KanjiDetailSectionMeanings, {
      props: { ...defaultProps, save: () => false },
    });

    await user.click(screen.getByRole('button', { name: /edit meanings/i }));
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
