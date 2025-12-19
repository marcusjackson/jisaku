<script setup lang="ts">
/**
 * KanjiDetailClassifications
 *
 * Display and edit section for kanji classifications (rikusho).
 * Supports view mode (display list) and edit mode (reordering, type selection, delete).
 *
 * Features:
 * - Arrow button reordering (↑/↓)
 * - Primary classification = display_order 0 (first item)
 * - Combobox for classification type selection
 * - Delete buttons visible only in destructive mode
 */

import { computed, ref, watch } from 'vue'

import BaseButton from '@/base/components/BaseButton.vue'
import BaseSelect from '@/base/components/BaseSelect.vue'

import SharedConfirmDialog from '@/shared/components/SharedConfirmDialog.vue'

import type {
  ClassificationType,
  KanjiClassificationWithType
} from '@/shared/types/database-types'

const props = defineProps<{
  /** Classifications for this kanji with type data */
  classifications: KanjiClassificationWithType[]
  /** All available classification types */
  classificationTypes: ClassificationType[]
  /** Whether destructive mode is enabled (shows delete buttons) */
  isDestructiveMode?: boolean
}>()

const emit = defineEmits<{
  addClassification: [classificationTypeId: number]
  updateClassification: [id: number, classificationTypeId: number]
  removeClassification: [id: number]
  reorderClassifications: [classificationIds: number[]]
}>()

// State
const isEditing = ref(false)
const showDeleteDialog = ref(false)
const classificationToDelete = ref<number | null>(null)

// Counter for generating temporary IDs for new items (negative to avoid collisions)
const nextTempId = ref(-1)

// Local edit state (includes both existing and new pending items)
const editClassifications = ref<
  {
    id: number
    classificationTypeId: string // Store as string for BaseSelect compatibility
    isNew?: boolean // true for newly added, not yet saved items
  }[]
>([])

// Computed: type options for select dropdown
const typeOptions = computed(() =>
  props.classificationTypes.map((t) => ({
    label: `${t.nameJapanese ?? t.typeName} (${t.nameEnglish ?? ''})`,
    value: String(t.id)
  }))
)

// Get classification type by ID
function getTypeById(typeId: string): ClassificationType | undefined {
  return props.classificationTypes.find((t) => String(t.id) === typeId)
}

// Format classification for display
function formatClassification(
  classification: KanjiClassificationWithType
): string {
  return `${classification.nameJapanese ?? classification.typeName} (${classification.nameEnglish ?? ''})`
}

// Get abbreviated Japanese name for badge display
function getAbbreviation(japaneseName: string | null): string {
  if (!japaneseName) return ''
  const abbreviations: Record<string, string> = {
    象形文字: '象形',
    指事文字: '指事',
    会意文字: '会意',
    形声文字: '形声',
    仮借字: '仮借'
  }
  return abbreviations[japaneseName] ?? japaneseName
}

// Initialize edit state when entering edit mode
function startEditing() {
  editClassifications.value = props.classifications.map((c) => ({
    id: c.id,
    classificationTypeId: String(c.classificationTypeId),
    isNew: false
  }))
  isEditing.value = true
}

// Cancel editing
function cancelEditing() {
  isEditing.value = false
  editClassifications.value = []
  nextTempId.value = -1 // Reset temp ID counter
}

// Add new classification (local only, not saved yet)
function handleAddClassification() {
  const tempId = nextTempId.value
  nextTempId.value -= 1

  // Default to first classification type, or '0' if none available
  const defaultTypeId = props.classificationTypes[0]?.id ?? 0

  editClassifications.value.push({
    id: tempId,
    classificationTypeId: String(defaultTypeId),
    isNew: true
  })
}

// Save a new classification (emit to parent to persist)
function saveNewClassification(index: number) {
  const classification = editClassifications.value[index]
  if (!classification?.isNew) return

  // Emit to parent with the classification type ID (convert back to number)
  emit('addClassification', Number(classification.classificationTypeId))

  // Remove the pending item - it will be replaced by the real item from props via watch
  editClassifications.value.splice(index, 1)
}

// Cancel a new classification (remove from local state)
function cancelNewClassification(index: number) {
  const classification = editClassifications.value[index]
  if (!classification?.isNew) return
  editClassifications.value.splice(index, 1)
}

// Save all changes
function handleSave() {
  // Save classification type changes
  editClassifications.value.forEach((editClassification) => {
    const original = props.classifications.find(
      (c) => c.id === editClassification.id
    )
    if (
      original &&
      String(original.classificationTypeId) !==
        editClassification.classificationTypeId
    ) {
      emit(
        'updateClassification',
        editClassification.id,
        Number(editClassification.classificationTypeId)
      )
    }
  })

  // Emit reorder if order changed
  const newOrder = editClassifications.value.map((c) => c.id)
  const originalOrder = props.classifications.map((c) => c.id)
  if (JSON.stringify(newOrder) !== JSON.stringify(originalOrder)) {
    emit('reorderClassifications', newOrder)
  }

  isEditing.value = false
}

