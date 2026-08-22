/**
 * use-settings-position-type-section
 *
 * Composable encapsulating state and handlers for the
 * Position Types settings section (CRUD + reordering).
 */

import { onMounted, ref } from 'vue'

import { usePositionTypeRepository } from '@/api/position'

import { useToast } from '@/shared/composables/use-toast'

import { emptyPositionTypeForm } from '../settings-types'
import {
  loadPositionTypes,
  makeCreateHandlers,
  makeDeleteHandlers,
  makeEditHandlers
} from '../utils/position-type-handlers'
import { makeReorderHandlers } from '../utils/position-type-reorder-handlers'

import type {
  PositionTypeFormValues,
  PositionTypeSectionState
} from '../settings-types'
import type { PositionType } from '@/api/position'
import type { Ref } from 'vue'

type UsePositionTypeSectionReturn = {
  positionTypes: Ref<PositionType[]>
  showCreateDialog: Ref<boolean>
  showEditDialog: Ref<boolean>
  showDeleteDialog: Ref<boolean>
  editingItem: Ref<PositionType | null>
  deletingItem: Ref<PositionType | null>
  deleteUsageCount: Ref<number>
  createForm: Ref<PositionTypeFormValues>
  editForm: Ref<PositionTypeFormValues>
} & ReturnType<typeof makeCreateHandlers> &
  ReturnType<typeof makeEditHandlers> &
  ReturnType<typeof makeDeleteHandlers> &
  ReturnType<typeof makeReorderHandlers>

/**
 * Manages state and handlers for the Position Types settings section.
 * Encapsulates CRUD operations and reordering for position types.
 *
 * @returns Reactive state and CRUD/reorder handlers for position types
 */
export function usePositionTypeSection(): UsePositionTypeSectionReturn {
  const repo = usePositionTypeRepository()
  const toast = useToast()
  const s: PositionTypeSectionState = {
    repo,
    toast,
    positionTypes: ref([]),
    showCreateDialog: ref(false),
    showEditDialog: ref(false),
    showDeleteDialog: ref(false),
    editingItem: ref(null),
    deletingItem: ref(null),
    deleteUsageCount: ref(0),
    createForm: ref(emptyPositionTypeForm()),
    editForm: ref(emptyPositionTypeForm())
  }

  onMounted(() => {
    loadPositionTypes(s)
  })

  return {
    positionTypes: s.positionTypes,
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
