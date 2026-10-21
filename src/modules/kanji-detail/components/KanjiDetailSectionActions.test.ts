/**
 * KanjiDetailSectionActions Tests
 *
 * Tests for the actions section component, with the real delete confirmation dialog.
 */

import { renderWithProviders as render } from '@test/helpers/render';
import { userEvent } from '@testing-library/user-event';
import { screen } from '@testing-library/vue';
import { describe, expect, it } from 'vitest';

import KanjiDetailSectionActions from './KanjiDetailSectionActions.vue';

function renderActions(props: { destructiveMode?: boolean; isDeleting?: boolean } = {}) {
  return render(KanjiDetailSectionActions, {
    props: { destructiveMode: false, isDeleting: false, ...props },
  });
}

describe('KanjiDetailSectionActions', () => {
  it('renders destructive mode toggle', () => {
    renderActions();
    expect(screen.getByText('Destructive Mode')).toBeInTheDocument();
  });

  it('renders delete button', () => {
    renderActions();
    expect(screen.getByRole('button', { name: /delete kanji/i })).toBeInTheDocument();
  });

  it('renders back button', () => {
    renderActions();
    expect(screen.getByText('Back to Kanji List')).toBeInTheDocument();
  });

  it('disables delete button when destructive mode is off', () => {
    renderActions({ destructiveMode: false });
    expect(screen.getByRole('button', { name: /delete kanji/i })).toBeDisabled();
  });

  it('enables delete button when destructive mode is on', () => {
    renderActions({ destructiveMode: true });
    expect(screen.getByRole('button', { name: /delete kanji/i })).toBeEnabled();
  });

  it('disables delete button when deleting', () => {
    renderActions({ destructiveMode: true, isDeleting: true });
    expect(screen.getByTestId('delete-kanji-button')).toBeDisabled();
  });

  it('shows deleting text when deleting', () => {
    renderActions({ isDeleting: true });
    expect(screen.getByText('Deleting...')).toBeInTheDocument();
  });

  it('emits update:destructiveMode when switch is toggled', async () => {
    const user = userEvent.setup();
    const { emitted } = renderActions();

    await user.click(screen.getByRole('switch', { name: 'Destructive mode' }));

    expect(emitted()['update:destructiveMode']).toEqual([[true]]);
  });

  describe('delete confirmation', () => {
    it('emits delete only after the dialog is confirmed', async () => {
      const user = userEvent.setup();
      const { emitted } = renderActions({ destructiveMode: true });

      await user.click(screen.getByRole('button', { name: /delete kanji/i }));
      expect(emitted()['delete']).toBeUndefined();

      await user.click(await screen.findByRole('button', { name: 'Delete' }));

      expect(emitted()['delete']).toHaveLength(1);
    });

    it('does not emit delete when the dialog is cancelled', async () => {
      const user = userEvent.setup();
      const { emitted } = renderActions({ destructiveMode: true });

      await user.click(screen.getByRole('button', { name: /delete kanji/i }));
      await user.click(await screen.findByRole('button', { name: 'Cancel' }));

      expect(emitted()['delete']).toBeUndefined();
    });
  });
});
