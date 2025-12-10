/**
 * useComponentForm tests
 *
 * Tests for the component form composable.
 */

import { nextTick, ref } from 'vue'

import { describe, expect, it, vi } from 'vitest'

// Mock vee-validate
const mockErrors = ref<Record<string, string>>({})
const mockIsSubmitting = ref(false)
const mockValues = ref({
  character: '',
  description: '',
  japaneseName: '',
  sourceKanjiId: null,
  strokeCount: undefined
})
const mockHandleSubmit = vi.fn(
  (fn: (values: unknown) => void | Promise<void>) => {
    return async () => {
      await fn(mockValues.value)
    }
  }
)
const mockResetForm = vi.fn()
const mockSetFieldValue = vi.fn()

vi.mock('vee-validate', () => ({
  useForm: vi.fn(() => ({
    errors: mockErrors,
    handleSubmit: mockHandleSubmit,
    isSubmitting: mockIsSubmitting,
    resetForm: mockResetForm,
    setFieldValue: mockSetFieldValue,
    values: mockValues
  }))
}))

vi.mock('@vee-validate/zod', () => ({
  toTypedSchema: vi.fn((schema: unknown) => schema)
}))

import { useComponentForm } from './use-component-form'

describe('useComponentForm', () => {
  it('returns form utilities', () => {
    const onSubmit = vi.fn()
    const result = useComponentForm({ onSubmit })

    expect(result).toHaveProperty('errors')
    expect(result).toHaveProperty('isSubmitting')
    expect(result).toHaveProperty('resetForm')
    expect(result).toHaveProperty('setFieldValue')
    expect(result).toHaveProperty('submitForm')
    expect(result).toHaveProperty('values')
  })

  it('calls onSubmit when form is submitted', async () => {
    const onSubmit = vi.fn()
    const { submitForm } = useComponentForm({ onSubmit })

    await submitForm()

    expect(onSubmit).toHaveBeenCalled()
  })

  it('resets form when resetForm is called', () => {
    const onSubmit = vi.fn()
    const { resetForm } = useComponentForm({ onSubmit })

    resetForm()

    expect(mockResetForm).toHaveBeenCalled()
  })

  it('exposes setFieldValue from vee-validate', () => {
    const onSubmit = vi.fn()
    const { setFieldValue } = useComponentForm({ onSubmit })

    expect(setFieldValue).toBe(mockSetFieldValue)
  })

  it('exposes errors from vee-validate', async () => {
    mockErrors.value = { character: 'Required' }
    const onSubmit = vi.fn()
    const { errors } = useComponentForm({ onSubmit })

    await nextTick()

    expect(errors.value).toEqual({ character: 'Required' })
  })

  it('exposes isSubmitting state', () => {
    const onSubmit = vi.fn()
    const { isSubmitting } = useComponentForm({ onSubmit })

    expect(isSubmitting.value).toBe(false)

    mockIsSubmitting.value = true
    expect(isSubmitting.value).toBe(true)
  })

  it('exposes form values', () => {
    const onSubmit = vi.fn()
    const { values } = useComponentForm({ onSubmit })

    // The mock returns a ref, so access via .value
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect((values as any).value).toEqual({
      character: '',
      description: '',
      japaneseName: '',
      sourceKanjiId: null,
      strokeCount: undefined
    })
  })

  it('accepts initial values for edit mode', () => {
    const onSubmit = vi.fn()
    useComponentForm({
      initialValues: { character: '亻', strokeCount: 2 },
      onSubmit
    })

    // Verify the composable can be created with initial values
    // (vee-validate's useForm is mocked, so we just verify no error)
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('handles async onSubmit', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const { submitForm } = useComponentForm({ onSubmit })

    await submitForm()

    expect(onSubmit).toHaveBeenCalled()
  })
})
