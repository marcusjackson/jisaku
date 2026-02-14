<script setup lang="ts">
/**
 * ComponentDetailSectionForms - Forms section with list and CRUD operations.
 *
 * Displays collapsible section containing forms list, add/edit dialog,
 * and delete confirmation. Emits events to parent for data operations.
 */

import { computed, ref } from 'vue'

import SharedConfirmDialog from '@/shared/components/SharedConfirmDialog.vue'
import SharedSection from '@/shared/components/SharedSection.vue'

import ComponentDetailDialogForm from './ComponentDetailDialogForm.vue'
import ComponentDetailFormItem from './ComponentDetailFormItem.vue'

import type { FormSubmitData } from '../component-detail-types'
import type { ComponentForm } from '@/api/component'

// =============================================================================
// Props & Emits
// =============================================================================

interface Props {
  /** List of component forms */
  forms: ComponentForm[]
  /** Parent component ID for creating forms */
  componentId: number
  /** Whether destructive mode is enabled */
  isDestructiveMode: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  add: [data: Omit<FormSubmitData, 'formCharacter'> & { formCharacter: string }]
  update: [id: number, data: FormSubmitData]
  remove: [id: number]
  reorder: [ids: number[]]
}>()

// =============================================================================
// State
// =============================================================================

const showAddDialog = ref(false)
const showEditDialog = ref(false)
const showDeleteDialog = ref(false)
const editingForm = ref<ComponentForm | null>(null)
const deletingForm = ref<ComponentForm | null>(null)

// =============================================================================
// Computed
// =============================================================================

const defaultOpen = computed(() => props.forms.length > 0)

// =============================================================================
// Handlers
// =============================================================================

function handleAddClick() {
  showAddDialog.value = true
}

function handleAddSubmit(data: FormSubmitData) {
  emit(
    'add',
    data as Omit<FormSubmitData, 'formCharacter'> & { formCharacter: string }
  )
  showAddDialog.value = false
}

function handleAddCancel() {
  showAddDialog.value = false
}

function handleEditClick(form: ComponentForm) {
  editingForm.value = form
  showEditDialog.value = true
}

function handleEditSubmit(data: FormSubmitData) {
  if (editingForm.value) {
    emit('update', editingForm.value.id, data)
  }
  showEditDialog.value = false
  editingForm.value = null
}

function handleEditCancel() {
  showEditDialog.value = false
  editingForm.value = null
}

function handleDeleteClick(form: ComponentForm) {
  deletingForm.value = form
  showDeleteDialog.value = true
}

function handleDeleteConfirm() {
  if (deletingForm.value) {
    emit('remove', deletingForm.value.id)
  }
  showDeleteDialog.value = false
  deletingForm.value = null
}

function handleDeleteCancel() {
  showDeleteDialog.value = false
  deletingForm.value = null
}

function handleMoveUp(index: number) {
  if (index <= 0) return
  const ids = props.forms.map((f) => f.id)
  const current = ids[index]
  const previous = ids[index - 1]
  if (current === undefined || previous === undefined) return
  // Swap with previous
  ids[index - 1] = current
  ids[index] = previous
  emit('reorder', ids)
}

function handleMoveDown(index: number) {
  if (index >= props.forms.length - 1) return
  const ids = props.forms.map((f) => f.id)
  const current = ids[index]
  const next = ids[index + 1]
  if (current === undefined || next === undefined) return
  // Swap with next
  ids[index] = next
  ids[index + 1] = current
  emit('reorder', ids)
}
</script>

<template>
  <SharedSection
    collapsible
    :default-open="defaultOpen"
    test-id="component-detail-forms"
    title="Forms"
  >
    <template #actions="{ isOpen }">
      <button
        v-if="isOpen"
        class="add-button"
        type="button"
        @click="handleAddClick"
      >
        Add
      </button>
    </template>

    <div class="forms-content">
      <!-- Empty state -->
      <p
        v-if="forms.length === 0"
        class="empty-state"
      >
        No forms added yet. Forms represent visual variants like 氵 vs 水.
      </p>

      <!-- Forms list -->
      <div
        v-else
        class="forms-list"
      >
        <ComponentDetailFormItem
          v-for="(form, index) in forms"
          :key="form.id"
          :form="form"
          :index="index"
          :is-destructive-mode="isDestructiveMode"
          :total="forms.length"
          @delete="handleDeleteClick(form)"
          @edit="handleEditClick(form)"
          @move-down="handleMoveDown(index)"
          @move-up="handleMoveUp(index)"
        />
      </div>
    </div>
  </SharedSection>

  <!-- Add Dialog -->
  <ComponentDetailDialogForm
    :form="null"
    :open="showAddDialog"
    @cancel="handleAddCancel"
    @submit="handleAddSubmit"
  />

  <!-- Edit Dialog -->
  <ComponentDetailDialogForm
    :form="editingForm"
    :open="showEditDialog"
    @cancel="handleEditCancel"
    @submit="handleEditSubmit"
  />

  <!-- Delete Confirmation -->
  <SharedConfirmDialog
    v-model:open="showDeleteDialog"
    confirm-label="Delete"
    :description="`Are you sure you want to delete the form '${deletingForm?.formCharacter}'?`"
    title="Delete Form"
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

.forms-content {
  padding: var(--spacing-md) 0;
}

.empty-state {
  margin: 0;
  color: var(--color-text-secondary);
  font-style: italic;
}

.forms-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}
</style>
