/**
 * Tests for useBlobUrl composable: blob URL lifecycle and MIME detection.
 */

import { nextTick, ref } from 'vue';

import { withSetup } from '@test/helpers/with-setup';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useBlobUrl } from './use-blob-url';

import type { MockInstance } from 'vitest';

let mockCreateObjectURL: MockInstance<typeof URL.createObjectURL>;
let mockRevokeObjectURL: MockInstance<typeof URL.revokeObjectURL>;

describe('useBlobUrl', () => {
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

  describe('URL creation', () => {
    it('creates blob URL from Uint8Array data', () => {
      const data = ref<Uint8Array | null>(new Uint8Array([0x89, 0x50, 0x4e, 0x47]));

      const [result] = withSetup(() => useBlobUrl(data));

      expect(result.url.value).toBe('blob:test-url');
      expect(mockCreateObjectURL).toHaveBeenCalled();
    });

    it('returns null URL when data is null', () => {
      const data = ref<Uint8Array | null>(null);

      const [result] = withSetup(() => useBlobUrl(data));

      expect(result.url.value).toBeNull();
      expect(mockCreateObjectURL).not.toHaveBeenCalled();
    });

    it('accepts getter function as data source', () => {
      const data = ref<Uint8Array | null>(new Uint8Array([0x89, 0x50, 0x4e, 0x47]));

      const [result] = withSetup(() => useBlobUrl(() => data.value));

      expect(result.url.value).toBe('blob:test-url');
    });
  });

  describe('MIME type detection', () => {
    it('detects PNG from magic bytes', () => {
      const pngData = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
      const data = ref<Uint8Array | null>(pngData);

      withSetup(() => useBlobUrl(data));

      const blobArg = mockCreateObjectURL.mock.calls[0]?.[0] as Blob;
      expect(blobArg).toBeInstanceOf(Blob);
      expect(blobArg.type).toBe('image/png');
    });

    it('detects JPEG from magic bytes', () => {
      const jpegData = new Uint8Array([0xff, 0xd8, 0xff, 0xe0]);
      const data = ref<Uint8Array | null>(jpegData);

      withSetup(() => useBlobUrl(data));

      const blobArg = mockCreateObjectURL.mock.calls[0]?.[0] as Blob;
      expect(blobArg.type).toBe('image/jpeg');
    });

    it('detects GIF from magic bytes', () => {
      const gifData = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]);
      const data = ref<Uint8Array | null>(gifData);

      withSetup(() => useBlobUrl(data));

      const blobArg = mockCreateObjectURL.mock.calls[0]?.[0] as Blob;
      expect(blobArg.type).toBe('image/gif');
    });

    it('detects WebP when RIFF is followed by WEBP at bytes 8-11', () => {
      const webp = new Uint8Array([
        0x52, 0x49, 0x46, 0x46, 0x10, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
      ]);

      withSetup(() => useBlobUrl(ref<Uint8Array | null>(webp)));

      const blobArg = mockCreateObjectURL.mock.calls[0]?.[0] as Blob;
      expect(blobArg.type).toBe('image/webp');
    });

    it('does not treat a RIFF/WAVE file as WebP', () => {
      const wave = new Uint8Array([
        0x52, 0x49, 0x46, 0x46, 0x10, 0x00, 0x00, 0x00, 0x57, 0x41, 0x56, 0x45,
      ]);

      withSetup(() => useBlobUrl(ref<Uint8Array | null>(wave)));

      const blobArg = mockCreateObjectURL.mock.calls[0]?.[0] as Blob;
      expect(blobArg.type).toBe('application/octet-stream');
    });

    it('falls back to octet-stream for unknown types', () => {
      const unknownData = new Uint8Array([0x00, 0x01, 0x02, 0x03]);
      const data = ref<Uint8Array | null>(unknownData);

      withSetup(() => useBlobUrl(data));

      const blobArg = mockCreateObjectURL.mock.calls[0]?.[0] as Blob;
      expect(blobArg.type).toBe('application/octet-stream');
    });
  });

  describe('URL cleanup', () => {
    it('revokes previous URL when data changes', async () => {
      const data1 = new Uint8Array([0x89, 0x50, 0x4e, 0x47]);
      const data2 = new Uint8Array([0xff, 0xd8, 0xff]);
      const data = ref<Uint8Array | null>(data1);

      mockCreateObjectURL.mockReturnValueOnce('blob:url1');
      mockCreateObjectURL.mockReturnValueOnce('blob:url2');

      withSetup(() => useBlobUrl(data));

      expect(mockCreateObjectURL).toHaveBeenCalledTimes(1);

      data.value = data2;
      await nextTick();

      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:url1');
      expect(mockCreateObjectURL).toHaveBeenCalledTimes(2);
    });

    it('revokes URL when data becomes null', async () => {
      const data = ref<Uint8Array | null>(new Uint8Array([0x89, 0x50, 0x4e, 0x47]));
      mockCreateObjectURL.mockReturnValue('blob:revoke-test');

      const [result] = withSetup(() => useBlobUrl(data));

      expect(result.url.value).toBe('blob:revoke-test');

      data.value = null;
      await nextTick();

      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:revoke-test');
      expect(result.url.value).toBeNull();
    });

    it('revokes URL on component unmount', () => {
      const data = ref<Uint8Array | null>(new Uint8Array([0x89, 0x50, 0x4e, 0x47]));
      mockCreateObjectURL.mockReturnValue('blob:unmount-test');

      const [, app] = withSetup(() => useBlobUrl(data));

      expect(mockCreateObjectURL).toHaveBeenCalled();

      // Unmount the component
      app.unmount();

      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:unmount-test');
    });
  });
});
