<script setup lang="ts">
/**
 * KanjiDetailMeanings
 *
 * Display and edit section for kanji meanings with optional reading groupings.
 * Supports two states: ungrouped (flat list) and grouped (by reading).
 * Edit mode has two areas: meanings management and reading groupings.
 *
 * Features:
 * - Arrow button reordering (↑/↓)
 * - Enable/disable reading groupings
 * - Combobox assignment (shows unassigned meanings only)
 * - Delete buttons visible only in destructive mode
 * - Empty groups deleted on save
 */

import { computed, ref, watch } from 'vue'

import BaseButton from '@/base/components/BaseButton.vue'
import BaseInput from '@/base/components/BaseInput.vue'
import BaseSelect from '@/base/components/BaseSelect.vue'
import BaseTextarea from '@/base/components/BaseTextarea.vue'

import SharedConfirmDialog from '@/shared/components/SharedConfirmDialog.vue'

import KanjiMeaningsViewMode from './KanjiMeaningsViewMode.vue'

import type {
  KanjiMeaning,
  KanjiMeaningGroupMember,
  KanjiMeaningReadingGroup
} from '@/shared/types/database-types'

interface Props {
  /** All meanings for this kanji */
  meanings: KanjiMeaning[]
  /** Reading groups for this kanji (empty if grouping disabled) */
  readingGroups: KanjiMeaningReadingGroup[]
  /** Group member assignments */
  groupMembers: KanjiMeaningGroupMember[]
  /** Whether destructive mode is enabled (shows delete buttons) */
  isDestructiveMode?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isDestructiveMode: false
})

const emit = defineEmits<{
  // Meaning events
  addMeaning: [meaningText: string, additionalInfo: string | null]
  updateMeaning: [
    id: number,
    meaningText: string,
    additionalInfo: string | null
  ]
  removeMeaning: [id: number]
  reorderMeanings: [meaningIds: number[]]
  // Reading group events
  enableGrouping: []
  disableGrouping: []
  addReadingGroup: []
  updateReadingGroup: [id: number, readingText: string]
  removeReadingGroup: [id: number]
  reorderReadingGroups: [groupIds: number[]]
  // Group member events
  assignMeaningToGroup: [meaningId: number, groupId: number]
  removeMeaningFromGroup: [meaningId: number, groupId: number]
  reorderMeaningsInGroup: [groupId: number, meaningIds: number[]]
  // Save event
  save: []
}>()

// =============================================================================
// State
// =============================================================================

const isEditing = ref(false)

// Delete confirmation dialogs
const showDeleteMeaningDialog = ref(false)
const showDeleteGroupDialog = ref(false)
const showDisableGroupingDialog = ref(false)
const meaningToDelete = ref<number | null>(null)
const groupToDelete = ref<number | null>(null)

// Edit meaning dialog
const showEditMeaningDialog = ref(false)
const editingMeaning = ref<{
  id: number | null // null means creating new, number means editing existing
  meaningText: string
  additionalInfo: string
} | null>(null)

// Computed to determine if dialog is for creating new or editing existing
const isCreatingNewMeaning = computed(
  () => editingMeaning.value !== null && editingMeaning.value.id === null
)

// Local edit state for meanings (for reordering)
const editMeanings = ref<
  {
    id: number
    meaningText: string
    additionalInfo: string
  }[]
>([])

// Local edit state for reading groups (for reordering)
const editReadingGroups = ref<
  {
    id: number
    readingText: string
  }[]
>([])

// Local edit state for group members (for assignment changes)
const editGroupMembers = ref<
  {
    readingGroupId: number
    meaningId: number
    displayOrder: number
  }[]
>([])

// New reading group being added
const newGroupReadingText = ref('')

// =============================================================================
// Computed
// =============================================================================

/** Whether reading grouping is currently enabled (any groups exist) */
const isGroupingEnabled = computed(() => props.readingGroups.length > 0)

/** Get unassigned meanings for combobox dropdown */
const unassignedMeaningsForCombobox = computed(() => {
  const assignedIds = new Set(editGroupMembers.value.map((m) => m.meaningId))
  return props.meanings.filter((m) => !assignedIds.has(m.id))
})

// =============================================================================
// View Mode Display Functions
// =============================================================================

