/**
 * Use Component Detail Form Handlers
 *
 * Handles form CRUD operations for the component detail page.
 */

import { useComponentFormRepository } from '@/api/component'

import { useToast } from '@/shared/composables'

import type { FormSubmitData } from '../component-detail-types'
import type { ComponentForm } from '@/api/component'
import type { Ref } from 'vue'

/** Dependencies for the composable */
interface UseComponentDetailFormHandlersDeps {
  /** Component ID ref */
  componentId: Ref<number | null>
  /** Forms list ref to update */
  forms: Ref<ComponentForm[]>
}

/** Return type of the composable */
interface UseComponentDetailFormHandlersReturn {
  handleFormAdd: (
    data: Omit<FormSubmitData, 'formCharacter'> & { formCharacter: string }
  ) => void
  handleFormUpdate: (id: number, data: FormSubmitData) => void
  handleFormRemove: (id: number) => void
  handleFormReorder: (ids: number[]) => void
}

// Helper to reload forms from repository
function createFormsReloader(
  componentId: Ref<number | null>,
  forms: Ref<ComponentForm[]>,
  repo: ReturnType<typeof useComponentFormRepository>
) {
  return (): void => {
    if (componentId.value === null) return
    forms.value = repo.getByParentId(componentId.value)
  }
}

// Helper to create add handler
function createAddHandler(
  componentId: Ref<number | null>,
  reloadForms: () => void,
  repo: ReturnType<typeof useComponentFormRepository>,
  toast: ReturnType<typeof useToast>
) {
  return (
    data: Omit<FormSubmitData, 'formCharacter'> & { formCharacter: string }
  ): void => {
    if (componentId.value === null) return
    try {
      repo.create({
        componentId: componentId.value,
        formCharacter: data.formCharacter,
        formName: data.formName,
        strokeCount: data.strokeCount,
        usageNotes: data.usageNotes
      })
      reloadForms()
      toast.success('Form added')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add form')
    }
  }
}

// Helper to create update handler
function createUpdateHandler(
  reloadForms: () => void,
  repo: ReturnType<typeof useComponentFormRepository>,
  toast: ReturnType<typeof useToast>
) {
  return (id: number, data: FormSubmitData): void => {
    try {
      repo.update(id, {
        formName: data.formName,
        strokeCount: data.strokeCount,
        usageNotes: data.usageNotes
      })
      reloadForms()
      toast.success('Form updated')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update form')
    }
  }
}

export function useComponentDetailFormHandlers(
  deps: UseComponentDetailFormHandlersDeps
): UseComponentDetailFormHandlersReturn {
  const { componentId, forms } = deps
  const componentFormRepo = useComponentFormRepository()
  const toast = useToast()

  const reloadForms = createFormsReloader(componentId, forms, componentFormRepo)
  const handleFormAdd = createAddHandler(
    componentId,
    reloadForms,
    componentFormRepo,
    toast
  )
  const handleFormUpdate = createUpdateHandler(
    reloadForms,
    componentFormRepo,
    toast
  )

  function handleFormRemove(id: number): void {
    if (componentId.value === null) return
    try {
      componentFormRepo.remove(id)
      reloadForms()
      toast.success('Form deleted')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete form')
    }
  }

  function handleFormReorder(ids: number[]): void {
    if (componentId.value === null) return
    try {
      componentFormRepo.reorder(ids)
      reloadForms()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to reorder forms'
      )
    }
  }

  return {
    handleFormAdd,
    handleFormUpdate,
    handleFormRemove,
    handleFormReorder
  }
}
