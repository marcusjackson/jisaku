/**
 * useComponentForm
 *
 * Composable for managing component form state and validation.
 * Uses vee-validate with zod schema integration.
 */

import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'

import { componentFormSchema } from '../component-form-schema'

import type { ComponentFormData } from '../component-form-schema'

export interface UseComponentFormOptions {
  /** Initial values for edit mode (undefined uses default empty values) */
  initialValues?: Partial<ComponentFormData> | undefined
  /** Callback when form is submitted successfully */
  onSubmit: (values: ComponentFormData) => void | Promise<void>
}

export function useComponentForm(options: UseComponentFormOptions) {
  const { initialValues, onSubmit } = options

  const schema = toTypedSchema(componentFormSchema)

  const {
    errors,
    handleSubmit,
    isSubmitting,
    resetForm: resetFormInternal,
    setFieldValue,
    values
  } = useForm<ComponentFormData>({
    initialValues: {
      character: '',
      description: '',
      searchKeywords: '',
      sourceKanjiId: null,
      strokeCount: undefined,
      canBeRadical: false,
      kangxiNumber: null,
      kangxiMeaning: '',
      radicalNameJapanese: '',
      ...initialValues
    },
    validationSchema: schema
  })

  const submitForm = handleSubmit(async (formValues) => {
    await onSubmit(formValues)
  })

  function resetForm() {
    resetFormInternal()
  }

  return {
    /** Field errors (computed ref) */
    errors,
    /** Whether form is currently submitting (ref) */
    isSubmitting: isSubmitting,
    /** Reset form to initial values */
    resetForm,
    /** Set a specific field's value */
    setFieldValue,
    /** Submit handler to call on form submit */
    submitForm,
    /** Form values (reactive) */
    values
  }
}
