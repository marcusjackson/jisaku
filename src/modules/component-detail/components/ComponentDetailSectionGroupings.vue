<script setup lang="ts">
/**
 * ComponentDetailSectionGroupings - Groupings section with list and CRUD.
 *
 * Displays collapsible section containing groupings list, add/edit/delete
 * dialogs, and manage members dialog. Emits events to parent for operations.
 */

import { computed, ref } from 'vue'

import { BaseButton } from '@/base/components'

import SharedConfirmDialog from '@/shared/components/SharedConfirmDialog.vue'
import SharedSection from '@/shared/components/SharedSection.vue'

import ComponentDetailDialogGrouping from './ComponentDetailDialogGrouping.vue'
import ComponentDetailDialogManageMembers from './ComponentDetailDialogManageMembers.vue'
import ComponentDetailGroupingItem from './ComponentDetailGroupingItem.vue'

import type { GroupingFormData } from '../component-detail-types'
import type {
  ComponentGroupingMember,
  ComponentGroupingWithMembers,
  OccurrenceWithKanji
} from '@/api/component'

// =============================================================================
// Props & Emits
// =============================================================================

interface Props {
  /** List of groupings with member counts */
  groupings: ComponentGroupingWithMembers[]
  /** Parent component ID */
  componentId: number
  /** All occurrences for member management */
  occurrences: OccurrenceWithKanji[]
  /** All members for all groupings, keyed by grouping ID */
  allGroupingMembers: Map<number, ComponentGroupingMember[]>
  /** Current members for the managing grouping */
  managingGroupingMembers: ComponentGroupingMember[]
  /** Whether destructive mode is enabled */
  isDestructiveMode: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  add: [data: GroupingFormData]
  update: [id: number, data: GroupingFormData]
  remove: [id: number]
  reorder: [ids: number[]]
  manageMembers: [groupingId: number]
  addMember: [groupingId: number, occurrenceId: number]
  removeMember: [groupingId: number, occurrenceId: number]
  reorderMembers: [groupingId: number, ids: number[]]
}>()

// =============================================================================
// State
// =============================================================================

const showAddDialog = ref(false)
const showEditDialog = ref(false)
const showDeleteDialog = ref(false)
const showMembersDialog = ref(false)
const editingGrouping = ref<ComponentGroupingWithMembers | null>(null)
const deletingGrouping = ref<ComponentGroupingWithMembers | null>(null)
const managingGrouping = ref<ComponentGroupingWithMembers | null>(null)

// =============================================================================
// Computed
// =============================================================================

const defaultOpen = computed(() => props.groupings.length > 0)

const editInitial = computed<GroupingFormData | undefined>(() => {
  if (!editingGrouping.value) return undefined
  return {
    name: editingGrouping.value.name,
    description: editingGrouping.value.description ?? null
  }
})

/** Resolve member occurrences for a grouping in display order */
function getMemberOccurrences(groupingId: number): OccurrenceWithKanji[] {
  const members = props.allGroupingMembers.get(groupingId)
  if (!members || members.length === 0) return []
  const sorted = [...members].sort((a, b) => a.displayOrder - b.displayOrder)
  return sorted
    .map((m) => props.occurrences.find((o) => o.id === m.occurrenceId))
    .filter((o): o is OccurrenceWithKanji => o !== undefined)
}

// =============================================================================
// Handlers - Add
// =============================================================================

function handleAddClick() {
  showAddDialog.value = true
}

function handleAddSubmit(data: GroupingFormData) {
  emit('add', data)
  showAddDialog.value = false
}

// =============================================================================
// Handlers - Edit
// =============================================================================

function handleEditClick(grouping: ComponentGroupingWithMembers) {
  editingGrouping.value = grouping
  showEditDialog.value = true
}

function handleEditSubmit(data: GroupingFormData) {
  if (editingGrouping.value) {
    emit('update', editingGrouping.value.id, data)
  }
  showEditDialog.value = false
  editingGrouping.value = null
}

// =============================================================================
// Handlers - Delete
// =============================================================================

function handleDeleteClick(grouping: ComponentGroupingWithMembers) {
  deletingGrouping.value = grouping
  showDeleteDialog.value = true
}

function handleDeleteConfirm() {
  if (deletingGrouping.value) {
    emit('remove', deletingGrouping.value.id)
  }
  showDeleteDialog.value = false
  deletingGrouping.value = null
}