// Reordering
function moveClassificationUp(index: number) {
  if (index === 0) return
  const items = [...editClassifications.value]
  const temp = items[index]
  const prev = items[index - 1]
  if (!temp || !prev) return
  items[index] = prev
  items[index - 1] = temp
  editClassifications.value = items
}

function moveClassificationDown(index: number) {
  if (index === editClassifications.value.length - 1) return
  const items = [...editClassifications.value]
  const temp = items[index]
  const next = items[index + 1]
  if (!temp || !next) return
  items[index] = next
  items[index + 1] = temp
  editClassifications.value = items
}

// Delete handlers
function confirmDeleteClassification(id: number) {
  classificationToDelete.value = id
  showDeleteDialog.value = true
}

function handleDeleteClassification() {
  if (classificationToDelete.value !== null) {
    // Remove from local edit state
    editClassifications.value = editClassifications.value.filter(
      (c) => c.id !== classificationToDelete.value
    )
    emit('removeClassification', classificationToDelete.value)
  }
  showDeleteDialog.value = false
  classificationToDelete.value = null
}

// Check for duplicate type selections
const hasDuplicates = computed(() => {
  const typeIds = editClassifications.value.map((c) => c.classificationTypeId)
  return typeIds.length !== new Set(typeIds).size
})

// Get duplicate warning for a specific type
function isDuplicateType(typeId: string, currentIndex: number): boolean {
  return editClassifications.value.some(
    (c, i) => c.classificationTypeId === typeId && i !== currentIndex
  )
}

// Watch for prop changes to update edit state
watch(
  () => props.classifications,
  (newClassifications) => {
    if (isEditing.value) {
      // Update edit state with any new classifications
      const newIds = newClassifications.map((c) => c.id)
      const editIds = editClassifications.value.map((c) => c.id)

      // Add new classifications
      newClassifications.forEach((c) => {
        if (!editIds.includes(c.id)) {
          editClassifications.value.push({
            id: c.id,
            classificationTypeId: String(c.classificationTypeId)
          })
        }
      })

      // Remove deleted classifications (if removed elsewhere)
      editClassifications.value = editClassifications.value.filter(
        (c) => c.isNew === true || newIds.includes(c.id)
      )
    }
  }
)
</script>

<template>
  <div class="kanji-detail-classifications">
    <!-- View Mode -->
    <template v-if="!isEditing">
      <div class="kanji-detail-classifications-view">
        <div
          v-if="classifications.length === 0"
          class="kanji-detail-classifications-empty"
        >
          No classifications assigned
        </div>

        <template v-else>
          <!-- Primary classification (display_order = 0) -->
          <div
            v-if="classifications[0]"
            class="kanji-detail-classifications-primary"
          >
            <span class="kanji-detail-classifications-label">Primary:</span>
            <span class="kanji-detail-classifications-badge">
              {{ getAbbreviation(classifications[0].nameJapanese) }}
            </span>
            <span class="kanji-detail-classifications-name">
              {{ formatClassification(classifications[0]) }}
            </span>
          </div>

          <!-- Additional classifications -->
          <div
            v-if="classifications.length > 1"
            class="kanji-detail-classifications-additional"
          >
            <span class="kanji-detail-classifications-label">Additional:</span>
            <ul class="kanji-detail-classifications-list">
              <li
                v-for="classification in classifications.slice(1)"
                :key="classification.id"
                class="kanji-detail-classifications-item"
              >
                {{ formatClassification(classification) }}
              </li>
            </ul>
          </div>
        </template>
      </div>

      <div class="kanji-detail-classifications-actions">
        <BaseButton
          size="sm"
          variant="secondary"
          @click="startEditing"
        >
          Edit
        </BaseButton>
      </div>
    </template>

    <!-- Edit Mode -->
    <template v-else>
      <div class="kanji-detail-classifications-edit">
        <div class="kanji-detail-classifications-edit-header">
          <BaseButton
            size="sm"
            variant="ghost"
            @click="handleAddClassification"
          >
            + Add Classification
          </BaseButton>
        </div>

        <div
          v-if="editClassifications.length === 0"
          class="kanji-detail-classifications-empty"
        >
          No classifications. Click "+ Add Classification" to add one.
        </div>

        <div
          v-else
          class="kanji-detail-classifications-edit-list"
        >
          <!-- Duplicate warning -->
          <div
            v-if="hasDuplicates"
            class="kanji-detail-classifications-warning"
          >
            ⚠️ Duplicate classification types detected
          </div>

          <div
            v-for="(classification, index) in editClassifications"
            :key="classification.id"
            class="kanji-detail-classifications-edit-item"
            :class="{
              'kanji-detail-classifications-edit-item-new': classification.isNew
            }"
          >
            <span class="kanji-detail-classifications-edit-number">
              {{ index + 1 }}.
            </span>

            <div class="kanji-detail-classifications-edit-field">
              <BaseSelect
                v-model="classification.classificationTypeId"
                label="Classification Type"
                :options="typeOptions"
              />
              <span
                v-if="
                  isDuplicateType(classification.classificationTypeId, index)
                "
                class="kanji-detail-classifications-duplicate-warning"
              >
                ⚠️ Already selected
              </span>
              <!-- Show description for selected type -->
              <span
                v-if="
                  getTypeById(classification.classificationTypeId)
                    ?.descriptionShort
                "
                class="kanji-detail-classifications-description"
              >
                {{
                  getTypeById(classification.classificationTypeId)
                    ?.descriptionShort
                }}
              </span>
            </div>

            <div class="kanji-detail-classifications-edit-buttons">
              <!-- New item: Save/Cancel buttons -->
              <template v-if="classification.isNew">
                <BaseButton
                  aria-label="Save classification"
                  size="sm"
                  variant="primary"
                  @click="saveNewClassification(index)"
                >
                  Save
                </BaseButton>
                <BaseButton
                  aria-label="Cancel"
                  size="sm"
                  variant="secondary"
                  @click="cancelNewClassification(index)"
                >
                  Cancel
                </BaseButton>
              </template>
              <!-- Existing item: Reorder and delete buttons -->
              <template v-else>
                <BaseButton
                  aria-label="Move up"
                  :disabled="index === 0 || editClassifications.length <= 1"
                  size="sm"
                  variant="ghost"
                  @click="moveClassificationUp(index)"
                >
                  ↑
                </BaseButton>
                <BaseButton
                  aria-label="Move down"
                  :disabled="
                    index === editClassifications.length - 1 ||
                    editClassifications.length <= 1
                  "
                  size="sm"
                  variant="ghost"
                  @click="moveClassificationDown(index)"
                >
                  ↓
                </BaseButton>
                <BaseButton
                  v-if="isDestructiveMode"
                  aria-label="Delete classification"
                  size="sm"
                  variant="ghost"
                  @click="confirmDeleteClassification(classification.id)"
                >
                  ✕
                </BaseButton>
              </template>
            </div>
          </div>
        </div>
      </div>

      <div class="kanji-detail-classifications-actions">
        <BaseButton
          size="sm"
          variant="secondary"
          @click="cancelEditing"
        >
          Cancel
        </BaseButton>
        <BaseButton
          :disabled="hasDuplicates"
          size="sm"
          @click="handleSave"
        >
          Save
        </BaseButton>
      </div>
    </template>

    <!-- Delete confirmation dialog -->
    <SharedConfirmDialog
      confirm-label="Delete"
      description="Are you sure you want to delete this classification?"
      :is-open="showDeleteDialog"
      title="Delete Classification"
      variant="danger"
      @cancel="showDeleteDialog = false"
      @confirm="handleDeleteClassification"
    />
  </div>
