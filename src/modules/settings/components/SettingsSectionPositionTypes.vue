<script setup lang="ts">
/**
 * SettingsSectionPositionTypes
 *
 * Section component for managing position types in settings.
 * Provides CRUD operations for position types used in component occurrences.
 */

import { onMounted, ref } from 'vue'

import BaseButton from '@/base/components/BaseButton.vue'
import BaseDialog from '@/base/components/BaseDialog.vue'
import BaseInput from '@/base/components/BaseInput.vue'
import BaseTextarea from '@/base/components/BaseTextarea.vue'

import SharedConfirmDialog from '@/shared/components/SharedConfirmDialog.vue'
import { usePositionTypeRepository } from '@/shared/composables/use-position-type-repository'
import { useToast } from '@/shared/composables/use-toast'

import type { PositionType } from '@/shared/types/database-types'

// Repository
const { create, getAll, getUsageCount, remove, update, updateDisplayOrders } =
  usePositionTypeRepository()

// Toast
const { error: errorToast, success } = useToast()

// Position types list
const positionTypes = ref<PositionType[]>([])

// Dialog states
const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const showDeleteDialog = ref(false)
const editingPositionType = ref<PositionType | null>(null)
const deletingPositionType = ref<PositionType | null>(null)
const deleteUsageCount = ref(0)

// Local edit state (for form values during edit)
const editFormValues = ref<{
  positionName: string
  nameJapanese: string | undefined
  nameEnglish: string | undefined
  description: string | undefined
  descriptionShort: string | undefined
}>({
  positionName: '',
  nameJapanese: undefined,
  nameEnglish: undefined,
  description: undefined,
  descriptionShort: undefined
})

// Local create state (for form values during create)
const createFormValues = ref<{
  positionName: string
  nameJapanese: string | undefined
  nameEnglish: string | undefined
  description: string | undefined
  descriptionShort: string | undefined
}>({
  positionName: '',
  nameJapanese: undefined,
  nameEnglish: undefined,
  description: undefined,
  descriptionShort: undefined
})

function loadPositionTypes() {
  try {
    positionTypes.value = getAll()
  } catch {
    // Database not initialized (e.g., in tests)
    positionTypes.value = []
  }
}

// Create handlers
function handleCreateClick() {
  createFormValues.value = {
    positionName: '',
    nameJapanese: undefined,
    nameEnglish: undefined,
    description: undefined,
    descriptionShort: undefined
  }
  showCreateDialog.value = true
}

function handleCreateSubmit() {
  if (!createFormValues.value.positionName.trim()) {
    errorToast('Position name is required')
    return
  }
  try {
    create({
      positionName: createFormValues.value.positionName,
      nameJapanese: createFormValues.value.nameJapanese ?? null,
      nameEnglish: createFormValues.value.nameEnglish ?? null,
      description: createFormValues.value.description ?? null,
      descriptionShort: createFormValues.value.descriptionShort ?? null
    })
    success('Position type created')
    showCreateDialog.value = false
    createFormValues.value = {
      positionName: '',
      nameJapanese: undefined,
      nameEnglish: undefined,
      description: undefined,
      descriptionShort: undefined
    }
    loadPositionTypes()
  } catch (err) {
    errorToast(
      err instanceof Error ? err.message : 'Failed to create position type'
    )
  }
}

function handleCreateCancel() {
  showCreateDialog.value = false
  createFormValues.value = {
    positionName: '',
    nameJapanese: undefined,
    nameEnglish: undefined,
    description: undefined,
    descriptionShort: undefined
  }
}

// Edit handlers
function handleEditClick(positionType: PositionType) {
  // Create a copy to avoid modifying readonly props
  editingPositionType.value = {
    id: positionType.id,
    positionName: positionType.positionName,
    nameJapanese: positionType.nameJapanese,
    nameEnglish: positionType.nameEnglish,
    description: positionType.description,
    descriptionShort: positionType.descriptionShort,
    displayOrder: positionType.displayOrder,
    createdAt: positionType.createdAt,
    updatedAt: positionType.updatedAt
  }
  // Set local edit form values
  editFormValues.value = {
    positionName: positionType.positionName,
    nameJapanese: positionType.nameJapanese ?? undefined,
    nameEnglish: positionType.nameEnglish ?? undefined,
    description: positionType.description ?? undefined,
    descriptionShort: positionType.descriptionShort ?? undefined
  }
  showEditDialog.value = true
}