/** Format meaning display text (truncated for lists) */
function formatMeaningShort(meaning: KanjiMeaning, maxLength = 50): string {
  if (meaning.meaningText.length <= maxLength) {
    return meaning.meaningText
  }
  return meaning.meaningText.substring(0, maxLength) + '...'
}

// =============================================================================
// Edit Mode
// =============================================================================

function startEditing() {
  // Initialize local edit state from props
  editMeanings.value = props.meanings.map((m) => ({
    id: m.id,
    meaningText: m.meaningText,
    additionalInfo: m.additionalInfo ?? ''
  }))

  editReadingGroups.value = props.readingGroups.map((g) => ({
    id: g.id,
    readingText: g.readingText
  }))

  editGroupMembers.value = props.groupMembers.map((gm) => ({
    readingGroupId: gm.readingGroupId,
    meaningId: gm.meaningId,
    displayOrder: gm.displayOrder
  }))

  newGroupReadingText.value = ''
  isEditing.value = true
}

function cancelEditing() {
  isEditing.value = false
  editMeanings.value = []
  editReadingGroups.value = []
  editGroupMembers.value = []
  newGroupReadingText.value = ''
}

function handleSave() {
  // Emit reorder if order changed
  const newMeaningOrder = editMeanings.value.map((m) => m.id)
  const originalMeaningOrder = props.meanings.map((m) => m.id)
  if (
    JSON.stringify(newMeaningOrder) !== JSON.stringify(originalMeaningOrder)
  ) {
    emit('reorderMeanings', newMeaningOrder)
  }

  // Emit reorder for groups if order changed
  const newGroupOrder = editReadingGroups.value.map((g) => g.id)
  const originalGroupOrder = props.readingGroups.map((g) => g.id)
  if (JSON.stringify(newGroupOrder) !== JSON.stringify(originalGroupOrder)) {
    emit('reorderReadingGroups', newGroupOrder)
  }

  // Emit all reading group text updates (ensure text is saved even without blur)
  editReadingGroups.value.forEach((editGroup) => {
    const original = props.readingGroups.find((g) => g.id === editGroup.id)
    if (original && original.readingText !== editGroup.readingText) {
      emit('updateReadingGroup', editGroup.id, editGroup.readingText)
    }
  })

  // Emit save event for parent to persist changes
  emit('save')

  isEditing.value = false
}

// =============================================================================
// Meaning Management (Area 1)
// =============================================================================

function openEditMeaningDialog(meaning: KanjiMeaning) {
  editingMeaning.value = {
    id: meaning.id,
    meaningText: meaning.meaningText,
    additionalInfo: meaning.additionalInfo ?? ''
  }
  showEditMeaningDialog.value = true
}

// Open dialog to create a new meaning
function openAddMeaningDialog() {
  editingMeaning.value = {
    id: null, // null indicates creating new
    meaningText: '',
    additionalInfo: ''
  }
  showEditMeaningDialog.value = true
}

function saveEditMeaning() {
  if (editingMeaning.value) {
    if (editingMeaning.value.id === null) {
      // Creating new meaning
      emit(
        'addMeaning',
        editingMeaning.value.meaningText,
        editingMeaning.value.additionalInfo || null
      )
    } else {
      // Updating existing meaning
      emit(
        'updateMeaning',
        editingMeaning.value.id,
        editingMeaning.value.meaningText,
        editingMeaning.value.additionalInfo || null
      )
    }
  }
  showEditMeaningDialog.value = false
  editingMeaning.value = null
}

function cancelEditMeaning() {
  showEditMeaningDialog.value = false
  editingMeaning.value = null
}

function moveMeaningUp(index: number) {
  if (index === 0) return
  const items = [...editMeanings.value]
  const temp = items[index]
  const prev = items[index - 1]
  if (!temp || !prev) return
  items[index] = prev
  items[index - 1] = temp
  editMeanings.value = items
}

function moveMeaningDown(index: number) {
  if (index === editMeanings.value.length - 1) return
  const items = [...editMeanings.value]
  const temp = items[index]
  const next = items[index + 1]
  if (!temp || !next) return
  items[index] = next
  items[index + 1] = temp
  editMeanings.value = items
}

function confirmDeleteMeaning(id: number) {
  meaningToDelete.value = id
  showDeleteMeaningDialog.value = true
}

