<script setup lang="ts">
/**
 * KanjiDetailReadings
 *
 * Section component: Manages kanji readings display and editing (on-yomi and kun-yomi).
 * Coordinates between view and edit modes, handles state management, and emits actions to parent.
 */

import { computed, ref, watch } from 'vue'

import BaseButton from '@/base/components/BaseButton.vue'

import SharedConfirmDialog from '@/shared/components/SharedConfirmDialog.vue'

import KanjiReadingsEditMode from './KanjiReadingsEditMode.vue'
import KanjiReadingsViewMode from './KanjiReadingsViewMode.vue'

import type {
  KunReading,
  OnReading,
  ReadingLevel
} from '@/shared/types/database-types'

const props = defineProps<{
  /** On-yomi readings for this kanji */
  onReadings: OnReading[]
  /** Kun-yomi readings for this kanji */
  kunReadings: KunReading[]
  /** Whether destructive mode is enabled (shows delete buttons) */
  isDestructiveMode?: boolean
}>()

const emit = defineEmits<{
  // On-yomi events
  addOnReading: [reading: string, level: ReadingLevel]
  updateOnReading: [id: number, reading: string, level: ReadingLevel]
  removeOnReading: [id: number]
  reorderOnReadings: [readingIds: number[]]
  // Kun-yomi events
  addKunReading: [
    reading: string,
    okurigana: string | null,
    level: ReadingLevel
  ]
  updateKunReading: [
    id: number,
    reading: string,
    okurigana: string | null,
    level: ReadingLevel
  ]
  removeKunReading: [id: number]
  reorderKunReadings: [readingIds: number[]]
}>()

// =============================================================================
// State
// =============================================================================

const isEditing = ref(false)
const showDeleteOnDialog = ref(false)
const showDeleteKunDialog = ref(false)
const readingToDelete = ref<number | null>(null)
const nextTempId = ref(-1)

// Local edit state for on-yomi (includes both existing and new pending items)
const editOnReadings = ref<
  {
    id: number
    reading: string
    readingLevel: ReadingLevel
    isNew?: boolean
  }[]
>([])

// Local edit state for kun-yomi (includes both existing and new pending items)
const editKunReadings = ref<
  {
    id: number
    reading: string
    okurigana: string
    readingLevel: ReadingLevel
    isNew?: boolean
  }[]
>([])

// =============================================================================
// Edit Mode Management
// =============================================================================

function startEditing() {
  editOnReadings.value = props.onReadings.map((r) => ({
    id: r.id,
    reading: r.reading,
    readingLevel: r.readingLevel,
    isNew: false
  }))
  editKunReadings.value = props.kunReadings.map((r) => ({
    id: r.id,
    reading: r.reading,
    okurigana: r.okurigana ?? '',
    readingLevel: r.readingLevel,
    isNew: false
  }))
  isEditing.value = true
}

function cancelEditing() {
  isEditing.value = false
  editOnReadings.value = []
  editKunReadings.value = []
  nextTempId.value = -1
}

function handleSave() {
  // Save on-yomi changes
  editOnReadings.value.forEach((editReading) => {
    const original = props.onReadings.find((r) => r.id === editReading.id)
    if (
      original &&
      (original.reading !== editReading.reading ||
        original.readingLevel !== editReading.readingLevel)
    ) {
      emit(
        'updateOnReading',
        editReading.id,
        editReading.reading,
        editReading.readingLevel
      )
    }
  })

  // Emit reorder if order changed
  const newOnOrder = editOnReadings.value.map((r) => r.id)
  const originalOnOrder = props.onReadings.map((r) => r.id)
  if (JSON.stringify(newOnOrder) !== JSON.stringify(originalOnOrder)) {
    emit('reorderOnReadings', newOnOrder)
  }

  // Save kun-yomi changes
  editKunReadings.value.forEach((editReading) => {
    const original = props.kunReadings.find((r) => r.id === editReading.id)
    if (
      original &&
      (original.reading !== editReading.reading ||
        (original.okurigana ?? '') !== editReading.okurigana ||
        original.readingLevel !== editReading.readingLevel)
    ) {
      emit(
        'updateKunReading',
        editReading.id,
        editReading.reading,
        editReading.okurigana || null,
        editReading.readingLevel
      )
    }
  })

  // Emit reorder if order changed
  const newKunOrder = editKunReadings.value.map((r) => r.id)
  const originalKunOrder = props.kunReadings.map((r) => r.id)
  if (JSON.stringify(newKunOrder) !== JSON.stringify(originalKunOrder)) {
    emit('reorderKunReadings', newKunOrder)
  }

  isEditing.value = false
}