function handleEditSubmit() {
  // Direct submit without form validation
  if (!editingPositionType.value) return

  try {
    update(editingPositionType.value.id, {
      positionName: editFormValues.value.positionName,
      nameJapanese: editFormValues.value.nameJapanese ?? null,
      nameEnglish: editFormValues.value.nameEnglish ?? null,
      description: editFormValues.value.description ?? null,
      descriptionShort: editFormValues.value.descriptionShort ?? null
    })
    success('Position type updated')
    showEditDialog.value = false
    editingPositionType.value = null
    loadPositionTypes()
  } catch (err) {
    errorToast(
      err instanceof Error ? err.message : 'Failed to update position type'
    )
  }
}

function handleEditCancel() {
  showEditDialog.value = false
  editingPositionType.value = null
}

// Delete handlers
function handleDeleteClick(positionType: PositionType) {
  deletingPositionType.value = positionType
  deleteUsageCount.value = getUsageCount(positionType.id)
  showDeleteDialog.value = true
}

function handleDeleteConfirm() {
  if (!deletingPositionType.value) return

  try {
    remove(deletingPositionType.value.id)
    success('Position type deleted')
    showDeleteDialog.value = false
    deletingPositionType.value = null
    deleteUsageCount.value = 0
    loadPositionTypes()
  } catch (err) {
    errorToast(
      err instanceof Error ? err.message : 'Failed to delete position type'
    )
  }
}

function handleDeleteCancel() {
  showDeleteDialog.value = false
  deletingPositionType.value = null
  deleteUsageCount.value = 0
}

// Move up/down handlers
function handleMoveUp(index: number) {
  if (index === 0) return

  const updated = [...positionTypes.value]
  const temp = updated[index]
  const prev = updated[index - 1]
  if (!temp || !prev) return

  updated[index] = prev
  updated[index - 1] = temp

  // Update display orders
  const updates = updated.map((pt, i) => ({
    id: pt.id,
    displayOrder: i + 1
  }))

  try {
    updateDisplayOrders(updates)
    loadPositionTypes()
    success('Position types reordered')
  } catch (err) {
    errorToast(
      err instanceof Error ? err.message : 'Failed to reorder position types'
    )
  }
}

function handleMoveDown(index: number) {
  if (index === positionTypes.value.length - 1) return

  const updated = [...positionTypes.value]
  const temp = updated[index]
  const next = updated[index + 1]
  if (!temp || !next) return

  updated[index] = next
  updated[index + 1] = temp

  // Update display orders
  const updates = updated.map((pt, i) => ({
    id: pt.id,
    displayOrder: i + 1
  }))

  try {
    updateDisplayOrders(updates)
    loadPositionTypes()
    success('Position types reordered')
  } catch (err) {
    errorToast(
      err instanceof Error ? err.message : 'Failed to reorder position types'
    )
  }
}

onMounted(() => {
  loadPositionTypes()
})
</script>

