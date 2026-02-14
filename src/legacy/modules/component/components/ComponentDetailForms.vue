<script setup lang="ts">
/**
 * ComponentDetailForms
 *
 * Section component for managing component forms (visual variants).
 * Uses dialogs for add/edit operations and arrow buttons for reordering.
 * Forms represent different visual shapes of the same semantic component
 * (e.g., 水 vs 氵 vs 氺 are all "water" forms).
 */

import { ref } from 'vue'

import BaseButton from '@/legacy/base/components/BaseButton.vue'
import BaseDialog from '@/legacy/base/components/BaseDialog.vue'
import BaseInput from '@/legacy/base/components/BaseInput.vue'
import BaseTextarea from '@/legacy/base/components/BaseTextarea.vue'

import SharedConfirmDialog from '@/legacy/shared/components/SharedConfirmDialog.vue'

import type { ComponentForm } from '@/legacy/shared/types/database-types'

const props = defineProps<{
  forms: ComponentForm[]
  componentId: number
  /** Whether destructive mode is enabled (shows delete buttons) */
  isDestructiveMode?: boolean
}>()

const emit = defineEmits<{
  add: [
    data: {
      formCharacter: string
      formName: string | null
      strokeCount: number | null
      usageNotes: string | null
    }
  ]
  update: [
    id: number,
    data: {
      formName: string | null
      strokeCount: number | null
      usageNotes: string | null
    }
  ]
  remove: [id: number]
  reorder: [formIds: number[]]
}>()

// =============================================================================
// Dialog State
// =============================================================================

const showAddDialog = ref(false)
const showEditDialog = ref(false)
const showDeleteDialog = ref(false)
const editingForm = ref<ComponentForm | null>(null)
const deletingForm = ref<ComponentForm | null>(null)

// Form values for create dialog
const createFormValues = ref({
  formCharacter: '',
  formName: '',
  strokeCount: '',
  usageNotes: ''
})

// Form values for edit dialog
const editFormValues = ref({
  formName: '',
  strokeCount: '',
  usageNotes: ''
})

// =============================================================================
// Create Handlers
// =============================================================================

function handleAddClick() {
  createFormValues.value = {
    formCharacter: '',
    formName: '',
    strokeCount: '',
    usageNotes: ''
  }
  showAddDialog.value = true
}

function handleCreateSubmit() {
  if (!createFormValues.value.formCharacter.trim()) {
    return
  }

  const strokeCountRaw = createFormValues.value.strokeCount
  const strokeCount =
    typeof strokeCountRaw === 'string'
      ? strokeCountRaw.trim()
        ? Number(strokeCountRaw)
        : null
      : typeof strokeCountRaw === 'number'
        ? strokeCountRaw
        : null

  emit('add', {
    formCharacter: createFormValues.value.formCharacter.trim(),
    formName: createFormValues.value.formName.trim() || null,
    strokeCount,
    usageNotes: createFormValues.value.usageNotes.trim() || null
  })

  showAddDialog.value = false
  createFormValues.value = {
    formCharacter: '',
    formName: '',
    strokeCount: '',
    usageNotes: ''
  }
}

function handleCreateCancel() {
  showAddDialog.value = false
  createFormValues.value = {
    formCharacter: '',
    formName: '',
    strokeCount: '',
    usageNotes: ''
  }
}

// =============================================================================
// Edit Handlers
// =============================================================================

function handleEditClick(form: ComponentForm) {
  editingForm.value = form
  editFormValues.value = {
    formName: form.formName ?? '',
    strokeCount: form.strokeCount?.toString() ?? '',
    usageNotes: form.usageNotes ?? ''
  }
  showEditDialog.value = true
}

function handleEditSubmit() {
  if (!editingForm.value) return

  const strokeCountRaw = editFormValues.value.strokeCount
  const strokeCount =
    typeof strokeCountRaw === 'string'
      ? strokeCountRaw.trim()
        ? Number(strokeCountRaw)
        : null
      : typeof strokeCountRaw === 'number'
        ? strokeCountRaw
        : null

  emit('update', editingForm.value.id, {
    formName: editFormValues.value.formName.trim() || null,
    strokeCount,
    usageNotes: editFormValues.value.usageNotes.trim() || null
  })

  showEditDialog.value = false
  editingForm.value = null
}

