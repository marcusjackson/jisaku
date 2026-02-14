/**
 * Tests for usePwa composable
 *
 * Note: This composable wraps vite-plugin-pwa's virtual module, which
 * requires mocking in tests since the service worker functionality
 * is only available in production builds.
 *
 * The mock is provided via vitest.config.ts alias to test/mocks/pwa-register.ts
 */

import { mockNeedRefresh, mockOfflineReady } from '@test/mocks/pwa-register'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { usePwa } from './use-pwa'

describe('usePwa', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNeedRefresh.value = false
    mockOfflineReady.value = false
  })

  it('returns needsUpdate ref', () => {
    const { needsUpdate } = usePwa()

    expect(needsUpdate.value).toBe(false)
  })

  it('returns offlineReady ref', () => {
    const { offlineReady } = usePwa()

    expect(offlineReady.value).toBe(false)
  })

  it('reflects needsUpdate when service worker needs refresh', () => {
    const { needsUpdate } = usePwa()

    mockNeedRefresh.value = true

    expect(needsUpdate.value).toBe(true)
  })

  it('reflects offlineReady when app is cached', () => {
    const { offlineReady } = usePwa()

    mockOfflineReady.value = true

    expect(offlineReady.value).toBe(true)
  })

  it('updateServiceWorker returns a promise', async () => {
    const { updateServiceWorker } = usePwa()

    const result = updateServiceWorker()

    expect(result).toBeInstanceOf(Promise)
    await result
  })

  it('dismissUpdate sets needsUpdate to false', () => {
    const { dismissUpdate, needsUpdate } = usePwa()

    mockNeedRefresh.value = true
    expect(needsUpdate.value).toBe(true)

    dismissUpdate()

    expect(needsUpdate.value).toBe(false)
  })

  it('returns all expected properties', () => {
    const result = usePwa()

    expect(result).toHaveProperty('needsUpdate')
    expect(result).toHaveProperty('offlineReady')
    expect(result).toHaveProperty('updateServiceWorker')
    expect(result).toHaveProperty('dismissUpdate')
  })

  it('needsUpdate is a reactive ref', () => {
    const { needsUpdate } = usePwa()

    expect(needsUpdate).toHaveProperty('value')
    expect(typeof needsUpdate.value).toBe('boolean')
  })
})
