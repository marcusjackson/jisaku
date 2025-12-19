<script setup lang="ts">
/**
 * ComponentDetailGroupings
 *
 * Section component for managing component groupings (pattern analysis groups).
 * Uses dialogs for add/edit operations and arrow buttons for reordering.
 * Groupings allow users to create custom groups of occurrences for analysis.
 */

import { ref } from 'vue'

import BaseButton from '@/base/components/BaseButton.vue'
import BaseDialog from '@/base/components/BaseDialog.vue'
import BaseInput from '@/base/components/BaseInput.vue'
import BaseTextarea from '@/base/components/BaseTextarea.vue'

import SharedConfirmDialog from '@/shared/components/SharedConfirmDialog.vue'

import type {
  ComponentGroupingMember,
  ComponentGroupingWithMembers,
  OccurrenceWithKanji
} from '@/shared/types/database-types'

const props = defineProps<{
  groupings: ComponentGroupingWithMembers[]
  componentId: number
  /** Available occurrences for adding to groups */
  occurrences: OccurrenceWithKanji[]
  /** Whether destructive mode is enabled (shows delete buttons) */
  isDestructiveMode?: boolean
  /** Members for each grouping (keyed by grouping ID) */
  groupingMembers?: Map<number, ComponentGroupingMember[]>
}>()

const emit = defineEmits<{
  add: [data: { name: string; description: string | null }]
  update: [id: number, data: { name: string; description: string | null }]
  remove: [id: number]
  reorder: [groupingIds: number[]]
  addMember: [groupingId: number, occurrenceId: number]
  removeMember: [groupingId: number, occurrenceId: number]
}>()

// =============================================================================
// Dialog State
// =============================================================================

const showAddDialog = ref(false)
const showEditDialog = ref(false)
const showDeleteDialog = ref(false)
const editingGrouping = ref<ComponentGroupingWithMembers | null>(null)
const deletingGrouping = ref<ComponentGroupingWithMembers | null>(null)

// Form values for create dialog
const createFormValues = ref({
  name: '',
  description: ''
})

// Form values for edit dialog
const editFormValues = ref({
  name: '',
  description: ''
})

// Expanded groupings (to show members)
const expandedGroupings = ref<Set<number>>(new Set())

// =============================================================================
// Computed
// =============================================================================

// Get member occurrence IDs for a grouping
function getMemberOccurrenceIds(groupingId: number): Set<number> {
  const members = props.groupingMembers?.get(groupingId) ?? []
  return new Set(members.map((m) => m.occurrenceId))
}

// Get available occurrences (not already in this grouping)
function getAvailableOccurrences(groupingId: number): OccurrenceWithKanji[] {
  const memberIds = getMemberOccurrenceIds(groupingId)
  return props.occurrences.filter((o) => !memberIds.has(o.id))
}

// Get member occurrences for a grouping
function getMemberOccurrences(groupingId: number): OccurrenceWithKanji[] {
  const members = props.groupingMembers?.get(groupingId) ?? []
  const memberIds = new Set(members.map((m) => m.occurrenceId))
  return props.occurrences.filter((o) => memberIds.has(o.id))
}

// =============================================================================
// Create Handlers
// =============================================================================

function handleAddClick() {
  createFormValues.value = {
    name: '',
    description: ''
  }
  showAddDialog.value = true
}

function handleCreateSubmit() {
  if (!createFormValues.value.name.trim()) {
    return
  }

  emit('add', {
    name: createFormValues.value.name.trim(),
    description: createFormValues.value.description.trim() || null
  })

  showAddDialog.value = false
  createFormValues.value = {
    name: '',
    description: ''
  }
}

function handleCreateCancel() {
  showAddDialog.value = false
  createFormValues.value = {
    name: '',
    description: ''
  }
}

// =============================================================================
// Edit Handlers
// =============================================================================

function handleEditClick(grouping: ComponentGroupingWithMembers) {
  editingGrouping.value = grouping
  editFormValues.value = {
    name: grouping.name,
    description: grouping.description ?? ''
  }
  showEditDialog.value = true
}

function handleEditSubmit() {
  if (!editingGrouping.value) return

  emit('update', editingGrouping.value.id, {
    name: editFormValues.value.name.trim(),
    description: editFormValues.value.description.trim() || null
  })

  showEditDialog.value = false
  editingGrouping.value = null
}

function handleEditCancel() {
  showEditDialog.value = false
  editingGrouping.value = null
}

// =============================================================================
// Delete Handlers
// =============================================================================

function handleDeleteClick(grouping: ComponentGroupingWithMembers) {
  deletingGrouping.value = grouping
  showDeleteDialog.value = true
}

function handleDeleteConfirm() {
  if (!deletingGrouping.value) return

  emit('remove', deletingGrouping.value.id)
  showDeleteDialog.value = false
  deletingGrouping.value = null
}

function handleDeleteCancel() {
  showDeleteDialog.value = false
  deletingGrouping.value = null
}

// =============================================================================
// Reorder Handlers
// =============================================================================