function handleEditCancel() {
  showEditDialog.value = false
  editingForm.value = null
}

// =============================================================================
// Delete Handlers
// =============================================================================

function handleDeleteClick(form: ComponentForm) {
  deletingForm.value = form
  showDeleteDialog.value = true
}

function handleDeleteConfirm() {
  if (!deletingForm.value) return

  emit('remove', deletingForm.value.id)
  showDeleteDialog.value = false
  deletingForm.value = null
}

function handleDeleteCancel() {
  showDeleteDialog.value = false
  deletingForm.value = null
}

// =============================================================================
// Reorder Handlers
// =============================================================================

function handleMoveUp(index: number) {
  if (index === 0) return

  const newOrder = [...props.forms]
  const temp = newOrder[index]
  const prev = newOrder[index - 1]
  if (!temp || !prev) return

  newOrder[index] = prev
  newOrder[index - 1] = temp

  emit(
    'reorder',
    newOrder.map((f) => f.id)
  )
}

function handleMoveDown(index: number) {
  if (index === props.forms.length - 1) return

  const newOrder = [...props.forms]
  const temp = newOrder[index]
  const next = newOrder[index + 1]
  if (!temp || !next) return

  newOrder[index] = next
  newOrder[index + 1] = temp

  emit(
    'reorder',
    newOrder.map((f) => f.id)
  )
}

// =============================================================================
// Display Helpers
// =============================================================================

function getFormDisplayName(form: ComponentForm): string {
  if (form.formName) {
    return `${form.formCharacter} (${form.formName})`
  }
  return form.formCharacter
}
</script>

