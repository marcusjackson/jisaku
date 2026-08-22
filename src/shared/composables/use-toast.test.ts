/**
 * Tests for useToast composable
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('useToast', () => {
  // Reset modules before each test to reset singleton state
  beforeEach(() => {
    vi.resetModules()
  })

  it('should start with empty toasts', async () => {
    const { useToast } = await import('./use-toast')
    const { toasts } = useToast()

    expect(toasts.value).toHaveLength(0)
  })

  it('should add toast when addToast is called', async () => {
    const { useToast } = await import('./use-toast')
    const { addToast, toasts } = useToast()

    addToast({ message: 'Test message' })

    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0]?.message).toBe('Test message')
  })

  it('should add toast with default type info when no type is specified', async () => {
    const { useToast } = await import('./use-toast')
    const { addToast, toasts } = useToast()

    addToast({ message: 'Test' })

    expect(toasts.value[0]?.type).toBe('info')
  })

  it('should add toast with specified type when type is provided', async () => {
    const { useToast } = await import('./use-toast')
    const { addToast, toasts } = useToast()

    addToast({ message: 'Test', type: 'error' })

    expect(toasts.value[0]?.type).toBe('error')
  })

  it('should add toast with title when title is provided', async () => {
    const { useToast } = await import('./use-toast')
    const { addToast, toasts } = useToast()

    addToast({ message: 'Message', title: 'Title' })

    expect(toasts.value[0]?.title).toBe('Title')
  })

  it('should remove toast when removeToast is called with id', async () => {
    const { useToast } = await import('./use-toast')
    const { addToast, removeToast, toasts } = useToast()

    const id = addToast({ message: 'Test' })
    expect(toasts.value).toHaveLength(1)

    removeToast(id)
    expect(toasts.value).toHaveLength(0)
  })

  it('should create success toast when success helper is called', async () => {
    const { useToast } = await import('./use-toast')
    const { success, toasts } = useToast()

    success('Success message')

    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0]?.type).toBe('success')
    expect(toasts.value[0]?.message).toBe('Success message')
  })

  it('should create error toast when error helper is called', async () => {
    const { useToast } = await import('./use-toast')
    const { error, toasts } = useToast()

    error('Error message')

    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0]?.type).toBe('error')
    expect(toasts.value[0]?.message).toBe('Error message')
  })

  it('should create info toast when info helper is called', async () => {
    const { useToast } = await import('./use-toast')
    const { info, toasts } = useToast()

    info('Info message')

    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0]?.type).toBe('info')
  })

  it('should create warning toast when warning helper is called', async () => {
    const { useToast } = await import('./use-toast')
    const { toasts, warning } = useToast()

    warning('Warning message')

    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0]?.type).toBe('warning')
  })

  it('should use provided title when success helper is called with title', async () => {
    const { useToast } = await import('./use-toast')
    const { success, toasts } = useToast()

    success('Message', 'Success Title')

    expect(toasts.value[0]?.title).toBe('Success Title')
  })

  it('should generate unique ids when multiple toasts are added', async () => {
    const { useToast } = await import('./use-toast')
    const { addToast, toasts } = useToast()

    addToast({ message: 'First' })
    addToast({ message: 'Second' })

    expect(toasts.value[0]?.id).not.toBe(toasts.value[1]?.id)
  })

  it('should set default duration when no duration is specified', async () => {
    const { useToast } = await import('./use-toast')
    const { addToast, toasts } = useToast()

    addToast({ message: 'Test' })

    expect(toasts.value[0]?.duration).toBe(2000)
  })

  it('should use custom duration when duration is specified', async () => {
    const { useToast } = await import('./use-toast')
    const { addToast, toasts } = useToast()

    addToast({ duration: 10000, message: 'Test' })

    expect(toasts.value[0]?.duration).toBe(10000)
  })
})