function handleDeleteMeaning() {
  if (meaningToDelete.value !== null) {
    // Remove from local edit state
    editMeanings.value = editMeanings.value.filter(
      (m) => m.id !== meaningToDelete.value
    )
    // Remove from group members
    editGroupMembers.value = editGroupMembers.value.filter(
      (gm) => gm.meaningId !== meaningToDelete.value
    )
    emit('removeMeaning', meaningToDelete.value)
  }
  showDeleteMeaningDialog.value = false
  meaningToDelete.value = null
}

// =============================================================================
// Reading Group Management (Area 2)
// =============================================================================

function handleEnableGrouping() {
  emit('enableGrouping')
}

function confirmDisableGrouping() {
  showDisableGroupingDialog.value = true
}

function handleDisableGrouping() {
  emit('disableGrouping')
  showDisableGroupingDialog.value = false
}

function handleAddReadingGroup() {
  emit('addReadingGroup')
}

function updateReadingGroupText(id: number, text: string) {
  const group = editReadingGroups.value.find((g) => g.id === id)
  if (group) {
    group.readingText = text
    emit('updateReadingGroup', id, text)
  }
}

function moveReadingGroupUp(index: number) {
  if (index === 0) return
  const items = [...editReadingGroups.value]
  const temp = items[index]
  const prev = items[index - 1]
  if (!temp || !prev) return
  items[index] = prev
  items[index - 1] = temp
  editReadingGroups.value = items
}

function moveReadingGroupDown(index: number) {
  if (index === editReadingGroups.value.length - 1) return
  const items = [...editReadingGroups.value]
  const temp = items[index]
  const next = items[index + 1]
  if (!temp || !next) return
  items[index] = next
  items[index + 1] = temp
  editReadingGroups.value = items
}

function confirmDeleteReadingGroup(id: number) {
  groupToDelete.value = id
  showDeleteGroupDialog.value = true
}

function handleDeleteReadingGroup() {
  if (groupToDelete.value !== null) {
    // Remove from local edit state
    editReadingGroups.value = editReadingGroups.value.filter(
      (g) => g.id !== groupToDelete.value
    )
    // Remove all members of this group
    editGroupMembers.value = editGroupMembers.value.filter(
      (gm) => gm.readingGroupId !== groupToDelete.value
    )
    emit('removeReadingGroup', groupToDelete.value)
  }
  showDeleteGroupDialog.value = false
  groupToDelete.value = null
}

// =============================================================================
// Group Member Management
// =============================================================================

function handleAssignMeaning(groupId: number, meaningId: string) {
  // Ignore placeholder selection
  if (meaningId === '__placeholder__' || meaningId === '') return

  const id = parseInt(meaningId, 10)
  if (Number.isNaN(id)) return

  // Add to local edit state
  const maxOrder = editGroupMembers.value
    .filter((gm) => gm.readingGroupId === groupId)
    .reduce((max, gm) => Math.max(max, gm.displayOrder), -1)

  editGroupMembers.value.push({
    readingGroupId: groupId,
    meaningId: id,
    displayOrder: maxOrder + 1
  })

  emit('assignMeaningToGroup', id, groupId)
}

function handleRemoveMeaningFromGroup(groupId: number, meaningId: number) {
  // Remove from local edit state
  editGroupMembers.value = editGroupMembers.value.filter(
    (gm) => !(gm.readingGroupId === groupId && gm.meaningId === meaningId)
  )

  emit('removeMeaningFromGroup', meaningId, groupId)
}

function getMeaningsInGroupForEdit(groupId: number): KanjiMeaning[] {
  const memberIds = editGroupMembers.value
    .filter((m) => m.readingGroupId === groupId)
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((m) => m.meaningId)

  return memberIds
    .map((id) => props.meanings.find((m) => m.id === id))
    .filter((m): m is KanjiMeaning => m !== undefined)
}

function moveMeaningInGroupUp(groupId: number, meaningIndex: number) {
  if (meaningIndex === 0) return

  const groupMembers = editGroupMembers.value
    .filter((gm) => gm.readingGroupId === groupId)
    .sort((a, b) => a.displayOrder - b.displayOrder)

  if (meaningIndex >= groupMembers.length) return

  const current = groupMembers[meaningIndex]
  const prev = groupMembers[meaningIndex - 1]

  if (current && prev) {
    // Swap display orders
    const tempOrder = current.displayOrder
    current.displayOrder = prev.displayOrder
    prev.displayOrder = tempOrder
  }
}