<template>
  <div class="component-detail-forms">
    <div class="component-detail-forms-header">
      <BaseButton
        size="sm"
        variant="primary"
        @click="handleAddClick"
      >
        + Add Form
      </BaseButton>
    </div>

    <div
      v-if="props.forms.length === 0"
      class="component-detail-forms-empty"
    >
      <p class="component-detail-forms-empty-text">
        No forms added yet. Forms represent visual variants like 氵 vs 水.
      </p>
    </div>

    <ul
      v-else
      class="component-detail-forms-list"
    >
      <li
        v-for="(form, index) in props.forms"
        :key="form.id"
        class="component-detail-forms-item"
      >
        <div class="component-detail-forms-item-reorder">
          <BaseButton
            :disabled="index === 0"
            size="sm"
            variant="secondary"
            @click="handleMoveUp(index)"
          >
            ↑
          </BaseButton>
          <BaseButton
            :disabled="index === props.forms.length - 1"
            size="sm"
            variant="secondary"
            @click="handleMoveDown(index)"
          >
            ↓
          </BaseButton>
        </div>

        <div class="component-detail-forms-item-content">
          <div class="component-detail-forms-item-header">
            <span class="component-detail-forms-item-character">
              {{ form.formCharacter }}
            </span>
            <span
              v-if="form.formName"
              class="component-detail-forms-item-name"
            >
              {{ form.formName }}
            </span>
            <span
              v-if="form.strokeCount"
              class="component-detail-forms-item-strokes"
            >
              {{ form.strokeCount }}画
            </span>
          </div>
          <p
            v-if="form.usageNotes"
            class="component-detail-forms-item-notes"
          >
            {{ form.usageNotes }}
          </p>
        </div>

        <div class="component-detail-forms-item-actions">
          <BaseButton
            size="sm"
            variant="secondary"
            @click="handleEditClick(form)"
          >
            Edit
          </BaseButton>
          <BaseButton
            v-if="props.isDestructiveMode"
            size="sm"
            variant="danger"
            @click="handleDeleteClick(form)"
          >
            ✕
          </BaseButton>
        </div>
      </li>
    </ul>

    <!-- Add Form Dialog -->
    <BaseDialog
      v-model:open="showAddDialog"
      title="Add Form Variant"
    >
      <form
        class="component-detail-forms-dialog-form"
        @submit.prevent="handleCreateSubmit"
      >
        <BaseInput
          v-model="createFormValues.formCharacter"
          label="Character"
          name="formCharacter"
          placeholder="e.g., 氵"
          required
        />

        <BaseInput
          v-model="createFormValues.formName"
          label="Form Name"
          name="formName"
          placeholder="e.g., sanzui"
        />

        <BaseInput
          v-model="createFormValues.strokeCount"
          label="Stroke Count"
          name="strokeCount"
          placeholder="e.g., 3"
          type="number"
        />

        <BaseTextarea
          v-model="createFormValues.usageNotes"
          label="Usage Notes"
          name="usageNotes"
          placeholder="e.g., Used on left side of kanji..."
          :rows="3"
        />

        <div class="component-detail-forms-dialog-actions">
          <BaseButton
            type="button"
            variant="secondary"
            @click="handleCreateCancel"
          >
            Cancel
          </BaseButton>
          <BaseButton
            type="submit"
            variant="primary"
          >
            Add
          </BaseButton>
        </div>
      </form>
    </BaseDialog>

    <!-- Edit Form Dialog -->
    <BaseDialog
      v-model:open="showEditDialog"
      title="Edit Form Variant"
    >
      <form
        class="component-detail-forms-dialog-form"
        @submit.prevent="handleEditSubmit"
      >
        <BaseInput
          disabled
          label="Character"
          :model-value="editingForm?.formCharacter ?? ''"
          name="formCharacter"
        />

        <BaseInput
          v-model="editFormValues.formName"
          label="Form Name"
          name="formName"
          placeholder="e.g., sanzui"
        />

        <BaseInput
          v-model="editFormValues.strokeCount"
          label="Stroke Count"
          name="strokeCount"
          placeholder="e.g., 3"
          type="number"
        />

        <BaseTextarea
          v-model="editFormValues.usageNotes"
          label="Usage Notes"
          name="usageNotes"
          placeholder="e.g., Used on left side of kanji..."
          :rows="3"
        />

        <div class="component-detail-forms-dialog-actions">
          <BaseButton
            type="button"
            variant="secondary"
            @click="handleEditCancel"
          >
            Cancel
          </BaseButton>
          <BaseButton
            type="submit"
            variant="primary"
          >
            Save
          </BaseButton>
        </div>
      </form>
    </BaseDialog>

    <!-- Delete Confirmation Dialog -->
    <SharedConfirmDialog
      confirm-label="Delete"
      :description="`Delete form '${deletingForm ? getFormDisplayName(deletingForm) : ''}'? This will unlink this form from all occurrences.`"
      :is-open="showDeleteDialog"
      title="Delete Form?"
      variant="danger"
      @cancel="handleDeleteCancel"
      @confirm="handleDeleteConfirm"
    />
  </div>
</template>

<style scoped>
.component-detail-forms {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.component-detail-forms-header {
  display: flex;
  justify-content: flex-end;
}

.component-detail-forms-empty {
  padding: var(--spacing-lg);
  text-align: center;
}

.component-detail-forms-empty-text {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.component-detail-forms-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin: 0;
  padding: 0;
  list-style: none;
}

.component-detail-forms-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  background-color: var(--color-surface-secondary);
}

.component-detail-forms-item-reorder {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.component-detail-forms-item-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.component-detail-forms-item-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.component-detail-forms-item-character {
  color: var(--color-text-primary);
  font-family: var(--font-family-kanji);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
}

.component-detail-forms-item-name {
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
}

.component-detail-forms-item-strokes {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.component-detail-forms-item-notes {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-relaxed);
  white-space: pre-wrap;
}

.component-detail-forms-item-actions {
  display: flex;
  gap: var(--spacing-xs);
}

.component-detail-forms-dialog-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.component-detail-forms-dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  padding-top: var(--spacing-sm);
}

@media (width <= 640px) {
  .component-detail-forms-item {
    flex-direction: column;
  }

  .component-detail-forms-item-reorder {
    flex-direction: row;
  }

  .component-detail-forms-item-actions {
    justify-content: flex-end;
    width: 100%;
  }
}
</style>
