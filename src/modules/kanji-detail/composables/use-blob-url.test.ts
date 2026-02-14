/**
 * Tests for useBlobUrl composable
 *
 * TDD tests for blob URL lifecycle management.
 */

import { nextTick, ref } from 'vue'

import { withSetup } from '@test/helpers/with-setup'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useBlobUrl } from './use-blob-url'

// Mock URL.createObjectURL and revokeObjectURL
const mockCreateObjectURL = vi.fn()
const mockRevokeObjectURL = vi.fn()

describe('useBlobUrl', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateObjectURL.mockReturnValue('blob:test-url')
    globalThis.URL.createObjectURL = mockCreateObjectURL
    globalThis.URL.revokeObjectURL = mockRevokeObjectURL
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('URL creation (Task 3.1)', () => {
    it('creates blob URL from Uint8Array data', () => {
      const data = ref<Uint8Array | null>(
        new Uint8Array([0x89, 0x50, 0x4e, 0x47])
      )

      const [result] = withSetup(() => useBlobUrl(data))

      expect(result.url.value).toBe('blob:test-url')
      expect(mockCreateObjectURL).toHaveBeenCalled()
    })

    it('returns null URL when data is null', () => {
      const data = ref<Uint8Array | null>(null)

      const [result] = withSetup(() => useBlobUrl(data))

      expect(result.url.value).toBeNull()
      expect(mockCreateObjectURL).not.toHaveBeenCalled()
    })

    it('accepts getter function as data source', () => {
      const data = ref<Uint8Array | null>(
        new Uint8Array([0x89, 0x50, 0x4e, 0x47])
      )

      const [result] = withSetup(() => useBlobUrl(() => data.value))

      expect(result.url.value).toBe('blob:test-url')
    })
  })

  describe('MIME type detection (Task 3.1)', () => {
    it('detects PNG from magic bytes', () => {
      const pngData = new Uint8Array([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a
      ])
      const data = ref<Uint8Array | null>(pngData)

      withSetup(() => useBlobUrl(data))

      const blobArg = mockCreateObjectURL.mock.calls[0]?.[0] as Blob
      expect(blobArg).toBeInstanceOf(Blob)
      expect(blobArg.type).toBe('image/png')
    })

    it('detects JPEG from magic bytes', () => {
      const jpegData = new Uint8Array([0xff, 0xd8, 0xff, 0xe0])
      const data = ref<Uint8Array | null>(jpegData)

      withSetup(() => useBlobUrl(data))

      const blobArg = mockCreateObjectURL.mock.calls[0]?.[0] as Blob
      expect(blobArg.type).toBe('image/jpeg')
    })

    it('detects GIF from magic bytes', () => {
      const gifData = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61])
      const data = ref<Uint8Array | null>(gifData)

      withSetup(() => useBlobUrl(data))

      const blobArg = mockCreateObjectURL.mock.calls[0]?.[0] as Blob
      expect(blobArg.type).toBe('image/gif')
    })

    it('falls back to octet-stream for unknown types', () => {
      const unknownData = new Uint8Array([0x00, 0x01, 0x02, 0x03])
      const data = ref<Uint8Array | null>(unknownData)

      withSetup(() => useBlobUrl(data))

      const blobArg = mockCreateObjectURL.mock.calls[0]?.[0] as Blob
      expect(blobArg.type).toBe('application/octet-stream')
    })
  })

  describe('URL cleanup (Task 3.1)', () => {
    it('revokes previous URL when data changes', async () => {
      const data1 = new Uint8Array([0x89, 0x50, 0x4e, 0x47])
      const data2 = new Uint8Array([0xff, 0xd8, 0xff])
      const data = ref<Uint8Array | null>(data1)

      mockCreateObjectURL.mockReturnValueOnce('blob:url1')
      mockCreateObjectURL.mockReturnValueOnce('blob:url2')

      withSetup(() => useBlobUrl(data))

      expect(mockCreateObjectURL).toHaveBeenCalledTimes(1)

      data.value = data2
      await nextTick()

      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:url1')
      expect(mockCreateObjectURL).toHaveBeenCalledTimes(2)
    })

    it('revokes URL when data becomes null', async () => {
      const data = ref<Uint8Array | null>(
        new Uint8Array([0x89, 0x50, 0x4e, 0x47])
      )
      mockCreateObjectURL.mockReturnValue('blob:revoke-test')

      const [result] = withSetup(() => useBlobUrl(data))

      expect(result.url.value).toBe('blob:revoke-test')

      data.value = null
      await nextTick()

      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:revoke-test')
      expect(result.url.value).toBeNull()
    })

    it('revokes URL on component unmount', () => {
      const data = ref<Uint8Array | null>(
        new Uint8Array([0x89, 0x50, 0x4e, 0x47])
      )
      mockCreateObjectURL.mockReturnValue('blob:unmount-test')

      const [, app] = withSetup(() => useBlobUrl(data))

      expect(mockCreateObjectURL).toHaveBeenCalled()

      // Unmount the component
      app.unmount()

      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:unmount-test')
    })
  })
})
