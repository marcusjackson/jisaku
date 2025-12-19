<script setup lang="ts">
/**
 * SettingsSectionClassificationTypes
 *
 * Section component for managing classification types in settings.
 * Provides CRUD operations for classification types used in kanji classifications (Rikusho).
 */

import { onMounted, ref } from 'vue'

import BaseButton from '@/base/components/BaseButton.vue'
import BaseDialog from '@/base/components/BaseDialog.vue'
import BaseInput from '@/base/components/BaseInput.vue'
import BaseTextarea from '@/base/components/BaseTextarea.vue'

import SharedConfirmDialog from '@/shared/components/SharedConfirmDialog.vue'
import { useClassificationRepository } from '@/shared/composables/use-classification-repository'
import { useToast } from '@/shared/composables/use-toast'

import type { ClassificationType } from '@/shared/types/database-types'

// Repository
const {
  createClassificationType,
  getAllClassificationTypes,
  getClassificationTypeUsageCount,
  removeClassificationType,
  updateClassificationType,
  updateClassificationTypeDisplayOrders
} = useClassificationRepository()

// Toast
const { error: errorToast, success } = useToast()

// Classification types list
const classificationTypes = ref<ClassificationType[]>([])

// Dialog states
const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const showDeleteDialog = ref(false)
const editingClassificationType = ref<ClassificationType | null>(null)
const deletingClassificationType = ref<ClassificationType | null>(null)
const deleteUsageCount = ref(0)

// Local edit state (for form values during edit)
const editFormValues = ref<{
  typeName: string
  nameJapanese: string | undefined
  nameEnglish: string | undefined
  description: string | undefined
  descriptionShort: string | undefined
}>({
  typeName: '',
  nameJapanese: undefined,
  nameEnglish: undefined,
  description: undefined,
  descriptionShort: undefined
})

// Local create state (for form values during create)
const createFormValues = ref<{
  typeName: string
  nameJapanese: string | undefined
  nameEnglish: string | undefined
  description: string | undefined
  descriptionShort: string | undefined
}>({
  typeName: '',
  nameJapanese: undefined,
  nameEnglish: undefined,
  description: undefined,
  descriptionShort: undefined
})

function loadClassificationTypes() {
  try {
    classificationTypes.value = getAllClassificationTypes()
  } catch {
    // Database not initialized (e.g., in tests)
    classificationTypes.value = []
  }
}

// Create handlers
function handleCreateClick() {
  createFormValues.value = {
    typeName: '',
    nameJapanese: undefined,
    nameEnglish: undefined,
    description: undefined,
    descriptionShort: undefined
  }
  showCreateDialog.value = true
}

function handleCreateSubmit() {
  if (!createFormValues.value.typeName.trim()) {
    errorToast('Type name is required')
    return
  }
  try {
    createClassificationType({
      typeName: createFormValues.value.typeName,
      nameJapanese: createFormValues.value.nameJapanese ?? null,
      nameEnglish: createFormValues.value.nameEnglish ?? null,
      description: createFormValues.value.description ?? null,
      descriptionShort: createFormValues.value.descriptionShort ?? null
    })
    success('Classification type created')
    showCreateDialog.value = false
    createFormValues.value = {
      typeName: '',
      nameJapanese: undefined,
      nameEnglish: undefined,
      description: undefined,
      descriptionShort: undefined
    }
    loadClassificationTypes()
  } catch (err) {
    errorToast(
      err instanceof Error
        ? err.message
        : 'Failed to create classification type'
    )
  }
}

function handleCreateCancel() {
  showCreateDialog.value = false
  createFormValues.value = {
    typeName: '',
    nameJapanese: undefined,
    nameEnglish: undefined,
    description: undefined,
    descriptionShort: undefined
  }
}

// Edit handlers
function handleEditClick(classificationType: ClassificationType) {
  // Create a copy to avoid modifying readonly props
  editingClassificationType.value = {
    id: classificationType.id,
    typeName: classificationType.typeName,
    nameJapanese: classificationType.nameJapanese,
    nameEnglish: classificationType.nameEnglish,
    description: classificationType.description,
    descriptionShort: classificationType.descriptionShort,
    displayOrder: classificationType.displayOrder,
    createdAt: classificationType.createdAt,
    updatedAt: classificationType.updatedAt
  }
  // Set local edit form values
  editFormValues.value = {
    typeName: classificationType.typeName,
    nameJapanese: classificationType.nameJapanese ?? undefined,
    nameEnglish: classificationType.nameEnglish ?? undefined,
    description: classificationType.description ?? undefined,
    descriptionShort: classificationType.descriptionShort ?? undefined
  }
  showEditDialog.value = true
}

