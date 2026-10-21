/**
 * Tests for BaseFileInput component
 *
 * Note: jsdom has limitations with File API (arrayBuffer) and DragEvent,
 * so file upload is tested via modelValue prop and E2E tests cover the rest.
 */

import { defineComponent, h } from 'vue';

import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import BaseFileInput from './BaseFileInput.vue';

import type { MockInstance } from 'vitest';

let mockCreateObjectURL: MockInstance<typeof URL.createObjectURL>;
let mockRevokeObjectURL: MockInstance<typeof URL.revokeObjectURL>;

describe('BaseFileInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateObjectURL = vi
      .spyOn(globalThis.URL, 'createObjectURL')
      .mockReturnValue('blob:test-url');
    mockRevokeObjectURL = vi
      .spyOn(globalThis.URL, 'revokeObjectURL')
      .mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('core file input functionality', () => {
    it('renders file input with drop zone', () => {
      render(BaseFileInput);

      expect(screen.getByTestId('file-input-drop-zone')).toBeInTheDocument();
      expect(screen.getByText('Drag and drop or click to browse')).toBeInTheDocument();
    });

    it('renders with label when provided', () => {
      render(BaseFileInput, {
        props: { label: 'Upload Image' },
      });

      expect(screen.getByText('Upload Image')).toBeInTheDocument();
    });

    it('displays preview when modelValue is provided', async () => {
      const testData = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]); // PNG magic bytes

      render(BaseFileInput, {
        props: {
          modelValue: testData,
        },
      });

      await waitFor(() => {
        expect(screen.queryByTestId('file-input-preview')).toBeInTheDocument();
      });

      expect(mockCreateObjectURL).toHaveBeenCalled();
    });

    it('revokes previous blob URL when data changes', async () => {
      const data1 = new Uint8Array([0x89, 0x50, 0x4e, 0x47]);
      const data2 = new Uint8Array([0xff, 0xd8, 0xff]);

      mockCreateObjectURL.mockReturnValueOnce('blob:url1');
      mockCreateObjectURL.mockReturnValueOnce('blob:url2');

      const { rerender } = render(BaseFileInput, {
        props: { modelValue: data1 },
      });

      await waitFor(() => {
        expect(mockCreateObjectURL).toHaveBeenCalledTimes(1);
      });

      await rerender({ modelValue: data2 });

      await waitFor(() => {
        expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:url1');
        expect(mockCreateObjectURL).toHaveBeenCalledTimes(2);
      });
    });

    it('provides remove button to clear the file', async () => {
      const user = userEvent.setup();
      const onUpdate = vi.fn();

      render(BaseFileInput, {
        props: {
          modelValue: new Uint8Array([0x89, 0x50, 0x4e, 0x47]),
          'onUpdate:modelValue': onUpdate,
        },
      });

      await waitFor(() => {
        expect(screen.getByTestId('file-input-remove')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('file-input-remove'));

      expect(onUpdate).toHaveBeenCalledWith(null);
    });

    it('shows empty state when no file is uploaded', () => {
      render(BaseFileInput);

      expect(screen.getByText(/drag.*drop|click.*upload/i)).toBeInTheDocument();
    });
  });

  describe('blob URL cleanup', () => {
    it('revokes blob URL on unmount', async () => {
      const data = new Uint8Array([0x89, 0x50, 0x4e, 0x47]);
      mockCreateObjectURL.mockReturnValue('blob:cleanup-test');

      const { unmount } = render(BaseFileInput, {
        props: { modelValue: data },
      });

      await waitFor(() => {
        expect(mockCreateObjectURL).toHaveBeenCalled();
      });

      unmount();

      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:cleanup-test');
    });
  });

  describe('validation and accessibility', () => {
    it('has accessible file input with correct accept attribute', () => {
      render(BaseFileInput, {
        props: { accept: 'image/gif' },
      });

      const input = screen.getByTestId('file-input-hidden');
      expect(input).toHaveAttribute('accept', 'image/gif');
    });

    it('disables the input when disabled prop is true', () => {
      render(BaseFileInput, {
        props: { disabled: true },
      });

      const input = screen.getByTestId('file-input-hidden');
      expect(input).toBeDisabled();
    });

    it('shows error message when provided via prop', () => {
      render(BaseFileInput, {
        props: { error: 'Invalid file type' },
      });

      expect(screen.getByText('Invalid file type')).toBeInTheDocument();
    });

    it('has a focusable drop zone button', () => {
      render(BaseFileInput);

      const dropZone = screen.getByTestId('file-input-drop-zone');
      expect(dropZone).toBeInTheDocument();
      // Native button should not be disabled
      expect(dropZone).not.toBeDisabled();
    });

    it('associates label with input via matching for/id (useId)', () => {
      render(BaseFileInput, {
        props: { label: 'Profile Photo' },
      });

      const label = screen.getByText('Profile Photo');
      const input = screen.getByTestId('file-input-hidden');

      const forAttr = label.getAttribute('for');
      const idAttr = input.getAttribute('id');

      expect(forAttr).toBeTruthy();
      expect(idAttr).toBeTruthy();
      expect(forAttr).toBe(idAttr);
    });

    it('generates unique ids for multiple instances in the same app', () => {
      // Render two instances in the same Vue app tree to verify useId() uniqueness
      const Wrapper = defineComponent({
        setup() {
          return () =>
            h('div', [h(BaseFileInput, { label: 'First' }), h(BaseFileInput, { label: 'Second' })]);
        },
      });

      const { container } = render(Wrapper);

      const inputs = container.querySelectorAll('input[type="file"]');
      expect(inputs).toHaveLength(2);

      const id1 = inputs[0]?.getAttribute('id');
      const id2 = inputs[1]?.getAttribute('id');

      expect(id1).toBeTruthy();
      expect(id2).toBeTruthy();
      expect(id1).not.toBe(id2);
    });

    it('has remove button with proper aria-label', async () => {
      render(BaseFileInput, {
        props: {
          modelValue: new Uint8Array([0x89, 0x50, 0x4e, 0x47]),
        },
      });

      await waitFor(() => {
        expect(screen.getByTestId('file-input-remove')).toBeInTheDocument();
      });

      const removeButton = screen.getByLabelText('Remove file');
      expect(removeButton).toBeInTheDocument();
    });
  });
});