<template>
  <div class="settings-section-position-types">
    <div class="settings-section-position-types-actions">
      <BaseButton
        variant="primary"
        @click="handleCreateClick"
      >
        Add Position Type
      </BaseButton>
    </div>

    <div
      v-if="positionTypes.length === 0"
      class="settings-section-position-types-empty"
    >
      <p class="settings-section-position-types-empty-text">
        No position types defined. Click "Add Position Type" to create one.
      </p>
    </div>

    <ul
      v-else
      class="settings-section-position-types-list"
    >
      <li
        v-for="(positionType, index) in positionTypes"
        :key="positionType.id"
        class="settings-section-position-types-item"
      >
        <div class="settings-section-position-types-item-content">
          <div class="settings-section-position-types-item-main">
            <span class="settings-section-position-types-item-name">
              {{ positionType.positionName }}
            </span>
            <span
              v-if="positionType.nameJapanese"
              class="settings-section-position-types-item-japanese"
            >
              {{ positionType.nameJapanese }}
            </span>
            <span
              v-if="positionType.nameEnglish"
              class="settings-section-position-types-item-english"
            >
              {{ positionType.nameEnglish }}
            </span>
          </div>
          <p
            v-if="positionType.descriptionShort"
            class="settings-section-position-types-item-description"
          >
            {{ positionType.descriptionShort }}
          </p>
          <p
            v-if="positionType.description"
            class="settings-section-position-types-item-description"
          >
            {{ positionType.description }}
          </p>
        </div>

        <div class="settings-section-position-types-item-actions">
          <BaseButton
            :disabled="index === 0"
            size="sm"
            variant="secondary"
            @click="handleMoveUp(index)"
          >
            ↑
          </BaseButton>
          <BaseButton
            :disabled="index === positionTypes.length - 1"
            size="sm"
            variant="secondary"
            @click="handleMoveDown(index)"
          >
            ↓
          </BaseButton>
          <BaseButton
            size="sm"
            variant="secondary"
            @click="handleEditClick(positionType)"
          >
            Edit
          </BaseButton>
          <BaseButton
            size="sm"
            variant="danger"
            @click="handleDeleteClick(positionType)"
          >
            Delete
          </BaseButton>
        </div>
      </li>
    </ul>

    <!-- Create Dialog -->
    <BaseDialog
      :open="showCreateDialog"
      title="Add Position Type"
      @close="handleCreateCancel"
    >
      <form
        class="settings-section-position-types-form"
        @submit.prevent="handleCreateSubmit"
      >
        <BaseInput
          v-model="createFormValues.positionName"
          label="Position Name"
          name="positionName"
          placeholder="e.g., hen"
          required
        />

        <BaseInput
          v-model="createFormValues.nameJapanese"
          label="Japanese Name"
          name="nameJapanese"
          placeholder="e.g., へん"
        />

        <BaseInput
          v-model="createFormValues.nameEnglish"
          label="English Name"
          name="nameEnglish"
          placeholder="e.g., left side"
        />

        <BaseInput
          v-model="createFormValues.descriptionShort"
          label="Short Description"
          name="descriptionShort"
          placeholder="e.g., Left side of character"
        />

        <BaseTextarea
          v-model="createFormValues.description"
          label="Full Description"
          name="description"
          placeholder="Detailed explanation..."
          :rows="3"
        />

        <div class="settings-section-position-types-form-actions">
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
            Create
          </BaseButton>
        </div>
      </form>
    </BaseDialog>

    <!-- Edit Dialog -->
    <BaseDialog
      :open="showEditDialog"
      title="Edit Position Type"
      @close="handleEditCancel"
    >
      <form
        class="settings-section-position-types-form"
        @submit.prevent="handleEditSubmit"
      >
        <BaseInput
          v-model="editFormValues.positionName"
          label="Position Name"
          name="positionName"
          required
        />

        <BaseInput
          v-model="editFormValues.nameJapanese"
          label="Japanese Name"
          name="nameJapanese"
        />

        <BaseInput
          v-model="editFormValues.nameEnglish"
          label="English Name"
          name="nameEnglish"
        />

        <BaseInput
          v-model="editFormValues.descriptionShort"
          label="Short Description"
          name="descriptionShort"
        />

        <BaseTextarea
          v-model="editFormValues.description"
          label="Full Description"
          name="description"
          :rows="3"
        />

        <div class="settings-section-position-types-form-actions">
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
      :description="
        deleteUsageCount > 0
          ? `This position type is used by ${String(deleteUsageCount)} component occurrence(s). Deleting it will remove the position classification from those occurrences. Are you sure you want to delete this position type?`
          : 'Are you sure you want to delete this position type? This action cannot be undone.'
      "
      :is-open="showDeleteDialog"
      title="Delete Position Type"
      variant="danger"
      @cancel="handleDeleteCancel"
      @confirm="handleDeleteConfirm"
    />
  </div>
</template>

<style scoped>
.settings-section-position-types {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.settings-section-position-types-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.settings-section-position-types-empty {
  padding: var(--spacing-lg);
  text-align: center;
}

.settings-section-position-types-empty-text {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
}

.settings-section-position-types-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin: 0;
  padding: 0;
  list-style: none;
}

.settings-section-position-types-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  background-color: var(--color-surface-secondary);
}

.settings-section-position-types-item-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.settings-section-position-types-item-main {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.settings-section-position-types-item-name {
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
}

.settings-section-position-types-item-japanese {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.settings-section-position-types-item-english {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-style: italic;
}

.settings-section-position-types-item-description {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  white-space: pre-wrap;
}

.settings-section-position-types-item-actions {
  display: flex;
  gap: var(--spacing-xs);
}

.settings-section-position-types-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.settings-section-position-types-form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  padding-top: var(--spacing-sm);
}

@media (width <= 640px) {
  .settings-section-position-types-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .settings-section-position-types-item-actions {
    justify-content: flex-end;
    width: 100%;
  }
}
</style>