function handleEditSubmit() {
  // Direct submit without form validation
  if (!editingClassificationType.value) return

  try {
    updateClassificationType(editingClassificationType.value.id, {
      typeName: editFormValues.value.typeName,
      nameJapanese: editFormValues.value.nameJapanese ?? null,
      nameEnglish: editFormValues.value.nameEnglish ?? null,
      description: editFormValues.value.description ?? null,
      descriptionShort: editFormValues.value.descriptionShort ?? null
    })
    success('Classification type updated')
    showEditDialog.value = false
    editingClassificationType.value = null
    loadClassificationTypes()
  } catch (err) {
    errorToast(
      err instanceof Error
        ? err.message
        : 'Failed to update classification type'
    )
  }
}

function handleEditCancel() {
  showEditDialog.value = false
  editingClassificationType.value = null
}

// Delete handlers
function handleDeleteClick(classificationType: ClassificationType) {
  deletingClassificationType.value = classificationType
  deleteUsageCount.value = getClassificationTypeUsageCount(
    classificationType.id
  )
  showDeleteDialog.value = true
}

function handleDeleteConfirm() {
  if (!deletingClassificationType.value) return

  try {
    removeClassificationType(deletingClassificationType.value.id)
    success('Classification type deleted')
    showDeleteDialog.value = false
    deletingClassificationType.value = null
    deleteUsageCount.value = 0
    loadClassificationTypes()
  } catch (err) {
    errorToast(
      err instanceof Error
        ? err.message
        : 'Failed to delete classification type'
    )
  }
}

function handleDeleteCancel() {
  showDeleteDialog.value = false
  deletingClassificationType.value = null
  deleteUsageCount.value = 0
}

// Move up/down handlers
function handleMoveUp(index: number) {
  if (index === 0) return

  const updated = [...classificationTypes.value]
  const temp = updated[index]
  const prev = updated[index - 1]
  if (!temp || !prev) return

  updated[index] = prev
  updated[index - 1] = temp

  // Update display orders
  const updates = updated.map((ct, i) => ({
    id: ct.id,
    displayOrder: i + 1
  }))

  try {
    updateClassificationTypeDisplayOrders(updates)
    loadClassificationTypes()
    success('Classification types reordered')
  } catch (err) {
    errorToast(
      err instanceof Error
        ? err.message
        : 'Failed to reorder classification types'
    )
  }
}

function handleMoveDown(index: number) {
  if (index === classificationTypes.value.length - 1) return

  const updated = [...classificationTypes.value]
  const temp = updated[index]
  const next = updated[index + 1]
  if (!temp || !next) return

  updated[index] = next
  updated[index + 1] = temp

  // Update display orders
  const updates = updated.map((ct, i) => ({
    id: ct.id,
    displayOrder: i + 1
  }))

  try {
    updateClassificationTypeDisplayOrders(updates)
    loadClassificationTypes()
    success('Classification types reordered')
  } catch (err) {
    errorToast(
      err instanceof Error
        ? err.message
        : 'Failed to reorder classification types'
    )
  }
}

onMounted(() => {
  loadClassificationTypes()
})
</script>

