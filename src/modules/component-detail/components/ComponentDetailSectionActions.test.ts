/**
 * ComponentDetailSectionActions Tests
 *
 * Tests for the actions section component. The button, switch and confirm
 * dialog are real, so the delete flow is exercised through accessible names.
 */

import userEvent from '@testing-library/user-event';
import { render, screen, waitFor, within } from '@testing-library/vue';
import { describe, expect, it, vi } from 'vitest';

import ComponentDetailSectionActions from './ComponentDetailSectionActions.vue';

// Mock vue-router
vi.mock('vue-router', () => ({
  RouterLink: {
    name: 'RouterLink',
    template: '<a><slot /></a>',
    props: ['to'],
  },
}));

function renderActions(props = {}) {
  return render(ComponentDetailSectionActions, {
    props: {
      destructiveMode: false,
      isDeleting: false,
      ...props,
    },
    global: {
      stubs: { SharedBackButton: true },
    },
  });
}

describe('ComponentDetailSectionActions', () => {
  it('renders destructive mode toggle', () => {
    renderActions();
    expect(screen.getByText('Destructive Mode')).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: 'Destructive mode' })).toBeInTheDocument();
  });

  it('renders delete button', () => {
    renderActions();
    expect(screen.getByRole('button', { name: 'Delete component' })).toBeInTheDocument();
  });

  it('disables delete button when destructive mode is off', () => {
    renderActions({ destructiveMode: false });
    expect(screen.getByRole('button', { name: 'Delete component' })).toBeDisabled();
  });

  it('enables delete button when destructive mode is on', () => {
    renderActions({ destructiveMode: true });
    expect(screen.getByRole('button', { name: 'Delete component' })).toBeEnabled();
  });

  it('disables delete button and shows deleting text when deleting', () => {
    renderActions({ destructiveMode: true, isDeleting: true });
    const button = screen.getByRole('button', { name: 'Delete component' });
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('Deleting...');
  });

  it('emits update:destructiveMode when switch is toggled', async () => {
    const user = userEvent.setup();
    const { emitted } = renderActions();
    await user.click(screen.getByRole('switch', { name: 'Destructive mode' }));
    expect(emitted('update:destructiveMode')).toEqual([[true]]);
  });

  describe('delete confirmation', () => {
    it('does not emit delete before the confirmation', async () => {
      const user = userEvent.setup();
      const { emitted } = renderActions({ destructiveMode: true });

      await user.click(screen.getByRole('button', { name: 'Delete component' }));

      expect(await screen.findByRole('dialog')).toBeInTheDocument();
      expect(emitted('delete')).toBeUndefined();
    });

    it('emits delete and closes the dialog on confirm', async () => {
      const user = userEvent.setup();
      const { emitted } = renderActions({ destructiveMode: true });

      await user.click(screen.getByRole('button', { name: 'Delete component' }));
      const dialog = await screen.findByRole('dialog');
      await user.click(within(dialog).getByRole('button', { name: 'Delete' }));

      expect(emitted('delete')).toHaveLength(1);
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('emits nothing and closes the dialog on cancel', async () => {
      const user = userEvent.setup();
      const { emitted } = renderActions({ destructiveMode: true });

      await user.click(screen.getByRole('button', { name: 'Delete component' }));
      const dialog = await screen.findByRole('dialog');
      await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));

      expect(emitted('delete')).toBeUndefined();
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });
});
