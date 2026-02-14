<script setup lang="ts">
/* eslint-disable max-lines -- Dialog with local state requires inline handlers and template logic */
/**
 * KanjiDetailDialogComponents
 *
 * Dialog for managing component occurrences with local state and explicit save/cancel.
 * Changes are not persisted until the user clicks Save.
 */

import { computed, ref, watch } from 'vue'

import BaseButton from '@/base/components/BaseButton.vue'
import BaseDialog from '@/base/components/BaseDialog.vue'

import SharedConfirmDialog from '@/shared/components/SharedConfirmDialog.vue'
import SharedQuickCreateComponent from '@/shared/components/SharedQuickCreateComponent.vue'

import { useKanjiDetailComponentsDialogState } from '../composables/use-kanji-detail-components-dialog-state'
import { useKanjiDetailDialogComponentsHandlers } from '../composables/use-kanji-detail-dialog-components-handlers'
import { useKanjiDetailDialogComponentsSave } from '../composables/use-kanji-detail-dialog-components-save'

import KanjiDetailComponentOccurrenceEditor from './KanjiDetailComponentOccurrenceEditor.vue'
import KanjiDetailComponentSearch from './KanjiDetailComponentSearch.vue'

import type { ComponentOccurrenceWithDetails } from '../kanji-detail-types'
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
  save: [
    changes: {
      toLink: {
        componentId: number
        positionTypeId: number | null
        componentFormId: number | null
        isRadical: boolean
      }[]
      toUpdate: {
        id: number
        positionTypeId: number | null
        componentFormId: number | null
        isRadical: boolean
      }[]
      toDelete: number[]
    }
  ]
  /** Create new component */
  create: [data: QuickCreateComponentData]
}>()

// Local edit state
const editOccurrences = ref<EditOccurrence[]>([])
const linkedOccurrencesRef = computed(() => props.linkedOccurrences)

// Save logic
const { calculateSaveData } = useKanjiDetailDialogComponentsSave(
  editOccurrences,
  linkedOccurrencesRef
)

// Initialize edit state from props when dialog opens
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      editOccurrences.value = props.linkedOccurrences.map((occ) => ({
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

/** Handle save - emit all changes */
function handleSave(): void {
  const changes = calculateSaveData()
  emit('save', changes)
  emit('update:open', false)
}

/** Handle cancel - discard changes */
function handleCancel(): void {
  emit('update:open', false)
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
          @create="
            (term: string) => {
              quickCreateSearchTerm = term
              quickCreateDialogOpen = true
            }
          "
          @select="handleComponentSelect"
        />
      </div>

      <!-- Linked Occurrences Section -->
      <div
        v-if="getVisibleOccurrences().length > 0"
        class="kanji-detail-dialog-components-section"
      >
        <h3 class="kanji-detail-dialog-components-section-title">
          Linked Components ({{ getVisibleOccurrences().length }})
        </h3>

        <div class="kanji-detail-dialog-components-list">
          <KanjiDetailComponentOccurrenceEditor
            v-for="occurrence in getVisibleOccurrences()"
            :key="`${occurrence.id ?? 'new'}-${occurrence.componentId}`"
            :component-forms="
              componentFormsMap.get(occurrence.componentId) ?? []
            "
            :destructive-mode="props.destructiveMode"
            :occurrence="
              {
                ...occurrence,
                kanjiId: 0,
                analysisNotes: null,
                displayOrder: 0,
                createdAt: '',
                updatedAt: '',
                position: occurrence.position
                  ? {
                      id: 0,
                      positionName: occurrence.position,
                      nameJapanese: null,
                      nameEnglish: null,
                      description: null,
                      displayOrder: 0
                    }
                  : null
              } as ComponentOccurrenceWithDetails
            "
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
    @cancel="
      () => {
        quickCreateDialogOpen = false
        quickCreateSearchTerm = ''
      }
    "
    @create="
      (data) => {
        emit('create', data)
        quickCreateDialogOpen = false
        quickCreateSearchTerm = ''
      }
    "
  />

  <!-- Confirmation Dialog -->
  <SharedConfirmDialog
    v-model:open="showConfirmDialog"
    confirm-label="Unlink"
    description="Are you sure you want to unlink this component from the kanji? This action cannot be undone."
    title="Confirm Unlink"
    variant="danger"
    @cancel="
      () => {
        showConfirmDialog = false
        pendingRemoveOccurrenceId = null
      }
    "
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