function moveMeaningInGroupDown(groupId: number, meaningIndex: number) {
  const groupMembers = editGroupMembers.value
    .filter((gm) => gm.readingGroupId === groupId)
    .sort((a, b) => a.displayOrder - b.displayOrder)

  if (meaningIndex >= groupMembers.length - 1) return

  const current = groupMembers[meaningIndex]
  const next = groupMembers[meaningIndex + 1]

  if (current && next) {
    // Swap display orders
    const tempOrder = current.displayOrder
    current.displayOrder = next.displayOrder
    next.displayOrder = tempOrder
  }
}

// =============================================================================
// Watch for prop changes
// =============================================================================

watch(
  () => props.meanings,
  (newMeanings) => {
    if (isEditing.value) {
      const newIds = newMeanings.map((m) => m.id)
      const editIds = editMeanings.value.map((m) => m.id)

      // Add new meanings
      newMeanings.forEach((m) => {
        if (!editIds.includes(m.id)) {
          editMeanings.value.push({
            id: m.id,
            meaningText: m.meaningText,
            additionalInfo: m.additionalInfo ?? ''
          })
        }
      })

      // Remove deleted meanings
      editMeanings.value = editMeanings.value.filter((m) =>
        newIds.includes(m.id)
      )
    }
  }
)

watch(
  () => props.readingGroups,
  (newGroups) => {
    if (isEditing.value) {
      const newIds = newGroups.map((g) => g.id)
      const editIds = editReadingGroups.value.map((g) => g.id)

      // Add new groups
      newGroups.forEach((g) => {
        if (!editIds.includes(g.id)) {
          editReadingGroups.value.push({
            id: g.id,
            readingText: g.readingText
          })
        }
      })

      // Remove deleted groups
      editReadingGroups.value = editReadingGroups.value.filter((g) =>
        newIds.includes(g.id)
      )
    }
  }
)

watch(
  () => props.groupMembers,
  (newMembers) => {
    if (isEditing.value) {
      // Sync group members
      editGroupMembers.value = newMembers.map((gm) => ({
        readingGroupId: gm.readingGroupId,
        meaningId: gm.meaningId,
        displayOrder: gm.displayOrder
      }))
    }
  }
)
</script>