// =============================================================================
// On-yomi Handlers
// =============================================================================

function handleAddOnReading() {
  const tempId = nextTempId.value
  nextTempId.value -= 1
  editOnReadings.value.push({
    id: tempId,
    reading: '',
    readingLevel: '小',
    isNew: true
  })
}

function saveNewOnReading(index: number) {
  const reading = editOnReadings.value[index]
  if (!reading?.isNew) return

  emit('addOnReading', reading.reading, reading.readingLevel)
  editOnReadings.value.splice(index, 1)
}

function cancelNewOnReading(index: number) {
  const reading = editOnReadings.value[index]
  if (!reading?.isNew) return
  editOnReadings.value.splice(index, 1)
}

function updateOnReadingField(
  index: number,
  field: 'reading' | 'level',
  value: string
) {
  const reading = editOnReadings.value[index]
  if (!reading) return

  if (field === 'reading') {
    reading.reading = value
  } else {
    reading.readingLevel = value as ReadingLevel
  }
}

function moveOnReadingUp(index: number) {
  if (index === 0) return
  const items = [...editOnReadings.value]
  const temp = items[index]
  const prev = items[index - 1]
  if (!temp || !prev) return
  items[index] = prev
  items[index - 1] = temp
  editOnReadings.value = items
}

function moveOnReadingDown(index: number) {
  if (index === editOnReadings.value.length - 1) return
  const items = [...editOnReadings.value]
  const temp = items[index]
  const next = items[index + 1]
  if (!temp || !next) return
  items[index] = next
  items[index + 1] = temp
  editOnReadings.value = items
}

function confirmDeleteOnReading(id: number) {
  readingToDelete.value = id
  showDeleteOnDialog.value = true
}

function handleDeleteOnReading() {
  if (readingToDelete.value !== null) {
    editOnReadings.value = editOnReadings.value.filter(
      (r) => r.id !== readingToDelete.value
    )
    emit('removeOnReading', readingToDelete.value)
  }
  showDeleteOnDialog.value = false
  readingToDelete.value = null
}

// =============================================================================
// Kun-yomi Handlers
// =============================================================================

function handleAddKunReading() {
  const tempId = nextTempId.value
  nextTempId.value -= 1
  editKunReadings.value.push({
    id: tempId,
    reading: '',
    okurigana: '',
    readingLevel: '小',
    isNew: true
  })
}

function saveNewKunReading(index: number) {
  const reading = editKunReadings.value[index]
  if (!reading?.isNew) return

  emit(
    'addKunReading',
    reading.reading,
    reading.okurigana || null,
    reading.readingLevel
  )
  editKunReadings.value.splice(index, 1)
}

function cancelNewKunReading(index: number) {
  const reading = editKunReadings.value[index]
  if (!reading?.isNew) return
  editKunReadings.value.splice(index, 1)
}

function updateKunReadingField(
  index: number,
  field: 'reading' | 'okurigana' | 'level',
  value: string
) {
  const reading = editKunReadings.value[index]
  if (!reading) return

  if (field === 'reading') {
    reading.reading = value
  } else if (field === 'okurigana') {
    reading.okurigana = value
  } else {
    reading.readingLevel = value as ReadingLevel
  }
}

function moveKunReadingUp(index: number) {
  if (index === 0) return
  const items = [...editKunReadings.value]
  const temp = items[index]
  const prev = items[index - 1]
  if (!temp || !prev) return
  items[index] = prev
  items[index - 1] = temp
  editKunReadings.value = items
}

function moveKunReadingDown(index: number) {
  if (index === editKunReadings.value.length - 1) return
  const items = [...editKunReadings.value]
  const temp = items[index]
  const next = items[index + 1]
  if (!temp || !next) return
  items[index] = next
  items[index + 1] = temp
  editKunReadings.value = items
}

function confirmDeleteKunReading(id: number) {
  readingToDelete.value = id
  showDeleteKunDialog.value = true
}

function handleDeleteKunReading() {
  if (readingToDelete.value !== null) {
    editKunReadings.value = editKunReadings.value.filter(
      (r) => r.id !== readingToDelete.value
    )
    emit('removeKunReading', readingToDelete.value)
  }
  showDeleteKunDialog.value = false
  readingToDelete.value = null
}

// =============================================================================
// Character Type Warnings (Non-blocking)
// =============================================================================

function hasHiragana(text: string): boolean {
  return /[\u3040-\u309F]/.test(text)
}

function hasKatakana(text: string): boolean {
  return /[\u30A0-\u30FF]/.test(text)
}

