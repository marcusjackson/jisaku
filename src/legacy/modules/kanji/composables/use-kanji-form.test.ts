/**
 * useKanjiForm tests
 *
 * Tests for the kanji form composable.
 */

import { nextTick, ref } from 'vue'

import { describe, expect, it, vi } from 'vitest'

// Mock vee-validate
const mockErrors = ref<Record<string, string>>({})
const mockIsSubmitting = ref(false)
const mockValues = ref({
  character: '',
  jlptLevel: null,
  joyoLevel: null,
  kenteiLevel: null,
  notesEtymology: '',
  notesSemantic: '',
  notesPersonal: '',
  radicalId: null,
  strokeCount: undefined,
  strokeDiagramImage: null,
  strokeGifImage: null
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

import { useKanjiForm } from './use-kanji-form'

describe('useKanjiForm', () => {
  it('returns form utilities', () => {
    const onSubmit = vi.fn()
    const result = useKanjiForm({ onSubmit })

    expect(result).toHaveProperty('errors')
    expect(result).toHaveProperty('isSubmitting')
    expect(result).toHaveProperty('resetForm')
    expect(result).toHaveProperty('setFieldValue')
    expect(result).toHaveProperty('submitForm')
    expect(result).toHaveProperty('values')
  })

  it('calls onSubmit when form is submitted', async () => {
    const onSubmit = vi.fn()
    const { submitForm } = useKanjiForm({ onSubmit })

    await submitForm()

    expect(onSubmit).toHaveBeenCalled()
  })

  it('resets form when resetForm is called', () => {
    const onSubmit = vi.fn()
    const { resetForm } = useKanjiForm({ onSubmit })

    resetForm()

    expect(mockResetForm).toHaveBeenCalled()
  })

  it('exposes setFieldValue from vee-validate', () => {
    const onSubmit = vi.fn()
    const { setFieldValue } = useKanjiForm({ onSubmit })

    expect(setFieldValue).toBe(mockSetFieldValue)
  })

  it('exposes errors from vee-validate', async () => {
    mockErrors.value = { character: 'Required' }
    const onSubmit = vi.fn()
    const { errors } = useKanjiForm({ onSubmit })

    await nextTick()

    expect(errors.value).toEqual({ character: 'Required' })
  })

  it('exposes isSubmitting state', () => {
    const onSubmit = vi.fn()
    const { isSubmitting } = useKanjiForm({ onSubmit })

    expect(isSubmitting.value).toBe(false)

    mockIsSubmitting.value = true
    expect(isSubmitting.value).toBe(true)
    mockIsSubmitting.value = false
  })

  it('accepts initial values for edit mode', () => {
    const onSubmit = vi.fn()
    useKanjiForm({
      initialValues: { character: '日', strokeCount: 4 },
      onSubmit
    })

    // Verify the composable can be created with initial values
    // (vee-validate's useForm is mocked, so we just verify no error)
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('handles async onSubmit', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const { submitForm } = useKanjiForm({ onSubmit })

    await submitForm()

    expect(onSubmit).toHaveBeenCalled()
  })
})