<template>
  <div class="kanji-detail-meanings">
    <!-- View Mode -->
    <template v-if="!isEditing">
      <KanjiMeaningsViewMode
        :group-members="groupMembers"
        :meanings="meanings"
        :reading-groups="readingGroups"
      />

      <div class="kanji-detail-meanings-actions">
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
      <div class="kanji-detail-meanings-edit">
        <!-- Area 1: Meanings Management -->
        <div class="kanji-detail-meanings-edit-section">
          <div class="kanji-detail-meanings-edit-header">
            <h4 class="kanji-detail-meanings-section-title">Meanings</h4>
            <BaseButton
              size="sm"
              variant="ghost"
              @click="openAddMeaningDialog"
            >
              + Add
            </BaseButton>
          </div>

          <div
            v-if="editMeanings.length === 0"
            class="kanji-detail-meanings-empty"
          >
            No meanings. Click "+ Add" to add one.
          </div>

          <div
            v-else
            class="kanji-detail-meanings-edit-list"
          >
            <div
              v-for="(meaning, index) in editMeanings"
              :key="meaning.id"
              class="kanji-detail-meanings-edit-item"
            >
              <span class="kanji-detail-meanings-edit-number"
                >{{ index + 1 }}.</span
              >

              <div class="kanji-detail-meanings-edit-content">
                <div class="kanji-detail-meanings-edit-text">
                  {{
                    formatMeaningShort(
                      props.meanings.find((m) => m.id === meaning.id) ||
                        ({ meaningText: meaning.meaningText } as KanjiMeaning)
                    )
                  }}
                </div>
              </div>

              <div class="kanji-detail-meanings-edit-buttons">
                <BaseButton
                  aria-label="Move up"
                  :disabled="index === 0"
                  size="sm"
                  variant="ghost"
                  @click="moveMeaningUp(index)"
                >
                  ↑
                </BaseButton>
                <BaseButton
                  aria-label="Move down"
                  :disabled="index === editMeanings.length - 1"
                  size="sm"
                  variant="ghost"
                  @click="moveMeaningDown(index)"
                >
                  ↓
                </BaseButton>
                <BaseButton
                  aria-label="Edit meaning"
                  size="sm"
                  variant="ghost"
                  @click="
                    openEditMeaningDialog(
                      props.meanings.find((m) => m.id === meaning.id)!
                    )
                  "
                >
                  Edit
                </BaseButton>
                <BaseButton
                  v-if="isDestructiveMode"
                  aria-label="Delete meaning"
                  size="sm"
                  variant="ghost"
                  @click="confirmDeleteMeaning(meaning.id)"
                >
                  ✕
                </BaseButton>
              </div>
            </div>
          </div>
        </div>

        <!-- Area 2: Reading Groupings -->
        <div class="kanji-detail-meanings-edit-section">
          <div class="kanji-detail-meanings-edit-header">
            <h4 class="kanji-detail-meanings-section-title">
              Reading Groupings
            </h4>
            <BaseButton
              v-if="!isGroupingEnabled"
              size="sm"
              variant="secondary"
              @click="handleEnableGrouping"
            >
              Enable
            </BaseButton>
            <BaseButton
              v-else
              :disabled="!isDestructiveMode"
              size="sm"
              :title="
                !isDestructiveMode
                  ? 'Enable destructive mode to disable grouping'
                  : ''
              "
              variant="secondary"
              @click="confirmDisableGrouping"
            >
              Disable
            </BaseButton>
          </div>

          <!-- Grouping disabled state -->
          <div
            v-if="!isGroupingEnabled"
            class="kanji-detail-meanings-grouping-disabled"
          >
            Reading grouping is not enabled for this kanji.
          </div>

          <!-- Grouping enabled state -->
          <template v-else>
            <div class="kanji-detail-meanings-groups-container">
              <div class="kanji-detail-meanings-groups-header">
                <BaseButton
                  size="sm"
                  variant="ghost"
                  @click="handleAddReadingGroup"
                >
                  + Add Reading Group
                </BaseButton>
              </div>

              <div
                v-if="editReadingGroups.length === 0"
                class="kanji-detail-meanings-empty"
              >
                No reading groups. Click "+ Add Reading Group" to create one.
              </div>

              <div
                v-else
                class="kanji-detail-meanings-groups-list"
              >
                <div
                  v-for="(group, groupIndex) in editReadingGroups"
                  :key="group.id"
                  class="kanji-detail-meanings-group-edit"
                >
                  <div class="kanji-detail-meanings-group-edit-header">
                    <BaseInput
                      v-model="group.readingText"
                      label="Reading"
                      placeholder="メイ, あか.り..."
                      @blur="
                        updateReadingGroupText(group.id, group.readingText)
                      "
                    />

                    <div class="kanji-detail-meanings-group-edit-buttons">
                      <BaseButton
                        aria-label="Move group up"
                        :disabled="groupIndex === 0"
                        size="sm"
                        variant="ghost"
                        @click="moveReadingGroupUp(groupIndex)"
                      >
                        ↑
                      </BaseButton>
                      <BaseButton
                        aria-label="Move group down"
                        :disabled="groupIndex === editReadingGroups.length - 1"
                        size="sm"
                        variant="ghost"
                        @click="moveReadingGroupDown(groupIndex)"
                      >
                        ↓
                      </BaseButton>
                      <BaseButton
                        v-if="isDestructiveMode"
                        aria-label="Delete group"
                        size="sm"
                        variant="ghost"
                        @click="confirmDeleteReadingGroup(group.id)"
                      >
                        ✕
                      </BaseButton>
                    </div>
                  </div>

                  <div class="kanji-detail-meanings-group-edit-content">
                    <div class="kanji-detail-meanings-group-members-label">
                      Meanings in this group:
                    </div>

                    <div
                      v-if="getMeaningsInGroupForEdit(group.id).length === 0"
                      class="kanji-detail-meanings-group-empty"
                    >
                      No meanings assigned.
                    </div>

                    <div
                      v-else
                      class="kanji-detail-meanings-group-members"
                    >
                      <div
                        v-for="(meaning, mIndex) in getMeaningsInGroupForEdit(
                          group.id
                        )"
                        :key="meaning.id"
                        class="kanji-detail-meanings-group-member"
                      >
                        <span class="kanji-detail-meanings-group-member-text">
                          • {{ formatMeaningShort(meaning, 40) }}
                        </span>
                        <div class="kanji-detail-meanings-group-member-buttons">
                          <BaseButton
                            aria-label="Move meaning up in group"
                            :disabled="mIndex === 0"
                            size="sm"
                            variant="ghost"
                            @click="moveMeaningInGroupUp(group.id, mIndex)"
                          >
                            ↑
                          </BaseButton>
                          <BaseButton
                            aria-label="Move meaning down in group"
                            :disabled="
                              mIndex ===
                              getMeaningsInGroupForEdit(group.id).length - 1
                            "
                            size="sm"
                            variant="ghost"
                            @click="moveMeaningInGroupDown(group.id, mIndex)"
                          >
                            ↓
                          </BaseButton>
                          <BaseButton
                            aria-label="Remove from group"
                            size="sm"
                            variant="ghost"
                            @click="
                              handleRemoveMeaningFromGroup(group.id, meaning.id)
                            "
                          >
                            Remove
                          </BaseButton>
                        </div>
                      </div>
                    </div>

                    <!-- Assign meaning combobox -->
                    <div
                      v-if="unassignedMeaningsForCombobox.length > 0"
                      class="kanji-detail-meanings-assign"
                    >
                      <BaseSelect
                        label="Assign meaning"
                        model-value="__placeholder__"
                        :options="[
                          {
                            label: 'Add to group…',
                            value: '__placeholder__'
                          },
                          ...unassignedMeaningsForCombobox.map((m) => ({
                            label: formatMeaningShort(m, 50),
                            value: String(m.id)
                          }))
                        ]"
                        @update:model-value="
                          handleAssignMeaning(group.id, String($event ?? ''))
                        "
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Unassigned meanings display -->
              <div
                v-if="
                  unassignedMeaningsForCombobox.length > 0 &&
                  editReadingGroups.length > 0
                "
                class="kanji-detail-meanings-unassigned"
              >
                <div class="kanji-detail-meanings-unassigned-label">
                  Unassigned Meanings:
                </div>
                <ul class="kanji-detail-meanings-unassigned-list">
                  <li
                    v-for="meaning in unassignedMeaningsForCombobox"
                    :key="meaning.id"
                  >
                    • {{ formatMeaningShort(meaning, 50) }}
                  </li>
                </ul>
              </div>
            </div>
          </template>
        </div>
      </div>

      <div
        class="kanji-detail-meanings-actions kanji-detail-meanings-actions-sticky"
      >
        <BaseButton
          size="sm"
          variant="secondary"
          @click="cancelEditing"
        >
          Cancel
        </BaseButton>
        <BaseButton
          size="sm"
          @click="handleSave"
        >
          Save
        </BaseButton>
      </div>
    </template>

    <!-- Edit/Add Meaning Dialog -->
    <SharedConfirmDialog
      confirm-label="Save"
      :description="
        isCreatingNewMeaning
          ? 'Add a new meaning for this kanji.'
          : 'Edit the meaning details.'
      "
      :is-open="showEditMeaningDialog"
      :title="isCreatingNewMeaning ? 'Add Meaning' : 'Edit Meaning'"
      variant="default"
      @cancel="cancelEditMeaning"
      @confirm="saveEditMeaning"
    >
      <div class="kanji-detail-meanings-dialog-content">
        <div class="kanji-detail-meanings-dialog-field">
          <BaseTextarea
            v-if="editingMeaning"
            v-model="editingMeaning.meaningText"
            label="Meaning"
            placeholder="Enter meaning text..."
            :rows="2"
          />
        </div>
        <div class="kanji-detail-meanings-dialog-field">
          <BaseTextarea
            v-if="editingMeaning"
            v-model="editingMeaning.additionalInfo"
            label="Additional Info"
            placeholder="Synonyms, antonyms, examples, usage notes..."
            :rows="2"
          />
        </div>
      </div>
    </SharedConfirmDialog>

    <!-- Delete Meaning Confirmation Dialog -->
    <SharedConfirmDialog
      confirm-label="Delete"
      description="Are you sure you want to delete this meaning?"
      :is-open="showDeleteMeaningDialog"
      title="Delete Meaning"
      variant="danger"
      @cancel="showDeleteMeaningDialog = false"
      @confirm="handleDeleteMeaning"
    />

    <!-- Delete Reading Group Confirmation Dialog -->
    <SharedConfirmDialog
      confirm-label="Delete"
      description="Are you sure you want to delete this reading group? Assigned meanings will become unassigned."
      :is-open="showDeleteGroupDialog"
      title="Delete Reading Group"
      variant="danger"
      @cancel="showDeleteGroupDialog = false"
      @confirm="handleDeleteReadingGroup"
    />

    <!-- Disable Grouping Confirmation Dialog -->
    <SharedConfirmDialog
      confirm-label="Remove Groupings"
      description="This will remove all reading groups and assignments. Meanings will remain but will no longer be grouped by reading. This cannot be undone."
      :is-open="showDisableGroupingDialog"
      title="Remove all reading groupings?"
      variant="danger"
      @cancel="showDisableGroupingDialog = false"
      @confirm="handleDisableGrouping"
    />
  </div>
