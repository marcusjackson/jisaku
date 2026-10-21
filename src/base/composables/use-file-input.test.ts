import { ref } from 'vue';

import { withSetup } from '@test/helpers/with-setup';
import { flushPromises } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useFileInput, useFilePreview } from './use-file-input';

import type { App } from 'vue';

describe('useFileInput', () => {
  let app: App | undefined;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(globalThis.URL, 'createObjectURL').mockReturnValue('blob:test-url');
    vi.spyOn(globalThis.URL, 'revokeObjectURL').mockImplementation(() => undefined);
  });

  afterEach(() => {
    app?.unmount();
    vi.restoreAllMocks();
  });

  describe('resolvedAccept', () => {
    it('defaults to image/* when no accept option provided', () => {
      const model = ref<Uint8Array | null>(null);
      const [{ resolvedAccept }, a] = withSetup(() => useFileInput(model, {}, vi.fn()));
      app = a;

      expect(resolvedAccept.value).toBe('image/*');
    });

    it('uses provided accept option', () => {
      const model = ref<Uint8Array | null>(null);
      const [{ resolvedAccept }, a] = withSetup(() =>
        useFileInput(model, { accept: ref('image/png') }, vi.fn())
      );
      app = a;

      expect(resolvedAccept.value).toBe('image/png');
    });
  });

  describe('handleRemove', () => {
    it('clears model value', () => {
      const model = ref<Uint8Array | null>(new Uint8Array([1, 2, 3]));
      const [{ handleRemove }, a] = withSetup(() => useFileInput(model, {}, vi.fn()));
      app = a;

      handleRemove();

      expect(model.value).toBeNull();
    });
  });

  describe('drag and drop', () => {
    it('sets isDragging to true on dragenter', () => {
      const model = ref<Uint8Array | null>(null);
      const [{ handleDragEnterOver, isDragging }, a] = withSetup(() =>
        useFileInput(model, {}, vi.fn())
      );
      app = a;

      const event = { preventDefault: vi.fn() } as unknown as DragEvent;
      handleDragEnterOver(event);

      expect(isDragging.value).toBe(true);
    });

    it('sets isDragging to false on dragleave', () => {
      const model = ref<Uint8Array | null>(null);
      const [{ handleDragEnterOver, handleDragLeave, isDragging }, a] = withSetup(() =>
        useFileInput(model, {}, vi.fn())
      );
      app = a;

      const mockEvent = { preventDefault: vi.fn() } as unknown as DragEvent;
      handleDragEnterOver(mockEvent);
      expect(isDragging.value).toBe(true);

      handleDragLeave(mockEvent);
      expect(isDragging.value).toBe(false);
    });

    it('sets isDragging to false after drop', () => {
      const model = ref<Uint8Array | null>(null);
      const [{ handleDragEnterOver, handleDrop, isDragging }, a] = withSetup(() =>
        useFileInput(model, {}, vi.fn())
      );
      app = a;

      const mockEvent = { preventDefault: vi.fn() } as unknown as DragEvent;
      handleDragEnterOver(mockEvent);
      expect(isDragging.value).toBe(true);

      handleDrop({ preventDefault: vi.fn() } as unknown as DragEvent);
      expect(isDragging.value).toBe(false);
    });
  });

  describe('displayError', () => {
    it('shows external error when provided', () => {
      const model = ref<Uint8Array | null>(null);
      const [{ displayError }, a] = withSetup(() =>
        useFileInput(model, { externalError: ref('Upload failed') }, vi.fn())
      );
      app = a;

      expect(displayError.value).toBe('Upload failed');
    });

    it('shows null when no errors', () => {
      const model = ref<Uint8Array | null>(null);
      const [{ displayError }, a] = withSetup(() => useFileInput(model, {}, vi.fn()));
      app = a;

      expect(displayError.value).toBeNull();
    });
  });

  describe('file selection', () => {
    function selectFile(file: File, handler: (event: Event) => void): void {
      const input = document.createElement('input');
      Object.defineProperty(input, 'files', { value: [file] });
      handler({ target: input } as unknown as Event);
    }

    it('stores the file bytes in the model on select', async () => {
      const model = ref<Uint8Array | null>(null);
      const [{ handleFileSelect }, a] = withSetup(() => useFileInput(model, {}, vi.fn()));
      app = a;

      selectFile(
        new File([new Uint8Array([1, 2, 3])], 'a.png', { type: 'image/png' }),
        handleFileSelect
      );
      await flushPromises();

      expect(Array.from(model.value ?? [])).toEqual([1, 2, 3]);
    });

    it('stores the file bytes in the model on drop', async () => {
      const model = ref<Uint8Array | null>(null);
      const [{ handleDrop }, a] = withSetup(() => useFileInput(model, {}, vi.fn()));
      app = a;

      const file = new File([new Uint8Array([4, 5])], 'a.png', { type: 'image/png' });
      handleDrop({
        preventDefault: vi.fn(),
        dataTransfer: { files: [file] },
      } as unknown as DragEvent);
      await flushPromises();

      expect(Array.from(model.value ?? [])).toEqual([4, 5]);
    });

    it('rejects a selected file whose type is not accepted', async () => {
      const model = ref<Uint8Array | null>(null);
      const onError = vi.fn();
      const [{ displayError, handleFileSelect }, a] = withSetup(() =>
        useFileInput(model, { accept: ref('image/gif') }, onError)
      );
      app = a;

      selectFile(new File([new Uint8Array([1])], 'a.png', { type: 'image/png' }), handleFileSelect);
      await flushPromises();

      expect(onError).toHaveBeenCalledOnce();
      expect(displayError.value).toContain('not accepted');
      expect(model.value).toBeNull();
    });

    it('rejects a dropped file whose type is not accepted', async () => {
      const model = ref<Uint8Array | null>(null);
      const onError = vi.fn();
      const [{ displayError, handleDrop }, a] = withSetup(() =>
        useFileInput(model, { accept: ref('image/gif') }, onError)
      );
      app = a;

      const file = new File([new Uint8Array([1])], 'a.txt', { type: 'text/plain' });
      handleDrop({
        preventDefault: vi.fn(),
        dataTransfer: { files: [file] },
      } as unknown as DragEvent);
      await flushPromises();

      expect(onError).toHaveBeenCalledOnce();
      expect(displayError.value).toContain('not accepted');
      expect(model.value).toBeNull();
    });

    it.each([
      ['image/*', 'a.png', 'image/png'],
      ['image/png,image/gif', 'a.gif', 'image/gif'],
      ['.db, .sqlite', 'DATA.SQLITE', ''],
    ])('accepts %s for %s', async (accept, name, type) => {
      const model = ref<Uint8Array | null>(null);
      const [{ handleFileSelect }, a] = withSetup(() =>
        useFileInput(model, { accept: ref(accept) }, vi.fn())
      );
      app = a;

      selectFile(new File([new Uint8Array([1])], name, { type }), handleFileSelect);
      await flushPromises();

      expect(model.value).not.toBeNull();
    });
  });

  describe('file size validation', () => {
    it('emits error and blocks upload when file exceeds max size', async () => {
      const model = ref<Uint8Array | null>(null);
      const onError = vi.fn();
      const [{ displayError, handleFileSelect }, a] = withSetup(() =>
        useFileInput(
          model,
          { maxSizeBytes: ref(100) }, // 100 byte limit
          onError
        )
      );
      app = a;

      const largeContent = new Uint8Array(200).fill(1);
      const file = new File([largeContent], 'large.png', { type: 'image/png' });
      const input = document.createElement('input');
      Object.defineProperty(input, 'files', { value: [file] });

      handleFileSelect({ target: input } as unknown as Event);

      await flushPromises();

      expect(onError).toHaveBeenCalled();
      expect(displayError.value).toContain('too large');
      expect(model.value).toBeNull();
    });

    it('shows warning when file exceeds warning size', async () => {
      const model = ref<Uint8Array | null>(null);
      const onError = vi.fn();
      const [{ handleFileSelect, sizeWarning }, a] = withSetup(() =>
        useFileInput(
          model,
          {
            maxSizeBytes: ref(1000),
            warningSizeBytes: ref(50),
          },
          onError
        )
      );
      app = a;

      const mediumContent = new Uint8Array(100).fill(1);
      const file = new File([mediumContent], 'medium.png', {
        type: 'image/png',
      });
      const input = document.createElement('input');
      Object.defineProperty(input, 'files', { value: [file] });

      // Mock arrayBuffer on the file
      file.arrayBuffer = vi.fn().mockResolvedValue(mediumContent.buffer);

      handleFileSelect({ target: input } as unknown as Event);
      await flushPromises();

      expect(onError).not.toHaveBeenCalled();
      expect(sizeWarning.value).toContain('KB');
    });
  });
});