<template>
  <div class="settings-section-classification-types">
    <div class="settings-section-classification-types-actions">
      <BaseButton
        variant="primary"
        @click="handleCreateClick"
      >
        Add Classification Type
      </BaseButton>
    </div>

    <div
      v-if="classificationTypes.length === 0"
      class="settings-section-classification-types-empty"
    >
      <p class="settings-section-classification-types-empty-text">
        No classification types defined. Click "Add Classification Type" to
        create one.
      </p>
    </div>

    <ul
      v-else
      class="settings-section-classification-types-list"
    >
      <li
        v-for="(classificationType, index) in classificationTypes"
        :key="classificationType.id"
        class="settings-section-classification-types-item"
      >
        <div class="settings-section-classification-types-item-content">
          <div class="settings-section-classification-types-item-main">
            <span class="settings-section-classification-types-item-name">
              {{ classificationType.typeName }}
            </span>
            <span
              v-if="classificationType.nameJapanese"
              class="settings-section-classification-types-item-japanese"
            >
              {{ classificationType.nameJapanese }}
            </span>
            <span
              v-if="classificationType.nameEnglish"
              class="settings-section-classification-types-item-english"
            >
              {{ classificationType.nameEnglish }}
            </span>
          </div>
          <p
            v-if="classificationType.descriptionShort"
            class="settings-section-classification-types-item-description"
          >
            {{ classificationType.descriptionShort }}
          </p>
          <p
            v-if="classificationType.description"
            class="settings-section-classification-types-item-description"
          >
            {{ classificationType.description }}
          </p>
        </div>

        <div class="settings-section-classification-types-item-actions">
          <BaseButton
            :disabled="index === 0"
            size="sm"
            variant="secondary"
            @click="handleMoveUp(index)"
          >
            ↑
          </BaseButton>
          <BaseButton
            :disabled="index === classificationTypes.length - 1"
            size="sm"
            variant="secondary"
            @click="handleMoveDown(index)"
          >
            ↓
          </BaseButton>
          <BaseButton
            size="sm"
            variant="secondary"
            @click="handleEditClick(classificationType)"
          >
            Edit
          </BaseButton>
          <BaseButton
            size="sm"
            variant="danger"
            @click="handleDeleteClick(classificationType)"
          >
            Delete
          </BaseButton>
        </div>
      </li>
    </ul>

    <!-- Create Dialog -->
    <BaseDialog
      :open="showCreateDialog"
      title="Add Classification Type"
      @close="handleCreateCancel"
    >
      <form
        class="settings-section-classification-types-form"
        @submit.prevent="handleCreateSubmit"
      >
        <BaseInput
          v-model="createFormValues.typeName"
          label="Type Name"
          name="typeName"
          placeholder="e.g., phonetic_loan"
          required
        />

        <BaseInput
          v-model="createFormValues.nameJapanese"
          label="Japanese Name"
          name="nameJapanese"
          placeholder="e.g., 仮借字"
        />

        <BaseInput
          v-model="createFormValues.nameEnglish"
          label="English Name"
          name="nameEnglish"
          placeholder="e.g., Phonetic Loan"
        />

        <BaseInput
          v-model="createFormValues.descriptionShort"
          label="Short Description"
          name="descriptionShort"
          placeholder="e.g., Borrowed character for sound alone"
        />

        <BaseTextarea
          v-model="createFormValues.description"
          label="Full Description"
          name="description"
          placeholder="Detailed explanation..."
          :rows="3"
        />

        <div class="settings-section-classification-types-form-actions">
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
      title="Edit Classification Type"
      @close="handleEditCancel"
    >
      <form
        class="settings-section-classification-types-form"
        @submit.prevent="handleEditSubmit"
      >
        <BaseInput
          v-model="editFormValues.typeName"
          label="Type Name"
          name="typeName"
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

        <div class="settings-section-classification-types-form-actions">
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
          ? `This classification type is used by ${String(deleteUsageCount)} kanji. Deleting it will remove the classification from those kanji. Are you sure you want to delete this classification type?`
          : 'Are you sure you want to delete this classification type? This action cannot be undone.'
      "
      :is-open="showDeleteDialog"
      title="Delete Classification Type"
      variant="danger"
      @cancel="handleDeleteCancel"
      @confirm="handleDeleteConfirm"
    />
  </div>
</template>

<style scoped>
.settings-section-classification-types {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.settings-section-classification-types-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.settings-section-classification-types-empty {
  padding: var(--spacing-lg);
  text-align: center;
}

.settings-section-classification-types-empty-text {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
}

.settings-section-classification-types-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin: 0;
  padding: 0;
  list-style: none;
}

.settings-section-classification-types-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  background-color: var(--color-surface-secondary);
}

.settings-section-classification-types-item-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.settings-section-classification-types-item-main {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.settings-section-classification-types-item-name {
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
}

.settings-section-classification-types-item-japanese {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.settings-section-classification-types-item-english {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-style: italic;
}

.settings-section-classification-types-item-description {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  white-space: pre-wrap;
}

.settings-section-classification-types-item-actions {
  display: flex;
  gap: var(--spacing-xs);
}

.settings-section-classification-types-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.settings-section-classification-types-form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  padding-top: var(--spacing-sm);
}

@media (width <= 640px) {
  .settings-section-classification-types-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .settings-section-classification-types-item-actions {
    justify-content: flex-end;
    width: 100%;
  }
}
</style>