function handleDeleteCancel() {
  showDeleteDialog.value = false
  deletingGrouping.value = null
}

// =============================================================================
// Handlers - Manage Members
// =============================================================================

function handleManageMembersClick(grouping: ComponentGroupingWithMembers) {
  managingGrouping.value = grouping
  emit('manageMembers', grouping.id)
  showMembersDialog.value = true
}

function handleMemberAdd(occurrenceId: number) {
  if (managingGrouping.value) {
    emit('addMember', managingGrouping.value.id, occurrenceId)
  }
}

function handleMemberRemove(occurrenceId: number) {
  if (managingGrouping.value) {
    emit('removeMember', managingGrouping.value.id, occurrenceId)
  }
}

function handleMemberReorder(ids: number[]) {
  if (managingGrouping.value) {
    emit('reorderMembers', managingGrouping.value.id, ids)
  }
}

// =============================================================================
// Handlers - Reorder Groupings
// =============================================================================

function handleMoveUp(index: number) {
  if (index <= 0) return
  const ids = props.groupings.map((g) => g.id)
  const current = ids[index]
  const previous = ids[index - 1]
  if (current === undefined || previous === undefined) return
  ids[index - 1] = current
  ids[index] = previous
  emit('reorder', ids)
}

function handleMoveDown(index: number) {
  if (index >= props.groupings.length - 1) return
  const ids = props.groupings.map((g) => g.id)
  const current = ids[index]
  const next = ids[index + 1]
  if (current === undefined || next === undefined) return
  ids[index] = next
  ids[index + 1] = current
  emit('reorder', ids)
}
</script>

<template>
  <SharedSection
    collapsible
    :default-open="defaultOpen"
    test-id="component-detail-groupings"
    title="Groupings"
  >
    <template #actions="{ isOpen }">
      <BaseButton
        v-if="isOpen"
        size="sm"
        variant="secondary"
        @click="handleAddClick"
      >
        Add Grouping
      </BaseButton>
    </template>

    <div class="groupings-content">
      <!-- Empty state -->
      <p
        v-if="groupings.length === 0"
        class="empty-state"
      >
        No groupings yet. Group occurrences by position or visual pattern.
      </p>

      <!-- Groupings list -->
      <div
        v-else
        class="groupings-list"
      >
        <ComponentDetailGroupingItem
          v-for="(grouping, index) in groupings"
          :key="grouping.id"
          :grouping="grouping"
          :index="index"
          :is-destructive-mode="isDestructiveMode"
          :member-occurrences="getMemberOccurrences(grouping.id)"
          :total="groupings.length"
          @delete="handleDeleteClick(grouping)"
          @edit="handleEditClick(grouping)"
          @manage-members="handleManageMembersClick(grouping)"
          @move-down="handleMoveDown(index)"
          @move-up="handleMoveUp(index)"
        />
      </div>
    </div>
  </SharedSection>

  <!-- Add Dialog -->
  <ComponentDetailDialogGrouping
    v-model:open="showAddDialog"
    mode="add"
    @submit="handleAddSubmit"
  />

  <!-- Edit Dialog -->
  <ComponentDetailDialogGrouping
    v-model:open="showEditDialog"
    :initial="editInitial"
    mode="edit"
    @submit="handleEditSubmit"
  />

  <!-- Delete Confirm Dialog -->
  <SharedConfirmDialog
    confirm-label="Delete"
    :description="`Delete grouping '${deletingGrouping?.name ?? ''}'? Members will be unlinked.`"
    :open="showDeleteDialog"
    title="Delete Grouping"
    variant="danger"
    @cancel="handleDeleteCancel"
    @confirm="handleDeleteConfirm"
  />

  <!-- Manage Members Dialog -->
  <ComponentDetailDialogManageMembers
    v-if="managingGrouping"
    v-model:open="showMembersDialog"
    :grouping="managingGrouping"
    :members="managingGroupingMembers"
    :occurrences="occurrences"
    @add-member="handleMemberAdd"
    @remove-member="handleMemberRemove"
    @reorder-members="handleMemberReorder"
  />
</template>

<style scoped>
.groupings-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.empty-state {
  padding: var(--spacing-lg) 0;
  color: var(--color-text-muted);
  text-align: center;
}

.groupings-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding-top: var(--spacing-md);
}
</style>
