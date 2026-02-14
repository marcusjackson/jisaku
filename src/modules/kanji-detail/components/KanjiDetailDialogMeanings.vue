<script setup lang="ts">
/**
 * KanjiDetailDialogMeanings
 *
 * Dialog for editing kanji meanings with optional reading grouping.
 * Manages local edit state until save is confirmed.
 */

import { computed, ref, watch } from 'vue'

import { BaseButton, BaseDialog, BaseSwitch } from '@/base/components'

import { useKanjiDetailMeaningsDialogHandlers } from '../composables/use-kanji-detail-meanings-dialog-handlers'

import KanjiDetailMeaningsList from './KanjiDetailMeaningsList.vue'
import KanjiDetailReadingGroupMeaningsList from './KanjiDetailReadingGroupMeaningsList.vue'
import KanjiDetailReadingGroupsList from './KanjiDetailReadingGroupsList.vue'
import KanjiDetailUnassignedMeanings from './KanjiDetailUnassignedMeanings.vue'

import type {
  EditGroupMember,
  EditMeaning,
  EditReadingGroup,
  KanjiMeaning,
  KanjiMeaningGroupMember,
  KanjiMeaningReadingGroup,
  MeaningsSaveData
} from '../kanji-detail-types'

const props = defineProps<{
  open: boolean
  meanings: KanjiMeaning[]
  readingGroups: KanjiMeaningReadingGroup[]
  groupMembers: KanjiMeaningGroupMember[]
  destructiveMode?: boolean
}>()

const emit = defineEmits<{
  'update:open': [open: boolean]
  save: [data: MeaningsSaveData]
}>()

// Local edit state
const editMeanings = ref<EditMeaning[]>([])
const editGroups = ref<EditReadingGroup[]>([])
const editMembers = ref<EditGroupMember[]>([])
const groupingEnabled = ref(false)
const nextTempId = ref(-1)

// Initialize state from props
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      editMeanings.value = props.meanings.map((m) => ({
        additionalInfo: m.additionalInfo ?? '',
        id: m.id,
        meaningText: m.meaningText
      }))
      editGroups.value = props.readingGroups.map((g) => ({
        id: g.id,
        readingText: g.readingText
      }))
      editMembers.value = props.groupMembers.map((m) => ({
        displayOrder: m.displayOrder,
        meaningId: m.meaningId,
        readingGroupId: m.readingGroupId
      }))
      groupingEnabled.value = props.readingGroups.length > 0
      nextTempId.value = -1
    }
  },
  { immediate: true }
)

const hasGroups = computed(() => editGroups.value.length > 0)
const hasUnassignedMeanings = computed(() => {
  const assignedIds = new Set(editMembers.value.map((m) => m.meaningId))
  return editMeanings.value.some((m) => !assignedIds.has(m.id))
})

// Computed grouping toggle that prevents turning OFF when groups exist without destructive mode
const groupingToggle = computed({
  get: () => groupingEnabled.value,
  set: (newValue) => {
    const turningOff = groupingEnabled.value && !newValue
    // Only allow turning OFF when destructive mode is on OR no groups exist
    if (!turningOff || props.destructiveMode || !hasGroups.value) {
      groupingEnabled.value = newValue
    }
  }
})

// Handlers
const {
  addMeaning,
  addReadingGroup,
  assignMeaningToGroup,
  getMeaningsInGroup,
  getUnassignedMeanings,
  moveMeaning,
  moveMeaningInGroup,
  moveReadingGroup,
  removeMeaning,
  removeMeaningFromGroup,
  removeReadingGroup,
  updateMeaningInfo,
  updateMeaningText,
  updateReadingGroupText
} = useKanjiDetailMeaningsDialogHandlers(
  editMeanings,
  editGroups,
  editMembers,
  nextTempId
)

// Save handler
function handleSave(): void {
  emit('save', {
    groupingDisabled: !groupingEnabled.value,
    groupingEnabled: groupingEnabled.value,
    groupMembers: groupingEnabled.value ? editMembers.value : [],
    meanings: editMeanings.value,
    readingGroups: groupingEnabled.value ? editGroups.value : []
  })
  emit('update:open', false)
}
</script>

<template>
  <BaseDialog
    :open="props.open"
    title="Edit Meanings"
    @update:open="emit('update:open', $event)"
  >
    <div class="meanings-dialog-content">
      <!-- Grouping toggle -->
      <div class="grouping-toggle">
        <BaseSwitch
          v-model="groupingToggle"
          label="Group meanings by readings"
        />
      </div>

      <!-- Meanings list -->
      <KanjiDetailMeaningsList
        :destructive-mode="props.destructiveMode ?? false"
        :meanings="editMeanings"
        @add="addMeaning"
        @delete="removeMeaning"
        @move="moveMeaning"
        @update:additional-info="updateMeaningInfo"
        @update:meaning-text="updateMeaningText"
      />

      <!-- Grouping section -->
      <div
        v-if="groupingEnabled"
        class="grouping-section"
      >
        <KanjiDetailReadingGroupsList
          :destructive-mode="props.destructiveMode ?? false"
          :groups="editGroups"
          :unassigned-meanings="getUnassignedMeanings()"
          @add="addReadingGroup"
          @assign-meaning="assignMeaningToGroup"
          @delete="removeReadingGroup"
          @move="moveReadingGroup"
          @update:reading-text="updateReadingGroupText"
        >
          <template #group-meanings="{ groupId }">
            <KanjiDetailReadingGroupMeaningsList
              :destructive-mode="props.destructiveMode ?? false"
              :group-id="groupId"
              :meanings="getMeaningsInGroup(groupId)"
              @move-down="moveMeaningInGroup(groupId, $event, 1)"
              @move-up="moveMeaningInGroup(groupId, $event, -1)"
              @remove="removeMeaningFromGroup(groupId, $event)"
            />
          </template>
        </KanjiDetailReadingGroupsList>

        <KanjiDetailUnassignedMeanings
          v-if="hasUnassignedMeanings && hasGroups"
          :meanings="getUnassignedMeanings()"
        />
      </div>

      <!-- Actions -->
      <div class="meanings-dialog-actions">
        <BaseButton
          variant="secondary"
          @click="emit('update:open', false)"
        >
          Cancel
        </BaseButton>
        <BaseButton @click="handleSave">Save</BaseButton>
      </div>
    </div>
  </BaseDialog>
</template>

<style scoped>
.meanings-dialog-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  max-height: 70vh;
  overflow-y: auto;
}

.grouping-toggle {
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid var(--color-border);
}

.grouping-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-sm);
  background: var(--color-background-secondary);
}

.meanings-dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border);
}
</style>
