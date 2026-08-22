/**
 * use-settings-classification-type-section
 *
 * Composable encapsulating state and handlers for the
 * Classification Types settings section (CRUD + reordering).
 */

import { onMounted, ref } from 'vue'

import { useClassificationTypeRepository } from '@/api/classification'

import { useToast } from '@/shared/composables/use-toast'

import { emptyClassificationTypeForm } from '../settings-types'
import {
  loadClassificationTypes,
  makeCreateHandlers,
  makeDeleteHandlers,
  makeEditHandlers
} from '../utils/classification-type-handlers'
import { makeReorderHandlers } from '../utils/classification-type-reorder-handlers'

import type {
  ClassificationTypeFormValues,
  ClassificationTypeSectionState
} from '../settings-types'
import type { ClassificationType } from '@/api/classification'
import type { Ref } from 'vue'

type UseClassificationTypeSectionReturn = {
  classificationTypes: Ref<ClassificationType[]>
  showCreateDialog: Ref<boolean>
  showEditDialog: Ref<boolean>
  showDeleteDialog: Ref<boolean>
  editingItem: Ref<ClassificationType | null>
  deletingItem: Ref<ClassificationType | null>
  deleteUsageCount: Ref<number>
  createForm: Ref<ClassificationTypeFormValues>
  editForm: Ref<ClassificationTypeFormValues>
} & ReturnType<typeof makeCreateHandlers> &
  ReturnType<typeof makeEditHandlers> &
  ReturnType<typeof makeDeleteHandlers> &
  ReturnType<typeof makeReorderHandlers>

/**
 * Manages state and handlers for the Classification Types settings section.
 * Encapsulates CRUD operations and reordering for classification types.
 *
 * @returns Reactive state and CRUD/reorder handlers for classification types
 */
export function useClassificationTypeSection(): UseClassificationTypeSectionReturn {
  const repo = useClassificationTypeRepository()
  const toast = useToast()
  const s: ClassificationTypeSectionState = {
    repo,
    toast,
    classificationTypes: ref([]),
    showCreateDialog: ref(false),
    showEditDialog: ref(false),
    showDeleteDialog: ref(false),
    editingItem: ref(null),
    deletingItem: ref(null),
    deleteUsageCount: ref(0),
    createForm: ref(emptyClassificationTypeForm()),
    editForm: ref(emptyClassificationTypeForm())
  }

  onMounted(() => {
    loadClassificationTypes(s)
  })

  return {
    classificationTypes: s.classificationTypes,
    showCreateDialog: s.showCreateDialog,
    showEditDialog: s.showEditDialog,
    showDeleteDialog: s.showDeleteDialog,
    editingItem: s.editingItem,
    deletingItem: s.deletingItem,
    deleteUsageCount: s.deleteUsageCount,
    createForm: s.createForm,
    editForm: s.editForm,
    ...makeCreateHandlers(s),
    ...makeEditHandlers(s),
    ...makeDeleteHandlers(s),
    ...makeReorderHandlers(s)
  }
}
