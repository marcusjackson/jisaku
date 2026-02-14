<script setup lang="ts">
/**
 * VocabularyDetailBasicInfo
 *
 * Displays and allows inline editing of vocabulary basic information:
 * JLPT level, is_common flag, description.
 *
 * Uses view/edit mode toggle pattern - click Edit to modify fields,
 * Save to persist changes, Cancel to discard.
 */

import { computed, ref, watch } from 'vue'

import BaseButton from '@/legacy/base/components/BaseButton.vue'
import BaseCheckbox from '@/legacy/base/components/BaseCheckbox.vue'
import BaseSelect from '@/legacy/base/components/BaseSelect.vue'
import BaseTextarea from '@/legacy/base/components/BaseTextarea.vue'

import { JLPT_OPTIONS } from '@/legacy/shared/constants/kanji-constants'

import type {
  JlptLevel,
  Vocabulary
} from '@/legacy/shared/types/database-types'

const props = defineProps<{
  vocabulary: Vocabulary
}>()

const emit = defineEmits<{
  update: [field: string, value: string | number | boolean | null]
}>()

// Special value to indicate "no selection"
const NONE_VALUE = '__none__'

// View/edit mode toggle
const isEditing = ref(false)

// Local edit values
const editJlptLevel = ref(props.vocabulary.jlptLevel ?? NONE_VALUE)
const editIsCommon = ref(props.vocabulary.isCommon)
const editDescription = ref(props.vocabulary.description ?? '')

// Reset edit values when vocabulary changes
watch(
  () => props.vocabulary,
  (newVocab) => {
    editJlptLevel.value = newVocab.jlptLevel ?? NONE_VALUE
    editIsCommon.value = newVocab.isCommon
    editDescription.value = newVocab.description ?? ''
  }
)

// JLPT level options for select
const jlptOptions = computed(() => {
  const options = JLPT_OPTIONS.map((opt) => ({
    value: opt.value,
    label: opt.label
  }))
  return [{ value: NONE_VALUE, label: 'None' }, ...options]
})

// Display values
const jlptDisplay = computed(() => {
  if (!props.vocabulary.jlptLevel) return '—'
  const match = JLPT_OPTIONS.find(
    (opt) => opt.value === props.vocabulary.jlptLevel
  )
  return match?.label ?? '—'
})

const commonDisplay = computed(() => (props.vocabulary.isCommon ? 'Yes' : 'No'))

// Start editing
function startEditing() {
  editJlptLevel.value = props.vocabulary.jlptLevel ?? NONE_VALUE
  editIsCommon.value = props.vocabulary.isCommon
  editDescription.value = props.vocabulary.description ?? ''
  isEditing.value = true
}

// Handle save - emit updates for changed fields
function handleSave() {
  const newJlpt =
    editJlptLevel.value === NONE_VALUE ? null : editJlptLevel.value
  if (newJlpt !== props.vocabulary.jlptLevel) {
    emit('update', 'jlptLevel', newJlpt as JlptLevel | null)
  }

  if (editIsCommon.value !== props.vocabulary.isCommon) {
    emit('update', 'isCommon', editIsCommon.value)
  }

  const newDescription = editDescription.value.trim() || null
  if (newDescription !== props.vocabulary.description) {
    emit('update', 'description', newDescription)
  }

  isEditing.value = false
}

// Handle cancel - reset to original values
function handleCancel() {
  editJlptLevel.value = props.vocabulary.jlptLevel ?? NONE_VALUE
  editIsCommon.value = props.vocabulary.isCommon
  editDescription.value = props.vocabulary.description ?? ''
  isEditing.value = false
}
</script>

<template>
  <div class="vocabulary-detail-basic-info">
    <!-- View mode -->
    <template v-if="!isEditing">
      <div class="vocabulary-detail-basic-info-grid">
        <div class="vocabulary-detail-basic-info-item">
          <span class="vocabulary-detail-basic-info-label">JLPT Level</span>
          <span class="vocabulary-detail-basic-info-value">{{
            jlptDisplay
          }}</span>
        </div>
        <div class="vocabulary-detail-basic-info-item">
          <span class="vocabulary-detail-basic-info-label">Common Word</span>
          <span class="vocabulary-detail-basic-info-value">{{
            commonDisplay
          }}</span>
        </div>
        <div
          class="vocabulary-detail-basic-info-item vocabulary-detail-basic-info-full"
        >
          <span class="vocabulary-detail-basic-info-label">Description</span>
          <span
            class="vocabulary-detail-basic-info-value vocabulary-detail-basic-info-description"
            >{{ vocabulary.description ?? '—' }}</span
          >
        </div>
      </div>
      <div class="vocabulary-detail-basic-info-actions">
        <BaseButton
          variant="ghost"
          @click="startEditing"
        >
          Edit
        </BaseButton>
      </div>
    </template>

    <!-- Edit mode -->
    <template v-else>
      <div class="vocabulary-detail-basic-info-form">
        <div class="vocabulary-detail-basic-info-row">
          <BaseSelect
            label="JLPT Level"
            :model-value="editJlptLevel"
            :options="jlptOptions"
            @update:model-value="editJlptLevel = $event ?? NONE_VALUE"
          />
        </div>

        <div class="vocabulary-detail-basic-info-checkbox">
          <BaseCheckbox
            label="Common word"
            :model-value="editIsCommon"
            @update:model-value="editIsCommon = $event === true"
          />
        </div>

        <BaseTextarea
          label="Description"
          :model-value="editDescription"
          placeholder="Additional notes about this vocabulary..."
          :rows="3"
          @update:model-value="editDescription = $event ?? ''"
        />
      </div>

      <div class="vocabulary-detail-basic-info-actions">
        <BaseButton
          variant="ghost"
          @click="handleCancel"
        >
          Cancel
        </BaseButton>
        <BaseButton
          variant="primary"
          @click="handleSave"
        >
          Save
        </BaseButton>
      </div>
    </template>
  </div>
</template>

<style scoped>
.vocabulary-detail-basic-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.vocabulary-detail-basic-info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
}

.vocabulary-detail-basic-info-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.vocabulary-detail-basic-info-full {
  grid-column: 1 / -1;
}

.vocabulary-detail-basic-info-label {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.vocabulary-detail-basic-info-value {
  color: var(--color-text-primary);
  font-size: var(--font-size-md);
}

.vocabulary-detail-basic-info-description {
  white-space: pre-wrap;
}

.vocabulary-detail-basic-info-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.vocabulary-detail-basic-info-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-md);
}

.vocabulary-detail-basic-info-checkbox {
  display: flex;
  align-items: center;
}

.vocabulary-detail-basic-info-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
}
</style>
