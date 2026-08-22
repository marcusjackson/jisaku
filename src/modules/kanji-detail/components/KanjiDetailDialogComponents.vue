<script setup lang="ts">
/**
 * KanjiDetailDialogComponents
 *
 * Dialog for managing component occurrences with local state and explicit save/cancel.
 * Changes are not persisted until the user clicks Save.
 */

import { computed } from 'vue'

import BaseButton from '@/base/components/BaseButton.vue'
import BaseDialog from '@/base/components/BaseDialog.vue'

import SharedConfirmDialog from '@/shared/components/SharedConfirmDialog.vue'
import SharedQuickCreateComponent from '@/shared/components/SharedQuickCreateComponent.vue'

import { useKanjiDetailComponentsDialogState } from '../composables/use-kanji-detail-components-dialog-state'
import { useKanjiDetailDialogComponentsEditState } from '../composables/use-kanji-detail-dialog-components-edit-state'
import { useKanjiDetailDialogComponentsHandlers } from '../composables/use-kanji-detail-dialog-components-handlers'

import KanjiDetailComponentOccurrenceEditor from './KanjiDetailComponentOccurrenceEditor.vue'
import KanjiDetailComponentSearch from './KanjiDetailComponentSearch.vue'

import type {
  ComponentOccurrenceWithDetails,
  DialogComponentChanges
} from '../kanji-detail-types'
import type { EditOccurrence } from '../utils/edit-occurrence-types'
import type { Component } from '@/api/component/component-types'
import type { QuickCreateComponentData } from '@/shared/validation/quick-create-component-schema'

const props = defineProps<{
  /** Whether dialog is open */
  open: boolean
  /** All available components for searching */
  allComponents: Component[]
  /** Currently linked occurrences */
  linkedOccurrences: ComponentOccurrenceWithDetails[]
  /** Whether destructive mode is enabled (shows unlink buttons) */
  destructiveMode: boolean
}>()

const emit = defineEmits<{
  /** Update dialog open state */
  'update:open': [open: boolean]
  /** Save all changes */
  save: [changes: DialogComponentChanges]
  /** Create new component */
  create: [data: QuickCreateComponentData]
}>()

// Edit state, watch initialization, and save/cancel logic
const { editOccurrences, handleCancel, handleSave } =
  useKanjiDetailDialogComponentsEditState(
    computed(() => props.linkedOccurrences),
    computed(() => props.open),
    emit
  )

const {
  availableComponents,
  componentFormsMap,
  pendingRemoveOccurrenceId,
  positionTypes,
  quickCreateDialogOpen,
  quickCreateSearchTerm,
  showConfirmDialog
} = useKanjiDetailComponentsDialogState(props)

// Dialog handlers
const {
  getVisibleOccurrences,
  handleComponentSelect,
  handleOccurrenceUpdate,
  handleUnlinkConfirm,
  handleUnlinkRequest
} = useKanjiDetailDialogComponentsHandlers(
  editOccurrences,
  props.allComponents,
  pendingRemoveOccurrenceId,
  showConfirmDialog
)

/** Build full occurrence detail for the editor (adapts EditOccurrence → ComponentOccurrenceWithDetails) */
function toOccurrenceDetail(
  occ: EditOccurrence
): ComponentOccurrenceWithDetails {
  return {
    ...occ,
    kanjiId: 0,
    analysisNotes: null,
    displayOrder: 0,
    createdAt: '',
    updatedAt: '',
    position: occ.position
      ? {
          id: 0,
          positionName: occ.position,
          nameJapanese: null,
          nameEnglish: null,
          description: null,
          displayOrder: 0
        }
      : null
  } as ComponentOccurrenceWithDetails
}

function handleQuickCreateRequest(term: string): void {
  quickCreateSearchTerm.value = term
  quickCreateDialogOpen.value = true
}

const visibleOccurrences = computed(() => getVisibleOccurrences())

function handleQuickCreateCancel(): void {
  quickCreateDialogOpen.value = false
  quickCreateSearchTerm.value = ''
}

function handleQuickCreateConfirm(data: QuickCreateComponentData): void {
  emit('create', data)
  quickCreateDialogOpen.value = false
  quickCreateSearchTerm.value = ''
}

function handleUnlinkCancel(): void {
  showConfirmDialog.value = false
  pendingRemoveOccurrenceId.value = null
}
</script>

<template>
  <BaseDialog
    description="Search and link components, or edit existing component occurrences."
    :open="props.open"
    title="Manage Components"
    @update:open="emit('update:open', $event)"
  >
    <div class="kanji-detail-dialog-components-body">
      <!-- Search Section -->
      <div class="kanji-detail-dialog-components-section">
        <h3 class="kanji-detail-dialog-components-section-title">
          Add Component
        </h3>
        <KanjiDetailComponentSearch
          :available-components="availableComponents"
          @create="handleQuickCreateRequest"
          @select="handleComponentSelect"
        />
      </div>

      <!-- Linked Occurrences Section -->
      <div
        v-if="visibleOccurrences.length > 0"
        class="kanji-detail-dialog-components-section"
      >
        <h3 class="kanji-detail-dialog-components-section-title">
          Linked Components ({{ visibleOccurrences.length }})
        </h3>

        <div class="kanji-detail-dialog-components-list">
          <KanjiDetailComponentOccurrenceEditor
            v-for="occurrence in visibleOccurrences"
            :key="`${occurrence.id ?? 'new'}-${occurrence.componentId}`"
            :component-forms="
              componentFormsMap.get(occurrence.componentId) ?? []
            "
            :destructive-mode="props.destructiveMode"
            :occurrence="toOccurrenceDetail(occurrence)"
            :position-types="positionTypes"
            @unlink="
              () => handleUnlinkRequest(occurrence.id, occurrence.componentId)
            "
            @update="
              (field, value) =>
                handleOccurrenceUpdate(
                  occurrence.id,
                  occurrence.componentId,
                  field,
                  value
                )
            "
          />
        </div>
      </div>
    </div>

    <template #footer>
      <div class="kanji-detail-dialog-components-footer">
        <BaseButton
          type="button"
          variant="secondary"
          @click="handleCancel"
        >
          Cancel
        </BaseButton>
        <BaseButton
          type="button"
          @click="handleSave"
        >
          Save
        </BaseButton>
      </div>
    </template>
  </BaseDialog>

  <!-- Quick Create Component Dialog -->
  <SharedQuickCreateComponent
    v-model:open="quickCreateDialogOpen"
    :initial-character="
      quickCreateSearchTerm.length === 1 ? quickCreateSearchTerm : undefined
    "
    @cancel="handleQuickCreateCancel"
    @create="handleQuickCreateConfirm"
  />

  <!-- Confirmation Dialog -->
  <SharedConfirmDialog
    v-model:open="showConfirmDialog"
    confirm-label="Unlink"
    description="Are you sure you want to unlink this component from the kanji? This action cannot be undone."
    title="Confirm Unlink"
    variant="danger"
    @cancel="handleUnlinkCancel"
    @confirm="handleUnlinkConfirm"
  />
</template>

<style scoped>
.kanji-detail-dialog-components-body {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.kanji-detail-dialog-components-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.kanji-detail-dialog-components-section-title {
  margin: 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
}

.kanji-detail-dialog-components-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.kanji-detail-dialog-components-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
}
</style>
