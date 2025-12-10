/**
 * useKanjiForm
 *
 * Composable for managing kanji form state and validation.
 * Uses vee-validate with zod schema integration.
 */

import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'

import { kanjiFormSchema } from '../kanji-form-schema'

import type { KanjiFormData } from '../kanji-form-schema'

export interface UseKanjiFormOptions {
  /** Initial values for edit mode (undefined uses default empty values) */
  initialValues?: Partial<KanjiFormData> | undefined
  /** Callback when form is submitted successfully */
  onSubmit: (values: KanjiFormData) => void | Promise<void>
}

export function useKanjiForm(options: UseKanjiFormOptions) {
  const { initialValues, onSubmit } = options

  const schema = toTypedSchema(kanjiFormSchema)

  const {
    errors,
    handleSubmit,
    isSubmitting,
    resetForm: resetFormInternal,
    setFieldValue,
    values
  } = useForm<KanjiFormData>({
    initialValues: {
      character: '',
      jlptLevel: null,
      joyoLevel: null,
      kenteiLevel: null,
      notesEtymology: '',
      notesSemantic: '',
      notesEducationMnemonics: '',
      notesPersonal: '',
      strokeCount: undefined as unknown as number,
      strokeDiagramImage: null,
      strokeGifImage: null,
      componentIds: [],
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