</template>

<style scoped>
.kanji-detail-classifications {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.kanji-detail-classifications-view {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.kanji-detail-classifications-empty {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  font-style: italic;
}

.kanji-detail-classifications-primary {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-sm);
}

.kanji-detail-classifications-label {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
}

.kanji-detail-classifications-badge {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  background-color: var(--color-primary-bg);
  color: var(--color-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.kanji-detail-classifications-name {
  font-size: var(--font-size-base);
}

.kanji-detail-classifications-additional {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.kanji-detail-classifications-list {
  margin: 0;
  padding: 0;
  padding-left: var(--spacing-md);
  list-style: disc;
}

.kanji-detail-classifications-item {
  padding: var(--spacing-xs) 0;
  font-size: var(--font-size-sm);
}

.kanji-detail-classifications-actions {
  display: flex;
  justify-content: flex-start;
  gap: var(--spacing-sm);
  padding-bottom: var(--spacing-sm);
}

/* Edit mode styles */
.kanji-detail-classifications-edit {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.kanji-detail-classifications-edit-header {
  display: flex;
  justify-content: flex-start;
}

.kanji-detail-classifications-edit-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.kanji-detail-classifications-edit-item {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  border-bottom: 1px solid var(--color-border);
}

.kanji-detail-classifications-edit-item:last-child {
  border-bottom: none;
}

/* New (unsaved) item styling */
.kanji-detail-classifications-edit-item-new {
  border: 1px dashed var(--color-primary);
  border-radius: var(--radius-sm);
  background-color: var(--color-surface-alt);
}

.kanji-detail-classifications-edit-number {
  min-width: 1.5rem;
  padding-top: var(--spacing-md);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
}

.kanji-detail-classifications-edit-field {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--spacing-xs);
  min-width: 200px;
}

.kanji-detail-classifications-edit-buttons {
  display: flex;
  gap: var(--spacing-xs);
  padding-top: var(--spacing-md);
}

.kanji-detail-classifications-description {
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
}

/* Warning styles */
.kanji-detail-classifications-warning {
  padding: var(--spacing-sm);
  border-radius: var(--radius-sm);
  background-color: var(--color-warning-bg);
  color: var(--color-warning);
  font-size: var(--font-size-sm);
}

.kanji-detail-classifications-duplicate-warning {
  color: var(--color-warning);
  font-size: var(--font-size-xs);
}
</style>
