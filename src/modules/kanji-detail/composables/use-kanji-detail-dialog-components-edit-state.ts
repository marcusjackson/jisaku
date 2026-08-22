/**
 * use-kanji-detail-dialog-components-edit-state
 *
 * Manages local edit state, initialization, and save/cancel logic for
 * the KanjiDetailDialogComponents dialog. Extracted to keep the component
 * within the 225-line UI component size limit.
 */

import { computed, ref, watch } from 'vue'

import { useKanjiDetailDialogComponentsSave } from './use-kanji-detail-dialog-components-save'

import type {
  ComponentOccurrenceWithDetails,
  DialogComponentChanges
} from '../kanji-detail-types'
import type { EditOccurrence } from '../utils/edit-occurrence-types'
import type { Ref } from 'vue'

// ============================================================================
// Types
// ============================================================================

interface EmitFn {
  (event: 'save', changes: DialogComponentChanges): void
  (event: 'update:open', open: boolean): void
}

// ============================================================================
// Composable
// ============================================================================

interface UseKanjiDetailDialogComponentsEditStateReturn {
  editOccurrences: Ref<EditOccurrence[]>
  handleSave: () => void
  handleCancel: () => void
}

/**
 * Manages local edit state and save/cancel logic for the components dialog.
 * Initializes edit occurrences from linked occurrences when the dialog opens.
 *
 * @param linkedOccurrences - Current linked component occurrences
 * @param isOpen - Ref tracking whether the dialog is open
 * @param emit - Component emit function for save and open events
 * @returns Edit state and save/cancel handlers
 */
export function useKanjiDetailDialogComponentsEditState(
  linkedOccurrences: Ref<ComponentOccurrenceWithDetails[]>,
  isOpen: Ref<boolean>,
  emit: EmitFn
): UseKanjiDetailDialogComponentsEditStateReturn {
  const editOccurrences = ref<EditOccurrence[]>([])
  const linkedOccurrencesRef = computed(() => linkedOccurrences.value)

  const { calculateSaveData } = useKanjiDetailDialogComponentsSave(
    editOccurrences,
    linkedOccurrencesRef
  )

  // Initialize edit state from props when dialog opens
  watch(
    isOpen,
    (open) => {
      if (open) {
        editOccurrences.value = linkedOccurrences.value.map((occ) => ({
          id: occ.id,
          componentId: occ.componentId,
          positionTypeId: occ.positionTypeId,
          componentFormId: occ.componentFormId,
          isRadical: occ.isRadical,
          component: occ.component,
          position: occ.position ? occ.position.positionName : null,
          form: occ.form
        }))
      }
    },
    { immediate: true }
  )

  function handleSave(): void {
    emit('save', calculateSaveData())
    emit('update:open', false)
  }

  function handleCancel(): void {
    emit('update:open', false)
  }

  return { editOccurrences, handleSave, handleCancel }
}