function handleMoveUp(index: number) {
  if (index === 0) return

  const newOrder = [...props.groupings]
  const temp = newOrder[index]
  const prev = newOrder[index - 1]
  if (!temp || !prev) return

  newOrder[index] = prev
  newOrder[index - 1] = temp

  emit(
    'reorder',
    newOrder.map((g) => g.id)
  )
}

function handleMoveDown(index: number) {
  if (index === props.groupings.length - 1) return

  const newOrder = [...props.groupings]
  const temp = newOrder[index]
  const next = newOrder[index + 1]
  if (!temp || !next) return

  newOrder[index] = next
  newOrder[index + 1] = temp

  emit(
    'reorder',
    newOrder.map((g) => g.id)
  )
}

// =============================================================================
// Expand/Collapse
// =============================================================================

function toggleExpand(groupingId: number) {
  if (expandedGroupings.value.has(groupingId)) {
    expandedGroupings.value.delete(groupingId)
  } else {
    expandedGroupings.value.add(groupingId)
  }
}

// =============================================================================
// Member Management
// =============================================================================

function handleAddMember(groupingId: number, occurrenceId: number) {
  emit('addMember', groupingId, occurrenceId)
}

function handleRemoveMember(groupingId: number, occurrenceId: number) {
  emit('removeMember', groupingId, occurrenceId)
}
</script>

<template>
  <div class="component-detail-groupings">
    <div class="component-detail-groupings-header">
      <BaseButton
        size="sm"
        variant="primary"
        @click="handleAddClick"
      >
        + Add Grouping
      </BaseButton>
    </div>

    <div
      v-if="props.groupings.length === 0"
      class="component-detail-groupings-empty"
    >
      <p class="component-detail-groupings-empty-text">
        No groupings created yet. Create groups to organize occurrences for
        pattern analysis.
      </p>
    </div>

    <ul
      v-else
      class="component-detail-groupings-list"
    >
      <li
        v-for="(grouping, index) in props.groupings"
        :key="grouping.id"
        class="component-detail-groupings-item"
      >
        <div class="component-detail-groupings-item-main">
          <div class="component-detail-groupings-item-reorder">
            <BaseButton
              :disabled="index === 0"
              size="sm"
              variant="secondary"
              @click="handleMoveUp(index)"
            >
              ↑
            </BaseButton>
            <BaseButton
              :disabled="index === props.groupings.length - 1"
              size="sm"
              variant="secondary"
              @click="handleMoveDown(index)"
            >
              ↓
            </BaseButton>
          </div>

          <div class="component-detail-groupings-item-content">
            <div class="component-detail-groupings-item-header">
              <button
                class="component-detail-groupings-item-expand"
                type="button"
                @click="toggleExpand(grouping.id)"
              >
                <span class="component-detail-groupings-item-expand-icon">
                  {{ expandedGroupings.has(grouping.id) ? '▼' : '▶' }}
                </span>
                <span class="component-detail-groupings-item-name">
                  {{ grouping.name }}
                </span>
                <span class="component-detail-groupings-item-count">
                  ({{ grouping.occurrenceCount }} kanji)
                </span>
              </button>
            </div>
            <p
              v-if="grouping.description"
              class="component-detail-groupings-item-description"
            >
              {{ grouping.description }}
            </p>
          </div>

          <div class="component-detail-groupings-item-actions">
            <BaseButton
              size="sm"
              variant="secondary"
              @click="handleEditClick(grouping)"
            >
              Edit
            </BaseButton>
            <BaseButton
              v-if="props.isDestructiveMode"
              size="sm"
              variant="danger"
              @click="handleDeleteClick(grouping)"
            >
              ✕
            </BaseButton>
          </div>
        </div>

        <!-- Expanded members section -->
        <div
          v-if="expandedGroupings.has(grouping.id)"
          class="component-detail-groupings-item-members"
        >
          <div class="component-detail-groupings-members-header">
            <span class="component-detail-groupings-members-title"
              >Members</span
            >
          </div>

          <!-- Current members -->
          <ul
            v-if="getMemberOccurrences(grouping.id).length > 0"
            class="component-detail-groupings-members-list"
          >
            <li
              v-for="occurrence in getMemberOccurrences(grouping.id)"
              :key="occurrence.id"
              class="component-detail-groupings-member"
            >
              <span class="component-detail-groupings-member-kanji">
                {{ occurrence.kanji.character }}
              </span>
              <span
                v-if="occurrence.kanji.shortMeaning"
                class="component-detail-groupings-member-meaning"
              >
                {{ occurrence.kanji.shortMeaning }}
              </span>
              <BaseButton
                size="sm"
                variant="secondary"
                @click="handleRemoveMember(grouping.id, occurrence.id)"
              >
                Remove
              </BaseButton>
            </li>
          </ul>
          <p
            v-else
            class="component-detail-groupings-members-empty"
          >
            No kanji in this group yet.
          </p>

          <!-- Add member dropdown -->
          <div
            v-if="getAvailableOccurrences(grouping.id).length > 0"
            class="component-detail-groupings-add-member"
          >
            <span class="component-detail-groupings-add-member-label">
              Add kanji:
            </span>
            <div class="component-detail-groupings-add-member-options">
              <button
                v-for="occurrence in getAvailableOccurrences(grouping.id)"
                :key="occurrence.id"
                class="component-detail-groupings-add-member-option"
                type="button"
                @click="handleAddMember(grouping.id, occurrence.id)"
              >
                {{ occurrence.kanji.character }}
              </button>
            </div>
          </div>
        </div>
      </li>
    </ul>

    <!-- Add Grouping Dialog -->
    <BaseDialog
      v-model:open="showAddDialog"
      title="Add Grouping"
    >
      <form
        class="component-detail-groupings-dialog-form"
        @submit.prevent="handleCreateSubmit"
      >
        <BaseInput
          v-model="createFormValues.name"
          label="Name"
          name="name"
          placeholder="e.g., Left side position"
          required
        />

        <BaseTextarea
          v-model="createFormValues.description"
          label="Description"
          name="description"
          placeholder="Optional description..."
          :rows="3"
        />

        <div class="component-detail-groupings-dialog-actions">
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

    <!-- Edit Grouping Dialog -->
    <BaseDialog
      v-model:open="showEditDialog"
      title="Edit Grouping"
    >
      <form
        class="component-detail-groupings-dialog-form"
        @submit.prevent="handleEditSubmit"
      >
        <BaseInput
          v-model="editFormValues.name"
          label="Name"
          name="name"
          placeholder="e.g., Left side position"
          required
        />

        <BaseTextarea
          v-model="editFormValues.description"
          label="Description"
          name="description"
          placeholder="Optional description..."
          :rows="3"
        />

        <div class="component-detail-groupings-dialog-actions">
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
      :description="`Delete grouping '${deletingGrouping?.name ?? ''}'? This will not affect the kanji occurrences.`"
      :is-open="showDeleteDialog"
      title="Delete Grouping?"
      variant="danger"
      @cancel="handleDeleteCancel"
      @confirm="handleDeleteConfirm"
    />
  </div>