</template>

<style scoped>
.kanji-detail-meanings {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

/* Actions */
.kanji-detail-meanings-actions {
  display: flex;
  justify-content: flex-start;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
}

.kanji-detail-meanings-actions-sticky {
  position: sticky;
  bottom: 0;
  z-index: var(--z-sticky, 10);
  border-top: 1px solid var(--color-border);
  background-color: var(--color-surface);
}

/* Edit mode styles */
.kanji-detail-meanings-edit {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.kanji-detail-meanings-edit-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.kanji-detail-meanings-edit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.kanji-detail-meanings-section-title {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.kanji-detail-meanings-edit-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.kanji-detail-meanings-edit-item {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  border-bottom: 1px solid var(--color-border);
}

.kanji-detail-meanings-edit-item:last-child {
  border-bottom: none;
}

.kanji-detail-meanings-edit-number {
  min-width: 1.5rem;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
}

.kanji-detail-meanings-edit-content {
  flex: 1;
  min-width: 200px;
}

.kanji-detail-meanings-edit-text {
  font-size: var(--font-size-base);
}

.kanji-detail-meanings-edit-buttons {
  display: flex;
  gap: var(--spacing-xs);
}

/* Grouping disabled state */
.kanji-detail-meanings-grouping-disabled {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  font-style: italic;
}

/* Groups container */
.kanji-detail-meanings-groups-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.kanji-detail-meanings-groups-header {
  display: flex;
  justify-content: flex-start;
}

.kanji-detail-meanings-groups-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

/* Group edit */
.kanji-detail-meanings-group-edit {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
}

.kanji-detail-meanings-group-edit-header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: var(--spacing-sm);
}

.kanji-detail-meanings-group-edit-buttons {
  display: flex;
  gap: var(--spacing-xs);
}

.kanji-detail-meanings-group-edit-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding-left: var(--spacing-md);
}

.kanji-detail-meanings-group-members-label {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.kanji-detail-meanings-group-empty {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  font-style: italic;
}

.kanji-detail-meanings-group-members {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.kanji-detail-meanings-group-member {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-sm);
}

.kanji-detail-meanings-group-member-text {
  flex: 1;
  min-width: 150px;
  font-size: var(--font-size-sm);
}

.kanji-detail-meanings-group-member-buttons {
  display: flex;
  gap: var(--spacing-xs);
}

/* Assign meaning */
.kanji-detail-meanings-assign {
  max-width: 300px;
  margin-top: var(--spacing-sm);
}

/* Unassigned section */
.kanji-detail-meanings-unassigned {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  padding: var(--spacing-md);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
}

.kanji-detail-meanings-unassigned-label {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  font-style: italic;
}

.kanji-detail-meanings-unassigned-list {
  margin: 0;
  padding: 0;
  padding-left: var(--spacing-md);
  list-style: none;
}

.kanji-detail-meanings-unassigned-list li {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

/* Dialog content */
.kanji-detail-meanings-dialog-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding-top: var(--spacing-md);
}

.kanji-detail-meanings-dialog-field {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}
</style>
