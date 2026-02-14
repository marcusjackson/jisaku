/**
 * useBlobUrl
 *
 * Composable for managing blob URL lifecycle.
 * Creates blob URLs from Uint8Array data with MIME type detection,
 * and automatically revokes URLs when data changes or component unmounts.
 */

import { computed, onUnmounted, ref, watch } from 'vue'

import type { Ref } from 'vue'

export interface UseBlobUrlReturn {
  /** Reactive blob URL (null if no data) */
  url: Ref<string | null>
}

/**
 * MIME type signatures for magic byte detection
 * [minLength, bytesToMatch, mimeType]
 */
type MimeSignature = [number, number[], string]

const MIME_SIGNATURES: MimeSignature[] = [
  // PNG: 89 50 4E 47
  [4, [0x89, 0x50, 0x4e, 0x47], 'image/png'],
  // GIF: 47 49 46 38
  [4, [0x47, 0x49, 0x46, 0x38], 'image/gif'],
  // JPEG: FF D8 FF
  [3, [0xff, 0xd8, 0xff], 'image/jpeg'],
  // WebP: RIFF at 0-3, WEBP at 8-11 (check partial)
  [12, [0x52, 0x49, 0x46, 0x46], 'image/webp']
]

/**
 * Detect MIME type from magic bytes
 */
function detectMimeType(data: Uint8Array): string {
  for (const [minLen, bytes, mime] of MIME_SIGNATURES) {
    if (data.length >= minLen) {
      const matches = bytes.every((b, i) => data[i] === b)
      if (matches) return mime
    }
  }
  return 'application/octet-stream'
}

/**
 * Create a blob URL from Uint8Array data with MIME type detection
 */
function createBlobUrl(data: Uint8Array): string {
  const mimeType = detectMimeType(data)
  const blob = new Blob([data], { type: mimeType })
  return URL.createObjectURL(blob)
}

/**
 * Composable for blob URL lifecycle management
 *
 * @param data - Reactive data source (Ref or getter function)
 * @returns Object with reactive URL ref
 */
export function useBlobUrl(
  data: Ref<Uint8Array | null> | (() => Uint8Array | null)
): UseBlobUrlReturn {
  const url = ref<string | null>(null)

  // Normalize data source to a computed
  const dataSource = computed(() => {
    if (typeof data === 'function') {
      return data()
    }
    return data.value
  })

  /**
   * Revoke the current URL if it exists
   */
  function revokeCurrentUrl(): void {
    if (url.value) {
      URL.revokeObjectURL(url.value)
      url.value = null
    }
  }

  /**
   * Update the URL based on current data
   */
  function updateUrl(): void {
    // Revoke previous URL first
    revokeCurrentUrl()

    // Create new URL if we have data
    const currentData = dataSource.value
    if (currentData) {
      url.value = createBlobUrl(currentData)
    }
  }

  // Watch for data changes
  watch(dataSource, updateUrl, { immediate: true })

  // Cleanup on unmount
  onUnmounted(revokeCurrentUrl)

  return { url }
}
