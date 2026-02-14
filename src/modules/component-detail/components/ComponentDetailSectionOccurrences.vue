<script setup lang="ts">
/**
 * ComponentDetailSectionOccurrences - Kanji occurrences section with CRUD.
 *
 * Displays collapsible section containing kanji occurrences list, add/edit
 * dialogs, and delete confirmation. Emits events to parent for data operations.
 */

import { computed, ref } from 'vue'

import SharedConfirmDialog from '@/shared/components/SharedConfirmDialog.vue'
import SharedSection from '@/shared/components/SharedSection.vue'

import ComponentDetailDialogAddKanji from './ComponentDetailDialogAddKanji.vue'
import ComponentDetailDialogEditOccurrence from './ComponentDetailDialogEditOccurrence.vue'
import ComponentDetailOccurrenceItem from './ComponentDetailOccurrenceItem.vue'

import type { OccurrenceUpdateData } from '../component-detail-types'
import type { ComponentForm, OccurrenceWithKanji } from '@/api/component'
import type { Kanji } from '@/api/kanji'
import type { PositionType } from '@/api/position/position-types'
import type { QuickCreateKanjiData } from '@/shared/validation'

// =============================================================================
// Props & Emits
// =============================================================================

interface Props {
  /** List of occurrences with joined kanji and position data */
  occurrences: OccurrenceWithKanji[]
  /** Parent component ID */
  componentId: number
  /** Available forms for this component */
  forms: ComponentForm[]
  /** Position types for dropdown */
  positionTypes: PositionType[]
  /** Whether destructive mode is enabled */
  isDestructiveMode: boolean
  /** All kanji for search (excluding already linked) */
  allKanji: Kanji[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  /** Link a kanji to this component */
  add: [kanjiId: number]
  /** Create new kanji and link it */
  create: [data: QuickCreateKanjiData]
  /** Update occurrence metadata */
  update: [id: number, data: OccurrenceUpdateData]
  /** Remove occurrence */
  remove: [id: number]
  /** Reorder occurrences */
  reorder: [ids: number[]]
}>()

// =============================================================================
// State
// =============================================================================

const showAddDialog = ref(false)
const showEditDialog = ref(false)
const showDeleteDialog = ref(false)
const editingOccurrence = ref<OccurrenceWithKanji | null>(null)
const deletingOccurrence = ref<OccurrenceWithKanji | null>(null)

// =============================================================================
// Computed
// =============================================================================

const defaultOpen = computed(() => props.occurrences.length > 0)

/** IDs of kanji already linked to this component */
const excludedKanjiIds = computed(() =>
  props.occurrences.map((occ) => occ.kanjiId)
)

// =============================================================================
// Handlers - Add Kanji
// =============================================================================

function handleAddClick() {
  showAddDialog.value = true
}

function handleAddSelect(kanjiId: number) {
  emit('add', kanjiId)
  showAddDialog.value = false
}

function handleAddCreate(data: QuickCreateKanjiData) {
  emit('create', data)
  showAddDialog.value = false
}

// =============================================================================
// Handlers - Edit Occurrence
// =============================================================================

function handleEditClick(occurrence: OccurrenceWithKanji) {
  editingOccurrence.value = occurrence
  showEditDialog.value = true
}

function handleEditSubmit(data: OccurrenceUpdateData) {
  if (editingOccurrence.value) {
    emit('update', editingOccurrence.value.id, data)
  }
  showEditDialog.value = false
  editingOccurrence.value = null
}

function handleEditCancel() {
  showEditDialog.value = false
  editingOccurrence.value = null
}

// =============================================================================
// Handlers - Delete Occurrence
// =============================================================================

function handleDeleteClick(occurrence: OccurrenceWithKanji) {
  deletingOccurrence.value = occurrence
  showDeleteDialog.value = true
}

function handleDeleteConfirm() {
  if (deletingOccurrence.value) {
    emit('remove', deletingOccurrence.value.id)
  }
  showDeleteDialog.value = false
  deletingOccurrence.value = null
}

function handleDeleteCancel() {
  showDeleteDialog.value = false
  deletingOccurrence.value = null
}

// =============================================================================
// Handlers - Reorder
// =============================================================================

function handleMoveUp(index: number) {
  if (index <= 0) return
  const ids = props.occurrences.map((o) => o.id)
  const current = ids[index]
  const previous = ids[index - 1]
  if (current === undefined || previous === undefined) return
  ids[index - 1] = current
  ids[index] = previous
  emit('reorder', ids)
}

function handleMoveDown(index: number) {
  if (index >= props.occurrences.length - 1) return
  const ids = props.occurrences.map((o) => o.id)
  const current = ids[index]
  const next = ids[index + 1]
  if (current === undefined || next === undefined) return
  ids[index] = next
  ids[index + 1] = current
  emit('reorder', ids)
}

// Expose for testing
defineExpose({ excludedKanjiIds })
</script>

<template>
  <SharedSection
    collapsible
    :default-open="defaultOpen"
    test-id="component-detail-occurrences"
    title="Kanji Occurrences"
  >
    <template #actions="{ isOpen }">
      <button
        v-if="isOpen"
        class="add-button"
        type="button"
        @click="handleAddClick"
      >
        Add Kanji
      </button>
    </template>

    <div class="occurrences-content">
      <!-- Empty state -->
      <p
        v-if="occurrences.length === 0"
        class="empty-state"
      >
        No kanji linked yet. Add kanji that use this component.
      </p>

      <!-- Occurrences list -->
      <div
        v-else
        class="occurrences-list"
      >
        <ComponentDetailOccurrenceItem
          v-for="(occurrence, index) in occurrences"
          :key="occurrence.id"
          :forms="forms"
          :index="index"
          :is-destructive-mode="isDestructiveMode"
          :occurrence="occurrence"
          :total="occurrences.length"
          @delete="handleDeleteClick(occurrence)"
          @edit="handleEditClick(occurrence)"
          @move-down="handleMoveDown(index)"
          @move-up="handleMoveUp(index)"
        />
      </div>
    </div>
  </SharedSection>

  <!-- Add Kanji Dialog -->
  <ComponentDetailDialogAddKanji
    v-model:open="showAddDialog"
    :all-kanji="allKanji"
    :excluded-kanji-ids="excludedKanjiIds"
    @create="handleAddCreate"
    @select="handleAddSelect"
  />

  <!-- Edit Occurrence Dialog -->
  <ComponentDetailDialogEditOccurrence
    v-model:open="showEditDialog"
    :forms="forms"
    :occurrence="editingOccurrence"
    :position-types="positionTypes"
    @cancel="handleEditCancel"
    @submit="handleEditSubmit"
  />

  <!-- Delete Confirmation -->
  <SharedConfirmDialog
    v-model:open="showDeleteDialog"
    confirm-label="Delete"
    :description="`Are you sure you want to unlink '${deletingOccurrence?.kanji.character}' from this component? Any analysis notes will be lost.`"
    title="Unlink Kanji"
    variant="danger"
    @cancel="handleDeleteCancel"
    @confirm="handleDeleteConfirm"
  />
</template>

<style scoped>
.add-button {
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  background-color: var(--color-bg-secondary);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  cursor: pointer;
}

.add-button:hover {
  background-color: var(--color-bg-tertiary);
}

.occurrences-content {
  padding: var(--spacing-md) 0;
}

.empty-state {
  margin: 0;
  color: var(--color-text-secondary);
  font-style: italic;
}

.occurrences-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}
</style>