const onReadingWarnings = computed(() => {
  const warnings: Record<number, string> = {}
  editOnReadings.value.forEach((r, index) => {
    if (hasHiragana(r.reading)) {
      warnings[index] = 'On-yomi is generally in katakana'
    }
  })
  return warnings
})

const kunReadingWarnings = computed(() => {
  const warnings: Record<number, { reading?: string; okurigana?: string }> = {}
  editKunReadings.value.forEach((r, index) => {
    const warning: { reading?: string; okurigana?: string } = {}
    if (hasKatakana(r.reading)) {
      warning.reading = 'Kun-yomi reading is generally in hiragana'
    }
    if (hasKatakana(r.okurigana)) {
      warning.okurigana = 'Okurigana is generally in hiragana'
    }
    if (warning.reading || warning.okurigana) {
      warnings[index] = warning
    }
  })
  return warnings
})

// =============================================================================
// Watchers
// =============================================================================

// Watch for prop changes to update edit state
watch(
  () => props.onReadings,
  (newReadings) => {
    if (isEditing.value) {
      const newIds = newReadings.map((r) => r.id)
      const editIds = editOnReadings.value.map((r) => r.id)

      newReadings.forEach((r) => {
        if (!editIds.includes(r.id)) {
          editOnReadings.value.push({
            id: r.id,
            reading: r.reading,
            readingLevel: r.readingLevel
          })
        }
      })

      editOnReadings.value = editOnReadings.value.filter((r) =>
        newIds.includes(r.id)
      )
    }
  }
)

watch(
  () => props.kunReadings,
  (newReadings) => {
    if (isEditing.value) {
      const newIds = newReadings.map((r) => r.id)
      const editIds = editKunReadings.value.map((r) => r.id)

      newReadings.forEach((r) => {
        if (!editIds.includes(r.id)) {
          editKunReadings.value.push({
            id: r.id,
            reading: r.reading,
            okurigana: r.okurigana ?? '',
            readingLevel: r.readingLevel
          })
        }
      })

      editKunReadings.value = editKunReadings.value.filter((r) =>
        newIds.includes(r.id)
      )
    }
  }
)
</script>

<template>
  <div class="kanji-detail-readings">
    <!-- View Mode -->
    <template v-if="!isEditing">
      <KanjiReadingsViewMode
        :kun-readings="kunReadings"
        :on-readings="onReadings"
      />

      <div class="kanji-detail-readings-actions">
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
      <KanjiReadingsEditMode
        :is-destructive-mode="isDestructiveMode ?? false"
        :kun-reading-warnings="kunReadingWarnings"
        :kun-readings="editKunReadings"
        :on-reading-warnings="onReadingWarnings"
        :on-readings="editOnReadings"
        @add-kun-reading="handleAddKunReading"
        @add-on-reading="handleAddOnReading"
        @cancel-new-kun-reading="cancelNewKunReading"
        @cancel-new-on-reading="cancelNewOnReading"
        @delete-kun-reading="confirmDeleteKunReading"
        @delete-on-reading="confirmDeleteOnReading"
        @move-kun-reading-down="moveKunReadingDown"
        @move-kun-reading-up="moveKunReadingUp"
        @move-on-reading-down="moveOnReadingDown"
        @move-on-reading-up="moveOnReadingUp"
        @save-new-kun-reading="saveNewKunReading"
        @save-new-on-reading="saveNewOnReading"
        @update:kun-reading="updateKunReadingField"
        @update:on-reading="updateOnReadingField"
      />

      <div class="kanji-detail-readings-actions">
        <BaseButton
          size="sm"
          variant="primary"
          @click="handleSave"
        >
          Save
        </BaseButton>
        <BaseButton
          size="sm"
          variant="secondary"
          @click="cancelEditing"
        >
          Cancel
        </BaseButton>
      </div>
    </template>

    <!-- Delete confirmation dialogs -->
    <SharedConfirmDialog
      v-model:is-open="showDeleteOnDialog"
      confirm-label="Delete"
      description="This will permanently delete this on-yomi reading."
      title="Delete On-yomi Reading?"
      variant="danger"
      @confirm="handleDeleteOnReading"
    />

    <SharedConfirmDialog
      v-model:is-open="showDeleteKunDialog"
      confirm-label="Delete"
      description="This will permanently delete this kun-yomi reading."
      title="Delete Kun-yomi Reading?"
      variant="danger"
      @confirm="handleDeleteKunReading"
    />
  </div>
</template>

<style scoped>
.kanji-detail-readings {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.kanji-detail-readings-actions {
  display: flex;
  justify-content: flex-start;
  gap: var(--spacing-sm);
  padding-bottom: var(--spacing-sm);
}
</style>
