/**
 * Tests for KanjiDetailSectionNotes component.
 */

import { render, screen } from '@testing-library/vue';
import { describe, expect, it } from 'vitest';

import KanjiDetailSectionNotes from './KanjiDetailSectionNotes.vue';

const base = {
  placeholder: 'Write here',
  testId: 'kanji-detail-sample-notes',
  title: 'Sample Notes',
};

describe('KanjiDetailSectionNotes', () => {
  it('renders the title, test id and character count', () => {
    render(KanjiDetailSectionNotes, { props: { ...base, notes: 'My notes' } });

    expect(screen.getByText('Sample Notes')).toBeInTheDocument();
    expect(screen.getByTestId('kanji-detail-sample-notes')).toBeInTheDocument();
    expect(screen.getByTestId('kanji-detail-sample-notes-char-count')).toHaveTextContent('8');
  });

  it('starts collapsed when empty and open when it has content', () => {
    const empty = render(KanjiDetailSectionNotes, {
      props: { ...base, notes: null },
    });
    expect(screen.getByTestId('kanji-detail-sample-notes')).toHaveAttribute('data-state', 'closed');
    empty.unmount();

    render(KanjiDetailSectionNotes, { props: { ...base, notes: 'Some' } });
    expect(screen.getByTestId('kanji-detail-sample-notes')).toHaveAttribute('data-state', 'open');
  });

  it('opens when notes gain content and closes when they are cleared', async () => {
    const view = render(KanjiDetailSectionNotes, {
      props: { ...base, notes: null },
    });
    const section = (): HTMLElement => screen.getByTestId('kanji-detail-sample-notes');

    await view.rerender({ notes: 'Added' });
    expect(section()).toHaveAttribute('data-state', 'open');

    await view.rerender({ notes: null });
    expect(section()).toHaveAttribute('data-state', 'closed');
  });
});