describe('useFilePreview', () => {
  let app: App | undefined;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(globalThis.URL, 'createObjectURL').mockReturnValue('blob:test-url');
    vi.spyOn(globalThis.URL, 'revokeObjectURL').mockImplementation(() => undefined);
  });

  afterEach(() => {
    app?.unmount();
    vi.restoreAllMocks();
  });

  it('creates preview URL when model has data', () => {
    const pngData = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a]);
    const model = ref<Uint8Array | null>(pngData);

    const [{ hasPreview, previewUrl }, a] = withSetup(() => useFilePreview(model));
    app = a;

    expect(hasPreview.value).toBe(true);
    expect(previewUrl.value).toBe('blob:test-url');
    expect(globalThis.URL.createObjectURL).toHaveBeenCalledOnce();
  });

  it('has no preview when model is null', () => {
    const model = ref<Uint8Array | null>(null);

    const [{ hasPreview, previewUrl }, a] = withSetup(() => useFilePreview(model));
    app = a;

    expect(hasPreview.value).toBe(false);
    expect(previewUrl.value).toBeNull();
  });

  it('revokes old preview URL when model changes', async () => {
    const initialData = new Uint8Array([0x89, 0x50, 0x4e, 0x47]);
    const model = ref<Uint8Array | null>(initialData);

    const [, a] = withSetup(() => useFilePreview(model));
    app = a;

    // Change model to new data
    model.value = new Uint8Array([0x89, 0x50, 0x4e, 0x48]);
    await flushPromises();

    expect(globalThis.URL.revokeObjectURL).toHaveBeenCalled();
  });

  it('revokes preview URL when model is set to null', async () => {
    const initialData = new Uint8Array([0x89, 0x50, 0x4e, 0x47]);
    const model = ref<Uint8Array | null>(initialData);

    const [{ hasPreview }, a] = withSetup(() => useFilePreview(model));
    app = a;

    expect(hasPreview.value).toBe(true);

    model.value = null;
    await flushPromises();

    expect(hasPreview.value).toBe(false);
    expect(globalThis.URL.revokeObjectURL).toHaveBeenCalled();
  });
});