</template>

<style scoped>
.component-detail-groupings {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.component-detail-groupings-header {
  display: flex;
  justify-content: flex-end;
}

.component-detail-groupings-empty {
  padding: var(--spacing-lg);
  text-align: center;
}

.component-detail-groupings-empty-text {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.component-detail-groupings-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin: 0;
  padding: 0;
  list-style: none;
}

.component-detail-groupings-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  background-color: var(--color-surface-secondary);
}

.component-detail-groupings-item-main {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
}

.component-detail-groupings-item-reorder {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.component-detail-groupings-item-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.component-detail-groupings-item-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.component-detail-groupings-item-expand {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: 0;
  border: none;
  background: none;
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
  cursor: pointer;
}

.component-detail-groupings-item-expand:hover {
  color: var(--color-primary);
}

.component-detail-groupings-item-expand-icon {
  font-size: var(--font-size-sm);
}

.component-detail-groupings-item-name {
  font-weight: var(--font-weight-semibold);
}

.component-detail-groupings-item-count {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.component-detail-groupings-item-description {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-relaxed);
  white-space: pre-wrap;
}

.component-detail-groupings-item-actions {
  display: flex;
  gap: var(--spacing-xs);
}

.component-detail-groupings-item-members {
  margin-left: calc(var(--spacing-md) + 32px + var(--spacing-md));
  padding: var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  background-color: var(--color-surface);
}

.component-detail-groupings-members-header {
  margin-bottom: var(--spacing-sm);
}

.component-detail-groupings-members-title {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.component-detail-groupings-members-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  margin: 0;
  padding: 0;
  list-style: none;
}

.component-detail-groupings-member {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  background-color: var(--color-surface-raised);
}

.component-detail-groupings-member-kanji {
  font-family: var(--font-family-kanji);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
}

.component-detail-groupings-member-meaning {
  flex: 1;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.component-detail-groupings-members-empty {
  margin: 0;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  font-style: italic;
}

.component-detail-groupings-add-member {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
  padding-top: var(--spacing-sm);
  border-top: 1px solid var(--color-border);
}

.component-detail-groupings-add-member-label {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.component-detail-groupings-add-member-options {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}

.component-detail-groupings-add-member-option {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  background-color: var(--color-surface);
  color: var(--color-text-primary);
  font-family: var(--font-family-kanji);
  font-size: var(--font-size-lg);
  cursor: pointer;
  transition:
    background-color var(--transition-fast),
    border-color var(--transition-fast);
}

.component-detail-groupings-add-member-option:hover {
  border-color: var(--color-primary);
  background-color: var(--color-primary-subtle);
}

.component-detail-groupings-dialog-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.component-detail-groupings-dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  padding-top: var(--spacing-sm);
}

@media (width <= 640px) {
  .component-detail-groupings-item-main {
    flex-direction: column;
  }

  .component-detail-groupings-item-reorder {
    flex-direction: row;
  }

  .component-detail-groupings-item-actions {
    justify-content: flex-end;
    width: 100%;
  }

  .component-detail-groupings-item-members {
    margin-left: 0;
  }
}
</style>
