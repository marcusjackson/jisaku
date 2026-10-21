/**
 * KanjiListFilterAnalysisFields Tests
 *
 * Tests for analysis field filter component with add/remove/update.
 */

import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/vue';
import { describe, expect, it } from 'vitest';

import KanjiListFilterAnalysisFields from './KanjiListFilterAnalysisFields.vue';

describe('KanjiListFilterAnalysisFields', () => {
  it('renders label', () => {
    render(KanjiListFilterAnalysisFields, {
      props: { modelValue: [] },
    });

    expect(screen.getByText(/analysis field/i)).toBeInTheDocument();
  });

  it('shows add field select when empty', () => {
    render(KanjiListFilterAnalysisFields, {
      props: { modelValue: [] },
    });

    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('displays active filter field names', () => {
    render(KanjiListFilterAnalysisFields, {
      props: {
        modelValue: [{ field: 'notesEtymology', threshold: 'short' }],
      },
    });

    // Should show the filter with field label (語源 = etymology in Japanese)
    expect(screen.getByText('語源')).toBeInTheDocument();
  });

  it('gives the add select an accessible name and an "Add field…" first option', async () => {
    const user = userEvent.setup();
    render(KanjiListFilterAnalysisFields, { props: { modelValue: [] } });

    const trigger = screen.getByRole('combobox', { name: 'Field to filter' });
    trigger.focus();
    await user.keyboard('{Enter}');
    expect(await screen.findByRole('option', { name: 'Add field…' })).toBeInTheDocument();
  });

  it('names the threshold select and remove button per active filter', () => {
    render(KanjiListFilterAnalysisFields, {
      props: { modelValue: [{ field: 'notesEtymology', threshold: 'short' }] },
    });

    expect(screen.getByRole('combobox', { name: '語源 length' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove 語源 filter' })).toBeInTheDocument();
  });
});
